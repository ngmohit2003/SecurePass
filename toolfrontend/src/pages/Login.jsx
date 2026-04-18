import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showError, showSuccess } from "../utils/toast";
import bgImage from "../assets/machinelearning.png";
export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const API_URL = "http://127.0.0.1:8000";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [form, setForm] = useState({
    email: "",
    otp: "",
  });

  /* =======================
     STEP 1 — SEND OTP
  ======================= */
  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email),
      });

      if (!res.ok) throw new Error("OTP send failed");

      setForm((prev) => ({ ...prev, email }));
      setStep(2);
      showSuccess("OTP sent to your email 📩");
    } catch (err) {
      showError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     STEP 2 — VERIFY OTP
  ======================= */
  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(
          typeof data.detail === "string"
            ? data.detail
            : "Invalid OTP"
        );
        return;
      }

      login(data.access_token);
      showSuccess("Login successful 🎉");

      setTimeout(() => {
        navigate("/password-generator", { replace: true });
      }, 300);
    } catch (err) {
      showError("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div
    className="min-h-screen flex items-center justify-center lg:justify-start 
               px-4 sm:px-6 lg:px-12 
               bg-cover bg-center relative"
    style={{
      // backgroundImage: "url('/machinelearning.png')",
      backgroundImage: `url(${bgImage})`,
    }}
  >
    {/* DARK OVERLAY */}
    <div className="absolute inset-0"></div>

    {/* LOGIN CARD */}
    <div className="relative w-full max-w-md 
                    lg:ml-40 
                    backdrop-blur-md rounded-2xl 
                    shadow-2xl 
                    p-6 sm:p-8 
                    animate-fadeIn">

      {/* BRAND */}
      <div className="text-center mb-8">
        <Link to="/">
          <h1 className="text-4xl sm:text-5xl 
                         font-bold font-mono 
                         bg-gradient-to-r from-[#9659FB] to-[#A897D2] 
                         bg-clip-text text-transparent">
            SecurePass
          </h1>
        </Link>
        <p className="text-white text-sm mt-1">
          Passwordless Authentication
        </p>
      </div>

      {/* STEP INDICATOR */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              step === 1 ? "bg-[#9659FB]" : "bg-gray-300"
            }`}
          />
          <span
            className={`w-3 h-3 rounded-full ${
              step === 2 ? "bg-[#9659FB]" : "bg-gray-300"
            }`}
          />
        </div>
      </div>

      {/* Rest of your code stays EXACTLY SAME */}

      {step === 1 && (
        <form onSubmit={sendOtp} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-gray-100">
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full mt-1 p-3 text-white rounded-xl border 
                         focus:ring-2 focus:ring-[#9659FB] outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="py-3 rounded-xl bg-[#9659FB] text-white font-semibold 
                       transition transform hover:scale-[1.02]"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={verifyOtp} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-white">
              One-Time Password
            </label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              className="w-full mt-1 p-3 rounded-xl text-white border text-center 
                         tracking-widest font-mono 
                         focus:ring-2 focus:ring-[#9659FB] outline-none transition"
              value={form.otp}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  otp: e.target.value,
                }))
              }
              required
            />
          </div>

          <button
            disabled={loading}
            className="py-3 rounded-xl bg-[#9659FB] text-white font-semibold 
                       transition transform hover:scale-[1.02]"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-sm text-[#9659FB] hover:underline"
          >
            ← Change email
          </button>
        </form>
      )}

      {/* FOOTER */}
      <p className="text-center text-xs text-gray-100 mt-8">
        Secure • Passwordless • OTP-based Authentication
      </p>
    </div>
  </div>
);
};

