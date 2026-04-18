# Upload PCAP to Supabase Storage 
from supabase_client import supabase
import os

def upload_pcap(local_path, remote_name):
    bucket = os.getenv("SUPABASE_BUCKET")

    with open(local_path, "rb") as f:
        supabase.storage.from_(bucket).upload(
            remote_name,
            f,
            {"content-type": "application/octet-stream"}
        )

    return f"{bucket}/{remote_name}"


def download_pcap(remote_path: str, local_path: str):
    bucket = os.getenv("SUPABASE_BUCKET")

    data = supabase.storage.from_(bucket).download(remote_path)

    with open(local_path, "wb") as f:
        f.write(data)


def delete_pcap(remote_path: str):
    bucket = os.getenv("SUPABASE_BUCKET")
    supabase.storage.from_(bucket).remove([remote_path])