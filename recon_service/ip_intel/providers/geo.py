# ip_intel/providers/geo.py

import requests


def fetch_geo(ip: str):
    """
    Passive IP geolocation using public metadata.
    No packets sent to target infrastructure.
    """
    url = f"http://ip-api.com/json/{ip}"

    try:
        r = requests.get(url, timeout=8)
        r.raise_for_status()
        data = r.json()

        if data.get("status") != "success":
            return {"error": "geo lookup failed"}

        return {
            "country": data.get("country"),
            "region": data.get("regionName"),
            "city": data.get("city"),
            "isp": data.get("isp"),
            "org": data.get("org"),
            "asn": data.get("as")
        }

    except Exception as e:
        return {"error": str(e)}
