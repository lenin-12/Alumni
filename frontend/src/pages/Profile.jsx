
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaBriefcase, FaAward, FaUserEdit, FaMapMarkerAlt, FaGraduationCap, FaBuilding, FaCalendarAlt, FaPlus, FaLock, FaLockOpen, FaEdit } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../UserContext";
import axios from "axios";
import { toast } from "react-toastify";

function Profile() {
  const { user, fetchUserData, logoutUser } = useUser();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [alumni, setAlumni] = useState(null);
  const [profileType, setProfileType] = useState(user?.profileType || "PUBLIC");
  const [workexp, setWorkExp] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [points, setPoints] = useState(null);
  const userId = user?.id;
  const [loading, setLoading] = useState(false);
  
  const dropdownRef = useRef(null);
  const { id } = useParams();

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // All useEffects MUST be placed here before any conditional returns
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Only fetch user data if we're logged in
    if (user && user.firstName) {
      const fetchUser = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${id}`, { withCredentials: true });
          setAlumni(response.data);
          setProfileType(response.data.profileType);
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load user profile");
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id, user]);

  useEffect(() => {
    // Only fetch points if we're logged in
    if (user && user.firstName) {
      const fetchPoints = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${id}/points`, { withCredentials: true });
          setPoints(response.data.points);
        } catch (error) {
          console.error("Error fetching points:", error);
          setPoints(0);
        }
      };
      fetchPoints();
    }
  }, [id, user]);

  useEffect(() => {
    // Only fetch work experience if we're logged in
    if (user && user.firstName) {
      const fetchWorkExp = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/work-experience/user/${id}`, { withCredentials: true });
          const data = response.data;
          const workExpArray = Array.isArray(data) ? [...data].reverse() : [data];
          setWorkExp(workExpArray);
        } catch (error) {
          console.error("Error fetching work experience:", error);
          setWorkExp([]);
        }
      };
      fetchWorkExp();
    }
  }, [id, user]);

  useEffect(() => {
    // Only fetch achievements if we're logged in
    if (user && user.firstName) {
      const fetchAchievements = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/achievements/user/${id}`, { withCredentials: true });
          const data = response.data;
          const achievementsArray = Array.isArray(data) ? [...data].reverse() : [data];
          setAchievements(achievementsArray);
        } catch (error) {
          console.error("Error fetching achievements:", error);
          setAchievements([]);
        }
      };
      fetchAchievements();
    }
  }, [id, user]);

  const handleProfileTypeChange = async (newType) => {
    setProfileType(newType);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/${id}/updateProfile`,
        { profileType: newType },
        { withCredentials: true }
      );
      await fetchUserData(user.id);
      
      // Show a single notification based on profile type change
      if (newType === "PRIVATE") {
        toast.info(
          "Profile set to private. Note: Administrators can still view your complete profile information.", 
          {
            autoClose: 5000,
            position: "top-center"
          }
        );
      } else {
        toast.success("Profile set to public. Your profile is now visible to all users.");
      }
    } catch (error) {
      console.error("Error updating profile type:", error);
      toast.error("Failed to update profile visibility. Please try again.");
    }
  };

  // Now we can have conditional returns safely
  
  // Check if user is logged in first
  if (!user || !user.firstName) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-brand-warmgray-light to-[#EAE6E1] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-md w-full">
          <div className="bg-gradient-to-r from-brand-maroon to-brand-maroon-dark p-6 text-white">
            <h2 className="text-2xl font-bold">Authentication Required</h2>
            <p className="mt-2 text-brand-warmgray-light">Access to alumni profiles requires login</p>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-6">Please sign in to your account to view alumni profiles and connect with the community.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => navigate("/login")} 
                className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-rust to-brand-rust-dark text-white rounded-lg shadow hover:from-brand-rust-dark hover:to-brand-rust transition flex items-center justify-center"
              >
                Log In
              </button>
              <button 
                onClick={() => navigate("/")} 
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-brand-warmgray-light to-[#EAE6E1] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold mb-4"></div>
          <p className="text-brand-maroon-dark font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (!alumni) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-brand-warmgray-light to-[#EAE6E1] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl text-gray-300 mb-4">404</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">The alumni profile you're looking for doesn't exist or may have been removed.</p>
          <button 
            onClick={() => navigate("/")} 
            className="px-6 py-2 bg-gradient-to-r from-brand-rust to-brand-rust-dark text-white rounded-lg shadow hover:from-brand-rust-dark hover:to-brand-rust transition"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Private profile view
  if (user.role === "ALUMNI" && alumni && alumni.profileType === "PRIVATE" && userId != id) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-brand-warmgray-light to-[#EAE6E1] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-md w-full text-center">
          <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-8 text-white">
            <div className="mx-auto w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <FaLock className="text-3xl text-gray-200" />
            </div>
            <h2 className="text-2xl font-bold">Private Profile</h2>
          </div>
          <div className="p-8">
            <p className="text-xl font-semibold text-gray-800 mb-2">{alumni.name} {alumni.lastName}</p>
            <p className="text-gray-600 mb-6">This alumni has set their profile to private.</p>
            <button 
              onClick={() => navigate("/")} 
              className="px-6 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-brand-warmgray-light to-[#EAE6E1]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              {/* Cover Image & Profile Picture */}
              <div className="h-32 bg-gradient-to-r from-brand-maroon to-brand-maroon-dark relative">
                {/* Profile Picture */}
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                    {alumni.imageUrl ? (
                      <img
                        src={alumni.imageUrl}
                        alt={alumni.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <FaUserEdit size={40} />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Profile Type Badge */}
                <div className="absolute top-4 right-4">
                  <div className={`text-xs font-medium px-3 py-1 rounded-full flex items-center ${
                    profileType === "PRIVATE" 
                      ? "bg-gray-800 text-white" 
                      : "bg-emerald-700 text-white"
                  }`}>
                    {profileType === "PRIVATE" ? (
                      <><FaLock className="mr-1" /> Private</>
                    ) : (
                      <><FaLockOpen className="mr-1" /> Public</>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="pt-20 pb-8 px-6">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">{alumni.name} {alumni.lastName}</h1>
                  
                  <div className="mt-2 flex items-center justify-center space-x-1 text-gray-500">
                    <FaGraduationCap />
                    <span>{alumni.batch || "Batch not specified"}</span>
                  </div>
                  
                  <div className="mt-1 flex items-center justify-center space-x-1 text-gray-500">
                    <FaBuilding />
                    <span>{alumni.department || "Department not specified"}</span>
                  </div>
                </div>
                
                {/* Points Card */}
                <div className="bg-brand-warmgray-light rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Points Earned</span>
                    <div className="bg-brand-rust text-white text-lg font-bold w-12 h-12 rounded-full flex items-center justify-center">
                      {points !== null ? points : "..."}
                    </div>
                  </div>
                </div>
                
                {/* Current User Controls */}
                {userId == id && (
                  <div className="space-y-4">
                    {/* Profile Type Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Profile Visibility</span>
                      <div 
                        onClick={() => handleProfileTypeChange(profileType === "PUBLIC" ? "PRIVATE" : "PUBLIC")}
                        className={`relative w-12 h-6 transition-colors duration-300 rounded-full cursor-pointer ${
                          profileType === "PUBLIC" ? "bg-green-500" : "bg-brand-warmgray-dark" 
                        }`}
                      >
                        <span 
                          className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform duration-300 transform bg-white ${
                            profileType === "PUBLIC" ? "translate-x-6" : ""
                          }`}
                        ></span>
                      </div>
                    </div>
                    
                    {/* Edit Profile Button */}
                    <button
                      onClick={() => navigate("/update-profile")}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-rust to-brand-rust-dark hover:from-brand-rust-dark hover:to-brand-rust text-white px-4 py-3 rounded-lg shadow-sm transition-all duration-300"
                    >
                      <FaEdit />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Right Column - Work Experience & Achievements */}
          <motion.div 
            className="lg:col-span-2 space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Work Experience */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaBriefcase className="text-brand-rust mr-2" /> 
                  <span>Work Experience</span>
                </h2>
                <Link 
                  to={`/alumni/${id}/workexperience`} 
                  className="text-brand-rust hover:text-brand-rust-dark text-sm font-medium transition"
                >
                  View All
                </Link>
              </div>
              
              <div className="p-6">
                {workexp && workexp.length > 0 ? (
                  <div className="space-y-6">
                    {workexp.slice(0, 2).map((exp, index) => (
                      <div key={index} className="group p-4 bg-gray-50 rounded-lg shadow">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 mt-1 rounded-lg bg-brand-warmgray-light text-brand-rust flex items-center justify-center flex-shrink-0">
                            <FaBriefcase />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-brand-rust transition">{exp.role}</h3>
                            <p className="text-gray-600 font-medium">{exp.company}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <FaCalendarAlt className="mr-1" />
                              <span>
                                {new Date(exp.startDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short'
                                })} - {exp.present ? "Present" : new Date(exp.endDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short'
                                })}
                              </span>
                            </div>
                            <p className="mt-2 text-gray-600">{exp.description}</p>
                          </div>
                        </div>
                        {index < workexp.slice(0, 2).length - 1 && <hr className="my-4 border-gray-100" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4">
                    <div className="w-16 h-16 mx-auto bg-brand-warmgray-light rounded-full flex items-center justify-center text-brand-warmgray mb-4">
                      <FaBriefcase size={24} />
                    </div>
                    <p className="text-gray-500">No work experience available</p>
                    {userId == id && (
                      <button 
                        onClick={() => navigate("/add-work-experience")}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-brand-rust to-brand-rust-dark hover:from-brand-rust-dark hover:to-brand-rust text-white text-sm rounded-lg shadow transition-all duration-300"
                      >
                        Add Work Experience
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaAward className="text-brand-rust mr-2" /> 
                  <span>Achievements</span>
                </h2>
                <Link 
                  to={`/alumni/${id}/achievements`} 
                  className="text-brand-rust hover:text-brand-rust-dark text-sm font-medium transition"
                >
                  View All
                </Link>
              </div>
              
              <div className="p-6">
                {achievements && achievements.length > 0 ? (
                  <div className="space-y-6">
                    {achievements.slice(0, 2).map((achievement, index) => (
                      <div key={index} className="group p-4 bg-gray-50 rounded-lg shadow">
                        <div className="flex items-start space-x-4">
                        {/* className="p-4 bg-gray-50 rounded-lg shadow" */}
                          <div className="w-10 h-10 mt-1 rounded-lg bg-brand-warmgray-light text-brand-rust flex items-center justify-center flex-shrink-0">
                            <FaAward />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-brand-rust transition">{achievement.title}</h3>
                              <span className="px-2 py-1 bg-brand-warmgray-light text-brand-maroon-dark text-xs rounded-full">
                                {achievement.organization}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <FaCalendarAlt className="mr-1" />
                              <span>
                                {new Date(achievement.dateOfAchievement).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <p className="mt-2 text-gray-600">{achievement.description}</p>
                          </div>
                        </div>
                        {index < achievements.slice(0, 2).length - 1 && <hr className="my-4 border-gray-100" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4">
                    <div className="w-16 h-16 mx-auto bg-brand-warmgray-light rounded-full flex items-center justify-center text-brand-warmgray mb-4">
                      <FaAward size={24} />
                    </div>
                    <p className="text-gray-500">No achievements available</p>
                    {userId == id && (
                      <button 
                        onClick={() => navigate("/add-achievements")}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-brand-rust to-brand-rust-dark hover:from-brand-rust-dark hover:to-brand-rust text-white text-sm rounded-lg shadow transition-all duration-300"
                      >
                        Add Achievement
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Add Details Button (Only for own profile) */}
            {userId == id && (workexp.length > 0 || achievements.length > 0) && (
              <div className="flex justify-end" ref={dropdownRef}>
                <div className="relative">
                  <button 
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 bg-gradient-to-r from-brand-rust to-brand-rust-dark hover:from-brand-rust-dark hover:to-brand-rust text-white px-4 py-2 rounded-lg shadow transition-colors duration-300"
                  >
                    <FaPlus />
                    <span>Add Details</span>
                  </button>
                  
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-10"
                      >
                        <button 
                          onClick={() => { setShowDropdown(false); navigate("/add-work-experience"); }}
                          className="flex items-center space-x-2 w-full text-left px-4 py-3 hover:bg-brand-warmgray-light transition"
                        >
                          <FaBriefcase className="text-brand-rust" />
                          <span>Work Experience</span>
                        </button>
                        <button 
                          onClick={() => { setShowDropdown(false); navigate("/add-achievements"); }}
                          className="flex items-center space-x-2 w-full text-left px-4 py-3 hover:bg-brand-warmgray-light transition"
                        >
                          <FaAward className="text-brand-rust" />
                          <span>Achievement</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Profile;