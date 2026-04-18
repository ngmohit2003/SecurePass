from fastapi import FastAPI, Depends
from dotenv import load_dotenv
from pathlib import Path

from auth_dependencies import get_current_user
from models import DomainIntelRequest, DomainIntelResponse
from models import DomainRequest


from dns_intel.live_records import query_dns
from dns_intel.parser import analyze_consistency

from cert_intel.ct_logs import fetch_certificates



from dns_history.history_client import fetch_dns_history
from dns_history.parser import parse_dns_history
from dns_history.timeline import analyze_dns_timeline


from ip_intel.enrich import enrich_ip



BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent


load_dotenv(PROJECT_ROOT / "shared" / "jwt_config.env")
load_dotenv(BASE_DIR / ".env")


app = FastAPI(
    title="Passive Recon Intelligence Service",
    description="Passive domain intelligence using publicly available data",
    version="1.0"
)


from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "recon_service running"}







@app.post("/domain-intel")
def domain_intel(
    payload: DomainRequest,
    user_email: str = Depends(get_current_user)
):
    domain = payload.domain.strip().lower()

    dns_data = query_dns(domain)  # DNS Intelligence
    
    cert_data = fetch_certificates(domain)   # cert transparency

    dns_history_raw = fetch_dns_history(domain)
    dns_history_parsed = parse_dns_history(dns_history_raw)
    dns_history_analysis = analyze_dns_timeline(dns_history_parsed)


    # very risky part................
    resolved_ips = set()

    for resolver in dns_data.get("A", {}).values():
        resolved_ips.update(resolver)

    for resolver in dns_data.get("AAAA", {}).values():
        resolved_ips.update(resolver)

    resolved_ips = list(resolved_ips)

    ip_intelligence = [enrich_ip(ip) for ip in resolved_ips]


    return {
        "disclaimer": (
            "All data derived via publicly available sources. "
            "No scanning, probing, or interaction with target systems."
        ),
        "domain": domain,
        "dns": dns_data,
        "dns_history": dns_history_analysis,
        "ip_intelligence": ip_intelligence,
        "certificates": cert_data,
        

    }



