import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth(); // 👈 token check

  

  return (
    <nav className="w-full bg-gradient-to-r from-[#7012eb]  to-[#b477ee]  text-black ">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-18 items-center justify-between">
          
          {/* Logo */}
          <Link to="/">
            <h1 className="text-2xl  text-white leading-10 font-bold font-mono text-gray-800">
              SecurePass
            </h1>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center font-bold text-xl font-mono gap-6">
          <Link to='/'>
            <a className="px-4 py-1.5 rounded-full hover:bg-[#9659FB] hover:text-white">
              Home
            </a>
            </Link>

            <a  href="#about" className="px-4 py-1.5 rounded-full hover:bg-[#9659FB]  hover:text-white">
              About
            </a>

            <a 
            href="#services" className="px-4 py-1.5 rounded-full hover:bg-[#9659FB] hover:text-white">
              Features
            </a>

            {/* 🔥 CONDITIONAL BUTTON */}
            {!isAuthenticated ? (
              <Link to="/login">
                <button
                  className="
                    relative px-6 py-1 rounded-xl
                    bg-[#9659FB]
                    text-white font-semibold tracking-wide
                    shadow-lg shadow-purple-500/30
                    transition-all duration-300 ease-in-out
                    hover:scale-105
                    hover:shadow-[0_0_25px_rgba(150,89,251,0.8)]
                    active:scale-95
                    before:absolute before:inset-0
                    before:rounded-xl
                    before:bg-gradient-to-r before:from-[#9659FB] before:to-[#A897D2]
                    before:blur-xl before:opacity-50
                    before:-z-10
                    animate-[float_3s_ease-in-out_infinite]
                  "
                >
                  <div className="flex flex-col transition-transform duration-700 group-hover:-translate-y-[40px]">
                    <span className="leading-10 mt-1 text-center">
                      Login
                    </span>
                    {/* <span className="leading-10 mt-1 text-center">Login</span> */}
                  </div>
                </button>
              </Link>
            ) : (
              <Link to="/password-generator">
                <button
                  className="
                    relative px-6 py-1 rounded-xl
                    bg-[#9659FB]
                    text-white font-semibold tracking-wide
                    shadow-lg shadow-purple-500/30
                    transition-all duration-300 ease-in-out
                    hover:scale-105
                    hover:shadow-[0_0_25px_rgba(150,89,251,0.8)]
                    active:scale-95
                    before:absolute before:inset-0
                    before:rounded-xl
                    before:bg-gradient-to-r before:from-[#9659FB] before:to-[#A897D2]
                    before:blur-xl before:opacity-50
                    before:-z-10
                    animate-[float_3s_ease-in-out_infinite]
                  "
                >
                  <div className="flex flex-col transition-transform duration-700 group-hover:-translate-y-[40px]">
                    <span className="leading-10 mt-1 text-center">
                      Dashboard
                    </span>
                    {/* <span className="leading-10 mt-1 text-center">Dashboard</span> */}
                  </div>
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="text-2xl md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="bg-gradient-to-r from-[#7012eb] text-lg to-[#b477ee] font-mono px-4 pb-4 md:hidden">
          <a className="block py-2">Home</a>
          <a className="block py-2">About</a>
          <a className="block py-2">Features</a>

          {!isAuthenticated ? (
            <Link to="/login">
              <button className="relative px-4 py-2 w-full 
                    bg-[#9659FB]
                    text-white font-semibold tracking-wide
                    shadow-lg shadow-purple-500/30
                    transition-all duration-300 ease-in-out
                    hover:scale-105
                    hover:shadow-[0_0_25px_rgba(150,89,251,0.8)]
                    active:scale-95
                    before:absolute before:inset-0
                   
                    before:bg-gradient-to-r before:from-[#9659FB] before:to-[#A897D2]
                    before:blur-xl before:opacity-50
                    before:-z-10
                    animate-[float_3s_ease-in-out_infinite]
                  ">
                Login
              </button>
            </Link>
          ) : (
            <Link to="/password-generator">
              <button className="relative px-4 py-2 w-full 
                    bg-[#9659FB] rounded-xl
                    text-white font-semibold tracking-wide
                    shadow-lg shadow-purple-500/30
                    transition-all duration-300 ease-in-out
                    hover:scale-105
                    hover:shadow-[0_0_25px_rgba(150,89,251,0.8)]
                    active:scale-95
                    before:absolute before:inset-0
                   
                    before:bg-gradient-to-r before:from-[#9659FB] before:to-[#A897D2]
                    before:blur-xl before:opacity-50
                    before:-z-10
                    animate-[float_3s_ease-in-out_infinite]
                  ">
                Dashboard
              </button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
