// export default Navbar2;


import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Navbar2 = () => {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: "/password-generator", label: "PasswordGenerator" },
    { to: "/hash-generator", label: "HashGenerator" },
    { to: "/crack-page", label: "CrackPage" },
    { to: "/pass-manager", label: "PasswordManager" },
    { to: "/packet-analyzer", label: "PacketAnalyzer" },
    { to: "/recon-intel", label: "DNSInfo" },
  ];

  return (
    <nav className="w-full bg-gradient-to-r from-[#7012eb] to-[#b477ee] fixed top-0 left-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">

          {/* Logo */}
          <Link to="/">
            <span className="text-xl sm:text-2xl font-mono font-bold text-white">
              SecurePass
            </span>
          </Link>

          {/* DESKTOP MENU (ONLY lg and above) */}
          <div className="hidden lg:flex font-mono  space-x-1 text-sm xl:text-lg font-bold">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `transition whitespace-nowrap ${
                    isActive ? "text-white" : "text-black"
                  }  hover:text-white hover:bg-[#9659FB] rounded-full px-3 py-1.5`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Logout Desktop */}
          <div className="hidden lg:block">
            <button
              onClick={logout}
              className="px-6 py-2 font-mono text-xl rounded-xl bg-[#9659FB] text-white font-semibold shadow-lg transition hover:scale-105 active:scale-95"
            >
              Logout
            </button>
          </div>

          {/* MOBILE BUTTON (below lg) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-2xl text-black"
          >
            ☰
          </button>
        </div>

        {/* MOBILE MENU */}
        {isOpen && (
          <div className="lg:hidden flex flex-col space-y-4 py-4 font-semibold bg-gradient-to-r from-[#7012eb] to-[#b477ee]">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block ${
                    isActive ? "text-white" : "text-black"
                  } hover:text-white hover:bg-[#9659FB] rounded-full  `
                }
              >
                {item.label}
              </NavLink>
            ))}

            <button
              onClick={logout}
              className="bg-[#9659FB] text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar2;