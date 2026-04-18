import React, { useEffect, useRef, useState } from "react";
import { showError, showSuccess } from "../utils/toast";
import Spinner from "../components/Spinner";
import {
  startCapture,
  listCaptures,
  analyzeCapture,
  downloadCapture,
  deleteCapture,
} from "../api/packetApi";
import Navbar2 from "../components/Navbar2";

export default function PacketAnalyzer() {
  const [captures, setCaptures] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [activeCaptureId, setActiveCaptureId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
 const [downloadingId, setDownloadingId] = useState(null);


  const timerRef = useRef(null);
  const notifyAudio = useRef(new Audio("/notify.mp3"));



  async function loadCaptures() {
  try {
    setIsLoading(true); // 🔄 START SPINNER

    const data = await listCaptures();
    setCaptures(data.captures || []);
  } catch (err) {
    showError("Failed to load captures ❌");
  } finally {
    setIsLoading(false); // ✅ STOP SPINNER
  }
}


  async function handleCapture() {
    setLoading(true);
    setCountdown(60);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timerRef.current);
          notifyAudio.current.play();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    await startCapture();
    await loadCaptures();
    setLoading(false);
  }

  async function handleAnalyze(id) {
    setAnalysis(null);
    setActiveCaptureId(id);
    const data = await analyzeCapture(id);
    showSuccess("Analysis completed");
    setAnalysis(data.analysis);
  }



  async function handleDelete(id) {
  const ok = window.confirm("Are you sure you want to delete this capture?");
  if (!ok) return;

  try {
    setDeletingId(id);

    await deleteCapture(id);
    showSuccess("Capture deleted successfully ✅");

    if (activeCaptureId === id) {
      setAnalysis(null);
      setActiveCaptureId(null);
    }

    await loadCaptures();
  } catch (error) {
    showError("Failed to delete capture ❌");
  } finally {
    setDeletingId(null);
  }
}


  useEffect(() => {
    loadCaptures();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#b46dfb] to-[#5217d3] rounded-md  ">
      <Navbar2 />

      <div className="max-w-7xl mx-auto px-4 py-16 animate-fadeIn">
        {/* HEADER */}
        <div className="text-center mb-10 mt-18">
          <h1 className="text-4xl font-bold text-gray-800">
           Live Packet Analyzer
          </h1>
          <p className="text-gray-600 mt-2">
            Capture and analyze network traffic in real time
          </p>
        </div>

        {/* START CAPTURE */}
        <div className="flex flex-col items-center mb-10  gap-2">
          <button
            onClick={handleCapture}
            disabled={loading}
            className="bg-[#9659FB] hover:bg-[#9659FB]
                       text-white px-10 py-4 rounded-xl
                       font-semibold text-lg
                       transition transform hover:scale-[1.02]"
          >
            {loading ? "Capturing..." : "Start New Capture"}
          </button>

             {isLoading && (
  <div className="flex justify-center py-12">
    <Spinner size={60} />
  </div>
)}

          {countdown !== null && countdown > 0 && (
            <div className="font-mono text-lg text-gray-700 animate-pulse">
              ⏳ Capturing packets:{" "}
              <span className="font-bold">{countdown}s</span>
            </div>
          )}

          {countdown === 0 && (
            <div className="text-green-600 font-semibold">
              ✅ Capture completed
            </div>
          )}
        </div>

        {/* CAPTURE LIST */}
        <div className=" max-w-9xl p-6 mb-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
             My Captures
          </h2>

         {/* {isLoading && (
  <div className="flex justify-center py-12">
    <Spinner size={60} />
  </div>
)} */}
          {captures.length === 0 && (
            <p className="text-gray-500">No captures yet</p>
          )}

          <div className="space-y-8">
            {captures.map((c) => (
              <div
                key={c.capture_id}
                className="  flex flex-col md:flex-row md:items-center
  justify-between gap-4
  p-8 rounded-xl
  bg-white/10 backdrop-blur-2xl
  border border-white/20
  hover:shadow-xl hover:bg-white/20
  transition-all duration-300
 "
              >
                <div>
                  <p className="font-mono text-xl font-bold text-gray-800">
                    {c.capture_id}
                  </p>
                  <p className="text-lg font-semibold text-gray-500">
                    Packets: {c.packet_count} · Duration: {c.duration}s
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                 <button
  onClick={() => handleAnalyze(c.capture_id)}
  disabled={activeCaptureId === c.capture_id && !analysis}
  className={`px-4 py-2 rounded-lg text-lg font-medium text-white
    ${
      activeCaptureId === c.capture_id && !analysis
        ? "bg-gray-400 cursor-not-allowed"
        : activeCaptureId === c.capture_id && analysis
        ? "bg-[#9659FB]"
        : "bg-[#9659FB] hover:bg-[#9659FB/90]"
    }
  `}
>
  {activeCaptureId === c.capture_id && !analysis
    ? "Analyzing..."
    : activeCaptureId === c.capture_id && analysis
    ? "Analyzed"
    : "Analyze"}
</button>

                  <button
  onClick={() => downloadCapture(c.capture_id)}
  className="bg-[#4ea9f8] hover:bg-[#4ea9f8/50]
             text-white px-6 py-4 rounded-lg
             text-lg font-medium"
>
  Download PCAP
</button>

                 {/* <button
  onClick={() => handleDelete(c.capture_id)}
  className="bg-rose-600 hover:bg-rose-700
             text-white px-4 py-2 rounded-lg
             text-md font-medium"
>
  Delete
</button> */}
<button
  onClick={() => handleDelete(c.capture_id)}
  disabled={deletingId === c.capture_id}
  className={`px-4 py-2 rounded-lg text-lg font-medium text-white
    ${
      deletingId === c.capture_id
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-[#e62f1a] hover:bg-[#e74c3c]/90"
    }
  `}
>
  {deletingId === c.capture_id
    ? "Deleting..."
    : "Delete"}
</button>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ANALYSIS */}

<section  >
        {analysis && (
          <>
            
            <h2 className="text-2xl font-semibold text-center mb-8 text-white">
               Capture ID —{" "}
              <span className="font-mono">{activeCaptureId}</span>
            </h2>

            <div className="grid md:grid-cols-2  gap-6 mb-10">
              <StatCard title="TCP Packets" value={analysis.tcp_packets} />
              <StatCard title="UDP Packets" value={analysis.udp_packets} />
            </div>

            <AnalysisCard title="🌐 DNS Queries">
              {Object.keys(analysis.dns_queries).length === 0 ? (
                <p className="text-black">No DNS queries</p>
              ) : (
                Object.entries(analysis.dns_queries).map(([d, c]) => (
                  <p key={d}>{d} → {c}</p>
                ))
              )}
            </AnalysisCard>

            <AnalysisCard title="🚨 SYN Flood Suspects">
              {Object.keys(analysis.syn_flood_suspects).length === 0 ? (
                <p className="text-black">No suspicious activity</p>
              ) : (
                Object.entries(analysis.syn_flood_suspects).map(
                  ([ip, count]) => (
                    <p key={ip}>{ip} → {count} SYN packets</p>
                  )
                )
              )}
            </AnalysisCard>

            <AnalysisCard title="📡 Top Source IPs">
              {analysis.top_source_ips.map(([ip, count]) => (
                <p key={ip}>{ip} → {count} packets</p>
              ))}
            </AnalysisCard>
          </>
        )}

        </section>
      </div>
    </div>
  );
}

/* =======================
   UI COMPONENTS
======================= */

function StatCard({ title, value }) {
  return (
    <div className=" rounded-xl shadow p-6 text-center">
      <p className="text-black text-3xl mb-2">{title}</p>
      <p className="text-2xl font-bold text-black">{value}</p>
    </div>
  );
}

function AnalysisCard({ title, children }) {
  return (
    <div className=" rounded-xl shadow p-6 mb-6">
      <h3 className="text-3xl font-semibold mb-3 text-black">
        {title}
      </h3>
      <div className="text-md text-black space-y-1">
        {children}
      </div>
    </div>
  );
}
