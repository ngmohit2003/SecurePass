import React from "react";
import { featuresData } from "../data/Featuresdata.jsx";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";


export const Home = () => {
  return (
    <div className="relative z-10 text-gray-800 overflow-x-hidden">

      {/* HERO SECTION */}
      <section
        className="
          relative
          min-h-[calc(100vh-80px)]
          flex items-center
          bg-cover bg-center bg-no-repeat
        "
        style={{
          backgroundImage: "url('home.jpeg')",
        }}
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12 md:py-20">

          <div className="space-y-8 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl xl:text-7xl font-bold leading-tight text-black">
              <span className="block font-mono text-white lg:text-[#9659FB] ">
                SecurePass
              </span>
            </h1>

            <p className="text-white max-w-xl mx-auto lg:mx-0 text-base sm:text-lg">
              Keep your digital life safe by managing passwords securely,
              detecting compromised credentials, and monitoring threats in
              real time — all from one powerful platform.
            </p>

            <ul className="text-[#9659FB] font-semibold space-y-3 text-sm sm:text-lg text-left max-w-2xl mx-auto lg:mx-0">
              <li>• Detect compromised passwords via hashing</li>
              <li>• Secure and manage credentials with AES-256 Standard</li>
              <li>• Analyze live network activity for ensuring user privacy & integrity</li>
            </ul>
          </div>

          <div></div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="services"  className="py-20 px-6 bg-gradient-to-b from-[#6c21cd] to-[#b477ee]">
        <h2 className="text-3xl sm:text-4xl md:text-6xl text-white font-bold text-center mb-16 animate-pulse">
          Services We Provide
        </h2>

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {featuresData.map((item, index) => (
            <div
              key={index}
              className="relative h-[380px] rounded-2xl overflow-hidden shadow-xl group"
            >

              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${item.image})` }}
              ></div>

              {/* Dark Overlay */}
              <div className="absolute inset-0 "></div>

              {/* ICON SECTION (Top Left Floating Glass Circle) */}
              <div className="absolute top-5 left-5 z-20">
                <div className="
                  w-14 h-14
                  bg-white/20 backdrop-blur-md
                  rounded-full animate-pulse
                  flex items-center justify-center
                  text-white
                  shadow-lg
                  border border-white/30
                  transition-all duration-300
                  group-hover:scale-110
                ">
                  <item.icon className="w-6 h-6" />
                </div>
              </div>

         

              <div
  className="
    absolute bottom-0 left-0 w-full
    bg-white/20 hover:backdrop-blur-md
    p-6  backdrop-blur
    transition-all duration-500 ease-in-out
    group-hover:bg-white/30
    h-20 group-hover:h-40
  "
>
  <h3 className="text-white text-xl font-bold mb-4 ">
    {item.title}
  </h3>

  <p
    className="
      text-white font-semibold text-sm leading-relaxed
      opacity-0 translate-y-4
      transition-all duration-500
      group-hover:opacity-100 group-hover:translate-y-0
    "
  >
    {item.desc}
  </p>
</div>

            </div>
          ))}

        </div>
      </section>

      {/* WHY SECTION */}
      <section id="about" className="py-16 sm:py-24 px-6 bg-[#d6bafa]">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white text-center mb-10">
          Why Use SecurePass?
        </h2>

        <div className="max-w-4xl mx-auto text-center text-gray-600 space-y-6">
          <p className="text-lg sm:text-xl md:text-2xl">
            Weak passwords are the biggest security risk today.
            SecurePass helps you understand, generate, and manage
            credentials safely.
          </p>

          <Link to="/login">
            <button
              className="
                relative px-6 py-3 rounded-xl
                bg-[#9659FB]
                text-white font-semibold
                shadow-lg shadow-purple-500/30
                transition-all duration-300
                hover:scale-105
                hover:shadow-[0_0_25px_rgba(150,89,251,0.8)]
                active:scale-95
                mt-6
              "
            >
              <div className="flex items-center justify-center space-x-3">
                <span>Start Now</span>
                <FaArrowRight />
              </div>
            </button>
          </Link>
        </div>
      </section>

   

    </div>
  );
};
