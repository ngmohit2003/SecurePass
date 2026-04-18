import React, { useState, useRef } from "react";
import { generateHashes } from "../api/api";
import { showError, showSuccess } from "../utils/toast";
import { FaCopy, FaExternalLinkAlt } from "react-icons/fa";
import Navbar2 from "../components/Navbar2";
import Footer from "../components/Footer";

const Hash_gen = () => {
  const [text, setText] = useState("");
  const [hashes, setHashes] = useState(null);
  const [loading, setLoading] = useState(false);

  const resultRef = useRef(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!text) return showError("Enter password");

    setLoading(true);
    try {
      const result = await generateHashes(text);
      setHashes(result);
      console.log("data is",result);
      showSuccess("Hashes generated successfully");

      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    } catch (err) {
      showError("Failed to generate hashes");
    } finally {
      setLoading(false);
    }
  };

  const copyHash = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      showSuccess("Hash copied to clipboard");
    } catch {
      showError("Failed to copy");
    }
  };

  const goToCrackPage = () => {
    window.location.href = "/crack-page";
  };

  return (
    <div className="min-h-screen">
      <Navbar2 />

      {/* =========================
          SECTION 1
      ========================== */}
      <section
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4"
        style={{ backgroundImage: "url('hash3.png')" }}
      >
        <div className="text-center w-full max-w-4xl">

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-2 ">
            Hash Generator
          
          </h1>
   <p className=" text-white mt-1 text-md mb-10">
            Generate cryptographic hashes
            </p>
          

          {/* <div className="w-16 h-1 bg-purple-600 mx-auto mb-8 rounded-full"></div> */}
          {/* <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6"></div> */}
          <div className=" p-6">
            <form onSubmit={handleGenerate}>
              <input
                className="w-full p-4 rounded-xl border font-mono
                         focus:ring-2 focus:ring-[#9659FB] text-black outline-none mb-8 backdrop-blur-2xl"
                placeholder="Enter password to create hash"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              <button
                className="w-full bg-[#9659FB] hover:bg-[#9659FB]
                         text-white py-4 rounded-xl font-semibold
                         transition transform duration-300 hover:scale-[1.03]"
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Hashes"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* =========================
          SECTION 2 - RESULTS
      ========================== */}
      {hashes && (
        <section
          ref={resultRef}
          className="py-16 sm:py-20 px-4 bg-gradient-to-br from-[#9e5fc7] rounded-md   to-[#431a69]"
        >
          <div className="max-w-6xl mx-auto">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
              <h2 className="text-3xl font-bold text-gray-800">
                Generated Hashes
              </h2>

              <button
                onClick={goToCrackPage}
                className="flex items-center gap-2
                           bg-red-600 hover:bg-red-700
                           text-white px-4 py-2 rounded-lg
                           text-sm font-medium transition"
              >
                Check Compromised Password
                <FaExternalLinkAlt className="text-xs" />
              </button>
            </div>

            <div className="flex flex-col gap-8">

              {/* 🔥 COLORS FLIPPED HERE */}

              <HashBlock
                title="SHA-256"
                value={hashes.sha256}
                onCopy={copyHash}
                bgColor="bg-purple-500"
              />

              <HashBlock
                title="SHA-512"
                value={hashes.sha512}
                onCopy={copyHash}
                bgColor="bg-purple-600"
              />

              <HashBlock
                title="Bcrypt"
                value={hashes.bcrypt}
                onCopy={copyHash}
                bgColor="bg-purple-400"
              />

              <HashBlock
                title="Argon2"
                value={hashes.argon2}
                onCopy={copyHash}
                bgColor="bg-purple-300"
              />

              <HashBlock
                title="Blake2"
                value={hashes.blake2}
                onCopy={copyHash}
                bgColor="bg-purple-200"
              />

            </div>
          </div>
        </section>
      )}

      {/* <Footer /> */}
    </div>
  );
};

function HashBlock({ title, value, onCopy, bgColor }) {
  return (
    <div className={`rounded-2xl shadow-xl p-4 sm:p-6 ${bgColor}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-md font-semibold bg-gray-100 text-black px-2 py-1 rounded">
          {title}
        </p>

        <button
          onClick={() => onCopy(value)}
          className="flex items-center gap-1 text-md text-black hover:text-gray-900 transition"
        >
          <FaCopy />
          Copy
        </button>
      </div>

      <pre
        className="
           bg-gray-400 text-black text-md
  p-4 rounded-lg
  break-all whitespace-pre-wrap
  overflow-x-auto
        "
      >
        {value}
      </pre>
    </div>
  );
}

export default Hash_gen;


