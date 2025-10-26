// src/api.js
// single source of truth for backend bases
export const PASSMANAGER_API_BASE = "http://127.0.0.1:8000"; // FastAPI / password manager
export const CRACKER_API_BASE = "http://127.0.0.1:5000";     // Flask cracker backend

// ---------------- CRACKER FUNCTIONS ----------------

// Start async cracker job (returns { ok: true, job_id: "<uuid>" })
export async function startCrackerJob({ target_hash = null, use_samples = false, wordlist = null } = {}) {
  // body should match app_api.start route: use_samples, target_hash, wordlist
  const body = { use_samples: Boolean(use_samples) };
  if (target_hash) body.target_hash = target_hash;
  if (wordlist) body.wordlist = wordlist;

  const res = await fetch(`${CRACKER_API_BASE}/api/cracker/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// Poll job status: GET /api/job/<job_id>
export async function getJobStatus(jobId) {
  const res = await fetch(`${CRACKER_API_BASE}/api/job/${encodeURIComponent(jobId)}`);
  return res.json();
}

// Synchronous run (blocking) — POST /api/cracker/run
// body: { target_hash: "<hash>", wordlist: "<optional absolute path>" }
export async function runCrackerSync({ target_hash, wordlist = null } = {}) {
  if (!target_hash) throw new Error("target_hash required");
  const body = { target_hash };
  if (wordlist) body.wordlist = wordlist;

  const res = await fetch(`${CRACKER_API_BASE}/api/cracker/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ---------------- PASSWORD MANAGER FUNCTIONS ----------------

export async function getEntries() {
  const res = await fetch(`${PASSMANAGER_API_BASE}/entries`);
  return res.json();
}

export async function addEntry(entry) {
  const res = await fetch(`${PASSMANAGER_API_BASE}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  return res.json();
}

export async function updateEntry(id, entry) {
  const res = await fetch(`${PASSMANAGER_API_BASE}/entries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  return res.json();
}

export async function deleteEntry(id) {
  const res = await fetch(`${PASSMANAGER_API_BASE}/entries/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

function getAuthHeaders() {
  const token = localStorage.getItem("passman_token"); // or your helper
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}


export async function getEntryById(entryId) {
  const res = await fetch(`${PASSMANAGER_API_BASE}/entries/${encodeURIComponent(entryId)}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    // try to return parsed JSON error if available
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `HTTP ${res.status}`);
  }
  return res.json(); // should be { id, website, username, password, created_at }
}