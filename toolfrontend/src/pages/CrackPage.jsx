import React, { useState, useRef } from "react";
import { startCrackerJob, getJobStatus } from "../api/api";
import Navbar2 from "../components/Navbar2";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { showError } from "../utils/toast";

export default function CrackPage() {
  const [targetHash, setTargetHash] = useState("");
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const { width, height } = useWindowSize();
  const resultRef = useRef(null);

  const handleStart = async (e) => {
    e.preventDefault();
    const cleanHash = targetHash.trim();
    if (!cleanHash) return showError("Enter hash First");

    setLoading(true);
    setResult(null);
    setStatus("Starting...");

    try {
      const resp = await startCrackerJob({
        target_hash: cleanHash,
      });

      if (!resp || !resp.job_id) {
        throw new Error("Failed to start job");
      }

      poll(resp.job_id);
    } catch (err) {
      setLoading(false);
    }
  };

  const poll = (id) => {
    const interval = setInterval(async () => {
      try {
        const j = await getJobStatus(id);
        setStatus(j.status);

        if (j.status === "done" || j.status === "failed") {
          clearInterval(interval);
          setResult(j.result || { error: j.error });
          setLoading(false);

          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 500);
        }
      } catch (err) {
        clearInterval(interval);
        setLoading(false);
        setResult({ error: "Failed to fetch job status" });
      }
    }, 1000);
  };

  const isSuccess = result && !result.error && result.found;

  return (
    <div className="bg-[#AE9FC3] overflow-x-hidden">
      <Navbar2 />

      {/* ================= FIRST SECTION ================= */}
     <section
  className="min-h-screen pt-14 sm:pt-18 lg:pt-20 flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 lg:px-16 bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: "url('dns.png')" }}
>

  {/* LEFT SIDE HEADING */}
  <div className="w-full lg:w-2/5 flex justify-center lg:justify-start mb-12 lg:mb-0">
    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black text-center lg:text-left animate-pulse">
      Hash Cracker
    </h1>
  </div>

  {/* RIGHT SIDE FORM */}
  <div className="w-full lg:w-3/5 max-w-4xl space-y-6">

    <form onSubmit={handleStart} className="space-y-6">

      <input
        className="w-full p-4 rounded-xl font-mono text-black
                   focus:ring-2 focus:ring-[#9659FB] outline-none
                   backdrop-blur bg-white/20"
        placeholder="Paste hash here (no spaces)"
        value={targetHash}
        onChange={(e) => setTargetHash(e.target.value)}
      />

      <button
        className="w-full bg-[#9659FB] text-white py-4 rounded-xl font-semibold
                   transition transform hover:scale-[1.03]"
        disabled={loading}
      >
        {loading ? "Cracking..." : "Start Cracking"}
      </button>

    </form>

    {status && (
      <div className="mt-4 text-center lg:text-center animate-pulse">
        <span className="inline-block bg-gray-200 text-gray-700
                         px-4 py-2 rounded-full text-sm font-medium">
          Status: {status}
        </span>
      </div>
    )}

  </div>

</section>

      {/* ================= SECOND SECTION ================= */}
      {result && (
        <section
          ref={resultRef}
          className={`relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-12 transition-all duration-700
          ${
            !isSuccess
              ? "bg-gradient-to-br from-green-400 to-green-600"
              : "bg-gradient-to-br from-red-500 to-red-700"
          }`}
        >
          {!isSuccess && (
            <Confetti
              width={width}
              height={height}
              numberOfPieces={400}
              recycle={false}
            />
          )}

          <div className="w-full max-w-6xl">
            <div className="grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl bg-white/10 border border-white/20">

              {/* LEFT ICON SIDE */}
              <div className="relative flex items-center justify-center p-8 sm:p-12 md:p-16">
                <div
                  className={`absolute w-60 sm:w-80 h-60 sm:h-80 rounded-full blur-3xl opacity-30 
                  ${!isSuccess ? "bg-green-300" : "bg-red-300"}`}
                ></div>

                <div className="relative bg-white/20 p-6 sm:p-10 rounded-full shadow-xl backdrop-blur-lg border border-white/30">
                  <img
                    src={
                      !isSuccess
                        ? "https://cdn-icons-png.flaticon.com/512/190/190411.png"
                        : "https://cdn-icons-png.flaticon.com/512/463/463612.png"
                    }
                    alt="result"
                    className="w-24 sm:w-32 md:w-40 animate-pulse"
                  />
                </div>
              </div>

              {/* RIGHT RESULT SIDE */}
              <div className="flex flex-col justify-center p-6 sm:p-10 md:p-14 text-white border-t md:border-t-0 md:border-l border-white/20">

                {result.error ? (
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
                    ❌ {result.error}
                  </h2>
                ) : (
                  <>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-8">
                      {isSuccess
                        ? "Compromised"
                        : "Secured 🎉"}
                    </h2>

                    <div className="space-y-4 sm:space-y-6">
                      <ResultRow
                        label="Algorithm"
                        value={result.algorithm || "Unknown"}
                      />
                      <ResultRow
                        label="Found"
                        value={result.found ? "Yes" : "No"}
                      />
                      <ResultRow
                        label="Compromised"
                        value={result.compromised ? "Yes" : "No"}
                      />
                    </div>

                    {result.plaintext && (
                      <div className="mt-8 bg-white text-black rounded-2xl p-4 sm:p-6 shadow-xl">
                        <p className="font-semibold mb-2 text-gray-600">
                          Cracked Password
                        </p>
                        <p className="font-mono break-all text-base sm:text-lg font-bold">
                          {result.plaintext}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ResultRow({ label, value }) {
  return (
    <div className="flex justify-between items-center bg-white/10 px-4 sm:px-6 py-3 sm:py-4 rounded-xl backdrop-blur-md border border-white/20 hover:bg-white/20 transition">
      <span className="font-medium text-base sm:text-lg opacity-90">
        {label}
      </span>
      <span className="font-bold text-base sm:text-lg">
        {value}
      </span>
    </div>
  );
}