import React from 'react'
import { featuresData } from "../data/Featuresdata.jsx";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <div>
      <footer className="bg-gradient-to-r from-[#7012eb] to-[#b477ee] text-white 
                         min-h-[200px] flex flex-col justify-between 
                         px-6 md:px-8 py-6">

        {/* TOP SECTION */}
        <div className="flex flex-col md:flex-row 
                        justify-between items-center md:items-start 
                        gap-6">

          {/* LEFT LINKS GROUP */}
          <div className="flex flex-wrap justify-center md:justify-start 
                          gap-4 md:gap-8 
                          text-base md:text-xl 
                          font-mono font-semibold text-center md:text-left">

            <a
              href="https://www.wireshark.org/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-200 transition"
            >
              WireShark
            </a>

            <a
              href="https://www.progress.com/blogs/use-aes-256-encryption-secure-data"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-200 transition"
            >
              AES-256
            </a>

            <a
              href="https://docs.devolutions.net/portal/kb/general-knowledge/what-is-sha-256/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-200 transition"
            >
              SHA-256
            </a>

            <a
              href="https://www.cloudflare.com/learning/dns/what-is-dns/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-200 transition"
            >
              DNS-intel
            </a>
          </div>

          {/* RIGHT SOCIAL ICONS */}
          <div className="flex gap-5 text-lg">
            <a href="#" className="hover:scale-110 transition duration-200">
              <FaFacebookF />
            </a>
            <a href="#" className="hover:scale-110 transition duration-200">
              <FaTwitter />
            </a>
            <a href="#" className="hover:scale-110 transition duration-200">
              <FaInstagram />
            </a>
            <a href="#" className="hover:scale-110 transition duration-200">
              <FaLinkedinIn />
            </a>
          </div>

        </div>

        {/* Divider */}
        <div className="w-full md:w-5/6 mx-auto h-[4px] bg-white my-4"></div>

        {/* BOTTOM SECTION */}
        <div className="flex flex-col md:flex-row 
                        justify-between items-center 
                        gap-4 text-center md:text-left">

          {/* Bottom Left Text */}
          <p className="font-mono text-sm md:text-lg">
            SecurePass : Privacy became simpler
          </p>

          {/* Bottom Right Links */}
          <div className="flex flex-wrap justify-center md:justify-end 
                          gap-4 md:gap-8 
                          text-md font-semibold">
            
            <Link
              to="/privacy"
              className="hover:text-gray-200 transition"
            >
              
            </Link>

            <Link
              to="/terms"
              className="hover:text-gray-200 transition"
            >
              Documentation
            </Link>

            <Link
              to="/contact"
              className="hover:text-gray-200 transition"
            >
              Contact Us
            </Link>
          </div>

        </div>

      </footer>
    </div>
  )
}

export default Footer;