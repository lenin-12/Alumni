// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";
// import { useUser } from "../UserContext";
// import { FaBuilding, FaUserTie, FaMapMarkerAlt, FaCalendarAlt, FaEdit, FaTrash } from "react-icons/fa";
// import { toast } from 'react-toastify';

// const AlumniAchievements = () => {
//   const { alumniId } = useParams();
//   const [achievements, setAchievements] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const { user, logoutUser } = useUser();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchAchievements = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/achievements/user/${alumniId}`, { withCredentials: true });
//         const achievementsArray = Array.isArray(response.data) ? response.data.reverse() : [response.data];
//         setAchievements(achievementsArray);
//         // setAchievements(response.data);
//       } catch (error) {
//         toast.error("Failed to fetch achievements.");
//         setError("Failed to fetch achievements.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAchievements();
//   }, [alumniId]);

//   const handleDelete = async (achievementId) => {
//     // Show confirmation toast with action buttons
//     toast.info(
//       <div>
//         <p>Are you sure you want to delete this achievement?</p>
//         <div className="mt-2 flex justify-center space-x-3">
//           <button 
//             className="bg-red-500 text-white px-3 py-1 rounded"
//             onClick={() => {
//               toast.dismiss();
//               deleteAchievement(achievementId);
//             }}
//           >
//             Yes, Delete
//           </button>
//           <button 
//             className="bg-gray-500 text-white px-3 py-1 rounded"
//             onClick={() => toast.dismiss()}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>,
//       {
//         autoClose: false,
//         closeOnClick: false,
//         draggable: false,
//         closeButton: false
//       }
//     );
//   };
  
//   const deleteAchievement = async (achievementId) => {
//     try {
//       await axios.delete(`${import.meta.env.VITE_API_URL}/api/achievements/${achievementId}`, { withCredentials: true });
//       setAchievements(achievements.filter(achievement => achievement.id !== achievementId));
//       toast.success("Achievement deleted successfully");
//     } catch (error) {
//       toast.error("Failed to delete achievement experience.");
//     }
//   };

//   const handleEdit = (achievementId) => {
//     navigate(`/edit-achievement/${achievementId}`); // Redirect to edit page (customize this route as needed)
//   };

//   if (loading) return <p className="text-center text-gray-600">Loading achievements...</p>;
//   if (error) return <p className="text-center text-red-500">{error}</p>;

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
//       <h2 className="text-4xl font-bold mb-6 text-gray-900">Achievements</h2>

//       {/* Wrapper Box with Background Color */}
//       <div className="bg-blue-100 p-6 rounded-xl shadow-lg w-full max-w-7xl">
//         {achievements.length === 0 ? (
//           <p className="text-gray-600 text-center">No achievements found for this alumni.</p>
//         ) : (
//           <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
//             {achievements.map((achievement) => (
//               <div
//                 key={achievement.id}
//                 className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 relative group"
//               >
//                 {/* Image Section */}
//                 {achievement.supportingDocuments && (
//                   <img
//                     src={achievement.supportingDocuments}
//                     alt="Achievement"
//                     className="w-full h-48 object-cover"
//                   />
//                 )}

//                 {/* Content Section */}
//                 <div className="p-5">
//                   <h3 className="text-2xl font-semibold text-gray-900">{achievement.title}</h3>
//                   <p className="text-gray-600 text-sm mb-2">{achievement.category}</p>
//                   <p className="text-gray-500 text-sm">
//                     📅 {new Date(achievement.dateOfAchievement).toLocaleDateString()}
//                   </p>
//                   <p className="mt-3 text-gray-700">{achievement.description}</p>
//                   <p className="text-blue-600 text-sm mt-2">🏢 Recognized by: {achievement.organization}</p>
//                   {user.id == alumniId && (
//                     <div className="absolute top-3 right-3 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
//                       <button
//                         onClick={() => handleEdit(achievement.id)}
//                         className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-700 transition"
//                       >
//                         <FaEdit />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(achievement.id)}
//                         className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-700 transition"
//                       >
//                         <FaTrash />
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AlumniAchievements;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "../UserContext";
import { 
  FaAward, FaTrophy, FaMedal, FaCertificate, FaEdit, 
  FaTrash, FaCalendarAlt, FaBuilding, FaArrowLeft, FaPlus
} from "react-icons/fa";
import { toast } from 'react-toastify';
import { motion } from "framer-motion";

