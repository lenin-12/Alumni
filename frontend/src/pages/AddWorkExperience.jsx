
import { useState } from "react";
import { useUser } from "../UserContext";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

import {
  FaBuilding,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserTie,
  FaFileAlt,
  FaArrowLeft,
  FaTimesCircle,
  FaPaperPlane,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const AddWorkExperienceForm = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isPresent, setIsPresent] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    isPresent: "",
    company: "",
    role: "",
    location: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }

    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.company.trim()) errors.company = "Company name is required";
    if (!formData.role.trim()) errors.role = "Job role is required";
    if (!formData.location.trim()) errors.location = "Location is required";
    if (!formData.startDate) errors.startDate = "Start date is required";
    if (!isPresent && !formData.endDate)
      errors.endDate = "End date is required";

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
      const requestData = {
        ...formData,
        user: { id: user.id },
        isPresent: isPresent ? true : false,
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/work-experience`,
        requestData,
        {
          withCredentials: true,
        }
      );

      toast.success("Work Experience Added Successfully!");
      navigate(`/profile/${user.id}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to Add Work Experience");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = () => {
    if (isPresent) {
      setFormData({ ...formData, isPresent: false });
    } else {
      setFormData({ ...formData, endDate: "", isPresent: true });
    }
    setIsPresent(!isPresent);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-brand-warmgray-light to-[#EAE6E1] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Page header with navigation */}
        <div className="mb-6">
          <Link
            to={`/profile/${user.id}`}
            className="inline-flex items-center text-brand-rust hover:text-brand-rust-dark mb-2"
          >
            <FaArrowLeft className="mr-2" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-3xl font-bold text-brand-maroon-dark flex items-center gap-3">
            <FaBuilding className="text-brand-rust" />
            <span>Add Work Experience</span>
          </h1>
          <p className="text-brand-warmgray-dark mt-1">
            Share your professional history and career journey
          </p>
        </div>

        {/* Main form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden"
        >
          {/* Card header */}
          <div className="bg-gradient-to-r from-brand-maroon to-brand-maroon-dark p-6 text-white">
            <h2 className="text-2xl font-bold">Career Details</h2>
            <p className="text-brand-warmgray-light">
              Fill in the information about your work experience
            </p>
          </div>

          {/* Form content */}
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dates section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-brand-maroon-dark">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-3 text-brand-gold" />
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      max={new Date().toISOString().split("T")[0]}
                      className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition ${
                        formErrors.startDate
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  {formErrors.startDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.startDate}
                    </p>
                  )}
                </div>

                {/* End Date / Present */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-brand-maroon-dark">
                    End Date
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-grow">
                      <FaCalendarAlt className="absolute left-3 top-3 text-brand-gold" />
                      <input
                        type="date"
                        name="endDate"
                        value={isPresent ? "" : formData.endDate}
                        onChange={handleChange}
                        min={formData.startDate}
                        max={new Date().toISOString().split("T")[0]}
                        disabled={isPresent}
                        className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition ${
                          isPresent ? "bg-gray-100" : ""
                        } ${
                          formErrors.endDate
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    <label className="flex items-center space-x-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isPresent}
                        onChange={handleCheckboxChange}
                        className="w-5 h-5 text-brand-gold border-gray-300 rounded focus:ring-brand-gold"
                      />
                      <span className="text-brand-maroon-dark">Currently working here</span>
                    </label>
                  </div>
                  {formErrors.endDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Company and Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-brand-maroon-dark">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaBuilding className="absolute left-3 top-3 text-brand-gold" />
                    <input
                      type="text"
                      name="company"
                      placeholder="E.g., Google, Microsoft, Startup"
                      value={formData.company}
                      onChange={handleChange}
                      className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition ${
                        formErrors.company
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  </div>
                  {formErrors.company && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.company}
                    </p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-brand-maroon-dark">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaUserTie className="absolute left-3 top-3 text-brand-gold" />
                    <input
                      type="text"
                      name="role"
                      placeholder="E.g., Software Engineer, Product Manager"
                      value={formData.role}
                      onChange={handleChange}
                      className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition ${
                        formErrors.role ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {formErrors.role && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.role}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-brand-maroon-dark">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-3 text-brand-gold" />
                  <input
                    type="text"
                    name="location"
                    placeholder="E.g., New York, Remote, Hybrid - London"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition ${
                      formErrors.location ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {formErrors.location && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.location}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-brand-maroon-dark">
                  Description
                </label>
                <div className="relative">
                  <FaFileAlt className="absolute left-3 top-3 text-brand-gold" />
                  <textarea
                    name="description"
                    placeholder="Describe your responsibilities, achievements, and skills utilized in this role..."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition"
                    rows="4"
                  ></textarea>
                </div>
              </div>

              {/* Form actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-brand-rust to-brand-rust-dark text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:from-brand-rust-dark hover:to-brand-rust transition-all disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      <span>Add Experience</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="flex-1 border border-brand-warmgray text-brand-warmgray-dark py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-brand-warmgray-light hover:text-brand-maroon-dark transition-all"
                >
                  <FaTimesCircle />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddWorkExperienceForm;
