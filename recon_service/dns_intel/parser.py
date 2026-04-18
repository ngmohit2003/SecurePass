def analyze_consistency(dns_data: dict):
    a_records = {}

    for resolver, records in dns_data.items():
        a_records[resolver] = set(records.get("A", {}).get("records", []))

    unique_sets = set(tuple(sorted(v)) for v in a_records.values())

    return {
        "resolver_consistency": len(unique_sets) == 1,
        "observed_sets": {
            resolver: list(values)
            for resolver, values in a_records.items()
        }
    }
