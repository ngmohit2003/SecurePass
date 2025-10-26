# app_api.py
import os
import time
import uuid
import importlib
import traceback
from threading import Thread
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])  # allow React dev server

# In-memory job store (dev only)
_jobs = {}

# Whitelist modules (module file name without .py)
ALLOWED_MODULES = {
    "cracker": "modules.cracker",
     "hash_gen": "modules.hash_gen",
}

def _run_module(module_name, payload):
    """Import module and run its run(payload) if available, else fallback to cracker logic."""
    module_path = ALLOWED_MODULES.get(module_name)
    if not module_path:
        raise RuntimeError("module not allowed")
    module = importlib.import_module(module_path)

    # Prefer run(payload)
    if hasattr(module, "run"):
        return module.run(payload)

    # Fallback specifically for your current cracker.py (calls crack_hash)
    if module_name == "cracker":
        target = payload.get("target_hash")
        wordlist = payload.get("wordlist")
        use_samples = payload.get("use_samples", False)

        from modules.cracker import crack_hash  # your existing function

        if use_samples:
            # run over samples/hashes.txt and return aggregated results
            root = os.path.dirname(os.path.abspath(__file__))
            samples_path = os.path.join(root, "samples", "hashes.txt")
            wl = wordlist or os.path.join(root, "wordlists", "rockyou1.txt")
            report = []
            cracked = []
            with open(samples_path, "r") as f:
                hashes = [line.strip() for line in f]
            for h in hashes:
                res = crack_hash(h, wl)
                report.append({"hash": h, "found": bool(res), "plaintext": res})
                if res:
                    cracked.append(res)
            return {"report": report, "cracked": cracked, "total_cracked": len(cracked)}
        else:
            if not target:
                raise ValueError("target_hash required")
            # default wordlist path relative to project root
            root = os.path.dirname(os.path.abspath(__file__))
            wl = wordlist or os.path.join(root, "wordlists", "rockyou1.txt")
            found = crack_hash(target, wl)
            return {"found": bool(found), "plaintext": found}

    raise RuntimeError("module has no runnable interface")

def start_job(module_name, payload):
    job_id = str(uuid.uuid4())
    _jobs[job_id] = {"status": "pending", "result": None, "error": None, "started_at": time.time()}

    def worker():
        try:
            _jobs[job_id]["status"] = "running"
            res = _run_module(module_name, payload)
            _jobs[job_id]["status"] = "done"
            _jobs[job_id]["result"] = res
            _jobs[job_id]["finished_at"] = time.time()
        except Exception as e:
            _jobs[job_id]["status"] = "failed"
            _jobs[job_id]["error"] = str(e)
            _jobs[job_id]["traceback"] = traceback.format_exc()

    Thread(target=worker, daemon=True).start()
    return job_id

@app.route("/api/cracker/start", methods=["POST"])
def api_start_cracker():
    body = request.get_json() or {}
    # support using samples file or single hash
    payload = {
        "use_samples": bool(body.get("use_samples", False)),
        "target_hash": body.get("target_hash"),
        "wordlist": body.get("wordlist")
    }
    job_id = start_job("cracker", payload)
    return jsonify({"ok": True, "job_id": job_id}), 202

@app.route("/api/job/<job_id>", methods=["GET"])
def api_get_job(job_id):
    job = _jobs.get(job_id)
    if not job:
        return jsonify({"error": "job not found"}), 404
    # return safe job data
    safe = {k: job[k] for k in ("status", "result", "error", "started_at", "finished_at") if k in job}
    return jsonify(safe)

# Quick synchronous run for testing (blocks)
@app.route("/api/cracker/run", methods=["POST"])
def api_run_cracker_sync():
    body = request.get_json() or {}
    target = body.get("target_hash")
    if not target:
        return jsonify({"error": "target_hash required"}), 400
    try:
        res = _run_module("cracker", {"target_hash": target, "wordlist": body.get("wordlist")})
        return jsonify({"ok": True, "result": res})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/api/hash/run", methods=["POST"])
def api_run_hash_gen():
    """
    Run the hash generator module.
    Example request body:
    {
        "text": "hello",
        "append": false
    }
    """
    body = request.get_json() or {}
    text = body.get("text")
    append = body.get("append", False)

    if not text:
        return jsonify({"error": "text is required"}), 400

    try:
        from modules import hash_gen
        result = hash_gen.run({"text": text, "append": append})
        return jsonify({"ok": True, "result": result})
    except Exception as e:
        import traceback
        return jsonify({"error": str(e), "traceback": traceback.format_exc()}), 500
  

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)

