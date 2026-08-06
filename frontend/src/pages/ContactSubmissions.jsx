import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEnvelope, FaTrash, FaCheck, FaInbox, FaSearch, FaSpinner, FaExclamationTriangle, FaClock, FaCalendarAlt, FaComment } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function ContactSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, pending, resolved
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest

  const formatDateTime = (dateArray) => {
    if (!Array.isArray(dateArray) || dateArray.length < 6) return "Invalid date";
  
    const [year, month, day, hour, minute, second] = dateArray;
  
    // JavaScript Date expects month index (0-based), so subtract 1 from the month
    const date = new Date(year, month - 1, day, hour, minute, second);
  
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateArray);
      return "Invalid date";
    }
  
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };
  
  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/contact/all`, {withCredentials:true});
      setSubmissions(response.data);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      toast.error("Failed to load contact submissions");
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (id) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/contact/${id}/resolve`, {}, {withCredentials:true});
      toast.success("Marked as resolved");
      fetchSubmissions();
    } catch (error) {
      console.error("Error marking submission as resolved:", error);
      toast.error("Failed to update status");
    }
  };

  const deleteSubmission = async (id) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this message?</p>
        <div className="flex justify-end mt-2 gap-2">
          <button 
            onClick={() => {
              toast.dismiss();
              performDelete(id);
            }}
            className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
          >
            Delete
          </button>
          <button 
            onClick={() => toast.dismiss()}
            className="px-3 py-1 bg-gray-300 text-gray-800 rounded-md text-sm hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        draggable: false,
        position: "top-center"
      }
    );
  };

  const performDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/contact/${id}`, {withCredentials: true});
      toast.success("Message deleted successfully");
      fetchSubmissions();
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast.error("Failed to delete message");
    }
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

  // Filter and sort submissions
  const filteredSubmissions = submissions
    .filter(submission => {
      // Apply status filter
      if (filter === "pending" && submission.resolved) return false;
      if (filter === "resolved" && !submission.resolved) return false;
      
      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          (submission.name && submission.name.toLowerCase().includes(term)) ||
          (submission.email && submission.email.toLowerCase().includes(term)) ||
          (submission.message && submission.message.toLowerCase().includes(term))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Convert date arrays to Date objects for comparison
      const dateA = new Date(a.createdAt[0], a.createdAt[1] - 1, a.createdAt[2]);
      const dateB = new Date(b.createdAt[0], b.createdAt[1] - 1, b.createdAt[2]);
      
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex justify-center items-center p-6">
        <div className="text-center">
          <FaSpinner className="animate-spin text-[#8B1E1E] text-5xl mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF6F0] to-[#FAF6F0] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-3 text-[#3D0707]">
            <FaInbox className="inline-block mr-3 text-[#8B1E1E]" />
            Contact Submissions
          </h1>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8 text-sm">
            Manage and respond to inquiries from your alumni community
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 bg-white p-5 rounded-xl border border-[#E7DDD6] shadow-sm"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-4 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email or message content..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] bg-white transition-all shadow-sm text-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[#3D0707] text-sm font-semibold whitespace-nowrap">Status:</span>
                <div className="flex rounded-full overflow-hidden border border-gray-300">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                      filter === "all" 
                        ? "bg-[#8B1E1E] text-white" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter("pending")}
                    className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                      filter === "pending" 
                        ? "bg-yellow-600 text-white" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setFilter("resolved")}
                    className={`px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                      filter === "resolved" 
                        ? "bg-green-600 text-white" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#3D0707] text-sm font-semibold whitespace-nowrap">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] bg-white transition shadow-sm text-sm cursor-pointer"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Submissions List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {filteredSubmissions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-10 rounded-xl border border-[#E7DDD6] text-center shadow-sm max-w-lg mx-auto"
            >
              <FaInbox className="mx-auto text-[#8B1E1E]/40 text-5xl mb-4" />
              <h3 className="text-xl font-bold text-[#3D0707] mb-2">No submissions found</h3>
              <p className="text-gray-500 text-sm">
                {searchTerm ? "Try adjusting your search terms or filters." : "No contact form submissions have been received yet."}
              </p>
            </motion.div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
                  Showing {filteredSubmissions.length} {filteredSubmissions.length === 1 ? 'submission' : 'submissions'}
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>
              <AnimatePresence>
                {filteredSubmissions.map((submission) => (
                  <motion.div 
                    key={submission.id} 
                    variants={itemVariants}
                    className={`bg-white rounded-xl border border-[#E7DDD6] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md group ${
                      submission.resolved ? 'border-l-4 border-green-600' : 'border-l-4 border-yellow-500'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center mb-1.5">
                            <h3 className="text-lg font-bold text-gray-900">{submission.name}</h3>
                            {submission.resolved && (
                              <span className="ml-3 px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-200 text-xs rounded-full flex items-center font-medium">
                                <FaCheck className="mr-1" /> Resolved
                              </span>
                            )}
                            {!submission.resolved && (
                              <span className="ml-3 px-2.5 py-0.5 bg-yellow-50 text-yellow-750 border border-yellow-200 text-xs rounded-full flex items-center font-medium">
                                <FaClock className="mr-1" /> Pending
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center text-gray-600 mb-4 text-sm">
                            <FaEnvelope className="text-[#8B1E1E] mr-2" />
                            <a href={`mailto:${submission.email}`} className="hover:text-[#8B1E1E] hover:underline transition-colors font-medium">
                              {submission.email}
                            </a>
                          </div>
                          
                          <div className="flex items-start mb-4 text-sm">
                            <FaComment className="text-[#8B1E1E] mr-2 mt-1 flex-shrink-0" />
                            <p className="text-gray-700 leading-relaxed">{submission.message}</p>
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500 font-medium">
                            <FaCalendarAlt className="text-gray-400 mr-2" />
                            <span>Submitted on: {formatDateTime(submission.createdAt)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-start mt-4 md:mt-0 md:ml-4 space-x-2">
                          {!submission.resolved && (
                            <button
                              onClick={() => markAsResolved(submission.id)}
                              className="p-2 bg-green-50 border border-green-200 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2 text-xs font-semibold"
                              title="Mark as resolved"
                            >
                              <FaCheck />
                              <span className="hidden sm:inline">Resolve</span>
                            </button>
                          )}
                          <button
                            onClick={() => deleteSubmission(submission.id)}
                            className="p-2 bg-red-50 border border-red-200 text-red-650 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 text-xs font-semibold"
                            title="Delete submission"
                          >
                            <FaTrash />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default ContactSubmissions; 