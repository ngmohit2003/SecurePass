from fastapi import FastAPI, Depends, HTTPException
from auth_dependencies import get_current_user
from models import CaptureStartResponse
from capture_engine import start_packet_capture
from analysis_engine import analyze_pcap

from storage_utils import upload_pcap, download_pcap
from packet_db import save_capture_metadata, get_capture_by_id

import uuid
import os
from dotenv import load_dotenv
from pathlib import Path

# -------------------------------------------------------------------
# Environment setup
# -------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

CAPTURE_DIR = BASE_DIR / "captures"
CAPTURE_DIR.mkdir(exist_ok=True)

# -------------------------------------------------------------------
# FastAPI app
# -------------------------------------------------------------------

app = FastAPI(title="Live Packet Analyzer Service")

# -------------------------------------------------------------------
# Health check
# -------------------------------------------------------------------


from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://toolkit-5bjf.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def health_check():
    return {"status": "packet_service running"}

# -------------------------------------------------------------------
# Start packet capture (60 seconds)
# -------------------------------------------------------------------

@app.post("/capture/start", response_model=CaptureStartResponse)
def start_capture(user_email: str = Depends(get_current_user)):
    capture_id = str(uuid.uuid4())
    pcap_path = CAPTURE_DIR / f"{capture_id}.pcap"

    # 1. Run tshark capture (blocking 60s)
    start_packet_capture(capture_id)

    if not pcap_path.exists():
        raise HTTPException(status_code=500, detail="PCAP capture failed")

    # 2. Analyze packets
    stats = analyze_pcap(str(pcap_path))

    # 3. Upload PCAP to Supabase Storage
    # remote_path = f"{user_email}/{capture_id}.pcap"
    safe_email = user_email.replace("@", "_at_").replace(".", "_")
    remote_path = f"{safe_email}/{capture_id}.pcap"

    storage_path = upload_pcap(
        local_path=str(pcap_path),
        remote_name=remote_path
    )

    # 4. Save metadata to Supabase DB
    save_capture_metadata(
        email=user_email,
        capture_id=capture_id,
        file_path=storage_path,
        packet_count=stats.get("tcp_packets", 0) + stats.get("udp_packets", 0),
        duration=int(os.getenv("CAPTURE_DURATION", "60"))
    )

    # 5. Delete local PCAP (cleanup)
    os.remove(pcap_path)

    return {
        "capture_id": capture_id,
        "message": "Packet capture completed (60 seconds)"
    }



# -------------------------------------------------------------------
# Analyze existing capture (local only, for now)
# -------------------------------------------------------------------
@app.get("/capture/analyze/{capture_id}")
def analyze_capture(
    capture_id: str,
    user_email: str = Depends(get_current_user)
):
    # 1. Fetch metadata from Supabase DB
    capture = get_capture_by_id(user_email, capture_id)

    if not capture:
        raise HTTPException(status_code=404, detail="Capture not found")

    remote_path = capture["file_path"]

    # 2. Download PCAP to temp file
    temp_pcap_path = CAPTURE_DIR / f"temp_{capture_id}.pcap"

    download_pcap(
        remote_path=remote_path.replace(f"{os.getenv('SUPABASE_BUCKET')}/", ""),
        local_path=str(temp_pcap_path)
    )

    # 3. Analyze PCAP
    analysis = analyze_pcap(str(temp_pcap_path))

    # 4. Cleanup temp file
    os.remove(temp_pcap_path)

    return {
        "capture_id": capture_id,
        "analysis": analysis
    }



from packet_db import get_captures_by_user

@app.get("/capture/list")
def list_captures(user_email: str = Depends(get_current_user)):
    return {
        "captures": get_captures_by_user(user_email)
    }


from fastapi.responses import FileResponse

@app.get("/capture/download/{capture_id}")
def download_capture(
    capture_id: str,
    user_email: str = Depends(get_current_user)
):
    capture = get_capture_by_id(user_email, capture_id)
    if not capture:
        raise HTTPException(404, "Capture not found")

    temp_path = CAPTURE_DIR / f"download_{capture_id}.pcap"

    download_pcap(
        remote_path=capture["file_path"].split("/", 1)[1],
        local_path=str(temp_path)
    )

    return FileResponse(
        path=temp_path,
        filename=f"{capture_id}.pcap",
        media_type="application/octet-stream"
    )

from storage_utils import delete_pcap
from supabase_client import supabase
@app.delete("/capture/delete/{capture_id}")
def delete_capture(
    capture_id: str,
    user_email: str = Depends(get_current_user)
):
    # 1. Get capture metadata
    capture = get_capture_by_id(user_email, capture_id)
    if not capture:
        raise HTTPException(status_code=404, detail="Capture not found")

    # 2. Delete PCAP from Supabase Storage
    remote_path = capture["file_path"].split("/", 1)[1]
    delete_pcap(remote_path)

    # 3. Delete DB row
    supabase.table("packet_captures") \
        .delete() \
        .eq("owner_email", user_email) \
        .eq("capture_id", capture_id) \
        .execute()

    return {"message": "Capture deleted successfully"}