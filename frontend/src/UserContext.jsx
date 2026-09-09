import React, { createContext, useState, useContext, useEffect } from "react";
import axiosInstance from "./utils/axiosInstance";

const UserContext = createContext();

export function UserProvider({ children }) {
 
  const [user, setUser] = useState(null);

 
  const fetchUserData = async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/users/${userId}`);

      const data = response.data;

      setUser((prevUser) => ({
        ...prevUser,
        ...data,
      }));

      return data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  };

  
  const loginUser = (userData) => {
    setUser(userData);
  };


  const logoutUser = async () => {
    try {
      await axiosInstance.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loginUser,
        logoutUser,
        fetchUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}