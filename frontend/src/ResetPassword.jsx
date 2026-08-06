// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";
// import nitcImage from "./assets/NIT-calicut-1024x576.webp"; // Ensure the image is placed in the assets folder

// const ResetPassword = () => {
//     const [newPassword, setNewPassword] = useState("");
//     const location = useLocation();
//     const navigate = useNavigate();
//     const userId = new URLSearchParams(location.search).get("userId");

//     const handleResetPassword = async () => {
//         try {
//             const response = await axios.post(
//                 `${import.meta.env.VITE_API_URL}/api/email/reset-password`,
//                 { userId, newPassword },
//                 { withCredentials: true }
//             );
//             // setMessage(response.data);
//             setTimeout(() => navigate("/login"), 2000);
//         } catch (error) {
//            // setMessage("Error resetting password.");
//         }
//     };

//     return (
//         <div className="relative flex items-center justify-center h-screen bg-gray-100">
//             {/* Background Image with Blur */}
//             <div className="absolute inset-0">
//                 <img
//                     src={nitcImage}
//                     alt="NITC Background"
//                     className="w-full h-full object-cover"
//                 />
//                 <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-md"></div>
//             </div>

//             {/* Reset Password Box */}
//             <div className="relative z-10 bg-white p-8 rounded-xl shadow-2xl w-96">
//                 <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Reset Password</h2>
//                 <input
//                     type="password"
//                     placeholder="Enter new password"
//                     className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
//                     onChange={(e) => setNewPassword(e.target.value)}
//                 />



//                 <button onClick={handleResetPassword} className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-lg text-lg font-bold shadow-md hover:scale-105 transition-transform duration-200 mt-5">


//                     Reset Password
//                 </button>

//                 <p
//                     className="mt-2 text-blue-600 cursor-pointer text-center hover:underline"
//                     onClick={() => navigate("/login")}
//                 >
//                     Back to Login
//                 </p>
//             </div>
//         </div>
//     );
// };

// export default ResetPassword;


import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import nitcImage from "./assets/NIT-calicut-1024x576.webp";
import { toast } from "react-toastify";
import { FaLock, FaShieldAlt, FaCheck, FaArrowLeft, FaSignInAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const userId = new URLSearchParams(location.search).get("userId");
    
    // Check if we have a valid userId
    const isValidReset = !!userId;

    // Calculate password strength
    useEffect(() => {
        if (!newPassword) {
            setPasswordStrength(0);
            return;
        }

        let strength = 0;
        // Length check
        if (newPassword.length >= 8) strength += 1;
        // Contains number
        if (/\d/.test(newPassword)) strength += 1;
        // Contains lowercase
        if (/[a-z]/.test(newPassword)) strength += 1;
        // Contains uppercase
        if (/[A-Z]/.test(newPassword)) strength += 1;
        // Contains special character
        if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;

        setPasswordStrength(strength);
    }, [newPassword]);

    const getStrengthLabel = () => {
        if (passwordStrength === 0) return { text: "", color: "bg-gray-200" };
        if (passwordStrength <= 2) return { text: "Weak", color: "bg-red-500" };
        if (passwordStrength <= 3) return { text: "Medium", color: "bg-yellow-500" };
        return { text: "Strong", color: "bg-green-500" };
    };

    const validatePasswords = () => {
        // Reset errors
        setPasswordError("");
        
        // Check password length
        if (newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters long");
            return false;
        }

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords don't match");
            return false;
        }

        return true;
    };

    const handleResetPassword = async () => {
        if (!validatePasswords()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/email/reset-password`,
                { userId, newPassword },
                { withCredentials: true }
            );
            
            toast.success("Password reset successfully!");
            
            // Show success message
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            toast.error("Error resetting password. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-xl shadow-xl overflow-hidden"
                >
                    {/* Header section */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                        <h2 className="text-2xl font-bold text-center">Reset Your Password</h2>
                        <p className="text-center text-indigo-100 mt-1">
                            Create a new secure password for your account
                        </p>
                    </div>
                    
                    <div className="p-6 md:p-8">
                        {!isValidReset ? (
                            <div className="text-center py-6">
                                <div className="flex justify-center">
                                    <FaShieldAlt className="text-red-500 text-5xl mb-4" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Invalid Reset Link</h3>
                                <p className="text-gray-600 mb-6">
                                    This password reset link is invalid or has expired.
                                    Please request a new password reset link.
                                </p>
                                <Link 
                                    to="/login"
                                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
                                >
                                    <FaArrowLeft />
                                    <span>Back to Login</span>
                                </Link>
                            </div>
                        ) : (
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleResetPassword();
                                }} 
                                className="space-y-6"
                            >
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                                        <FaShieldAlt className="text-indigo-600 text-3xl" />
                                    </div>
                                </div>
                                
                                {/* New Password */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <FaLock className="absolute left-3 top-3 text-indigo-500" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                                        />
                                        <button 
                                            type="button" 
                                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                                            onClick={toggleShowPassword}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    
                                    {/* Password strength meter */}
                                    {newPassword && (
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
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <FaLock className="absolute left-3 top-3 text-indigo-500" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Confirm your password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                                        />
                                    </div>
                                </div>
                                
                                {/* Error message display */}
                                {passwordError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        {passwordError}
                                    </div>
                                )}
                                
                                {/* Requirements */}
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-800 font-medium mb-2">Password requirements:</p>
                                    <ul className="text-xs text-blue-700 space-y-1">
                                        <li className="flex items-center gap-1">
                                            <span className={newPassword.length >= 6 ? "text-green-500" : "text-gray-400"}>
                                                <FaCheck />
                                            </span>
                                            At least 6 characters long
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <span className={/\d/.test(newPassword) ? "text-green-500" : "text-gray-400"}>
                                                <FaCheck />
                                            </span>
                                            Contains at least one number
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <span className={newPassword === confirmPassword && newPassword ? "text-green-500" : "text-gray-400"}>
                                                <FaCheck />
                                            </span>
                                            Passwords match
                                        </li>
                                    </ul>
                                </div>
                                
                                {/* Action buttons */}
                                <div className="flex flex-col gap-4 pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-70"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                                                <span>Resetting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaCheck />
                                                <span>Reset Password</span>
                                            </>
                                        )}
                                    </button>
                                    
                                    <Link 
                                        to="/login"
                                        className="flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-800"
                                    >
                                        <FaSignInAlt />
                                        <span>Back to Login</span>
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;