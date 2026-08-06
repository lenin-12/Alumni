// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";
// import { useUser } from "../UserContext";
// import { FaBuilding, FaUserTie, FaMapMarkerAlt, FaCalendarAlt, FaEdit, FaTrash } from "react-icons/fa";
// import { toast } from 'react-toastify';

// const WorkExperiencePage = () => {
//   const [workExperiences, setWorkExperiences] = useState([]);
//   const { alumniId } = useParams();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const { user, logoutUser } = useUser();
//   const navigate = useNavigate();
//   const userId = useState(user.id);
//   console.log(user);
//   console.log(user.id+" uuuuuuuuu    "+alumniId);

//   useEffect(() => {
//     const fetchWorkExperiences = async () => {
//       try {
//         const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/work-experience/user/${alumniId}`);
//         const workExpArray = Array.isArray(response.data) ? response.data.reverse() : [response.data];
//         setWorkExperiences(workExpArray);
//       } catch (error) {
//         toast.error("Failed to load work experiences");
//         setError("Failed to load work experience.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (user?.id) {
//       fetchWorkExperiences();
//     }
//   }, [user]);

//   const handleDelete = async (workId) => {
//     toast.info(
//       <div>
//         <p>Are you sure you want to delete this work experience?</p>
//         <div className="mt-2 flex justify-center space-x-3">
//           <button 
//             className="bg-red-500 text-white px-3 py-1 rounded"
//             onClick={() => {
//               toast.dismiss();
//               deleteWorkExperience(workId);
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
  
//   const deleteWorkExperience = async (workId) => {
//     try {
//       await axios.delete(`${import.meta.env.VITE_API_URL}/api/work-experience/${workId}`, { withCredentials: true });
//       setWorkExperiences(workExperiences.filter(work => work.id !== workId));
//       toast.success("Work experience deleted successfully");
//     } catch (error) {
//       toast.error("Failed to delete work experience");
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await axios.post(`${import.meta.env.VITE_API_URL}/api/logout`, {}, { withCredentials: true });
//       logoutUser();
//       navigate("/");
//     } catch (error) {
//       toast.error("Logout failed. Please try again.");
//     }
//   };

//   const handleEdit = (workId) => {
//     navigate(`/edit-work/${workId}`); // Redirect to edit page (customize this route as needed)
//   };

//   if (loading) return <p className="text-center text-gray-600">Loading work experiences...</p>;
//   if (error) return <p className="text-center text-red-500">{error}</p>;

//   return (
//     <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
//       <h2 className="text-3xl font-bold mb-6 text-gray-900">Work Experience</h2>

//       {/* Colored Box Wrapper */}
//       <div className="bg-blue-100 p-6 rounded-xl shadow-lg w-full max-w-3xl">
//         {workExperiences.length > 0 ? (
//           workExperiences.map((work) => (
//             <div key={work.id} className="bg-white p-5 rounded-lg shadow-md mb-4 transition-transform duration-300 hover:scale-105 relative group">
//               <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
//                 <FaBuilding className="text-blue-600" /> {work.company}
//               </h3>
//               <p className="text-gray-600 flex items-center gap-2">
//                 <FaUserTie className="text-green-600" /> {work.role}
//               </p>
//               <p className="text-gray-500 flex items-center gap-2">
//                 <FaMapMarkerAlt className="text-red-500" /> {work.location}
//               </p>
//               <p className="text-gray-500 flex items-center gap-2"> 
//                 <FaCalendarAlt className="text-yellow-500" /> {new Date(work.startDate).toLocaleDateString()} - {work.present?"Present":new Date(work.endDate).toLocaleDateString()}
//               </p>
//               <p className="mt-3 text-gray-700">{work.description}</p>
//               {user.id == alumniId && (
//                 <div className="absolute top-3 right-3 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
//                   <button
//                     onClick={() => handleEdit(work.id)}
//                     className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-700 transition"
//                   >
//                     <FaEdit />
//                   </button>
//                   <button
//                     onClick={() => handleDelete(work.id)}
//                     className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-700 transition"
//                   >
//                     <FaTrash />
//                   </button>
//                 </div>
//               )}
//             </div>
//           ))
//         ) : (
//           <p className="text-gray-600 text-center">No work experience added yet.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default WorkExperiencePage;


import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "../UserContext";
import { FaBuilding, FaUserTie, FaMapMarkerAlt, FaCalendarAlt, FaEdit, FaTrash, FaBriefcase, FaArrowLeft, FaPlus } from "react-icons/fa";
import { toast } from 'react-toastify';
import { motion } from "framer-motion";

