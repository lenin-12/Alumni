import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { FaTrash, FaTrophy, FaCalendarAlt, FaBuilding, FaUser, FaPlus } from "react-icons/fa";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const AchievementsList = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await axiosInstance.get("/api/achievements/all");
        const achievementsArray = Array.isArray(response.data) ? response.data.reverse() : [response.data];
        setAchievements(achievementsArray);
      } catch (error) {
        console.error("Error fetching achievements:", error);
        setError("Failed to fetch achievements.");
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  const handleDelete = (id) => {
    toast.info(
        <div>
            <p>Are you sure you want to delete this achievement?</p>
            <div className="mt-2 flex justify-center space-x-3">
                <button 
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => {
                        toast.dismiss();
                        confirmDelete(id);
                    }}
                >
                    Yes, Delete
                </button>
                <button 
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                    onClick={() => toast.dismiss()}
                >
                    Cancel
                </button>
            </div>
        </div>,
        {
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            closeButton: false
        }
    );
};

const confirmDelete = (id) => {
    axiosInstance.delete(`/api/achievements/${id}`)
        .then(() => {
            setAchievements(achievements.filter(achievement => achievement.id !== id));
            toast.success("Achievement deleted successfully");
        })
        .catch(() => {
            toast.error("Failed to delete work experience.");
        });
};
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const getAchievementColor = (category) => {
    const colors = {
      "Academic": "from-[#8B1E1E] to-[#A61B1B]", // Maroon
      "Professional": "from-[#A6491F] to-[#8C3A16]", // Rust
      "Social": "from-[#8C7D70] to-[#5C5248]", // Warm Gray
      "Award": "from-[#D4A857] to-[#E8C97A]", // Gold
      "Other": "from-red-700 to-red-900"
    };
    return colors[category] || "from-[#3D0707] to-[#531010]";
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Academic":
        return "🎓";
      case "Professional":
        return "💼";
      case "Social":
        return "🤝";
      case "Award":
        return "🏆";
      default:
        return "🎯";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex justify-center items-center p-6">
        <div className="w-16 h-16 border-t-4 border-b-4 border-[#8B1E1E] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex justify-center items-center p-6">
        <div className="bg-white p-8 rounded-xl border border-[#E7DDD6] shadow-sm text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{error}</h3>
          <p className="text-gray-600">Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF6F0] to-[#FAF6F0] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-[#3D0707]">
            <FaTrophy className="inline-block mr-3 text-yellow-500" />
            Alumni Achievements
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8 text-sm">
            Celebrating the outstanding accomplishments and milestones of our distinguished alumni community.
          </p>
        </motion.div>

        {/* Achievements Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          {achievements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-10 rounded-xl border border-[#E7DDD6] text-center shadow-sm max-w-lg mx-auto"
            >
              <FaTrophy className="mx-auto text-[#8B1E1E]/40 text-5xl mb-4" />
              <h3 className="text-xl font-bold text-[#3D0707] mb-2">No achievements found</h3>
              <p className="text-gray-500 text-sm">No achievements have been added yet.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="relative overflow-hidden rounded-xl border border-[#E7DDD6] shadow-sm bg-white hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Category Banner */}
                  <div className={`h-2 bg-gradient-to-r ${getAchievementColor(achievement.category)}`}></div>
                  
                  {/* Image Section */}
                  {achievement.supportingDocuments && (
                    <div className="overflow-hidden h-48 border-b border-[#E7DDD6]">
                      <img
                        src={achievement.supportingDocuments}
                        alt="Achievement"
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center mb-3">
                        <span className="text-xl mr-2">{getCategoryIcon(achievement.category)}</span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF6F0] text-gray-700 border border-[#E7DDD6]">
                          {achievement.category}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{achievement.title}</h3>
                      
                      <div className="flex items-center text-gray-500 mb-3 text-xs font-medium">
                        <FaCalendarAlt className="mr-1.5" />
                        <span>{new Date(achievement.dateOfAchievement).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">{achievement.description}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-[#E7DDD6]/50 mt-auto text-sm space-y-1.5">
                      <div className="flex items-center text-gray-600">
                        <FaBuilding className="mr-2 text-[#8B1E1E] flex-shrink-0" />
                        <span className="font-semibold">{achievement.organization}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaUser className="mr-2 text-[#8B1E1E] flex-shrink-0" />
                        <span className="font-semibold">{achievement.userId ? `${achievement.userId.name} ${achievement.userId.lastName || ""}` : "Deleted User"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button (Only for Admins) */}
                  {user && user.role === "ADMIN" && (
                    <button
                      onClick={() => handleDelete(achievement.id)}
                      className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-700 transition shadow-md z-10"
                    >
                      <FaTrash size={12} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Add Achievement Button (Admin only) */}
        {user && user.role === "ADMIN" && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/add-achievements")}
            className="fixed bottom-[40px] right-5 bg-gradient-to-r from-[#8B1E1E] to-[#6F1111] text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 font-semibold flex items-center space-x-2 z-10"
          >
            <FaPlus size={16} />
            <span>Add Achievement</span>
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default AchievementsList;
