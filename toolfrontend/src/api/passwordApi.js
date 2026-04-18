const API_BASE = "http://127.0.0.1:8001";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// CREATE
export async function createPassword(data) {
  const res = await fetch(`${API_BASE}/passwords`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

// READ
export async function getPasswords() {
  const res = await fetch(`${API_BASE}/passwords`, {
    headers: authHeaders(),
  });
  return res.json();
}

// UPDATE
export async function updatePassword(id, data) {
  const res = await fetch(`${API_BASE}/passwords/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

// DELETE
export async function deletePassword(id) {
  const res = await fetch(`${API_BASE}/passwords/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}
