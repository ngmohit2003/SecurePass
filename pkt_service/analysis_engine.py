# basic packet stats...
import subprocess
from collections import Counter
from datetime import datetime

def run_tshark(command):
    result = subprocess.run(
        command,
        capture_output=True,
        text=True
    )
    return result.stdout.strip().splitlines()



# tcp/udp Packet count
def count_tcp_udp(pcap_path):
    tcp_packets = run_tshark([
        "tshark", "-r", pcap_path,
        "-Y", "tcp",
        "-T", "fields",
        "-e", "frame.number"
    ])

    udp_packets = run_tshark([
        "tshark", "-r", pcap_path,
        "-Y", "udp",
        "-T", "fields",
        "-e", "frame.number"
    ])

    return {
        "tcp_count": len(tcp_packets),
        "udp_count": len(udp_packets)
    }



# dns query extraction 
def extract_dns_queries(pcap_path):
    dns_lines = run_tshark([
        "tshark", "-r", pcap_path,
        "-Y", "dns && dns.qry.name",
        "-T", "fields",
        "-e", "dns.qry.name"
    ])

    domains = [d for d in dns_lines if d]
    return dict(Counter(domains))



# syn packet detection
def count_syn_packets(pcap_path):
    syn_packets = run_tshark([
        "tshark", "-r", pcap_path,
        "-Y", "tcp.flags.syn == 1 && tcp.flags.ack == 0",
        "-T", "fields",
        "-e", "ip.src"
    ])

    return syn_packets




# syn flood detection only...
def detect_syn_flood(pcap_path, threshold=100):
    syn_sources = count_syn_packets(pcap_path)
    counts = Counter(syn_sources)

    suspicious = {
        ip: count
        for ip, count in counts.items()
        if count >= threshold
    }

    return suspicious




# top source IPs
def top_source_ips(pcap_path, limit=5):
    src_ips = run_tshark([
        "tshark", "-r", pcap_path,
        "-T", "fields",
        "-e", "ip.src"
    ])

    counts = Counter(ip for ip in src_ips if ip)
    return counts.most_common(limit)




# Packet Timestamps 
def extract_timestamps(pcap_path, limit=20):
    times = run_tshark([
        "tshark", "-r", pcap_path,
        "-T", "fields",
        "-e", "frame.time"
    ])

    return times[:limit]





# merged analysis details....
def analyze_pcap(pcap_path):
    stats = count_tcp_udp(pcap_path)
    dns = extract_dns_queries(pcap_path)
    syn_flood = detect_syn_flood(pcap_path)
    top_ips = top_source_ips(pcap_path)

    return {
        "tcp_packets": stats["tcp_count"],
        "udp_packets": stats["udp_count"],
        "dns_queries": dns,
        "syn_flood_suspects": syn_flood,
        "top_source_ips": top_ips
    }
