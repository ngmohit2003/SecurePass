# ip_intel/providers/bgpview.py

import requests

def fetch_bgpview(ip: str):
    url = f"https://api.bgpview.io/ip/{ip}"

    try:
        r = requests.get(url, timeout=8)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        return {"error": str(e)}
