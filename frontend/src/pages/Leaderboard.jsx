import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import userImg from '../assets/user.webp';
import { motion } from "framer-motion";
import { FaMedal, FaTrophy, FaSearch, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("points");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/api/users/leaderboard`, { withCredentials: true })
      .then(response => {
        setUsers(response.data);
        setFilteredUsers(response.data.filter(user => user.role === "ALUMNI"));
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching leaderboard:", error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    handleFilter();
  }, [searchTerm, users, sortField, sortDirection]);

  // Handle filtering and sorting
  const handleFilter = () => {
    let result = users.filter(user => user.role === "ALUMNI");
    
    // Apply search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(user => 
        (user.name && user.name.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.batch && user.batch.toString().includes(query))
      );
    }
    
    // Sort results
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === "points") {
        comparison = a.points - b.points;
      } else if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "batch") {
        comparison = a.batch - b.batch;
      }
      
      return sortDirection === "desc" ? -comparison : comparison;
    });
    
    setFilteredUsers(result);
  };

  // Function to determine medal type based on points
  const getMedal = (points) => {
    if (points >= 500) return { name: "Diamond", icon: <FaTrophy className="text-purple-600" />, color: "text-purple-700 font-bold", bgColor: "bg-purple-100" };
    if (points >= 200) return { name: "Platinum", icon: <FaMedal className="text-gray-700" />, color: "text-gray-700 font-semibold", bgColor: "bg-gray-100" };
    if (points >= 100) return { name: "Gold", icon: <FaMedal className="text-yellow-600" />, color: "text-yellow-600 font-semibold", bgColor: "bg-yellow-100" };
    if (points >= 50) return { name: "Silver", icon: <FaMedal className="text-gray-500" />, color: "text-gray-500 font-semibold", bgColor: "bg-gray-100" };
    return { name: "Bronze", icon: <FaMedal className="text-orange-600" />, color: "text-orange-600 font-semibold", bgColor: "bg-orange-100" };
  };

  // Toggle sort direction
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Render sort icon
  const renderSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="ml-1 text-gray-400" />;
    return sortDirection === "asc" ? <FaSortUp className="ml-1 text-blue-500" /> : <FaSortDown className="ml-1 text-blue-500" />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-center mb-3 text-indigo-900">
            <FaTrophy className="inline-block mr-3 text-yellow-500" /> 
            Alumni Leaderboard
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
            Recognizing our outstanding alumni who contribute to our community through participation and engagement.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
            />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {filteredUsers.length > 0 ? (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-400 to-indigo-600 text-white">
                        <th className="p-4 text-left w-12">S.No</th>
                        <th className="p-4 text-left">Profile</th>
                        <th className="p-4 text-left cursor-pointer" onClick={() => toggleSort("name")}>
                          <div className="flex items-center">
                            Name {renderSortIcon("name")}
                          </div>
                        </th>
                        <th className="p-4 text-left">Email</th>
                        <th className="p-4 text-left cursor-pointer" onClick={() => toggleSort("batch")}>
                          <div className="flex items-center">
                            Batch {renderSortIcon("batch")}
                          </div>
                        </th>
                        <th className="p-4 text-left cursor-pointer" onClick={() => toggleSort("points")}>
                          <div className="flex items-center">
                            Points {renderSortIcon("points")}
                          </div>
                        </th>
                        <th className="p-4 text-left">Achievement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => {
                        const { name, icon, color, bgColor } = getMedal(user.points);
                        return (
                          <motion.tr 
                            key={user.id || index} 
                            variants={itemVariants}
                            onClick={() => navigate(`/profile/${user.id}`)}
                            className={`cursor-pointer transition duration-300 hover:bg-indigo-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                          >
                            <td className="p-4 font-semibold text-gray-500">
                              {index < 3 ? (
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                                  {index + 1}
                                </span>
                              ) : (
                                index + 1
                              )}
                            </td>
                            <td className="p-4">
                              <div className="relative">
                                <img 
                                  src={user.imageUrl || userImg} 
                                  alt={user.name}
                                  className="h-14 w-14 rounded-full object-cover border-2 border-gray-300 shadow-sm" 
                                />
                              </div>
                            </td>
                            <td className="p-4 font-medium text-gray-900">{user.name}</td>
                            <td className="p-4 text-gray-600">{user.email}</td>
                            <td className="p-4 text-gray-600">{user.batch}</td>
                            <td className="p-4">
                              <div className="text-blue-600 font-bold bg-blue-100 px-3 py-1 rounded-full inline-block shadow-sm">
                                {user.points} Points
                              </div>
                            </td>
                            <td className="p-4">
                              <div className={`flex items-center gap-2 ${color} ${bgColor} px-3 py-1.5 rounded-full w-fit shadow-sm`}>
                                {icon}
                                <span>{name}</span>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-10 rounded-xl shadow-lg text-center"
              >
                <FaSearch className="mx-auto text-5xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No alumni found</h3>
                <p className="text-gray-500">
                  {searchTerm ? "Try adjusting your search terms or filters." : "The leaderboard is currently empty."}
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
