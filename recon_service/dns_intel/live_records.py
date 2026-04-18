import dns.resolver
from .resolvers import PUBLIC_RESOLVERS, DNS_RECORD_TYPES



PUBLIC_RESOLVERS = {
    "google": "8.8.8.8",
    "cloudflare": "1.1.1.1",
    "quad9": "9.9.9.9"
}

RECORD_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA"]


def query_dns(domain: str):
    results = {}

    for record in RECORD_TYPES:
        results[record] = {}

        for name, resolver_ip in PUBLIC_RESOLVERS.items():
            try:
                resolver = dns.resolver.Resolver()
                resolver.nameservers = [resolver_ip]
                answers = resolver.resolve(domain, record, lifetime=3)

                results[record][name] = [str(r) for r in answers]

            except Exception as e:
                results[record][name] = []

    return results


