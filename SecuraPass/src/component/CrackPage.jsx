import React, { useState } from "react";
import { startCrackerJob, getJobStatus } from "../api";

export default function CrackPage() {
  const [targetHash, setTargetHash] = useState("");
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setResult(null);

    const payload = { target_hash: targetHash }; // or { use_samples: true } to run samples
    const resp = await startCrackerJob(payload);
    if (resp.ok) {
      setJobId(resp.job_id);
      pollJob(resp.job_id);
    } else {
      alert("Failed to start job");
      setLoading(false);
    }
  };

  const pollJob = (id) => {
    const t = setInterval(async () => {
      const j = await getJobStatus(id);
      setStatus(j.status);
      if (j.status === "done" || j.status === "failed") {
        clearInterval(t);
        setResult(j.result || { error: j.error });
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="w-[960px] mx-auto py-20 text-white flex flex-col">
      <h2 className="flex justify-center text-[2.5rem] pb-8">Crack Hash</h2>
      <form onSubmit={handleStart} className="w-[50%] mx-auto flex flex-col gap-5">
        <input className="bg-[#243647] text-[#94ADC7] px-2 py-3 rounded-md" value={targetHash} onChange={(e) => setTargetHash(e.target.value)} placeholder="Enter hash" />
        <button className="w-[40%] mx-auto px-2 py-3 rounded-md bg-[#1A80E5] text-[#FFFFFF]"  type="submit" disabled={loading}>{loading ? "Starting..." : "Start"}</button>
      </form>

      {/* {jobId && <div className="text-white ">Job ID: {jobId}</div>}
      {status && <div className="text-white ">Status: {status}</div>} */}
      {result && (
        <div className="p-4 bg-[#1f2937] mt-20 flex flex-col items-center justify-center mx-auto w-[30%] h-[100px] rounded-md ">
          {result.found !== undefined && (
            <div>
              <strong>Found:</strong> {result.found ? "Yes" : "No"}
            </div>
          )}
          {result.plaintext && (
            <div>
              <strong>Plaintext:</strong> {result.plaintext}
            </div>
          )}
          {result.error && (
            <div className="text-red-400">
              <strong>Error:</strong> {result.error}
            </div>
          )}
        </div>
      )}
       
    </div>
  );
}
