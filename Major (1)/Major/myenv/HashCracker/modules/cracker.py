import hashlib
import bcrypt
import os 
from modules.hash_detector import detect_hash_type

def crack_hash(target_hash, wordlist_file):
    hash_type = detect_hash_type(target_hash)

    with open(wordlist_file, "r", encoding="latin-1") as file:
        for word in file:
            word = word.strip()
            if hash_type == "MD5":
                guess = hashlib.md5(word.encode()).hexdigest()
            elif hash_type == "SHA1":
                guess = hashlib.sha1(word.encode()).hexdigest()
            elif hash_type == "SHA256":
                guess = hashlib.sha256(word.encode()).hexdigest()
            elif hash_type == "bcrypt":
                if bcrypt.checkpw(word.encode(), target_hash.encode()):
                    return word
                continue
            else:
                return None

            if guess == target_hash:
                return word
    return None
def run(payload: dict):
    if payload.get("use_samples"):
        root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        samples_path = os.path.join(root, "samples", "hashes.txt")
        wl = payload.get("wordlist") or os.path.join(root, "wordlists", "rockyou1.txt")
        report = []
        cracked = []
        with open(samples_path, "r") as f:
            hashes = [line.strip() for line in f]
        for h in hashes:
            res = crack_hash(h, wl)
            report.append({"hash": h, "found": bool(res), "plaintext": res})
            if res:
                cracked.append(res)
        return {"report": report, "cracked": cracked, "total_cracked": len(cracked)}
    else:
        target = payload.get("target_hash")
        if not target:
            raise ValueError("target_hash required")
        root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        wl = payload.get("wordlist") or os.path.join(root, "wordlists", "rockyou1.txt")
        found = crack_hash(target, wl)
        return {"found": bool(found), "plaintext": found}


