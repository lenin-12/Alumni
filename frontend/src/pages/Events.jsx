import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useUser } from "../UserContext";

import { 
  FaCalendarAlt, FaTags, FaUserTie, FaCalendar, FaMapMarkerAlt, 
  FaEnvelope, FaFileAlt, FaHandshake, FaTrash, FaPlus, 
  FaSearch, FaFilter, FaTimes, FaCheckCircle, FaRegFileAlt,
  FaMicrophone, FaInfoCircle 
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

function Events() {
  const { user } = useUser();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    eventType: "",
    organizer: "",
    date: "",
    venue: "",
    contactPersonEmail: "",
    sponsorshipDetails: "",
  });
  
  const eventTypes = [
    "Webinar",
    "Workshop",
    "Conference",
    "Meetup",
    "Reunion",
    "Career Fair",
    "Seminar",
    "Hackathon",
    "Panel Discussion",
    "Networking Event",
    "Other"
  ];

  useEffect(() => {
    fetchEvents();
  }, []);
  
  useEffect(() => {
    let result = events;
    
    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(event => 
        event.eventName.toLowerCase().includes(lowercasedSearch) ||
        event.organizer.toLowerCase().includes(lowercasedSearch) ||
        event.description.toLowerCase().includes(lowercasedSearch) ||
        event.eventType.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    // Apply event type filter
    if (filterType) {
      result = result.filter(event => 
        event.eventType.toLowerCase() === filterType.toLowerCase()
      );
    }
    
    setFilteredEvents(result);
  }, [events, searchTerm, filterType]);

  // Handle form input changes
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
    
    if (!formData.eventName.trim()) errors.eventName = "Event name is required";
    if (!formData.eventType.trim()) errors.eventType = "Event type is required";
    if (!formData.organizer.trim()) errors.organizer = "Organizer is required";
    if (!formData.date) errors.date = "Date is required";
    if (!formData.venue.trim()) errors.venue = "Venue is required";
    if (!formData.contactPersonEmail.trim()) errors.contactPersonEmail = "Contact email is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await axiosInstance.post(`${import.meta.env.VITE_API_URL}/api/events`, formData, { withCredentials: true });
      toast.success("Event posted successfully!");
      setFormData({
        eventName: "",
        description: "",
        eventType: "",
        organizer: "",
        date: "",
        venue: "",
        contactPersonEmail: "",
        sponsorshipDetails: "",
      });
      setShowForm(false);
      fetchEvents();
    } catch (error) {
      console.error("Error posting event", error);
      toast.error("Failed to post event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (eventId) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this event?</p>
        <div className="mt-2 flex justify-center space-x-3">
          <button 
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={() => {
              toast.dismiss();
              deleteEvent(eventId);
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
  
  const deleteEvent = async (eventId) => {
    try {
      await axiosInstance.delete(`${import.meta.env.VITE_API_URL}/api/events/${eventId}`, { withCredentials: true });
      setEvents(events.filter((event) => event.id !== eventId));
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event", error);
      toast.error("Failed to delete event");
    }
  };

  // Fetch all events
  const fetchEvents = async () => {
    try {
      const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/events`, { withCredentials: true });
      const eventsArray = Array.isArray(response.data) ? response.data.reverse() : [response.data];
      setEvents(eventsArray);
      setFilteredEvents(eventsArray);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    }
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("");
  };
  
  // Format date to look better
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Check if an event is upcoming (today or in the future)
  const isUpcoming = (dateString) => {
    const eventDate = new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return eventDate >= today;
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
              Upcoming Events
            </h1>
            <p className="text-gray-600 text-center max-w-2xl mx-auto text-sm">
              Stay connected with the alumni community through webinars, meetups, and networking opportunities
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
                  placeholder="Search events by name, organizer, or type..."
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
                    <option value="">All Event Types</option>
                    {eventTypes.map(type => (
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

        {/* Add Event Button */}
        {user && user.firstName && !showForm && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            onClick={() => setShowForm(true)}
            className="fixed bottom-[40px] right-5 bg-gradient-to-r from-[#8B1E1E] to-[#6F1111] text-white px-5 py-3 rounded-full shadow-lg z-10 flex items-center gap-2 hover:from-[#6F1111] hover:to-[#531010] hover:shadow-xl transition-all duration-300 font-semibold"
          >
            <FaPlus className="text-lg" /> 
            <span>Add Event</span>
          </motion.button>
        )}

        {/* Event Posting Form Modal */}
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
                    Create New Event
                  </h2>
                  <p className="text-center text-gray-200 mt-1 text-sm">
                    Share events with the alumni community
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
                      {/* Event Name */}
                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-[#3D0707]">
                          Event Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaCalendarAlt className="absolute left-3 top-3 text-[#8B1E1E]" />
                          <input
                            name="eventName"
                            placeholder="e.g., Annual Alumni Meetup 2023"
                            value={formData.eventName}
                            onChange={handleChange}
                            className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition text-gray-800 text-sm ${
                              formErrors.eventName ? "border-red-500" : "border-gray-300 bg-white"
                            }`}
                          />
                        </div>
                        {formErrors.eventName && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.eventName}</p>
                        )}
                      </div>
                      
                      {/* Event Type */}
                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-[#3D0707]">
                          Event Type <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaTags className="absolute left-3 top-3 text-[#8B1E1E]" />
                          <select
                            name="eventType"
                            value={formData.eventType}
                            onChange={handleChange}
                            className={`w-full p-3 pl-10 border rounded-lg appearance-none focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition text-gray-800 text-sm ${
                              formErrors.eventType ? "border-red-500" : "border-gray-300 bg-white"
                            }`}
                          >
                            <option value="">Select Event Type</option>
                            {eventTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        {formErrors.eventType && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.eventType}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Organizer */}
                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-[#3D0707]">
                          Organizer <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaUserTie className="absolute left-3 top-3 text-[#8B1E1E]" />
                          <input
                            name="organizer"
                            placeholder="e.g., Alumni Association, CS Department"
                            value={formData.organizer}
                            onChange={handleChange}
                            className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition text-gray-800 text-sm ${
                              formErrors.organizer ? "border-red-500" : "border-gray-300 bg-white"
                            }`}
                          />
                        </div>
                        {formErrors.organizer && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.organizer}</p>
                        )}
                      </div>
                      
                      {/* Event Date */}
                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-[#3D0707]">
                          Event Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaCalendar className="absolute left-3 top-3 text-[#8B1E1E]" />
                          <input
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            min={new Date().toISOString().split("T")[0]}
                            className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition text-gray-800 text-sm ${
                              formErrors.date ? "border-red-500" : "border-gray-300 bg-white"
                            }`}
                          />
                        </div>
                        {formErrors.date && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Venue */}
                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-[#3D0707]">
                          Venue <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaMapMarkerAlt className="absolute left-3 top-3 text-[#8B1E1E]" />
                          <input
                            name="venue"
                            placeholder="e.g., Main Hall, or Zoom URL for virtual events"
                            value={formData.venue}
                            onChange={handleChange}
                            className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition text-gray-800 text-sm ${
                              formErrors.venue ? "border-red-500" : "border-gray-300 bg-white"
                            }`}
                          />
                        </div>
                        {formErrors.venue && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.venue}</p>
                        )}
                      </div>
                      
                      {/* Contact Person Email */}
                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-[#3D0707]">
                          Contact Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FaEnvelope className="absolute left-3 top-3 text-[#8B1E1E]" />
                          <input
                            name="contactPersonEmail"
                            type="email"
                            placeholder="Contact person's email address"
                            value={formData.contactPersonEmail}
                            onChange={handleChange}
                            className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition text-gray-800 text-sm ${
                              formErrors.contactPersonEmail ? "border-red-500" : "border-gray-300 bg-white"
                            }`}
                          />
                        </div>
                        {formErrors.contactPersonEmail && (
                          <p className="text-red-500 text-xs mt-1">{formErrors.contactPersonEmail}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-[#3D0707]">
                        Event Description <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaFileAlt className="absolute left-3 top-3 text-[#8B1E1E]" />
                        <textarea
                          name="description"
                          placeholder="Describe the event, its purpose, and what attendees can expect..."
                          value={formData.description}
                          onChange={handleChange}
                          rows="4"
                          className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition text-gray-800 text-sm ${
                            formErrors.description ? "border-red-500" : "border-gray-300 bg-white"
                          }`}
                        />
                      </div>
                      {formErrors.description && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                      )}
                    </div>
                    
                    {/* Sponsorship Details (Optional) */}
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-[#3D0707]">
                        Sponsorship Details <span className="text-gray-400 text-xs">(Optional)</span>
                      </label>
                      <div className="relative">
                        <FaHandshake className="absolute left-3 top-3 text-[#8B1E1E]" />
                        <textarea
                          name="sponsorshipDetails"
                          placeholder="Information about event sponsors or sponsorship opportunities..."
                          value={formData.sponsorshipDetails}
                          onChange={handleChange}
                          rows="3"
                          className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] transition text-gray-800 bg-white text-sm"
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
                          <span>Post Event</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Events Listing */}
        {!showForm && (
          <div className="mt-8">
            {filteredEvents.length > 0 ? (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider">
                    Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                    {searchTerm && ` for "${searchTerm}"`}
                    {filterType && ` in category ${filterType}`}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`bg-white rounded-xl border border-[#E7DDD6] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden flex flex-col justify-between ${
                        !isUpcoming(event.date) ? "border-l-4 border-gray-300" : "border-l-4 border-green-600"
                      }`}
                    >
                      {/* Event type badge */}
                      <div className="absolute top-0 right-0">
                        <div className="bg-[#FAF6F0] text-[#8B1E1E] border-l border-b border-[#E7DDD6] text-xs font-bold px-3 py-1 rounded-bl-lg">
                          {event.eventType}
                        </div>
                      </div>
                      
                      <div className="p-6 flex flex-col flex-grow justify-between">
                        <div>
                          {/* Admin delete button */}
                          {user && user.role === "ADMIN" && (
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="absolute top-10 left-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-700 transition opacity-0 group-hover:opacity-100 z-10 shadow-md"
                            >
                              <FaTrash size={12} />
                            </button>
                          )}
                          
                          {/* Date as a separate highlighted component */}
                          <div className="float-right ml-4 mb-3 bg-[#FAF6F0] border border-[#E7DDD6] rounded-lg p-2 text-center min-w-[4.5rem]">
                            <div className="text-xs uppercase text-[#8B1E1E] font-bold tracking-wider">
                              {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                            <div className="text-2xl font-bold text-[#3D0707] my-0.5">
                              {new Date(event.date).getDate()}
                            </div>
                            <div className="text-[10px] text-gray-500 font-semibold">
                              {new Date(event.date).getFullYear()}
                            </div>
                          </div>
                          
                          {/* Header */}
                          <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 pr-20">
                              {event.eventName}
                            </h3>
                            <div className="flex items-center text-gray-700 text-sm">
                              <FaUserTie className="text-[#A6491F] mr-2 flex-shrink-0" />
                              <span className="font-semibold">{event.organizer}</span>
                            </div>
                          </div>
                          
                          {/* Details */}
                          <div className="space-y-2 mb-4 text-sm">
                            <div className="flex items-start">
                              <FaMapMarkerAlt className="text-red-600 mt-1 mr-2 flex-shrink-0" />
                              <span className="text-gray-600">{event.venue}</span>
                            </div>
                            
                            {/* Description preview */}
                            <div className="text-gray-700 text-sm line-clamp-3 mt-3 leading-relaxed">
                              {event.description}
                            </div>
                          </div>
                        </div>
                        
                        {/* Footer with contact info and sponsorship */}
                        <div className="pt-4 border-t border-[#E7DDD6]/50 mt-auto text-xs space-y-1.5">
                          <div className="flex items-center text-gray-600">
                            <FaEnvelope className="mr-2 text-[#8B1E1E] flex-shrink-0" />
                            <span>Contact: {event.contactPersonEmail}</span>
                          </div>
                          
                          {event.sponsorshipDetails && (
                            <div className="flex items-center text-gray-600">
                              <FaHandshake className="mr-2 text-[#8B1E1E] flex-shrink-0" />
                              <span className="line-clamp-1" title={event.sponsorshipDetails}>Sponsorship: {event.sponsorshipDetails}</span>
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
                <FaCalendarAlt className="mx-auto text-[#8B1E1E]/40 text-5xl mb-4" />
                <h3 className="text-xl font-bold text-[#3D0707] mb-2">No events found</h3>
                <p className="text-gray-500 mb-6 text-sm">
                  {searchTerm || filterType ? 
                    "Try adjusting your search filters or check back later for new events." : 
                    "There are no events posted yet. Be the first to create an event for the alumni community."}
                </p>
                {user && user.firstName && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-[#8B1E1E] text-white px-5 py-2.5 rounded-full inline-flex items-center gap-2 hover:bg-[#6F1111] transition shadow-md font-semibold text-sm hover:-translate-y-0.5"
                  >
                    <FaPlus />
                    <span>Create Event</span>
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

export default Events;