const WorkExperiencePage = () => {
  const [workExperiences, setWorkExperiences] = useState([]);
  const [alumniInfo, setAlumniInfo] = useState(null);
  const { alumniId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useUser();
  const navigate = useNavigate();
  
  const isOwnProfile = user?.id == alumniId;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch work experiences
        const workResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/work-experience/user/${alumniId}`, 
          { withCredentials: true }
        );
        const workExpArray = Array.isArray(workResponse.data) ? workResponse.data : [workResponse.data];
        setWorkExperiences(workExpArray.sort((a, b) => b.id - a.id));
        
        // Fetch alumni info
        const alumniResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${alumniId}`, 
          { withCredentials: true }
        );
        setAlumniInfo(alumniResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load work experiences");
        setError("Failed to load work experience data");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [alumniId, user]);

  const handleDelete = async (workId) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this work experience?</p>
        <div className="mt-2 flex justify-center space-x-3">
          <button 
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={() => {
              toast.dismiss();
              deleteWorkExperience(workId);
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
  
  const deleteWorkExperience = async (workId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/work-experience/${workId}`, { withCredentials: true });
      setWorkExperiences(workExperiences.filter(work => work.id !== workId));
      toast.success("Work experience deleted successfully");
    } catch (error) {
      toast.error("Failed to delete work experience");
    }
  };

  const handleEdit = (workId) => {
    navigate(`/edit-work/${workId}`);
  };

  // Loading state with animation
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-[#8B1E1E] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8B1E1E] font-semibold">Loading work experiences...</p>
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
      <div className="max-w-4xl mx-auto">
        {/* Header with breadcrumb and actions */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#8B1E1E] mb-2 font-semibold">
              <Link to={`/profile/${alumniId}`} className="flex items-center hover:text-[#6F1111] transition">
                <FaArrowLeft className="mr-1.5" /> Back to Profile
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-[#3D0707] flex items-center gap-3">
              <FaBriefcase className="text-[#8B1E1E]" />
              <span>Work Experience</span>
            </h1>
            {alumniInfo && (
              <p className="text-gray-500 mt-1.5 font-medium">
                {isOwnProfile ? "Your professional journey" : `${alumniInfo.name}'s professional journey`}
              </p>
            )}
          </div>
          
          {isOwnProfile && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/add-work-experience")}
              className="bg-[#8B1E1E] hover:bg-[#6F1111] text-white flex items-center gap-2 px-5 py-2.5 rounded-full shadow transition-all text-sm font-semibold"
            >
              <FaPlus /> Add Work Experience
            </motion.button>
          )}
        </div>

        {/* Timeline View */}
        <div className="relative">
          {/* Timeline line */}
          {workExperiences.length > 0 && (
            <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-[#E7DDD6] z-0"></div>
          )}

          {/* Work experiences */}
          {workExperiences.length > 0 ? (
            <div className="space-y-8">
              {workExperiences.map((work, index) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative flex"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-8 transform -translate-x-1/2 w-4 h-4 rounded-full bg-[#8B1E1E] border-2 border-white z-10 shadow-sm"></div>
                  
                  {/* Content card */}
                  <div className="ml-12 flex-grow">
                    <div className="bg-white rounded-2xl shadow-sm border border-[#E7DDD6] overflow-hidden hover:shadow-md transition-shadow duration-300">
                      {/* Company bar */}
                      <div className="bg-[#FAF8F6] border-b border-[#E7DDD6] border-l-4 border-l-[#8B1E1E] py-3.5 px-6 text-[#3D0707] flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FaBuilding className="text-[#8B1E1E]" />
                          <h3 className="font-bold text-gray-800">{work.company}</h3>
                        </div>
                        <div className="text-xs bg-[#8B1E1E] text-white px-3 py-1 rounded-full font-bold">
                          {work.present ? "Current" : new Date(work.endDate).getFullYear()}
                        </div>
                      </div>
                      
                      {/* Details */}
                      <div className="p-6 bg-white">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-[#3D0707] mb-1">{work.role}</h3>
                            <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-500 font-medium">
                              <div className="flex items-center gap-1.5">
                                <FaMapMarkerAlt className="text-[#A6491F]" />
                                <span>{work.location || "Location not specified"}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <FaCalendarAlt className="text-[#8B1E1E]" />
                                <span>
                                  {new Date(work.startDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short'
                                  })} - {work.present ? "Present" : new Date(work.endDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action buttons - only for own profile */}
                          {isOwnProfile && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(work.id)}
                                className="bg-[#FAF6F0] text-[#8B1E1E] hover:bg-[#E7DDD6]/50 p-2 rounded-lg transition"
                                title="Edit"
                              >
                                <FaEdit size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(work.id)}
                                className="bg-red-50 text-red-650 hover:bg-red-100 p-2 rounded-lg transition"
                                title="Delete"
                              >
                                <FaTrash size={15} />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Description */}
                        <div className="mt-2 text-gray-600 text-sm leading-relaxed">
                          <p>{work.description || "No description provided."}</p>
                        </div>
                      </div>
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
                <FaBriefcase size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#3D0707] mb-2">
                {isOwnProfile ? "You haven't added any work experience yet" : "No work experience added yet"}
              </h3>
              <p className="text-gray-550 text-sm mb-6 max-w-md mx-auto">
                {isOwnProfile 
                  ? "Add your professional experience to showcase your career journey" 
                  : "This alumni hasn't added any work experience yet"}
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => navigate("/add-work-experience")}
                  className="px-5 py-2.5 bg-[#8B1E1E] hover:bg-[#6F1111] text-white rounded-full shadow transition-all inline-flex items-center gap-2 text-sm font-semibold"
                >
                  <FaPlus /> Add First Experience
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkExperiencePage;