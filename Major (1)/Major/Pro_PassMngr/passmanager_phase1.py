"""
PassManager - Phase 1
Setup & Encryption Core

Requirements:
  - Python 3.8+
  - pip install pycryptodome

This script initializes an encrypted SQLite DB, sets/validates a master password,
and provides key derivation + AES-256-GCM encrypt/decrypt helpers.

Usage:
  - Run the script and follow the menu to initialize master password and test
    encryption/decryption.

Security notes:
  - Master password is hashed with PBKDF2-HMAC-SHA256 and stored with a salt.
  - PBKDF2 is also used to derive an AES-256 key from the master password + salt.
  - AES-GCM is used for authenticated encryption (nonce + tag stored).
"""

import sqlite3
import os
import json
import getpass
from datetime import datetime
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Random import get_random_bytes

DB_PATH = 'passmanager.db'
PBKDF2_ITERS = 200_000  # adjustable; higher = slower but more secure
SALT_BYTES = 16
KEY_LEN = 32  # 256 bits
NONCE_LEN = 12  # recommended for GCM

# ---------- Database helpers -----
def init_db(path=DB_PATH):
    first_time = not os.path.exists(path)
    conn = sqlite3.connect(path)
    c = conn.cursor()
    # store settings like salt and master hash in a settings table
    c.execute('''
    CREATE TABLE IF NOT EXISTS settings (
        k TEXT PRIMARY KEY,
        V BLOB
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

# ---------- Crypto helpers ----------

def generate_salt(n=SALT_BYTES):
    return get_random_bytes(n)


def derive_key(master_password: str, salt: bytes, iters=PBKDF2_ITERS, dklen=KEY_LEN):
    # PBKDF2-HMAC-SHA256 -> returns bytes
    return PBKDF2(master_password.encode('utf-8'), salt, dklen, count=iters)


def encrypt(plaintext: bytes, key: bytes):
    nonce = get_random_bytes(NONCE_LEN)
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext)
    return ciphertext, nonce, tag


def decrypt(ciphertext: bytes, nonce: bytes, tag: bytes, key: bytes):
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    return cipher.decrypt_and_verify(ciphertext, tag)


# ---------- Master password setup & verification ----------

def set_master_password(conn):
    c = conn.cursor()
    # check if already set
    c.execute("SELECT v FROM settings WHERE k='master_hash'")
    if c.fetchone():
        print('Master password already set.')
        return False

    while True:
        pw = getpass.getpass('Create master password: ')
        pw2 = getpass.getpass('Confirm master password: ')
        if pw != pw2:
            print('Passwords did not match. Try again.')
            continue
        if len(pw) < 8:
            print('Choose a stronger password (>=8 chars).')
            continue
        break

    salt = generate_salt()
    key = derive_key(pw, salt)
    # store master hash as PBKDF2-derived bytes (avoid storing raw password)
    c.execute("INSERT OR REPLACE INTO settings(k,v) VALUES(?,?)", ('salt', salt))
    c.execute("INSERT OR REPLACE INTO settings(k,v) VALUES(?,?)", ('pbkdf2_iters', str(PBKDF2_ITERS).encode()))
    c.execute("INSERT OR REPLACE INTO settings(k,v) VALUES(?,?)", ('master_hash', key))
    conn.commit()
    print('Master password set and settings stored.')
    return True


def load_settings(conn):
    c = conn.cursor()
    c.execute("SELECT k,v FROM settings")
    rows = c.fetchall()
    d = {k: v for k, v in rows}
    return d


def verify_master_password(conn):
    c = conn.cursor()
    c.execute("SELECT v FROM settings WHERE k='salt'")
    row = c.fetchone()
    if not row:
        print('No master password is set. Please initialize first.')
        return None
    salt = row[0]
    c.execute("SELECT v FROM settings WHERE k='pbkdf2_iters'")
    iters = int(c.fetchone()[0].decode())
    pw = getpass.getpass('Enter master password: ')
    derived = derive_key(pw, salt, iters)
    c.execute("SELECT v FROM settings WHERE k='master_hash'")
    stored = c.fetchone()[0]
    if derived == stored:
        print('Master password verified.')
        return derived  # return key to use for encryption
    else:
        print('Incorrect master password.')
        return None

# ---------- Small test/demo CLI ----------

def demo_menu(conn):
    while True:
        print('\n--- PassManager Phase 1 demo ---')
        print('1) Initialize master password')
        print('2) Verify master password and derive key')
        print('3) Quick encrypt/decrypt test')
        print('4) Exit')
        choice = input('Choose: ').strip()
        if choice == '1':
            set_master_password(conn)
        elif choice == '2':
            key = verify_master_password(conn)
            if key:
                print('Derived key length:', len(key))
        elif choice == '3':
            key = verify_master_password(conn)
            if not key:
                continue
            pt = input('Plaintext to encrypt (will be bytes): ').encode()
            ct, nonce, tag = encrypt(pt, key)
            print('Ciphertext (hex):', ct.hex())
            recovered = decrypt(ct, nonce, tag, key)
            print('Recovered plaintext:', recovered.decode())
        elif choice == '4':
            print('Exiting demo.')
            break
        else:
            print('Invalid choice.')


if __name__ == '__main__':
    conn, first = init_db()
    if first:
        print('Database created:', DB_PATH)
    demo_menu(conn)
    conn.close()
