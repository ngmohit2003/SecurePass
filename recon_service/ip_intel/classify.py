# ip_intel/classify.py

KNOWN_CLOUD_KEYWORDS = [
    "amazon", "aws", "google", "microsoft",
    "azure", "cloudflare", "akamai", "fastly"
]


def classify_hosting(org_name: str):
    if not org_name:
        return "unknown"

    name = org_name.lower()

    for keyword in KNOWN_CLOUD_KEYWORDS:
        if keyword in name:
            return "cloud / managed provider"

    return "isp / dedicated hosting"
