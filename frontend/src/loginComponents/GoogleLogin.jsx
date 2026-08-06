import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from '../UserContext';  
import { toast } from 'react-toastify';

const GoogleLoginButton = () => {
  const [error, setError] = useState("");  
  const navigate = useNavigate();
  const { loginUser } = useUser(); 

  const handleSuccess = async (credentialResponse) => {
    try {
      const backendResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/google`,
        { credential: credentialResponse.credential },
        { withCredentials: true }
      );

      if (backendResponse.data.newUser === true) {
        toast.info("Google account not registered yet. Prefilling registration form.");
        navigate("/register", { 
          state: { 
            email: backendResponse.data.email,
            firstName: backendResponse.data.firstName,
            lastName: backendResponse.data.lastName,
            imageUrl: backendResponse.data.imageUrl
          } 
        });
      } else {
        const { user } = backendResponse.data; 
        loginUser({
          email: user.email,
          firstName: user.name,
          lastName: user.lastName,
          role: user.role, 
          imageUrl: user.imageUrl,
          batch: user.batch,
          rollNo: user.rollNo,
          department: user.department,
          id: user.id,
          profileType: user.profileType,
          phone: user.phone,
        }, backendResponse.data.token);
        
        toast.success(`Welcome back, ${user.name}! Login successful.`);
        navigate("/");
      }
    } catch (error) {
      console.error("Google login failed:", error);
      setError("An error occurred during Google login. Please try again.");
      toast.error("Google login failed. Please try again.");
    }
  };

  const handleError = () => {
    console.error("Login Failed");
    setError("Login failed. Please try again.");
    toast.error("Google login failed. Please try again.");
  };

  return (
    <div className="flex flex-col items-center w-full mt-2">
      <GoogleLogin 
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="outline"
        size="large"
        width="384px"
      />
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
};

export default GoogleLoginButton;
