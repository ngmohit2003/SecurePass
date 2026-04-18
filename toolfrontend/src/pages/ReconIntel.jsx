
import React, { useState } from "react";
import { fetchDomainIntel } from "../api/reconApi";
import Navbar2 from "../components/Navbar2";
import { showError,showSuccess } from "../utils/toast";

/* =======================
   DOWNLOAD HELPERS
======================= */

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadJSON(data, domain) {
  downloadFile(
    JSON.stringify(data, null, 2),
    `${domain}_recon_report.json`,
    "application/json"
  );
}

function downloadIPCSV(ips, domain) {
  if (!Array.isArray(ips) || ips.length === 0) return;

  const headers = ["IP", "ASN", "Org", "Country", "Region", "Hosting"];
  const rows = ips.map((ip) =>
    [
      ip.ip,
      ip.asn || "",
      ip.asn_org || "",
      ip.country || "",
      ip.region || "",
      ip.hosting_type || "",
    ].join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  downloadFile(csv, `${domain}_ip_intelligence.csv`, "text/csv");
}

function downloadSubdomainsTXT(subdomains, domain) {
  if (!Array.isArray(subdomains) || subdomains.length === 0) return;
  downloadFile(subdomains.join("\n"), `${domain}_subdomains.txt`, "text/plain");
}

const cleanDomain = (domain) => {
  return domain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .toLowerCase()
    .trim();
};

// Validate real-world domain format
const isValidDomain = (domain) => {
  const domainRegex =
    /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
};

/* =======================
   MAIN COMPONENT
======================= */

export default function ReconIntel() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleAnalyze() {
    if (!domain.trim()) {
      showError("Please enter a domain");
      return;
    }

    // these cleaned part is added for checking right domain 

      const cleanedService = cleanDomain(domain);
     if (!isValidDomain(cleanedService)) {
       showError("Enter valid service domain (e.g., google.com)");
       return;
     }


    setLoading(true);
    setError(null);
    setResult(null);



    try {
      const data = await fetchDomainIntel(domain.trim());
      
      setResult(data);
       showSuccess("Analysis completed successfully ");
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }


  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Navbar2 />

      <div
        className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-16 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('dns3.png')" }}
      >
        {/* ================= HEADER ================= */}
        <div className="max-w-6xl mx-auto pt-30 mb-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black animate-pulse">
              DNS Records
            </h1>
            <p className="text-black mt-4 text-sm sm:text-base">
              Passive DNS, IP intelligence & certificate discovery
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="instagram.com"
              className="w-full p-4 rounded-xl border font-mono
                         focus:ring-2 focus:ring-[#9659FB] outline-none
                         backdrop-blur bg-white/30"
            />

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-[#9659FB] text-white py-4 rounded-xl font-semibold
                         transition transform hover:scale-[1.03]"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mt-6 text-center">
              {error}
            </div>
          )}

          {result && (
            <>
              {/* SUMMARY */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-12">
                <SummaryCard title="IPs Found" value={result.ip_intelligence?.length || 0} />
                <SummaryCard title="DNS Records" value={Object.keys(result.dns || {}).length} />
                <SummaryCard title="Certificates" value={result.certificates?.total_certificates || 0} />
                <SummaryCard title="Resolvers" value={3} />
              </div>

              {/* DOWNLOAD BUTTONS */}
              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <button
                  onClick={() => downloadJSON(result, domain)}
                  className="bg-neutral-900 text-white px-5 py-2 rounded-lg text-sm"
                >
                  ⬇ Full JSON
                </button>

                <button
                  onClick={() => downloadIPCSV(result.ip_intelligence, domain)}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm"
                >
                  ⬇ IP CSV
                </button>

                <button
                  onClick={() =>
                    downloadSubdomainsTXT(
                      result.certificates?.unique_subdomains,
                      domain
                    )
                  }
                  className="bg-teal-600 text-white px-5 py-2 rounded-lg text-sm"
                >
                  ⬇ Subdomains TXT
                </button>
              </div>
            </>
          )}
        </div>

        {/* ================= DATA SECTION ================= */}
        {result && (
          <div className="max-w-8xl mx-auto bg-gradient-to-br from-[#b46dfb] to-[#5217d3] rounded-2xl p-6 sm:p-10">

            {/* DISCLAIMER */}
            {result.disclaimer && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-10 text-sm text-gray-700">
                ⚠️ {result.disclaimer}
              </div>
            )}

            {/* DNS LIVE RECORDS */}
            <Section title="DNS Live Records">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {Object.entries(result.dns || {}).map(([type, resolvers]) => (
                  <div key={type}>
                    <h4 className="text-2xl sm:text-3xl mb-4 text-black">
                      {type} Records
                    </h4>

                    {Object.entries(resolvers).map(([resolver, records]) => (
                      <div key={resolver} className="mb-6">
                        <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-2 rounded text-sm mb-2">
                          {resolver}
                        </span>

                        {records?.length ? (
                          <ul className="list-disc list-inside space-y-1">
                            {records.map((r, i) => (
                              <li key={i} className="break-all">{r}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="italic text-sm">No records</p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Section>

            {/* DNS HISTORY */}
            <Section title="DNS History">
              {result.dns_history?.error ? (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm">
                  ⚠️ {result.dns_history.error}
                </div>
              ) : (
                <>
                  <p className="font-medium mb-2">
                    Observed Record Types
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {result.dns_history?.record_types_observed?.map((t) => (
                      <span key={t} className="bg-gray-200 px-2 py-1 rounded text-xs">
                        {t}
                      </span>
                    ))}
                  </div>

                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(
                      result.dns_history?.change_frequency || {},
                      null,
                      2
                    )}
                  </pre>
                </>
              )}
            </Section>

            {/* IP INTELLIGENCE */}
            <Section title="IP Intelligence">
              {result.ip_intelligence?.map((ip) => (
                <div key={ip.ip} className="mb-6">
                  <p><strong>IP:</strong> {ip.ip}</p>
                  <p><strong>ASN:</strong> {ip.asn || "—"}</p>
                  <p><strong>Org:</strong> {ip.asn_org || "—"}</p>
                  <p><strong>Country:</strong> {ip.country || "—"}</p>
                  <p><strong>Region:</strong> {ip.region || "—"}</p>
                  <p><strong>Hosting:</strong> {ip.hosting_type}</p>
                </div>
              ))}
            </Section>

            {/* CERTIFICATES */}
            <Section title="Certificate Transparency">
              <p className="mb-3">
                <strong>Total Certificates:</strong>{" "}
                {result.certificates?.total_certificates || 0}
              </p>

              <div className="flex flex-wrap gap-2">
                {result.certificates?.unique_subdomains?.length ? (
                  result.certificates.unique_subdomains.map((s) => (
                    <span
                      key={s}
                      className="bg-emerald-100 text-emerald-700
                                 px-2 py-1 rounded text-sm break-all"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="italic">
                    No subdomains found
                  </span>
                )}
              </div>
            </Section>

          </div>
        )}
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Section({ title, children }) {
  return (
    <div className="mb-16">
      <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 text-black">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-300">
      <p className="text-sm text-black uppercase tracking-wide">
        {title}
      </p>
      <p className="text-4xl font-bold text-[#9659FB] mt-2">
        {value}
      </p>
    </div>
  );
}