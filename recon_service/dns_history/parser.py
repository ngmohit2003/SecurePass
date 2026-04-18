# dns_history/parser.py

def parse_dns_history(raw: dict):
    """
    Normalize DNS history into structured timelines.
    """

    if "error" in raw:
        return raw

    timelines = []

    records = raw.get("records", [])

    for record in records:
        timelines.append({
            "type": record.get("type"),
            "value": record.get("value"),
            "first_seen": record.get("first_seen"),
            "last_seen": record.get("last_seen"),
        })

    return {
        "total_observed_records": len(timelines),
        "timelines": timelines
    }
