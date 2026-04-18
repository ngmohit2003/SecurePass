# dns_history/history_client.py

import os
import requests

SECURITYTRAILS_API = "https://api.securitytrails.com/v1/domain/{domain}/dns"

API_KEY = os.getenv("SECURITYTRAILS_API_KEY")


def fetch_dns_history(domain: str):
    """
    Fetch passive DNS history from public datasets.
    No probing, no scanning.
    """

    if not API_KEY:
        return {"error": "DNS history provider not configured, potential lack of authorization"}

    headers = {
        "apikey": API_KEY,
        "accept": "application/json"
    }

    url = SECURITYTRAILS_API.format(domain=domain)

    try:
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        return resp.json()

    except Exception as e:
        return {"error": str(e)}
