import { useEffect, useState } from "react";
import { useUser } from "../UserContext";
import { useNavigate, useParams, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { 
  FaTrophy, FaCalendarAlt, FaTag, FaFileAlt, FaBuilding, 
  FaPaperPlane, FaTimesCircle, FaArrowLeft, FaEdit,
  FaCloudUploadAlt, FaCertificate, FaMedal, FaAward,
  FaSpinner, FaTrash
} from "react-icons/fa";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const EditAchievementForm = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const { id } = useParams(); // Get achievement ID from URL params
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        dateOfAchievement: "",
        category: "",
        description: "",
        supportingDocuments: null,
        organization: "",
    });

    const categoryOptions = [
        { value: "Award", label: "Award", icon: <FaTrophy className="text-yellow-500" /> },
        { value: "Certification", label: "Certification", icon: <FaCertificate className="text-blue-500" /> },
        { value: "Recognition", label: "Recognition", icon: <FaMedal className="text-purple-500" /> },
        { value: "Publication", label: "Publication", icon: <FaFileAlt className="text-green-500" /> },
        { value: "Other", label: "Other", icon: <FaAward className="text-gray-500" /> }
    ];

    // Fetch the existing achievement details
    useEffect(() => {
        const fetchAchievement = async () => {
            try {
                const response = await axiosInstance.get(`/api/achievements/${id}`);
                const data = response.data;

                // Convert [YYYY, MM, DD] to "YYYY-MM-DD"
                const formatDate = (dateArray) => {
                    if (!dateArray || dateArray.length !== 3) return ""; // Handle invalid data
                    const [year, month, day] = dateArray;
                    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                };

                setFormData({
                    ...data,
                    dateOfAchievement: formatDate(data.dateOfAchievement),
                });

                // Set image preview if there's a supporting document
                if (data.supportingDocuments) {
                    setImagePreview(data.supportingDocuments);
                }
            } catch (error) {
                setError("Failed to load achievement details.");
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchAchievement();
        }
    }, [id, user]);

    // Clean up image preview URL when component unmounts
    useEffect(() => {
        return () => {
            if (imagePreview && !imagePreview.startsWith('http')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleChange = async (e) => {
        const { name, value, files } = e.target;
        
        // Clear error when field is updated
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: null
            });
        }
        
        if (name === "supportingDocuments") {
            if (files && files[0]) {
                // Create preview URL
                const previewUrl = URL.createObjectURL(files[0]);
                setImagePreview(previewUrl);
                setSelectedFile(files[0]);
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) errors.title = "Title is required";
        if (!formData.dateOfAchievement) errors.dateOfAchievement = "Date is required";
        if (!formData.category) errors.category = "Category is required";
        
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
            const data = new FormData();
            data.append("title", formData.title);
            data.append("dateOfAchievement", formData.dateOfAchievement);
            data.append("category", formData.category);
            data.append("description", formData.description || "");
            data.append("organization", formData.organization || "");
            
            if (formData.supportingDocuments) {
                data.append("supportingDocuments", formData.supportingDocuments);
            }
            
            if (selectedFile) {
                data.append("image", selectedFile);
            }

            await axiosInstance.put(`/api/achievements/${id}`, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Achievement Updated Successfully!");
            navigate(`/profile/${user.id}`);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to Update Achievement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await axiosInstance.delete(`/api/achievements/${id}`);
            toast.success("Achievement deleted successfully");
            navigate(`/profile/${user.id}`);
        } catch (error) {
            console.error("Error deleting achievement:", error);
            toast.error("Failed to delete achievement");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-brand-warmgray-light to-[#EAE6E1] flex justify-center items-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-brand-gold text-5xl mx-auto mb-4" />
                    <p className="text-brand-maroon-dark">Loading achievement data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-brand-warmgray-light to-[#EAE6E1] flex justify-center items-center p-6">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                    <div className="text-brand-rust text-5xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-brand-maroon-dark mb-2">{error}</h3>
                    <p className="text-brand-warmgray-dark mb-6">Please try again or contact support.</p>
                    <button 
                        onClick={() => navigate(`/profile/${user.id}`)} 
                        className="px-4 py-2 bg-gradient-to-r from-brand-rust to-brand-rust-dark text-white rounded-lg hover:from-brand-rust-dark hover:to-brand-rust transition-all"
                    >
                        Return to Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-brand-warmgray-light to-[#EAE6E1] py-12 px-4">
            <div className="max-w-4xl mx-auto">
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
                        <FaEdit className="text-brand-rust" />
                        <span>Edit Achievement</span>
                    </h1>
                    <p className="text-brand-warmgray-dark mt-1">
                        Update your achievement details
                    </p>
                </div>
                
                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
                        >
                            <h3 className="text-xl font-bold text-brand-maroon-dark mb-4">Delete Achievement</h3>
                            <p className="text-brand-warmgray-dark mb-6">
                                Are you sure you want to delete this achievement? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button 
                                    onClick={() => setShowDeleteConfirm(false)} 
                                    className="px-4 py-2 border border-brand-warmgray rounded-lg text-brand-warmgray-dark hover:bg-brand-warmgray-light hover:text-brand-maroon-dark transition"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleDelete} 
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                                            <span>Deleting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaTrash className="w-4 h-4" />
                                            <span>Delete</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                
                {/* Main card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-xl shadow-xl overflow-hidden"
                >
                    {/* Card header */}
                    <div className="bg-gradient-to-r from-brand-maroon to-brand-maroon-dark p-6 text-white">
                        <h2 className="text-2xl font-bold">Achievement Details</h2>
                        <p className="text-brand-warmgray-light">Update information about your achievement</p>
                    </div>
                    
                    {/* Form and image preview in two columns */}
                    <div className="p-6 md:p-8 grid md:grid-cols-5 gap-8">
                        {/* Form column - takes 3/5 of space */}
                        <div className="md:col-span-3">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Achievement Title */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-brand-maroon-dark">
                                        Achievement Title <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaTrophy className="absolute left-3 top-3 text-brand-gold" />
                                        <input
                                            type="text"
                                            name="title"
                                            placeholder="E.g., Best Paper Award, Professional Certification"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition ${
                                                formErrors.title ? "border-red-500" : "border-gray-300"
                                            }`}
                                        />
                                    </div>
                                    {formErrors.title && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
                                    )}
                                </div>
                                
                                {/* Category & Date Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Category */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-brand-maroon-dark">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <FaTag className="absolute left-3 top-3 text-brand-gold" />
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className={`w-full p-3 pl-10 border rounded-lg appearance-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition ${
                                                    formErrors.category ? "border-red-500" : "border-gray-300"
                                                }`}
                                            >
                                                <option value="">Select Category</option>
                                                {categoryOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {formErrors.category && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
                                        )}
                                    </div>
                                    
                                    {/* Date of Achievement */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-brand-maroon-dark">
                                            Date Achieved <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <FaCalendarAlt className="absolute left-3 top-3 text-brand-gold" />
                                            <input
                                                type="date"
                                                name="dateOfAchievement"
                                                value={formData.dateOfAchievement}
                                                onChange={handleChange}
                                                max={new Date().toISOString().split("T")[0]}
                                                className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition ${
                                                    formErrors.dateOfAchievement ? "border-red-500" : "border-gray-300"
                                                }`}
                                            />
                                        </div>
                                        {formErrors.dateOfAchievement && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.dateOfAchievement}</p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Recognizing Organization */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-brand-maroon-dark">
                                        Issuing Organization
                                    </label>
                                    <div className="relative">
                                        <FaBuilding className="absolute left-3 top-3 text-brand-gold" />
                                        <input
                                            type="text"
                                            name="organization"
                                            placeholder="E.g., IEEE, Microsoft, University of Cambridge"
                                            value={formData.organization}
                                            onChange={handleChange}
                                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition"
                                        />
                                    </div>
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
                                            placeholder="Describe the achievement, its significance, and what skills or knowledge it represents..."
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition"
                                            rows="4"
                                        ></textarea>
                                    </div>
                                </div>
                                
                                {/* Form action buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || uploading}
                                        className="flex-1 bg-gradient-to-r from-brand-rust to-brand-rust-dark text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:from-brand-rust-dark hover:to-brand-rust transition-all disabled:opacity-70"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaPaperPlane />
                                                <span>Update Achievement</span>
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
                                
                                {/* Delete button */}
                                <div className="border-t border-gray-200 pt-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full bg-red-50 text-red-600 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-all border border-red-200"
                                    >
                                        <FaTrash />
                                        <span>Delete Achievement</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                        
                        {/* Image upload/preview column - takes 2/5 of space */}
                        <div className="md:col-span-2">
                            <div className="space-y-1 mb-4">
                                <label className="block text-sm font-medium text-brand-maroon-dark">
                                    Supporting Document
                                </label>
                                <p className="text-xs text-brand-warmgray-dark">Upload a certificate, award image, or relevant document</p>
                            </div>
                            
                            <div className="border-2 border-dashed border-brand-warmgray rounded-lg p-4 text-center h-64 flex flex-col items-center justify-center relative bg-gray-50">
                                {imagePreview ? (
                                    <>
                                        <img 
                                            src={imagePreview} 
                                            alt="Achievement Document" 
                                            className="max-h-full max-w-full object-contain" 
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setImagePreview(null);
                                                setFormData({...formData, supportingDocuments: null});
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                                        >
                                            <FaTimesCircle />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <FaCloudUploadAlt className="text-4xl text-brand-warmgray mb-2" />
                                        <p className="text-brand-warmgray-dark mb-4">Drag and drop or click to upload</p>
                                        {uploading && (
                                            <div className="mt-2">
                                                <div className="w-8 h-8 border-t-2 border-b-2 border-brand-gold rounded-full animate-spin mx-auto"></div>
                                                <p className="text-sm text-brand-gold mt-2">Uploading...</p>
                                            </div>
                                        )}
                                    </>
                                )}
                                
                                <input
                                    type="file"
                                    name="supportingDocuments"
                                    onChange={handleChange}
                                    className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${imagePreview ? 'hidden' : ''}`}
                                    accept="image/*,.pdf"
                                    disabled={uploading}
                                />
                            </div>
                            
                            <p className="text-xs text-brand-warmgray-dark mt-2">
                                Supported formats: JPEG, PNG, PDF. Max size: 5MB
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default EditAchievementForm;
