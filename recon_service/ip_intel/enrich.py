# ip_intel/enrich.py

from ip_intel.providers.ipinfo import fetch_ipinfo
from ip_intel.providers.bgpview import fetch_bgpview
from ip_intel.classify import classify_hosting

from ip_intel.providers.geo import fetch_geo


def enrich_ip(ip: str):
    ipinfo = fetch_ipinfo(ip)
    bgp = fetch_bgpview(ip)
    geo = fetch_geo(ip)
    org = ipinfo.get("org") if isinstance(ipinfo, dict) else None

  
    return {
        "ip": ip,
        "asn": ipinfo.get("asn", {}).get("asn") or geo.get("asn"),
        "asn_org": ipinfo.get("org") or geo.get("org"),
        "country": ipinfo.get("country") or geo.get("country"),
        "region": ipinfo.get("region") or geo.get("region"),
        "hosting_type": classify_hosting(
            ipinfo.get("org") or geo.get("org")
        ),
        "notes": "Derived from public BGP and geolocation metadata"
    }

