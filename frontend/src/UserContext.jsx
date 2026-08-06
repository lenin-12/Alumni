
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();


export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return parsed;
      }
      return null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  // Set default authorization header if token exists
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Fetch updated user data from backend
  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}`);
      const data = response.data;
      setUser((prevUser) => ({
        ...prevUser, // Keep existing properties
        ...data, // Update with new data
      }));
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const loginUser = (userData, userToken) => {
    setUser(userData);
    if (userToken) {
      setToken(userToken);
      localStorage.setItem("token", userToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    }
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common['Authorization'];
  };

  // Sync user state with localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser, fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
}
export function useUser() {
  return useContext(UserContext);
}


