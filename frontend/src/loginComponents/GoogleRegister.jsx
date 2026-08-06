import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from '../UserContext';  
import { toast } from 'react-toastify';

function GoogleRegister() {
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
        toast.success("Google account verified! Please complete your registration details.");
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
        
        toast.success(`Google account already registered. Welcome back, ${user.name}!`);
        navigate("/");
      }
    } catch (error) {
      console.error("Google login/register failed:", error);
      setError("An error occurred during Google registration. Please try again.");
      toast.error("Google registration failed. Please try again.");
    }
  };

  const handleError = () => {
    console.error("Registration Failed");
    setError("Registration failed. Please try again.");
    toast.error("Google registration failed. Please try again.");
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
}

export default GoogleRegister;
