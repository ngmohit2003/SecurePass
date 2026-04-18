import hashlib
import bcrypt
from argon2 import PasswordHasher
from modules.hash_detector import detect_hash_type
from db.supabase_client import supabase

ph = PasswordHasher()

# --------------------------------------------------
# Hash / Verify password
# --------------------------------------------------
def hash_password(password, algo, target_hash=None):
    password = password.strip()

    if algo == "sha256":
        return hashlib.sha256(password.encode()).hexdigest()

    if algo == "sha512":
        return hashlib.sha512(password.encode()).hexdigest()

    if algo == "blake2":
        # 🔥 MUST MATCH generator digest size
        return "blake2b$" + hashlib.blake2b(
            password.encode(),
            digest_size=32
        ).hexdigest()

    if algo == "bcrypt":
        return bcrypt.checkpw(
            password.encode(),
            target_hash.encode()
        )

    if algo == "argon2":
        try:
            return ph.verify(target_hash, password)
        except:
            return False

    return None


# --------------------------------------------------
# Main cracker runner
# --------------------------------------------------
def run(payload):
    target_hash = payload.get("target_hash")

    if not target_hash:
        raise ValueError("target_hash required")

    target_hash = target_hash.strip()

    algo = detect_hash_type(target_hash)

    page_size = 500
    offset = 0

    while True:
        res = (
            supabase
            .table("rockyou_passwords")
            .select("password")
            .range(offset, offset + page_size - 1)
            .execute()
        )

        rows = res.data
        if not rows:
            break

        for row in rows:
            pwd = row.get("password")

            if not pwd:
                continue

            pwd = pwd.strip()

            # bcrypt / argon2 need verify
            if algo in ["bcrypt", "argon2"]:
                if hash_password(pwd, algo, target_hash):
                    return {
                        "found": True,
                        "plaintext": pwd,
                        "algorithm": algo,
                        "compromised": True
                    }

            # sha / blake2
            else:
                guess = hash_password(pwd, algo)
                if guess == target_hash:
                    return {
                        "found": True,
                        "plaintext": pwd,
                        "algorithm": algo,
                        "compromised": True
                    }

        offset += page_size

    return {
        "found": False,
        "plaintext": None,
        "algorithm": algo,
        "compromised": False
    }