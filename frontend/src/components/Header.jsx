import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import axiosInstance, { setAccessToken } from "../utils/axiosInstance";
import nitkkrLogo from "../assets/nitkkr-logo.jpeg";
import { useState } from "react";
import { FaSearch, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa"; 
import userImg from '../assets/user.webp';
import { toast } from 'react-toastify';

function Header() {
  const { user, logoutUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchType, setSearchType] = useState("Name");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/api/auth/logout");
      setAccessToken(null); // clear the in-memory access token
      logoutUser(); // clear UserContext state (name, role, etc.)
      toast.success("You have successfully logged out!");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if the server call fails, clear local state so the UI doesn't
      // strand the user in a "logged in" state they can't act on.
      setAccessToken(null);
      logoutUser();
      toast.error("Logout failed on the server, but you've been signed out locally.");
      navigate("/");
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.warning("Please enter a search query.");
      return;
    }

    const searchParams = new URLSearchParams({
      type: searchType.toLowerCase().replace(" ", "_"),
      query: searchQuery,
    });

    navigate(`/search?${searchParams.toString()}`);
    setSearchQuery("");
    setIsSearchOpen(false); // Close dropdown search if open
    setIsMenuOpen(false); // Close mobile menu if open
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const isProfilePage = user && location.pathname === `/profile/${user.id}`;

  const isActive = (path) =>
    location.pathname === path
      ? "bg-[#8B1E1E] text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-full font-medium"
      : "text-white hover:bg-[#6F1111] hover:px-3 hover:lg:px-4 hover:py-1.5 hover:lg:py-2 hover:rounded-full transition-all duration-300 font-medium";

  return (
    <nav className="bg-gradient-to-r from-[#3D0707] via-[#531010] to-[#3D0707] shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Left Side: Logo & Title */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <img
            src={nitkkrLogo}
            alt="NIT Kurukshetra Logo"
            className="w-10 h-10 md:w-12 md:h-12 xl:w-14 xl:h-14 rounded-full bg-white p-1 flex-shrink-0 shadow"
          />
          <div className="leading-tight">
            <Link
              to="/"
              className="block text-white text-[16px] md:text-[20px] xl:text-[24px] font-bold hover:text-gray-200 transition tracking-wide whitespace-nowrap"
            >
              NIT KURUKSHETRA
            </Link>
            <p className="text-gray-200 text-[10px] md:text-[12px] xl:text-[14px] font-medium tracking-wider uppercase">
              Alumni Association
            </p>
          </div>
        </div>

        {/* Center: Desktop Search Bar (Visible only on xl: ≥ 1280px) */}
        <div className="hidden xl:flex items-center border border-gray-300 rounded-full px-3 py-1.5 bg-gray-100 shadow-md flex-1 max-w-xs xl:max-w-md mx-4 min-w-0">
          <select
            className="bg-transparent text-gray-700 text-sm font-semibold focus:outline-none cursor-pointer flex-shrink-0"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="Name">Name</option>
            <option value="Batch">Batch</option>
            <option value="Company Name">Company</option>
          </select>
          <input
            type="text"
            placeholder={`Search by ${searchType}`}
            className="ml-2 px-2 py-0.5 bg-transparent focus:outline-none flex-1 min-w-0 text-sm text-gray-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
          />
          <button
            onClick={handleSearch}
            className="ml-2 bg-[#8B1E1E] text-white px-4 py-1.5 rounded-full shadow-md hover:bg-[#6F1111] transition-all duration-300 flex items-center flex-shrink-0 text-sm font-medium"
          >
            <FaSearch className="mr-2" />
            <span>Search</span>
          </button>
        </div>

        {/* Right Side: Links & User Actions (Visible on Desktop/Tablet, hidden on Mobile) */}
        <div className="hidden md:flex items-center space-x-2 lg:space-x-3 xl:space-x-6 text-gray-600 flex-shrink-0">
          <Link to="/about" className={isActive("/about")}>About Us</Link>
          <Link to="/connections" className={isActive("/connections")}>Connections</Link>
          <Link to="/events" className={isActive("/events")}>Events</Link>
          <Link to="/gallery" className={isActive("/gallery")}>Gallery</Link>
          <Link to="/contact" className={isActive("/contact")}>Contact</Link>

          {/* Search Toggle Icon for Tablet Screens (md:flex xl:hidden) */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="xl:hidden text-white hover:text-gray-200 p-2 focus:outline-none flex-shrink-0"
            title="Toggle Search Bar"
          >
            <FaSearch className="text-lg" />
          </button>

          {!user || !user.firstName ? (
            <div className="flex items-center gap-1.5 lg:gap-2 pl-2 border-l border-[#6F1111] flex-shrink-0">
              <Link
                to="/login"
                className="px-3 lg:px-4 py-1.5 lg:py-2 bg-white text-[#5B0B0B] rounded-lg font-semibold text-xs lg:text-sm shadow border border-gray-200 hover:bg-gray-100 hover:-translate-y-0.5 transition-all duration-300"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-3 lg:px-4 py-1.5 lg:py-2 bg-[#A61B1B] text-white rounded-lg font-semibold text-xs lg:text-sm shadow hover:bg-[#851414] hover:-translate-y-0.5 transition-all duration-300"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 lg:gap-2 pl-2 border-l border-[#6F1111] flex-shrink-0">
              {!isProfilePage && user.role === "ALUMNI" && (
                <img
                  src={user.imageUrl || userImg}
                  alt="User Profile"
                  className="h-8 w-8 lg:h-10 lg:w-10 rounded-full object-cover border border-white shadow flex-shrink-0"
                />
              )}
              {!isProfilePage && user.role === "ALUMNI" && (
                <Link
                  to={`/profile/${user.id}`}
                  className="px-3 lg:px-4 py-1.5 lg:py-2 bg-white text-[#5B0B0B] rounded-lg font-semibold text-xs lg:text-sm shadow border border-gray-200 hover:bg-gray-100 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Profile
                </Link>
              )}
              {user.role === "ADMIN" && (
                <Link
                  to="/admin-dashboard"
                  className="px-3 lg:px-4 py-1.5 lg:py-2 bg-white text-[#5B0B0B] rounded-lg font-semibold text-xs lg:text-sm shadow border border-gray-200 hover:bg-gray-100 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 lg:px-4 py-1.5 lg:py-2 bg-[#A61B1B] text-white rounded-lg font-semibold text-xs lg:text-sm shadow hover:bg-[#851414] hover:-translate-y-0.5 transition-all duration-300"
              >
                <FaSignOutAlt />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile right-side container (Hamburger + Search Icon Toggle) */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="text-white hover:text-gray-200 p-2 focus:outline-none flex-shrink-0"
            title="Toggle Search"
          >
            <FaSearch className="text-lg" />
          </button>
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-gray-200 p-2 focus:outline-none flex-shrink-0"
          >
            {isMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>

      </div>

      {/* Dropdown Search Panel (Visible on Mobile/Tablet when toggled) */}
      {isSearchOpen && (
        <div className="bg-[#4a0d0d] border-t border-[#6F1111] px-4 py-3 xl:hidden shadow-inner">
          <div className="max-w-md mx-auto flex items-center border border-gray-300 rounded-full px-3 py-1.5 bg-gray-100 shadow-md">
            <select
              className="bg-transparent text-gray-700 text-xs font-semibold focus:outline-none cursor-pointer"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="Name">Name</option>
              <option value="Batch">Batch</option>
              <option value="Company Name">Company</option>
            </select>
            <input
              type="text"
              placeholder={`Search by ${searchType}...`}
              className="ml-2 px-2 py-0.5 bg-transparent focus:outline-none flex-1 text-xs text-gray-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
            />
            <button
              onClick={handleSearch}
              className="ml-2 bg-[#8B1E1E] text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-[#6F1111] transition"
            >
              Search
            </button>
          </div>
        </div>
      )}

      {/* Mobile: Slide-down Navigation Panel */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-[#531010] to-[#3D0707] border-t border-[#6F1111] px-4 py-4 space-y-4 shadow-inner">
          
          {/* Navigation Links */}
          <div className="flex flex-col space-y-1">
            <Link
              to="/about"
              onClick={() => setIsMenuOpen(false)}
              className="text-white hover:bg-[#6F1111] px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              About Us
            </Link>
            <Link
              to="/connections"
              onClick={() => setIsMenuOpen(false)}
              className="text-white hover:bg-[#6F1111] px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Connections
            </Link>
            <Link
              to="/events"
              onClick={() => setIsMenuOpen(false)}
              className="text-white hover:bg-[#6F1111] px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Events
            </Link>
            <Link
              to="/gallery"
              onClick={() => setIsMenuOpen(false)}
              className="text-white hover:bg-[#6F1111] px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Gallery
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="text-white hover:bg-[#6F1111] px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Contact
            </Link>
          </div>

          {/* User Auth Buttons */}
          <div className="pt-3 border-t border-[#6F1111]">
            {!user || !user.firstName ? (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center px-4 py-2 bg-white text-[#5B0B0B] rounded-lg font-bold text-sm shadow hover:bg-gray-50 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center px-4 py-2 bg-[#A61B1B] text-white rounded-lg font-bold text-sm shadow hover:bg-[#851414] transition"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                {user.role === "ALUMNI" && (
                  <Link
                    to={`/profile/${user.id}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-center px-4 py-2 bg-white text-[#5B0B0B] rounded-lg font-bold text-sm shadow hover:bg-gray-50 transition"
                  >
                    View Profile
                  </Link>
                )}
                {user.role === "ADMIN" && (
                  <Link
                    to="/admin-dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-center px-4 py-2 bg-white text-[#5B0B0B] rounded-lg font-bold text-sm shadow hover:bg-gray-50 transition"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#A61B1B] text-white rounded-lg font-bold text-sm shadow hover:bg-[#851414] transition"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </nav>
  );
}

export default Header;
