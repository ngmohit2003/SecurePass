# """
# PassManager - Phase 2
# Encrypted Storage & CRUD Operations

# This file builds on Phase 1 and adds functions to store, retrieve,
# list, update and delete password entries in the encrypted SQLite DB.

# Requirements:
#   - Python 3.8+
#   - pip install pycryptodome
#   - (optional) pip install pyperclip  -> for clipboard copy support

# Usage:
#   - Run the script and use the menu to add/list/get/update/delete entries.
#   - You will be prompted for the master password (used to derive the AES key).

# Security notes:
#   - Each stored password is encrypted with AES-256-GCM using a key derived
#     from the master password via PBKDF2 with salt (stored in settings).
#   - Each entry uses a fresh nonce and stores tag for verification.
# """

import sqlite3
import os
import getpass
from datetime import datetime
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Random import get_random_bytes

# # If you want clipboard functionality, install pyperclip. It's optional.
# try:
#     import pyperclip
#     HAS_CLIPBOARD = True
# except Exception:
#     HAS_CLIPBOARD = False

# ---- Config (same as Phase 1) ----
DB_PATH = 'passmanager.db'
PBKDF2_ITERS = 200_000
SALT_BYTES = 16
KEY_LEN = 32
NONCE_LEN = 12

# ---- DB initialization (reuse Phase1 schema) ----
def init_db(path=DB_PATH):
    first_time = not os.path.exists(path)
    conn = sqlite3.connect(path)
    c = conn.cursor()
    c.execute('''
    CREATE TABLE IF NOT EXISTS settings (
        k TEXT PRIMARY KEY,
        v BLOB
    )
    ''' )
    c.execute('''
    CREATE TABLE IF NOT EXISTS passwords (
        id INTEGER PRIMARY KEY,
        website TEXT NOT NULL,
        username TEXT,
        password_encrypted BLOB,
        nonce BLOB,
        tag BLOB,
        created_at TEXT
    )
    ''')
    conn.commit()
    return conn, first_time

# ---- Crypto helpers (same as Phase1) ----

def derive_key(master_password: str, salt: bytes, iters=PBKDF2_ITERS, dklen=KEY_LEN):
    return PBKDF2(master_password.encode('utf-8'), salt, dklen, count=iters)


def encrypt(plaintext: bytes, key: bytes):
    nonce = get_random_bytes(NONCE_LEN)
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext)
    return ciphertext, nonce, tag


def decrypt(ciphertext: bytes, nonce: bytes, tag: bytes, key: bytes):
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    return cipher.decrypt_and_verify(ciphertext, tag)

# ---- Settings loader & master password verifier ----

def load_settings(conn):
    c = conn.cursor()
    c.execute("SELECT k,v FROM settings")
    rows = c.fetchall()
    return {k: v for k, v in rows}


def verify_master_password(conn):
    c = conn.cursor()
    c.execute("SELECT v FROM settings WHERE k='salt'")
    row = c.fetchone()
    if not row:
        print('No master password set. Run setup in Phase 1 first.')
        return None
    salt = row[0]
    c.execute("SELECT v FROM settings WHERE k='pbkdf2_iters'")
    iters = int(c.fetchone()[0].decode())
    pw = getpass.getpass('Enter master password: ')
    derived = derive_key(pw, salt, iters)
    c.execute("SELECT v FROM settings WHERE k='master_hash'")
    stored = c.fetchone()[0]
    if derived == stored:
        return derived
    else:
        print('Incorrect master password.')
        return None

# ---- CRUD operations ----

def add_entry(conn, key: bytes, website: str, username: str, password_plain: str):
    ct, nonce, tag = encrypt(password_plain.encode('utf-8'), key)
    created = datetime.utcnow().isoformat() + 'Z'
    c = conn.cursor()
    c.execute(
        "INSERT INTO passwords(website, username, password_encrypted, nonce, tag, created_at) VALUES(?,?,?,?,?,?)",
        (website, username, ct, nonce, tag, created)
    )
    conn.commit()
    print(f"Added entry for '{website}'.")
def list_entries(conn):
    c = conn.cursor()
    c.execute("SELECT id, website, username, created_at FROM passwords ORDER BY website")
    rows = c.fetchall()
    if not rows:
        print('No entries found.')
        return
    print('\nStored entries:')
    for r in rows:
        print(f"ID: {r[0]} | Website: {r[1]} | Username: {r[2] or '--'} | Added: {r[3]}")


