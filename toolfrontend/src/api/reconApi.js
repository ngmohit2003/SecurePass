// import { authHeaders } from "../utils/auth";

const BASE = "http://127.0.0.1:8004"; // adjust port if needed

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchDomainIntel(domain) {
  const res = await fetch(`${BASE}/domain-intel`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ domain }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to fetch domain intel");
  }

  return res.json();
}
