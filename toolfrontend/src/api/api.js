// src/api.js

// Backend bases
export const CRACKER_API_BASE = "http://127.0.0.1:8002";

// ---------------- HASH GENERATOR ----------------

export async function generateHashes(text) {
  const res = await fetch(`${CRACKER_API_BASE}/api/hash/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || "Hash generation failed");
  }

  return json.result;
}

// ---------------- CRACKER ----------------

export async function startCrackerJob({ target_hash }) {
  const res = await fetch(`${CRACKER_API_BASE}/api/cracker/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target_hash }),
  });

  return res.json();
}

export async function getJobStatus(jobId) {
  const res = await fetch(`${CRACKER_API_BASE}/api/job/${jobId}`);
  return res.json();
}