const AlumniAchievements = () => {
  const { alumniId } = useParams();
  const [achievements, setAchievements] = useState([]);
  const [alumniInfo, setAlumniInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useUser();
  const navigate = useNavigate();
  
  const isOwnProfile = user?.id == alumniId;

  // Get icon based on achievement category
  const getCategoryIcon = (category) => {
    const categoryMap = {
      "Award": <FaTrophy className="text-yellow-500" />,
      "Certification": <FaCertificate className="text-blue-500" />,
      "Recognition": <FaMedal className="text-purple-500" />,
      "Publication": <FaAward className="text-green-500" />
    };
    
    return categoryMap[category] || <FaAward className="text-indigo-500" />;
  };

  // Get background gradient based on achievement category
  const getCategoryGradient = (category) => {
    const gradientMap = {
      "Award": "from-yellow-500 to-amber-600",
      "Certification": "from-blue-500 to-cyan-600",
      "Recognition": "from-purple-500 to-indigo-600",
      "Publication": "from-green-500 to-emerald-600"
    };
    
    return gradientMap[category] || "from-indigo-500 to-blue-600";
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch achievements
        const achievementsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/achievements/user/${alumniId}`, 
          { withCredentials: true }
        );
        const achievementsArray = Array.isArray(achievementsResponse.data) ? 
          achievementsResponse.data : [achievementsResponse.data];
        setAchievements(achievementsArray.sort((a, b) => new Date(b.dateOfAchievement) - new Date(a.dateOfAchievement)));
        
        // Fetch alumni info
        const alumniResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/${alumniId}`, 
          { withCredentials: true }
        );
        setAlumniInfo(alumniResponse.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to fetch achievements");
        setError("Failed to load achievements");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [alumniId]);

  const handleDelete = async (achievementId) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this achievement?</p>
        <div className="mt-2 flex justify-center space-x-3">
          <button 
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={() => {
              toast.dismiss();
              deleteAchievement(achievementId);
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
  
  const deleteAchievement = async (achievementId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/achievements/${achievementId}`, { withCredentials: true });
      setAchievements(achievements.filter(achievement => achievement.id !== achievementId));
      toast.success("Achievement deleted successfully");
    } catch (error) {
      toast.error("Failed to delete achievement");
    }
  };

  const handleEdit = (achievementId) => {
    navigate(`/edit-achievement/${achievementId}`);
  };

  // Loading state with animation
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-[#8B1E1E] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8B1E1E] font-semibold">Loading achievements...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl border border-[#E7DDD6] shadow-md max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="px-5 py-2.5 bg-[#8B1E1E] hover:bg-[#6F1111] text-white rounded-full shadow transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with breadcrumb and actions */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#8B1E1E] mb-2 font-semibold">
              <Link to={`/profile/${alumniId}`} className="flex items-center hover:text-[#6F1111] transition">
                <FaArrowLeft className="mr-1.5" /> Back to Profile
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-[#3D0707] flex items-center gap-3">
              <FaAward className="text-[#8B1E1E]" />
              <span>Achievements & Recognitions</span>
            </h1>
            {alumniInfo && (
              <p className="text-gray-550 mt-1.5 font-medium">
                {isOwnProfile ? "Your notable accomplishments" : `${alumniInfo.name}'s notable accomplishments`}
              </p>
            )}
          </div>
          
          {isOwnProfile && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/add-achievements")}
              className="bg-[#8B1E1E] hover:bg-[#6F1111] text-white flex items-center gap-2 px-5 py-2.5 rounded-full shadow transition-all text-sm font-semibold"
            >
              <FaPlus /> Add Achievement
            </motion.button>
          )}
        </div>

        {/* Achievements Grid */}
        {achievements.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-[#E7DDD6] overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                  {/* Header with Category */}
                  <div className="bg-[#FAF8F6] border-b border-[#E7DDD6] border-l-4 border-l-[#8B1E1E] py-3.5 px-6 text-[#3D0707]">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[#8B1E1E]">{getCategoryIcon(achievement.category)}</span>
                        <h3 className="font-bold text-gray-805 text-sm">{achievement.category || "Achievement"}</h3>
                      </div>
                      <div className="text-xs bg-[#8B1E1E] text-white px-3 py-1 rounded-full font-bold">
                        {new Date(achievement.dateOfAchievement).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short'
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Image Preview (if available) */}
                  {achievement.supportingDocuments && (
                    <div className="relative h-48 overflow-hidden bg-[#FAF6F0] border-b border-[#E7DDD6]/50">
                      <img
                        src={achievement.supportingDocuments}
                        alt={achievement.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="p-6 bg-white flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#3D0707] mb-2">{achievement.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 font-semibold mb-4">
                        <FaBuilding className="text-[#8B1E1E] mr-2" />
                        <span>{achievement.organization || "Organization not specified"}</span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">{achievement.description}</p>
                    </div>
                    
                    {/* Action buttons - only for own profile */}
                    {isOwnProfile && (
                      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#E7DDD6]/60">
                        <button
                          onClick={() => handleEdit(achievement.id)}
                          className="flex items-center gap-1.5 bg-[#FAF6F0] text-[#8B1E1E] hover:bg-[#E7DDD6]/50 px-3.5 py-1.5 rounded-full transition text-xs font-semibold"
                          title="Edit"
                        >
                          <FaEdit size={12} /> <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(achievement.id)}
                          className="flex items-center gap-1.5 bg-red-50 text-red-650 hover:bg-red-100 px-3.5 py-1.5 rounded-full transition text-xs font-semibold"
                          title="Delete"
                        >
                          <FaTrash size={12} /> <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-[#E7DDD6] shadow-sm p-10 text-center"
          >
            <div className="w-16 h-16 mx-auto bg-[#FAF6F0] rounded-full flex items-center justify-center mb-4 text-[#8B1E1E]">
              <FaAward size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#3D0707] mb-2">
              {isOwnProfile ? "You haven't added any achievements yet" : "No achievements found"}
            </h3>
            <p className="text-gray-555 text-sm mb-6 max-w-md mx-auto">
              {isOwnProfile 
                ? "Showcase your awards, certifications, and other notable accomplishments" 
                : "This alumni hasn't added any achievements yet"}
            </p>
            {isOwnProfile && (
              <button
                onClick={() => navigate("/add-achievements")}
                className="px-5 py-2.5 bg-[#8B1E1E] hover:bg-[#6F1111] text-white rounded-full shadow transition inline-flex items-center gap-2 text-sm font-semibold"
              >
                <FaPlus /> Add First Achievement
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AlumniAchievements;
