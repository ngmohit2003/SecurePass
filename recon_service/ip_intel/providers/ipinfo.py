# ip_intel/providers/ipinfo.py

import os
import requests

IPINFO_TOKEN = os.getenv("IPINFO_TOKEN")


def fetch_ipinfo(ip: str):
    if not IPINFO_TOKEN:
        return {"error": "ipinfo token not configured"}

    url = f"https://ipinfo.io/{ip}?token={IPINFO_TOKEN}"

    try:
        r = requests.get(url, timeout=8)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        return {"error": str(e)}
