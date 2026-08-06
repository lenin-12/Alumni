import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance, { setAccessToken } from "../utils/axiosInstance";
import { useUser } from "../UserContext";
import GoogleLoginButton from "../loginComponents/GoogleLogin";

import { toast } from "react-toastify";
import { FaEnvelope, FaLock, FaSignInAlt, FaUserPlus, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/api/auth/login", { email, password });

      if (response.status === 200) {
        const userData = response.data;

        setAccessToken(userData.token);

        loginUser({
          email: userData.email,
          firstName: userData.name,
          lastName: userData.lastName,
          role: userData.role,
          imageUrl: userData.imageUrl,
          batch: userData.batch,
          rollNo: userData.rollNo,
          department: userData.department,
          id: userData.id,
          profileType: userData.profileType,
          phone: userData.phone,
        }, userData.token);

        toast.success(`Welcome back, ${userData.name}!`);

        if (userData.role === "ALUMNI" || userData.role === "STUDENT") {
          navigate("/");
        } else {
          navigate("/admin-dashboard");
        }
      }
    } catch (error) {
      // Show what actually happened instead of always assuming bad credentials —
      // a 404/network error means something is misconfigured, not that the password is wrong.
      if (error.response?.status === 401) {
        setErrorMessage("Login failed! Invalid email or password.");
        toast.error("Login failed! Invalid email or password.");
      } else if (error.response?.status === 404) {
        setErrorMessage("Login service unavailable. Please try again later.");
        toast.error("Login endpoint not found. Please contact support.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setResetMessage("Please enter a valid email.");
      toast.warning("Please enter a valid email.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/api/email/forgot-password", { email });
      setResetMessage(response.data);
      toast.success("Reset link sent to your email!");
    } catch (error) {
      setResetMessage("Error: Unable to send reset email.");
      toast.error("Unable to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(180deg, #FAF8F6, #F4F0EC)" }}>
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden border border-[#E7DDD6]"
        >
        
          <div className="p-6 text-white" style={{ background: "linear-gradient(135deg, #6B1F1F, #8B2E2E)" }}>
            <h2 className="text-2xl font-bold text-center">
              {!isForgotPassword ? "Welcome Back" : "Reset Your Password"}
            </h2>
            <p className="text-center text-[#F8F5F2]/80 mt-1">
              {!isForgotPassword
                ? "Login to your alumni account"
                : "We'll send you a password reset link"}
            </p>
          </div>

          <div className="p-6 md:p-8">
            {!isForgotPassword ? (
              <>
                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-[#2C2C2C]">
                      Email Address
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-3 text-[#6B1F1F]" />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 pl-10 border border-[#E7DDD6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] focus:border-[#6B1F1F] transition text-[#2C2C2C] bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="block text-sm font-medium text-[#2C2C2C]">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs text-[#6B1F1F] hover:text-[#7A2323] transition font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-3 text-[#6B1F1F]" />
                      <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 pl-10 border border-[#E7DDD6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] focus:border-[#6B1F1F] transition text-[#2C2C2C] bg-white"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#6B1F1F] hover:bg-[#7A2323] active:bg-[#5A1A1A] text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-md"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <FaSignInAlt />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E7DDD6]"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <GoogleLoginButton />
                  </div>
                </div>

                <div className="mt-6 text-center text-sm">
                  <p className="text-gray-600">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-[#6B1F1F] hover:text-[#7A2323] font-semibold">
                      Sign up
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <>
                {resetMessage && (
                  <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200">
                    {resetMessage}
                  </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }} className="space-y-5">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-[#2C2C2C]">
                      Email Address
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-3 text-[#6B1F1F]" />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 pl-10 border border-[#E7DDD6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] focus:border-[#6B1F1F] transition text-[#2C2C2C] bg-white"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#6B1F1F] hover:bg-[#7A2323] active:bg-[#5A1A1A] text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-md"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                        <span>Sending link...</span>
                      </>
                    ) : (
                      <>
                        <FaEnvelope />
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setIsForgotPassword(false)}
                    className="text-[#6B1F1F] hover:text-[#7A2323] transition inline-flex items-center font-medium"
                  >
                    <FaArrowLeft className="mr-2" />
                    <span>Back to Login</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
