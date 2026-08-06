import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#3B0A0A] via-[#551111] to-[#3B0A0A] text-white py-10 mt-auto shadow-inner">

      <div className="container mx-auto px-6">

        {/* Social Icons */}

        <div className="flex justify-center gap-6 mb-6">

          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center
            hover:bg-[#1877F2] hover:scale-110 transition-all duration-300"
          >
            <FaFacebookF size={18} />
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center
            hover:bg-pink-600 hover:scale-110 transition-all duration-300"
          >
            <FaInstagram size={18} />
          </a>

          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center
            hover:bg-sky-500 hover:scale-110 transition-all duration-300"
          >
            <FaTwitter size={18} />
          </a>

          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center
            hover:bg-[#0A66C2] hover:scale-110 transition-all duration-300"
          >
            <FaLinkedinIn size={18} />
          </a>

        </div>

        {/* Divider */}

        <div className="border-t border-white/20 mb-5"></div>

        {/* Copyright */}

        <div className="text-center">

          <h3 className="text-xl font-bold tracking-wide">
            NIT Kurukshetra Alumni Association
          </h3>

          <p className="text-gray-300 mt-2 text-sm">
            Connecting Alumni • Inspiring Excellence • Building the Future
          </p>

          <p className="text-gray-400 text-sm mt-4">
            © 2026 National Institute of Technology Kurukshetra. All Rights Reserved.
          </p>

        </div>

      </div>

    </footer>
  );
}

export default Footer;