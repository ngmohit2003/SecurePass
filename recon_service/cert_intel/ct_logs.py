import requests
from collections import defaultdict

CRT_SH_URL = "https://crt.sh/"

def fetch_certificates(domain: str):
    """
    Fetch certificate transparency records from crt.sh
    Passive, public, no interaction with target servers.
    """
    params = {
        "q": domain,
        "output": "json"
    }

    try:
        resp = requests.get(CRT_SH_URL, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        return {
            "error": "Failed to fetch CT data, due to potential predefined rate limitations",
            "details": str(e)
        }

    certs = defaultdict(list)
    subdomains = set()

    for entry in data:
        common_name = entry.get("common_name")
        name_value = entry.get("name_value", "")

        issuer = entry.get("issuer_name")
        not_before = entry.get("not_before")
        not_after = entry.get("not_after")

        # name_value may contain multiple domains (newline-separated)
        names = name_value.split("\n")
        for name in names:
            if name.endswith(domain):
                subdomains.add(name.strip())

        certs["certificates"].append({
            "common_name": common_name,
            "issuer": issuer,
            "valid_from": not_before,
            "valid_to": not_after
        })

    return {
        "total_certificates": len(certs["certificates"]),
        "unique_subdomains": sorted(subdomains),
        "certificates": certs["certificates"]
    }