def get_entry(conn, key: bytes, entry_id: int, copy_to_clipboard=False):
    c = conn.cursor()
    c.execute("SELECT website, username, password_encrypted, nonce, tag, created_at FROM passwords WHERE id=?", (entry_id,))
    row = c.fetchone()
    if not row:
        print('Entry not found.')
        return
    website, username, ct, nonce, tag, created_at = row
    try:
        pt = decrypt(ct, nonce, tag, key)
    except Exception as e:
        print('Decryption failed — possibly wrong key or corrupted data.')
        return
    password = pt.decode('utf-8')
    print(f"\nWebsite: {website}\nUsername: {username}\nPassword: {password}\nAdded: {created_at}")
    # if copy_to_clipboard:
    #     if not HAS_CLIPBOARD:
    #         print('pyperclip not available; install it to enable clipboard copy.')
    #     else:
    #         pyperclip.copy(password)
    #         print('Password copied to clipboard (manual clear recommended).')
def update_entry(conn, key: bytes, entry_id: int, website=None, username=None, new_password=None):
    c = conn.cursor()
    c.execute("SELECT id FROM passwords WHERE id=?", (entry_id,))
    if not c.fetchone():
        print('Entry not found.')
        return
    updates = []
    params = []
    if website is not None:
        updates.append('website=?')
        params.append(website)
    if username is not None:
        updates.append('username=?')
        params.append(username)
    if new_password is not None:
        ct, nonce, tag = encrypt(new_password.encode('utf-8'), key)
        updates.extend(['password_encrypted=?','nonce=?','tag=?'])
        params.extend([ct, nonce, tag])
    if not updates:
        print('Nothing to update.')
        return
    params.append(entry_id)
    sql = f"UPDATE passwords SET {', '.join(updates)} WHERE id=?"
    c.execute(sql, params)
    conn.commit()
    print('Entry updated.')


def delete_entry(conn, entry_id: int):
    c = conn.cursor()
    c.execute("SELECT id, website FROM passwords WHERE id=?", (entry_id,))
    row = c.fetchone()
    if not row:
        print('Entry not found.')
        return
    confirm = input(f"Delete entry {entry_id} for '{row[1]}'? (y/N): ").strip().lower()
    if confirm == 'y':
        c.execute("DELETE FROM passwords WHERE id=?", (entry_id,))
        conn.commit()
        print('Deleted.')
    else:
        print('Aborted.')

# ---- Simple CLI ----
# ---- Simple CLI ----

def menu(conn):
    key = verify_master_password(conn)
    if not key:
        return
    while True:
        print('\n--- PassManager Phase 2 ---')
        print('1) Add new password')
        print('2) List entries')
        print('3) Get entry (decrypt)')
        print('4) Update entry')
        print('5) Delete entry')
        print('6) Exit')
        choice = input('Choice: ').strip()
        if choice == '1':
            website = input('Website (e.g. bank.com): ').strip()
            username = input('Username/email (optional): ').strip() or None
            pwd = getpass.getpass('Password to store: ')
            add_entry(conn, key, website, username, pwd)
        elif choice == '2':
            list_entries(conn)
        elif choice == '3':
            entry_id = int(input('Entry ID: ').strip())
            # copy = input('Copy password to clipboard? (y/N): ').strip().lower() == 'y'       , copy_to_clipboard=copy
            get_entry(conn, key, entry_id)
        elif choice == '4':
            entry_id = int(input('Entry ID: ').strip())
            w = input('New website (leave blank to keep): ').strip() or None
            u = input('New username (leave blank to keep): ').strip() or None
            np = None
            if input('Change password? (y/N): ').strip().lower() == 'y':
                np = getpass.getpass('New password: ')
            update_entry(conn, key, entry_id, website=w, username=u, new_password=np)
        elif choice == '5':
            entry_id = int(input('Entry ID: ').strip())
            delete_entry(conn, entry_id)
        elif choice == '6':
            print('Exiting Phase 2 menu.')
            break
        else:
            print('Invalid choice.')


if __name__ == '__main__':
    conn, first = init_db()
    if first:
        print('Database created: ', DB_PATH)
        print('Note: run Phase 1 script to initialize master password before using Phase 2.')
    menu(conn)
    conn.close()
