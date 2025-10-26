# passmanager_api.py
"""
PassManager Phase 2 - Backend API with FastAPI
Encrypted storage & CRUD operations.

Requirements:
  - Python 3.8+
  - pip install fastapi uvicorn[standard] pycryptodome pydantic

Usage:
  - Set environment variable MASTER_PASSWORD with your Phase 1 master password.
  - Run: uvicorn passmanager_api:app --reload --host 127.0.0.1 --port 8000
  - Access docs at: http://127.0.0.1:8000/docs
"""
import os
import sqlite3
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from fastapi.middleware.cors import CORSMiddleware
import hmac,hashlib

# ✅ Create FastAPI app ONCE
app = FastAPI(title="PassManager Phase 2 API")

# ✅ Add CORS middleware (important for React connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Constants
DB_PATH = "passmanager.db"
PBKDF2_ITERS = 200_000
KEY_LEN = 32
NONCE_LEN = 12

MASTER_PASSWORD = os.getenv("MASTER_PASSWORD")
if not MASTER_PASSWORD:
    raise RuntimeError("Set MASTER_PASSWORD environment variable before running the server.")



# ------------------ DB helpers ------------------
def get_conn():
    if not os.path.exists(DB_PATH):
        raise RuntimeError(f"{DB_PATH} not found. Run Phase 1 setup first.")
    return sqlite3.connect(DB_PATH)

def load_settings(conn):
    c = conn.cursor()
    c.execute("SELECT k,v FROM settings")
    rows = c.fetchall()
    return {k: v for k,v in rows}

def derive_master_key():
    conn = get_conn()
    settings = load_settings(conn)
    conn.close()
    salt = settings[b"salt"] if b"salt" in settings else settings["salt"]
    iters = int(settings[b"pbkdf2_iters"].decode() if b"pbkdf2_iters" in settings else settings["pbkdf2_iters"].decode())
    key = PBKDF2(MASTER_PASSWORD.encode(), salt, dkLen=KEY_LEN, count=iters)
    return key

# ------------------ Crypto helpers ------------------
def encrypt(plaintext: bytes, key: bytes):
    nonce = os.urandom(NONCE_LEN)
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext)
    return ciphertext, nonce, tag

def decrypt(ciphertext: bytes, nonce: bytes, tag: bytes, key: bytes):
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    return cipher.decrypt_and_verify(ciphertext, tag)

# ------------------ Pydantic models ------------------
class EntryCreate(BaseModel):
    website: str
    username: str = None
    password: str

class EntryUpdate(BaseModel):
    website: str = None
    username: str = None
    password: str = None

# ------------------ API Endpoints ------------------

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/entries")
def add_entry(entry: EntryCreate):
    key = derive_master_key()
    ct, nonce, tag = encrypt(entry.password.encode(), key)
    created = datetime.utcnow().isoformat() + "Z"

    conn = get_conn()
    c = conn.cursor()
    c.execute(
        "INSERT INTO passwords (website, username, password_encrypted, nonce, tag, created_at) VALUES (?,?,?,?,?,?)",
        (entry.website, entry.username, ct, nonce, tag, created)
    )
    conn.commit()
    entry_id = c.lastrowid
    conn.close()
    return {"id": entry_id, "website": entry.website, "username": entry.username, "created_at": created}

@app.get("/entries")
def list_entries():
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT id, website, username, created_at FROM passwords ORDER BY website")
    rows = c.fetchall()
    conn.close()
    return [{"id": r[0], "website": r[1], "username": r[2], "created_at": r[3]} for r in rows]

@app.get("/entries/{entry_id}")
def get_entry(entry_id: int):
    key = derive_master_key()
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT website, username, password_encrypted, nonce, tag, created_at FROM passwords WHERE id=?", (entry_id,))
    row = c.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Entry not found")
    website, username, ct, nonce, tag, created_at = row
    try:
        password = decrypt(ct, nonce, tag, key).decode()
    except:
        raise HTTPException(status_code=500, detail="Decryption failed")
    return {"id": entry_id, "website": website, "username": username, "password": password, "created_at": created_at}

@app.put("/entries/{entry_id}")
def update_entry(entry_id: int, entry: EntryUpdate):
    key = derive_master_key()
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT id FROM passwords WHERE id=?", (entry_id,))
    if not c.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Entry not found")
    updates = []
    params = []
    if entry.website is not None:
        updates.append("website=?")
        params.append(entry.website)
    if entry.username is not None:
        updates.append("username=?")
        params.append(entry.username)
    if entry.password is not None:
        ct, nonce, tag = encrypt(entry.password.encode(), key)
        updates.extend(["password_encrypted=?","nonce=?","tag=?"])
        params.extend([ct, nonce, tag])
    if not updates:
        conn.close()
        raise HTTPException(status_code=400, detail="Nothing to update")
    params.append(entry_id)
    sql = f"UPDATE passwords SET {', '.join(updates)} WHERE id=?"
    c.execute(sql, params)
    conn.commit()
    conn.close()
    return {"status": "updated"}

@app.delete("/entries/{entry_id}")
def delete_entry(entry_id: int):
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT id FROM passwords WHERE id=?", (entry_id,))
    if not c.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Entry not found")
    c.execute("DELETE FROM passwords WHERE id=?", (entry_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

class VerifyRequest(BaseModel):
    password: str

@app.post("/verify-master")
def verify_master(req: VerifyRequest):
    conn = sqlite3.connect("passmanager.db")
    c = conn.cursor()
    c.execute("SELECT k, v FROM settings")
    settings = {k: v for k, v in c.fetchall()}
    conn.close()

    salt = settings["salt"]
    iters = int(settings["pbkdf2_iters"].decode())
    derived_key = PBKDF2(req.password.encode(), salt, dkLen=32, count=iters)

    # Derive again from stored test hash (if exists) or check with a dummy key
    stored_test = settings.get("verify_hash")
    if stored_test:
        check_hash = hashlib.sha256(derived_key).digest()
        if hmac.compare_digest(check_hash, stored_test):
            return {"verified": True}
        else:
            return {"verified": False}
    else:
        # First setup, generate test hash
        verify_hash = hashlib.sha256(derived_key).digest()
        conn = sqlite3.connect("passmanager.db")
        c = conn.cursor()
        c.execute("INSERT OR REPLACE INTO settings (k,v) VALUES (?,?)", ("verify_hash", verify_hash))
        conn.commit()
        conn.close()
        return {"verified": True}