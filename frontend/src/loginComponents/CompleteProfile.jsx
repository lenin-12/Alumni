import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaUser, FaEnvelope, FaGraduationCap, FaPhone, FaIdBadge, 
  FaBuilding, FaLock, FaUpload, FaCamera, FaCheckCircle,
  FaArrowLeft, FaUserShield, FaUserCheck
} from "react-icons/fa";
import { toast } from 'react-toastify';
import { motion } from "framer-motion";

function CompleteProfile() {
  const [batch, setBatch] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneno, setPhoneno] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [department, setDepartment] = useState("");
  const [uploading, setUploading] = useState(false);
  const [profileType, setProfileType] = useState("PUBLIC");
  const [user, setUser] = useState({ name: "", lastName: "", email: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();

  const departmentOptions = [
    "Computer Science and Engineering",
    "Information Technology",
    "Artificial Intelligence & Machine Learning",
    "Electronics and Communication Engineering",
    "Electrical and Electronics Engineering", 
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Biotechnology",
    "Architecture",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Other"
  ];

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/user-info`, { withCredentials: true })
      .then((response) => setUser(response.data))
      .catch((error) => console.error("Error fetching user info:", error));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Clean up image preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    // Length check
    if (password.length >= 8) strength += 1;
    // Contains number
    if (/\d/.test(password)) strength += 1;
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  }, [password]);

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return { text: "", color: "bg-gray-200" };
    if (passwordStrength <= 2) return { text: "Weak", color: "bg-red-500" };
    if (passwordStrength <= 3) return { text: "Medium", color: "bg-yellow-500" };
    return { text: "Strong", color: "bg-green-500" };
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!/^[0-9]{4}$/.test(batch)) {
      newErrors.batch = "Batch must be a 4-digit year";
    }
    
    if (!/^[0-9]{10}$/.test(phoneno)) {
      newErrors.phoneno = "Phone number must be exactly 10 digits";
    }
    
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    
    if (!department.trim()) {
      newErrors.department = "Department is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  let defaulturl = `https://res.cloudinary.com/dcsomu9n6/image/upload/v1742667126/qkeb6zjwjoyygy4w51bz.webp`;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      // Scroll to the first error
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setIsSubmitting(true);
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("firstName", user.name);
      formData.append("lastName", user.lastName);
      formData.append("email", user.email);
      formData.append("batch", batch);
      formData.append("rollNo", rollNo);
      formData.append("phoneno", phoneno);
      formData.append("password", password);
      formData.append("department", department);
      formData.append("profileType", profileType);

      if (image) {
        formData.append("image", image);
      } else {
        formData.append("imageUrl", defaulturl);
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/api/complete-profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      toast.success("Profile completed successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Error completing profile", error);
      toast.error("Failed to complete profile. Please try again.");
    } finally {
      setUploading(false);
      setIsSubmitting(false);
    }
  };
  
  // Function to handle profile type changes
  const handleProfileTypeChange = (type) => {
    if (type === "PRIVATE") {
      toast.info(
        "Note: Even with a private profile, administrators can still view your complete profile information.",
        {
          autoClose: 5000,
          position: "top-center"
        }
      );
    }
    setProfileType(type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-300 to-indigo-500 p-6 text-white">
            <h2 className="text-2xl font-bold text-center">Complete Your Profile</h2>
            <p className="text-center text-indigo-100 mt-1">
              Add a few more details to finish setting up your alumni account
            </p>
          </div>
          
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Progress indicator */}
              <div className="flex items-center justify-center mb-6">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  1
                </div>
                <div className="h-1 w-8 bg-indigo-600"></div>
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  2
                </div>
                <div className="h-1 w-8 bg-indigo-600"></div>
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  3
                </div>
              </div>
              
              {/* User information card */}
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <h3 className="text-sm font-medium text-indigo-800 mb-3">Your Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <FaUser className="text-indigo-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium">{user.name} {user.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaEnvelope className="text-indigo-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Main form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile image - column 1 */}
                <div className="md:col-span-1">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Profile Picture</h3>
                  <div className="flex flex-col items-center">
                    <div className="relative group mb-3">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-100 shadow-md">
                        <img 
                          src={imagePreview || defaulturl} 
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 rounded-full">
                          <FaCamera className="text-white text-2xl" />
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center max-w-[180px]">
                      Click to upload a profile photo (optional)
                    </p>
                  </div>
                </div>
                
                {/* Form fields - columns 2-3 */}
                <div className="md:col-span-2 space-y-5">
                  {/* Education & Batch */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Batch */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Batch Year <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaGraduationCap className="absolute left-3 top-3 text-indigo-500" />
                        <input
                          type="text"
                          placeholder="e.g., 2025"
                          value={batch}
                          onChange={(e) => setBatch(e.target.value)}
                          className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition ${
                            errors.batch ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                      </div>
                      {errors.batch && (
                        <p className="text-red-500 text-xs mt-1">{errors.batch}</p>
                      )}
                    </div>
                    
                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-3 text-indigo-500" />
                        <input
                          type="text"
                          placeholder="10-digit phone number"
                          value={phoneno}
                          onChange={(e) => setPhoneno(e.target.value)}
                          className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition ${
                            errors.phoneno ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                      </div>
                      {errors.phoneno && (
                        <p className="text-red-500 text-xs mt-1">{errors.phoneno}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Roll Number & Department */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Roll Number */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Roll Number
                      </label>
                      <div className="relative">
                        <FaIdBadge className="absolute left-3 top-3 text-indigo-500" />
                        <input
                          type="text"
                          placeholder="Your roll number"
                          value={rollNo}
                          onChange={(e) => setRollNo(e.target.value)}
                          className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                        />
                      </div>
                    </div>
                    
                    {/* Department */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaBuilding className="absolute left-3 top-3 text-indigo-500" />
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className={`w-full p-3 pl-10 border rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 transition ${
                            errors.department ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Department</option>
                          {departmentOptions.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                      {errors.department && (
                        <p className="text-red-500 text-xs mt-1">{errors.department}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Password fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Password */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-3 text-indigo-500" />
                        <input
                          type="password"
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition ${
                            errors.password ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                      )}
                      
                      {/* Password strength meter */}
                      {password && (
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">Password strength:</span>
                            <span className={`text-xs font-medium ${
                              getStrengthLabel().text === "Weak" ? "text-red-500" : 
                              getStrengthLabel().text === "Medium" ? "text-yellow-500" : 
                              "text-green-500"
                            }`}>
                              {getStrengthLabel().text}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getStrengthLabel().color}`} 
                              style={{ width: `${(passwordStrength / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3 top-3 text-indigo-500" />
                        <input
                          type="password"
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition ${
                            errors.confirmPassword ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Profile Type */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Profile Visibility
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                        profileType === "PUBLIC" 
                          ? "border-indigo-500 bg-indigo-50" 
                          : "border-gray-300 hover:border-indigo-300"
                      }`}>
                        <input
                          type="radio"
                          checked={profileType === "PUBLIC"}
                          onChange={() => handleProfileTypeChange("PUBLIC")}
                          className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <div className="ml-3">
                          <div className="flex items-center">
                            <FaUserCheck className="text-indigo-500 mr-2" />
                            <span className="font-medium">Public</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Your profile is visible to everyone
                          </p>
                        </div>
                      </label>
                      
                      <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                        profileType === "PRIVATE" 
                          ? "border-indigo-500 bg-indigo-50" 
                          : "border-gray-300 hover:border-indigo-300"
                      }`}>
                        <input
                          type="radio"
                          checked={profileType === "PRIVATE"}
                          onChange={() => handleProfileTypeChange("PRIVATE")}
                          className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <div className="ml-3">
                          <div className="flex items-center">
                            <FaUserShield className="text-indigo-500 mr-2" />
                            <span className="font-medium">Private</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Limited visibility to other alumni
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Form actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || uploading}
                  className="flex-1 bg-gradient-to-r from-blue-300 to-indigo-500 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:from-blue-400 hover:to-indigo-600 transition-all disabled:opacity-70"
                >
                  {isSubmitting || uploading ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      <span>Complete Profile Setup</span>
                    </>
                  )}
                </button>
                <Link
                  to="/login"
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                >
                  <FaArrowLeft />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default CompleteProfile;