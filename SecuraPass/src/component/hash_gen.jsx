// src/modules/hash_gen/HashGen.jsx
import React, { useState } from "react";

export default function HashGen() {
  const [text, setText] = useState("");
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);

  // Simple synchronous request
  async function generateSync(e) {
    e?.preventDefault();
    if (!text) return alert("Enter text to hash");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/hash/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, append: false }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setHash(json.result.hash);
    } catch (err) {
      console.error(err);
      alert("Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Start job (async) and poll until done
  async function startJob(e) {
    e?.preventDefault();
    if (!text) return alert("Enter text to hash");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/hash/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, append: false }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Start failed");
      setJobId(json.job_id);
      setJobStatus("pending");

      // Poll job status every 1s (stop when done/failed)
      const poll = setInterval(async () => {
        try {
          const r = await fetch(`http://localhost:5000/api/job/${json.job_id}`);
          const jobJson = await r.json();
          setJobStatus(jobJson.status);
          if (jobJson.status === "done") {
            clearInterval(poll);
            setHash((jobJson.result && jobJson.result.hash) || "");
            setLoading(false);
          } else if (jobJson.status === "failed") {
            clearInterval(poll);
            alert("Job failed: " + (jobJson.error || "unknown"));
            setLoading(false);
          }
        } catch (err) {
          console.error("Polling error", err);
          clearInterval(poll);
          setLoading(false);
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Failed to start: " + err.message);
      setLoading(false);
    }
  }

  return ( <div className="w-[960px] mx-auto py-20">


      <main className="leading-[2] mx-auto" style={{ padding: 20, maxWidth: 720 }}>
      <h1 className="text-[#FFFFFF] text-[2.5rem] w-[50%] mx-auto pl-10">Hash generator</h1>
      <form style={{ display: "grid", gap: 8 }}>
        <input
          className="bg-[#243647] text-[#94ADC7] px-16 py-12 rounded-md"
          placeholder="Text to hash"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ padding: 8 }}
        />

        <div className="flex flex-row gap-6 justify-center w-[50%] mx-auto py-4">
          <button className="bg-[#1A80E5] text-[#FFFFFF] rounded-md py-1 px-4" onClick={generateSync} disabled={loading}>
            Generate
          </button>
          {/* <button onClick={startJob} disabled={loading}>
            Generate via job (async)
          </button> */}
          <button
          className="bg-[#1A80E5] text-[#FFFFFF] rounded-md py-1 px-4"
            type="button"
            onClick={() => {
              setText("");
              setHash("");
              setJobId(null);
              setJobStatus(null);
            }}
          >
            Clear
          </button>
        </div>

        {loading && <div className="text-white">Working... status: {jobStatus || "n/a"}</div>}

        {hash && (
          <>
            <label className="text-white text-2xl">Result</label>
            <pre className="px-2 py-2 bg-[#243647] text-[#94ADC7] rounded-md">
              {hash}
            </pre>
          </>
        )}

        {jobId && <div>Job ID: {jobId} — status: {jobStatus}</div>}
      </form>
    </main>
  </div>
   
  );
}
