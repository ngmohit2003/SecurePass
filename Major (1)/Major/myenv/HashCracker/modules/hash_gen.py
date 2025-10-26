import hashlib
import os

def run(payload):
    text = payload.get("text")
    append = payload.get("append", False)

    if not text:
        raise ValueError("text is required")

    # Get project root (CrackSuite/)
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    hashes_file_path = os.path.join(project_root, "samples", "hashes.txt")

    # Compute MD5 hash
    hash_value = hashlib.md5(text.encode()).hexdigest()

    # Append to file if requested
    if append:
        with open(hashes_file_path, "a") as f:
            f.write(hash_value + "\n")

    return {"hash": hash_value, "appended_to": hashes_file_path if append else None}
