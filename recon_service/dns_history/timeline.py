# dns_history/timeline.py

def analyze_dns_timeline(history: dict):
    """
    Passive analysis of DNS changes.
    """

    if "error" in history:
        return history

    changes = {}

    for entry in history["timelines"]:
        rtype = entry["type"]
        changes.setdefault(rtype, 0)
        changes[rtype] += 1

    return {
        "record_types_observed": list(changes.keys()),
        "change_frequency": changes,
        "notes": "All data is from passive historical observation"
    }
