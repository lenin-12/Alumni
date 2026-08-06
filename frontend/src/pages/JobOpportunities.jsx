
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../UserContext";
import { 
  FaTrash, FaBuilding, FaMapMarkerAlt, FaBriefcase, FaUserTie, 
  FaTools, FaFileAlt, FaCalendar, FaLink, FaEnvelope, FaPlus, 
  FaClock, FaTimes, FaExternalLinkAlt, FaFilter, FaSearch,
  FaInfoCircle, FaCheckCircle
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { toast } from 'react-toastify';
import { motion, AnimatePresence } from "framer-motion";

function JobOpportunities() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "",
    experienceLevel: "",
    skills: "",
    description: "",
    applicationDeadline: "",
    applicationLink: "",
    contactInfo: "",
  });

  const { user } = useUser();
  const navigate = useNavigate();
  
  const jobTypes = [
    "Full-time", 
    "Part-time", 
    "Contract", 
    "Internship", 
    "Remote", 
    "Hybrid",
    "Freelance"
  ];
  
  const experienceLevels = [
    "Entry Level",
    "Junior",
    "Mid-Level",
    "Senior",
    "Lead",
    "Manager",
    "Director",
    "Executive"
  ];

  useEffect(() => {
    fetchJobs();
  }, []);
  
  useEffect(() => {
    let result = jobs;
    
    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(lowercasedSearch) ||
        job.company.toLowerCase().includes(lowercasedSearch) ||
        job.skills.toLowerCase().includes(lowercasedSearch) ||
        job.description.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    // Apply job type filter
    if (filterType) {
      result = result.filter(job => 
        job.jobType.toLowerCase() === filterType.toLowerCase()
      );
    }
    
    setFilteredJobs(result);
  }, [jobs, searchTerm, filterType]);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`, { withCredentials: true });
      const jobOpportunitiesArray = Array.isArray(response.data) ? response.data.reverse() : [response.data];
      setJobs(jobOpportunitiesArray);
      setFilteredJobs(jobOpportunitiesArray);
    } catch (error) {
      console.error("Error fetching job opportunities", error);
      toast.error("Failed to load job opportunities");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
    
    setFormData({ ...formData, [name]: value });
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = "Job title is required";
    if (!formData.company.trim()) errors.company = "Company name is required";
    if (!formData.jobType.trim()) errors.jobType = "Job type is required";
    if (!formData.skills.trim()) errors.skills = "Skills are required";
    if (!formData.applicationDeadline) errors.applicationDeadline = "Application deadline is required";
    if (!formData.applicationLink.trim()) errors.applicationLink = "Application link is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      formData.userId = user.id;
      await axios.post(`${import.meta.env.VITE_API_URL}/api/jobs`, formData, { withCredentials: true });
      toast.success("Job posted successfully!");
      setFormData({
        title: "",
        company: "",
        location: "",
        jobType: "",
        experienceLevel: "",
        skills: "",
        description: "",
        applicationDeadline: "",
        applicationLink: "",
        contactInfo: "",
      });
      setShowForm(false);
      fetchJobs();
    } catch (error) {
      console.error("Error posting job", error);
      toast.error("Failed to post job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (jobId) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this job?</p>
        <div className="mt-2 flex justify-center space-x-3">
          <button 
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={() => {
              toast.dismiss();
              performDelete(jobId);
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

  const performDelete = async (jobId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/jobs/${jobId}`, { withCredentials: true });
      setJobs(jobs.filter((job) => job.id !== jobId));
      toast.success("Job deleted successfully");
    } catch (error) {
      console.error("Error deleting job", error);
      toast.error("Failed to delete job");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF6F0] to-[#FAF6F0] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        {!showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-[#3D0707] text-center mb-2">
              Job Opportunities
            </h1>
            <p className="text-gray-600 text-center max-w-2xl mx-auto text-sm">
              Discover career opportunities shared by fellow alumni and industry partners
            </p>
          </motion.div>
        )}

        {/* Search and Filter */}
        {!showForm && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 bg-white p-4 rounded-xl border border-[#E7DDD6] shadow-sm"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <FaSearch className="absolute left-4 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search jobs by title, company, or skills..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] bg-white transition-all shadow-sm text-sm"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <FaFilter className="absolute left-4 top-3 text-gray-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] appearance-none bg-white transition shadow-sm text-sm cursor-pointer"
                  >
                    <option value="">All Job Types</option>
                    {jobTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                {(searchTerm || filterType) && (
                  <button
                    onClick={clearFilters}
                    className="px-5 py-2 bg-white border border-[#8B1E1E] text-[#8B1E1E] rounded-full hover:bg-[#FAF6F0] transition flex items-center justify-center text-sm font-semibold shadow-sm"
                  >
                    <FaTimes className="mr-2" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Post Job Button */}
        {user && user.firstName && !showForm && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            onClick={() => setShowForm(true)}
            className="fixed bottom-[40px] right-5 bg-gradient-to-r from-[#8B1E1E] to-[#6F1111] text-white px-5 py-3 rounded-full shadow-lg z-10 flex items-center gap-2 hover:from-[#6F1111] hover:to-[#531010] hover:shadow-xl transition-all duration-300 font-semibold"
          >
            <FaPlus className="text-lg" /> 
            <span>Post Job</span>
          </motion.button>
        )}

        {/* Job Posting Form */}
        <AnimatePresence>
          {showForm && user && user.firstName && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowForm(false)}></div>
              
              {/* Form Card */}
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden border border-[#E7DDD6]"
              >
                {/* Form Header */}
                <div className="bg-gradient-to-r from-[#3D0707] via-[#531010] to-[#3D0707] p-6 text-white border-b border-[#6F1111]">
                  <h2 className="text-2xl font-bold text-center">
                    Post a Job Opportunity
                  </h2>
                  <p className="text-center text-gray-200 mt-1 text-sm">
                    Share career opportunities with the alumni community
                  </p>
                </div>
                
                {/* Close button */}
                <button 
                  onClick={() => setShowForm(false)}
                  className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/20 transition z-20"
                  aria-label="Close form"
                >
                  <FaTimes size={24} />
                </button>
                
                {/* Form Content */}
                <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto bg-[#FAF6F0]">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Job Title */}
                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-[#3D0707]">
                          Job Title <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaBriefcase className="absolute left-3 top-3 text-[#8B1E1E]" />
                          <input 
                            name="title" 
                            placeholder="e.g., Senior Software Engineer" 
                            value={formData.title} 
                            onChange={handleChange} 
                            className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition text-gray-800 text-sm ${
                              formErrors.title ? "border-red-500" : "border-gray-300 bg-white"
                            }`}
                          />
                        </div>
                        {formErrors.title && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
                        )}
                      </div>
                      
                      {/* Company Name */}
                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-[#3D0707]">
                          Company <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaBuilding className="absolute left-3 top-3 text-[#8B1E1E]" />
                          <input 
                            name="company" 
                            placeholder="e.g., Google, Microsoft" 
                            value={formData.company} 
                            onChange={handleChange} 
                            className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition text-gray-800 text-sm ${
                              formErrors.company ? "border-red-500" : "border-gray-300 bg-white"
                            }`}
                          />
                        </div>
                        {formErrors.company && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.company}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Job Type */}
                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-[#3D0707]">
                          Job Type <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaClock className="absolute left-3 top-3 text-[#8B1E1E]" />
                          <select 
                            name="jobType" 
                            value={formData.jobType} 
                            onChange={handleChange} 
                            className={`w-full p-3 pl-10 border rounded-lg appearance-none focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition text-gray-800 text-sm ${
                              formErrors.jobType ? "border-red-500" : "border-gray-300 bg-white"
                            }`}
                          >
                            <option value="">Select Job Type</option>
                            {jobTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        {formErrors.jobType && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.jobType}</p>
                        )}
                      </div>
                      
                      {/* Location */}
                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-[#3D0707]">
                          Location
                        </label>
                        <div className="relative">
                          <FaMapMarkerAlt className="absolute left-3 top-3 text-[#8B1E1E]" />
                          <input 
                            name="location" 
                            placeholder="e.g., New York, Remote" 
                            value={formData.location} 
                            onChange={handleChange} 
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition text-gray-800 bg-white text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Experience Level */}
                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-[#3D0707]">
                          Experience Level
                        </label>
                        <div className="relative">
                          <FaUserTie className="absolute left-3 top-3 text-[#8B1E1E]" />
                          <select 
                            name="experienceLevel" 
                            value={formData.experienceLevel} 
                            onChange={handleChange} 
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition text-gray-800 bg-white text-sm"
                          >
                            <option value="">Select Experience Level</option>
                            {experienceLevels.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      {/* Application Deadline */}
                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-[#3D0707]">
                          Application Deadline <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaCalendar className="absolute left-3 top-3 text-[#8B1E1E]" />
                          <input
                            name="applicationDeadline"
                            type="date"
                            value={formData.applicationDeadline}
                            onChange={handleChange}
                            min={new Date().toISOString().split("T")[0]}
                            className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition text-gray-800 text-sm ${
                              formErrors.applicationDeadline ? "border-red-500" : "border-gray-300 bg-white"
                            }`}
                          />
                        </div>
                        {formErrors.applicationDeadline && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.applicationDeadline}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Skills Required */}
                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-[#3D0707]">
                          Skills Required <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaTools className="absolute left-3 top-3 text-[#8B1E1E]" />
                          <input 
                            name="skills" 
                            placeholder="e.g., React, Node.js, SQL" 
                            value={formData.skills} 
                            onChange={handleChange} 
                            className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition text-gray-800 text-sm ${
                              formErrors.skills ? "border-red-500" : "border-gray-300 bg-white"
                            }`}
                          />
                        </div>
                        {formErrors.skills && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.skills}</p>
                        )}
                      </div>
                      
                      {/* Application Link */}
                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-[#3D0707]">
                          Application Link <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaLink className="absolute left-3 top-3 text-[#8B1E1E]" />
                          <input 
                            name="applicationLink" 
                            placeholder="https://example.com/apply" 
                            value={formData.applicationLink} 
                            onChange={handleChange} 
                            className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition text-gray-800 text-sm ${
                              formErrors.applicationLink ? "border-red-500" : "border-gray-300 bg-white"
                            }`}
                          />
                        </div>
                        {formErrors.applicationLink && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.applicationLink}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-[#3D0707]">
                        Contact Information
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-3 text-[#8B1E1E]" />
                        <input 
                          name="contactInfo" 
                          placeholder="e.g., Email or LinkedIn profile" 
                          value={formData.contactInfo} 
                          onChange={handleChange} 
                          className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition text-gray-800 bg-white text-sm"
                        />
                      </div>
                    </div>
                    
                    {/* Job Description */}
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-[#3D0707]">
                        Job Description
                      </label>
                      <div className="relative">
                        <FaFileAlt className="absolute left-3 top-3 text-[#8B1E1E]" />
                        <textarea 
                          name="description" 
                          placeholder="Describe the role, responsibilities, and requirements..." 
                          value={formData.description} 
                          onChange={handleChange} 
                          className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition text-gray-800 bg-white text-sm"
                          rows="4"
                        />
                      </div>
                    </div>
                    
                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[#8B1E1E] to-[#6F1111] text-white py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:from-[#6F1111] hover:to-[#531010] shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-70 text-sm uppercase tracking-wider"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                          <span>Posting...</span>
                        </>
                      ) : (
                        <>
                          <FaCheckCircle />
                          <span>Post Job</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job Listings */}
        {!showForm && (
          <div className="mt-8">
            {filteredJobs.length > 0 ? (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
                    Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
                    {searchTerm && ` for "${searchTerm}"`}
                    {filterType && ` in ${filterType}`}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-white rounded-xl border border-[#E7DDD6] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden flex flex-col justify-between"
                    >
                      {/* Job type badge */}
                      <div className="absolute top-0 right-0">
                        <div className="bg-[#FAF6F0] text-[#8B1E1E] border-l border-b border-[#E7DDD6] text-xs font-bold px-3 py-1 rounded-bl-lg">
                          {job.jobType}
                        </div>
                      </div>
                      
                      <div className="p-6 flex flex-col flex-grow justify-between">
                        <div>
                          {/* Admin delete button */}
                          {user && user.role === "ADMIN" && (
                            <button
                              onClick={() => handleDelete(job.id)}
                              className="absolute top-10 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-700 transition opacity-0 group-hover:opacity-100 shadow-md"
                            >
                              <FaTrash size={12} />
                            </button>
                          )}
                          
                          {/* Header */}
                          <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-1 pr-16">
                              {job.title}
                            </h3>
                            <div className="flex items-center text-gray-700 text-sm">
                              <FaBuilding className="text-[#8B1E1E] mr-2 flex-shrink-0" />
                              <span className="font-semibold">{job.company}</span>
                            </div>
                          </div>
                          
                          {/* Details */}
                          <div className="space-y-2 mb-4 text-sm">
                            {job.location && (
                              <div className="flex items-start">
                                <FaMapMarkerAlt className="text-red-600 mt-1 mr-2 flex-shrink-0" />
                                <span className="text-gray-600">{job.location}</span>
                              </div>
                            )}
                            
                            {job.experienceLevel && (
                              <div className="flex items-start">
                                <FaUserTie className="text-[#A6491F] mt-1 mr-2 flex-shrink-0" />
                                <span className="text-gray-600">{job.experienceLevel}</span>
                              </div>
                            )}
                            
                            <div className="flex items-start">
                              <FaTools className="text-[#8B1E1E] mt-1 mr-2 flex-shrink-0" />
                              <div>
                                <span className="text-gray-600 font-semibold">Skills: </span>
                                <span className="text-gray-600">{job.skills}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <FaClock className="text-gray-500 mt-1 mr-2 flex-shrink-0" />
                              <div>
                                <span className="text-gray-600">Apply by: </span>
                                <span className="text-gray-700 font-semibold">
                                  {new Date(job.applicationDeadline).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Description preview */}
                          {job.description && (
                            <div className="mb-4">
                              <div className="text-gray-700 text-sm line-clamp-3 leading-relaxed">
                                {job.description}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="pt-4 border-t border-[#E7DDD6] flex justify-between items-center mt-auto">
                          <a
                            href={job.applicationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#8B1E1E] text-white px-4 py-2 rounded-lg hover:bg-[#6F1111] hover:-translate-y-0.5 shadow-sm transition-all flex items-center gap-1.5 text-sm font-semibold"
                          >
                            <FaExternalLinkAlt size={12} />
                            <span>Apply Now</span>
                          </a>
                          
                          {job.contactInfo && (
                            <div className="flex items-center text-gray-500 text-xs">
                              <FaInfoCircle className="mr-1 text-[#8B1E1E]" />
                              <span className="truncate max-w-[120px]" title={job.contactInfo}>Contact: {job.contactInfo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-10 rounded-xl border border-[#E7DDD6] text-center shadow-sm max-w-lg mx-auto"
              >
                <FaBriefcase className="mx-auto text-[#8B1E1E]/40 text-5xl mb-4" />
                <h3 className="text-xl font-bold text-[#3D0707] mb-2">No job opportunities found</h3>
                <p className="text-gray-500 mb-6 text-sm">
                  {searchTerm || filterType ? 
                    "Try adjusting your search filters or check back later for new opportunities." : 
                    "There are no job opportunities posted yet. Be the first to share an opportunity with the alumni community."}
                </p>
                {user && user.firstName && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-[#8B1E1E] text-white px-5 py-2.5 rounded-full inline-flex items-center gap-2 hover:bg-[#6F1111] transition shadow-md font-semibold text-sm hover:-translate-y-0.5"
                  >
                    <FaPlus />
                    <span>Post a Job</span>
                  </button>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobOpportunities;

