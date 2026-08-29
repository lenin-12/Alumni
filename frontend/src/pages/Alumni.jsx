import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt, FaUserGraduate, FaUsers, FaSearch, FaFilter, FaBuilding, FaGraduationCap, FaUserClock, FaUserCheck } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useUser } from "../UserContext";
import axiosInstance from "../utils/axiosInstance";


const AlumniList = () => {
  const [alumni, setAlumni] = useState([]);
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [availableBatches, setAvailableBatches] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [connections, setConnections] = useState({});
  const navigate = useNavigate();
  const { user } = useUser();
  
  const isAdmin = user && user.role === "ADMIN";

  useEffect(() => {
    if (!user?.id) return;
    fetchAlumni();
    fetchConnections();
  }, [user]);


  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/users`, { withCredentials: true });
      const alumniData = response.data;
      setAlumni(alumniData);
      setFilteredAlumni(alumniData);
    } catch (error) {
      console.error("Error fetching alumni:", error);
      toast.error("Failed to load alumni list");
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await axiosInstance.get(`/api/connections/user/${user.id}`);
      console.log("RAW response.data:", response.data);   

      const { pending, accepted } = response.data;
      console.log("pending array:", pending);   
      console.log("accepted array:", accepted);   

      const newConnections = {};

      pending.forEach((conn) => {
        console.log("🔵 processing pending conn:", conn, "| sender.id:", conn.sender.id, "| receiver.id:", conn.receiver.id, "| my user.id:", user.id);   // 👈 ADD THIS
        if (conn.sender.id === user.id) {
          newConnections[conn.receiver.id] = "PENDING";
        } else {
          newConnections[conn.sender.id] = "PENDING";
        }
      });

      accepted.forEach((conn) => {
        if (conn.sender.id === user.id) {
          newConnections[conn.receiver.id] = "ACCEPTED";
        } else {
          newConnections[conn.sender.id] = "ACCEPTED";
        }
      });

      console.log("FINAL newConnections object:", newConnections);  
      setConnections(newConnections);
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
};
  

  const sendRequest = async (receiverId) => {
    try {
      await axiosInstance.post(`${import.meta.env.VITE_API_URL}/api/connections/send/${user.id}/${receiverId}`, {}, { withCredentials: true });
      setConnections(prev => ({ ...prev, [receiverId]: 'PENDING' }));
      toast.success("Connection request sent!");
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast.error("Failed to send connection request");
    }
  };

  const getConnectionStatus = (userId) => {
    if (!user || userId === user.id) return null;
    return connections[userId] || null;
  };

  const renderConnectionButton = (alumnus) => {
    if (user && alumnus.id === user.id) return null;
    const status = getConnectionStatus(alumnus.id);
    if (!status)
       return (
      <button 
        onClick={() => sendRequest(alumnus.id)}
        className="flex items-center space-x-1.5 px-3 py-1 bg-[#8B1E1E] hover:bg-[#6F1111] text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-200"
      >
        <span>Connect</span>
      </button>
    );

    switch (status) {
      case 'ACCEPTED':
        return (
          <button className="flex items-center space-x-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold rounded-lg cursor-default">
            <FaUserCheck />
            <span>Connected</span>
          </button>
        );
      case 'PENDING':
        return (
          <button className="flex items-center space-x-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-semibold rounded-lg cursor-default">
            <FaUserClock />
            <span>Pending</span>
          </button>
        );
      case 'REJECTED':
        return (
          <button 
            onClick={() => sendRequest(alumnus.id)}
            className="flex items-center space-x-1.5 px-3 py-1 bg-[#8B1E1E] hover:bg-[#6F1111] text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-200"
          >
            <span>Connect</span>
          </button>
        );
      default:
        return (
          <button 
            onClick={() => sendRequest(alumnus.id)}
            className="flex items-center space-x-1.5 px-3 py-1 bg-[#8B1E1E] hover:bg-[#6F1111] text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-200"
          >
            <span>Connect</span>
          </button>
        );
    }
  };

  useEffect(() => {
    if (alumni.length > 0) {
      // Extract unique batches and departments for filters
      const batches = [...new Set(alumni.map(a => a.batch).filter(Boolean))].sort((a, b) => b - a);
      const departments = [...new Set(alumni.map(a => a.department).filter(Boolean))].sort();
      
      setAvailableBatches(batches);
      setAvailableDepartments(departments);
      
      applyFilters();
    }
  }, [alumni, searchTerm, filterBatch, filterDepartment]);


  const applyFilters = () => {
    let filtered = [...alumni];
    
    // Apply search filter
    if(searchTerm){
      filtered = filtered.filter(alumnus => 
        alumnus.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumnus.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumnus.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply batch filter
    if(filterBatch){
      filtered = filtered.filter(alumnus => alumnus.batch === filterBatch);
    }
    
    // Apply department filter
    if(filterDepartment){
      filtered = filtered.filter(alumnus => alumnus.department === filterDepartment);
    }
    
    setFilteredAlumni(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterBatch("");
    setFilterDepartment("");
  };

  const handleDelete = async (id) => {
    // Show confirmation toast with action buttons
    toast.info(
      <div>
        <p>Are you sure you want to delete this alumni?</p>
        <div className="mt-2 flex justify-center space-x-3">
          <button 
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={() => {
              toast.dismiss();
              deleteAlumni(id);
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

  const deleteAlumni = async (id) => {
    try {
      await axiosInstance.delete(`${import.meta.env.VITE_API_URL}/api/users/${id}`, { withCredentials: true });
      setAlumni(alumni.filter((alumnus) => alumnus.id !== id));
      toast.success("Alumni deleted successfully");
    } catch (error) {
      console.error("Error deleting alumni:", error);
      toast.error("Failed to delete alumni. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#FAF6F0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B1E1E] mx-auto"></div>
          <p className="mt-3 text-gray-700 font-medium">Loading alumni data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF6F0] to-[#FAF6F0] py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header & Stats */}
        <div className="bg-gradient-to-r from-[#3D0707] via-[#531010] to-[#3D0707] rounded-xl shadow-md mb-8 p-6 text-white border border-[#6F1111]">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Alumni Directory</h1>
              <p className="mt-2 text-gray-200">Connect with your fellow graduates</p>
            </div>
            <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-sm border border-white/10 px-5 py-3 rounded-lg flex items-center">
              <FaUsers className="text-2xl mr-3 text-brand-gold" />
              <div>
                <p className="text-sm text-gray-200">Total Registered</p>
                <p className="text-2xl font-bold">
                  {alumni.length} Alumni
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-[#E7DDD6] shadow-sm p-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 pr-4 py-2 w-full border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] bg-white transition-all shadow-sm text-sm"
                />
              </div>
            </div>
            
            {/* Batch Filter */}
            <div className="lg:w-48">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaGraduationCap className="text-gray-400" />
                </div>
                <select
                  value={filterBatch}
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="pl-11 pr-8 py-2 w-full border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] appearance-none bg-white transition-all shadow-sm text-sm cursor-pointer"
                >
                  <option value="">All Batches</option>
                  {availableBatches.map(batch => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Department Filter */}
            <div className="lg:w-64">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaBuilding className="text-gray-400" />
                </div>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="pl-11 pr-8 py-2 w-full border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] appearance-none bg-white transition-all shadow-sm text-sm cursor-pointer"
                >
                  <option value="">All Departments</option>
                  {availableDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Reset Filters */}
            {(searchTerm || filterBatch || filterDepartment) && (
              <button
                onClick={resetFilters}
                className="px-5 py-2 bg-white border border-[#8B1E1E] text-[#8B1E1E] rounded-full hover:bg-[#FAF6F0] hover:-translate-y-0.5 transition-all shadow-sm text-sm font-semibold flex items-center justify-center"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          {/* Results Count */}
          <div className="mt-4 text-gray-500 text-xs font-medium">
            Showing {filteredAlumni.length} of {alumni.length} alumni
          </div>
        </div>
        
        {/* Alumni Grid */}
        {filteredAlumni.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlumni.map((alumnus) => (
              <div
                key={alumnus.id}
                className="bg-white rounded-xl border border-[#E7DDD6] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col justify-between"
              >
                <div 
                  onClick={() => navigate(`/profile/${alumnus.id}`)}
                  className="p-5 cursor-pointer flex flex-col flex-1"
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-[#FAF6F0] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#E7DDD6] flex-shrink-0">
                      {alumnus.imageUrl ? (
                        <img src={alumnus.imageUrl} alt={alumnus.name} className="w-full h-full object-cover" />
                      ) : (
                        <FaUserGraduate className="text-[#8B1E1E] text-2xl" />
                      )}
                    </div>

                    {/* Alumni Info */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[#8B1E1E] transition truncate">{alumnus.name}</h2>
                      <p className="text-gray-500 text-sm truncate">{alumnus.email}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-2 flex-1">
                    <div className="bg-[#FAF8F6] rounded-lg p-2 border border-[#E7DDD6]/50">
                      <p className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Batch</p>
                      <p className="font-semibold text-gray-800 text-sm mt-0.5">{alumnus.batch || "Not specified"}</p>
                    </div>
                    <div className="bg-[#FAF8F6] rounded-lg p-2 border border-[#E7DDD6]/50">
                      <p className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Department</p>
                      <p className="font-semibold text-gray-800 text-sm mt-0.5 truncate" title={alumnus.department}>{alumnus.department || "Not specified"}</p>
                    </div>
                  </div>

                  {/* Connection Button */}
                  <div className="mt-4 flex justify-end">
                    {renderConnectionButton(alumnus)}
                  </div>
                </div>

                {/* Admin Delete Button */}
                {isAdmin && (
                  <div className="bg-[#FAF8F6] px-5 py-2.5 flex justify-end border-t border-[#E7DDD6]/50">
                    <button
                      className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(alumnus.id);
                      }}
                      title="Delete alumni"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E7DDD6] p-12 text-center shadow-sm max-w-lg mx-auto">
            <FaSearch className="text-[#8B1E1E]/40 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#3D0707] mb-2">No alumni found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters to find alumni</p>
            <button 
              onClick={resetFilters}
              className="px-5 py-2.5 bg-[#8B1E1E] text-white font-semibold rounded-full hover:bg-[#6F1111] transition shadow-md"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniList;
