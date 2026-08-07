import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import GoogleRegister from "../loginComponents/GoogleRegister";

import { 
  FaUser, FaEnvelope, FaLock, FaPhone, FaGraduationCap, 
  FaIdBadge, FaUniversity, FaUpload, FaUserCheck, FaUserShield, 
  FaCheckCircle, FaTimesCircle, FaArrowRight, FaArrowLeft,
  FaCamera, FaSignInAlt
} from "react-icons/fa";
import { toast } from 'react-toastify';
import { motion } from "framer-motion";

function Register() {
  const location = useLocation();
  const [name, setName] = useState(location.state?.firstName || "");
  const [lastName, setLastName] = useState(location.state?.lastName || "");
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [batch, setBatch] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [profileType, setProfileType] = useState("PUBLIC");
  const [image, setImage] = useState(location.state?.imageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(location.state?.imageUrl || null);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // For multi-step form
  
  const navigate = useNavigate();

  const departmentOptions = [
    "Computer Science and Engineering",
    "Electronics and Communication Engineering",
    "Electrical Engineering", 
    "Mechanical Engineering",
    "Civil Engineering",
    "Production & Industrial Engineering",
    "Artificial Intelligence & Machine Learning",
    "Industrial Internet of Things",
    "Mathematics & Computing",
    "Architecture",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Other"
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  
  // Clean up image preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);
  
  const validateStep = (currentStep) => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!name.trim()) newErrors.name = "First name is required";
      if (!lastName.trim()) newErrors.lastName = "Last name is required";

      if (!role) {
        newErrors.role = "Please select whether you are a Student or Alumni";
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim()) {
        newErrors.email = "Email is required";
      } else if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
      } else if (role === "STUDENT" && !email.trim().toLowerCase().endsWith("@nitkkr.ac.in")) {
        newErrors.email = "Students must register with a @nitkkr.ac.in email address";
      }
      
      if (!password.trim()) {
        newErrors.password = "Password is required";
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords don't match";
      }
    } else if (currentStep === 2) {
      if (!/^\d{10}$/.test(phone)) {
        newErrors.phone = "Phone number must be exactly 10 digits";
      }
      
      if (!/^\d{4}$/.test(batch)) {
        newErrors.batch = "Batch must be a 4-digit year";
      }
      
      if (!department.trim()) newErrors.department = "Department is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const nextStep = () => {
    if(validateStep(step)){
      setStep(step + 1);
    }else{
      // Scroll to the first error
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(2)) {
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      formData.append("profileType", profileType);
      formData.append("phone", phone || "");
      formData.append("batch", batch || "");
      formData.append("rollNo", rollNo || "");
      formData.append("department", department || "");

      if (image && typeof image !== 'string') {
        formData.append("image", image);
      } else if (typeof image === 'string') {
        formData.append("imageUrl", image);
      }
`${import.meta.env.VITE_API_URL}/api/auth/register`
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      toast.success("Registration successful!");
      navigate("/login");
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data || "Registration failed! Try again.";
      toast.error(errorMsg);
    } finally {
      setUploading(false);
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

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Step 1: Account Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#2C2C2C]">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3 text-[#6B1F1F]" />
                  <input
                    type="text"
                    placeholder="Your first name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] focus:border-[#6B1F1F] transition text-[#2C2C2C] bg-white ${
                      errors.name ? "border-red-500" : "border-[#E7DDD6]"
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              
              {/* Last Name */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#2C2C2C]">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3 text-[#6B1F1F]" />
                  <input
                    type="text"
                    placeholder="Your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] focus:border-[#6B1F1F] transition text-[#2C2C2C] bg-white ${
                      errors.lastName ? "border-red-500" : "border-[#E7DDD6]"
                    }`}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Role Dropdown */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#2C2C2C]">
                Registering As <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-[#6B1F1F]" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] focus:border-[#6B1F1F] transition text-[#2C2C2C] bg-white font-medium ${
                    errors.role ? "border-red-500" : "border-[#E7DDD6]"
                  }`}
                >
                  <option value="">Select Role</option>
                  <option value="ALUMNI">ALUMNI</option>
                  <option value="STUDENT">STUDENT</option>
                </select>
              </div>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">{errors.role}</p>
              )}
            </div>
            
            {/* Email */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#2C2C2C]">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-[#6B1F1F]" />
                <input
                  type="email"
                  placeholder={role === "STUDENT" ? "yourname@nitkkr.ac.in" : "Your email address"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] focus:border-[#6B1F1F] transition text-[#2C2C2C] bg-white ${
                    errors.email ? "border-red-500" : "border-[#E7DDD6]"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
              {role === "STUDENT" && !errors.email && (
                <p className="text-xs text-gray-500 mt-1">
                  Students must use their official @nitkkr.ac.in email address
                </p>
              )}
            </div>
            
            {/* Password */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#2C2C2C]">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-[#6B1F1F]" />
                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] focus:border-[#6B1F1F] transition text-[#2C2C2C] bg-white ${
                    errors.password ? "border-red-500" : "border-[#E7DDD6]"
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 6 characters long
              </p>
            </div>
            
            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#2C2C2C]">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 text-[#6B1F1F]" />
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] focus:border-[#6B1F1F] transition text-[#2C2C2C] bg-white ${
                    errors.confirmPassword ? "border-red-500" : "border-[#E7DDD6]"
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            {/* Step 2: Personal Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#2C2C2C]">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-3 text-[#6B1F1F]" />
                  <input
                    type="text"
                    placeholder="10-digit phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] focus:border-[#6B1F1F] transition text-[#2C2C2C] bg-white ${
                      errors.phone ? "border-red-500" : "border-[#E7DDD6]"
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
              
              {/* Batch */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#2C2C2C]">
                  Batch Year <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaGraduationCap className="absolute left-3 top-3 text-[#6B1F1F]" />
                  <input
                    type="text"
                    placeholder="e.g., 2025"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className={`w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] focus:border-[#6B1F1F] transition text-[#2C2C2C] bg-white ${
                      errors.batch ? "border-red-500" : "border-[#E7DDD6]"
                    }`}
                  />
                </div>
                {errors.batch && (
                  <p className="text-red-500 text-xs mt-1">{errors.batch}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Roll Number */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#2C2C2C]">
                  Roll Number
                </label>
                <div className="relative">
                  <FaIdBadge className="absolute left-3 top-3 text-[#6B1F1F]" />
                  <input
                    type="text"
                    placeholder="Your roll number"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="w-full p-3 pl-10 border border-[#E7DDD6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] focus:border-[#6B1F1F] transition text-[#2C2C2C] bg-white"
                  />
                </div>
              </div>
              
              {/* Department */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#2C2C2C]">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUniversity className="absolute left-3 top-3 text-[#6B1F1F]" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={`w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] focus:border-[#6B1F1F] transition text-[#2C2C2C] bg-white ${
                      errors.department ? "border-red-500" : "border-[#E7DDD6]"
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
            
            {/* Profile Type */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#2C2C2C]">
                Profile Visibility
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                  profileType === "PUBLIC" 
                    ? "border-[#6B1F1F] bg-[#FAF8F6]" 
                    : "border-[#E7DDD6] hover:border-[#6B1F1F]/50"
                }`}>
                  <input
                    type="radio"
                    checked={profileType === "PUBLIC"}
                    onChange={() => handleProfileTypeChange("PUBLIC")}
                    className="w-4 h-4 text-[#6B1F1F] border-[#E7DDD6] focus:ring-[#6B1F1F]"
                  />
                  <div className="ml-3">
                    <div className="flex items-center">
                      <FaUserCheck className="text-[#6B1F1F] mr-2" />
                      <span className="font-medium text-[#2C2C2C]">Public</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Your profile is visible to everyone
                    </p>
                  </div>
                </label>
                
                <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                  profileType === "PRIVATE" 
                    ? "border-[#6B1F1F] bg-[#FAF8F6]" 
                    : "border-[#E7DDD6] hover:border-[#6B1F1F]/50"
                }`}>
                  <input
                    type="radio"
                    checked={profileType === "PRIVATE"}
                    onChange={() => handleProfileTypeChange("PRIVATE")}
                    className="w-4 h-4 text-[#6B1F1F] border-[#E7DDD6] focus:ring-[#6B1F1F]"
                  />
                  <div className="ml-3">
                    <div className="flex items-center">
                      <FaUserShield className="text-[#6B1F1F] mr-2" />
                      <span className="font-medium text-[#2C2C2C]">Private</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Limited visibility to other alumni
                    </p>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Profile Image */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#2C2C2C]">
                Profile Picture
              </label>
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 border-2 border-dashed border-[#E7DDD6] rounded-full flex items-center justify-center overflow-hidden relative bg-white">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile preview" 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <FaCamera className="text-gray-400 text-3xl" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#2C2C2C]">Upload your photo</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="text-xs text-red-500 hover:text-red-700 mt-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "linear-gradient(180deg, #FAF8F6, #F4F0EC)" }}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden border border-[#E7DDD6]"
        >
          {/* Progress bar */}
          <div className="p-6 text-white" style={{ background: "linear-gradient(135deg, #6B1F1F, #8B2E2E)" }}>
            <h2 className="text-2xl font-bold text-center mb-4">Create Your Alumni Account</h2>
            
            <div className="flex items-center justify-center max-w-md mx-auto">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${
                step === 1 ? 'bg-white text-[#6B1F1F] border-white' : 'bg-[#8B2E2E] text-white border-[#8B2E2E]'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 ${
                step >= 2 ? 'bg-white' : 'bg-[#D8CBC5]'
              }`}></div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${
                step === 2 ? 'bg-white text-[#6B1F1F] border-white' : 'bg-[#D8CBC5] text-white border-[#D8CBC5]'
              }`}>
                2
              </div>
            </div>
            
            <div className="text-center mt-2">
              <p className="text-[#F8F5F2]/80">
                {step === 1 ? "Account Information" : "Personal Details"}
              </p>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <form onSubmit={(e) => e.preventDefault()}>
              {renderStepContent()}
              
              <div className="flex justify-between mt-8">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center justify-center gap-2 text-[#6B1F1F] hover:text-[#7A2323] transition font-medium"
                  >
                    <FaArrowLeft />
                    <span>Previous</span>
                  </button>
                ) : (
                  <div></div> // Empty div to maintain flex layout
                )}
                
                {step < 2 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-[#6B1F1F] hover:bg-[#7A2323] active:bg-[#5A1A1A] text-white py-2 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition shadow-md"
                  >
                    <span>Continue</span>
                    <FaArrowRight />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={uploading}
                    className="bg-[#6B1F1F] hover:bg-[#7A2323] active:bg-[#5A1A1A] text-white py-2 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-70 shadow-md"
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        <span>Complete Registration</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
            
            <div className="mt-8 pt-6 border-t border-[#E7DDD6]">
              <div className="flex items-center justify-center gap-2">
                <span className="text-gray-500">Already have an account?</span>
                <Link 
                  to="/login"
                  className="text-[#6B1F1F] hover:text-[#7A2323] font-semibold flex items-center"
                >
                  <FaSignInAlt className="mr-1" />
                  <span>Sign in</span>
                </Link>
              </div>
              
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E7DDD6]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or register with</span>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <GoogleRegister />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;
