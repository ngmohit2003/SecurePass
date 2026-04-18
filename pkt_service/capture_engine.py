import subprocess
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

CAPTURE_DIR = BASE_DIR / os.getenv("CAPTURE_DIR")
CAPTURE_DIR.mkdir(exist_ok=True)

def start_packet_capture(capture_id: str):
    duration = os.getenv("CAPTURE_DURATION", "60")
    interface = os.getenv("CAPTURE_INTERFACE", "1")

    pcap_path = CAPTURE_DIR / f"{capture_id}.pcap"

    command = [
        "tshark",
        "-i", interface,
        "-a", f"duration:{duration}",
        "-w", str(pcap_path)
    ]

    # Start capture (blocking call)
    subprocess.run(
        command,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        shell=False
    )

    return pcap_path



# notes..
# -a duration:60 → tshark auto-stops
# subprocess.run() → blocks until capture finishes
# No shell injection
# No user-controlled parameters