import os
import time
import uuid
import importlib
import traceback
from threading import Thread
from typing import Optional, Dict, Any

from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

# CORS (same as Flask config)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://toolkit-5bjf.onrender.com"


    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job store (dev only)
_jobs: Dict[str, Dict[str, Any]] = {}

# Whitelist modules
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

    # Fallback for cracker.py
    if module_name == "cracker":
        target = payload.get("target_hash")
        wordlist = payload.get("wordlist")
        use_samples = payload.get("use_samples", False)

        from modules.cracker import crack_hash

        root = os.path.dirname(os.path.abspath(__file__))
        wl = wordlist or os.path.join(root, "wordlists", "rockyou1.txt")

        if use_samples:
            samples_path = os.path.join(root, "samples", "hashes.txt")
            report = []
            cracked = []

            with open(samples_path, "r") as f:
                hashes = [line.strip() for line in f]

            for h in hashes:
                res = crack_hash(h, wl)
                report.append({
                    "hash": h,
                    "found": bool(res),
                    "plaintext": res
                })
                if res:
                    cracked.append(res)

            return {
                "report": report,
                "cracked": cracked,
                "total_cracked": len(cracked)
            }

        else:
            if not target:
                raise ValueError("target_hash required")

            found = crack_hash(target, wl)
            return {"found": bool(found), "plaintext": found}

    raise RuntimeError("module has no runnable interface")


def start_job(module_name, payload):
    job_id = str(uuid.uuid4())
    _jobs[job_id] = {
        "status": "pending",
        "result": None,
        "error": None,
        "started_at": time.time()
    }

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


# -------------------- API ROUTES --------------------

@app.post("/api/cracker/start", status_code=202)
def api_start_cracker(body: dict = Body(default={})):
    payload = {
        "use_samples": bool(body.get("use_samples", False)),
        "target_hash": body.get("target_hash"),
        "wordlist": body.get("wordlist"),
    }
    job_id = start_job("cracker", payload)
    return {"ok": True, "job_id": job_id}


@app.get("/api/job/{job_id}")
def api_get_job(job_id: str):
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="job not found")

    safe = {
        k: job[k]
        for k in ("status", "result", "error", "started_at", "finished_at")
        if k in job
    }
    return safe


@app.post("/api/cracker/run")
def api_run_cracker(body: dict = Body(...)):
    from modules.cracker import run
    return run(body)



@app.post("/api/hash/run")
def api_run_hash_gen(body: dict = Body(default={})):
    """
    Example request body:
    {
        "text": "hello",
        "append": false
    }
    """
    text = body.get("text")
    append = body.get("append", False)

    if not text:
        raise HTTPException(status_code=400, detail="text is required")

    try:
        from modules import hash_gen
        result = hash_gen.run({"text": text, "append": append})
        return {"ok": True, "result": result}
    except Exception as e:
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }

