import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // httpOnly refreshToken cookie is sent/received
});

// A clean instance specifically for token refresh to avoid interceptor recursion and headers contamination
const refreshInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// In-memory only — never stored in localStorage. If the tab is closed, the access token is gone, but the httpOnly refresh cookie survives and silently re-issues one
// on the next request
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
  // Removed localStorage.setItem/removeItem and axios.defaults.headers.common —
  // storing the access token in localStorage reopens the XSS risk we deliberately avoided
  // by keeping it in-memory only. Also, mutating axios.defaults on the global `axios`
  // import does nothing useful here since all real requests go through axiosInstance,
  // which already gets the token via the request interceptor below.
};

export const getAccessToken = () => accessToken;

axiosInstance.interceptors.request.use((config) => {
  // Do not attach the expired access token to the token refresh endpoint
  if (accessToken && !config.url?.includes("/api/auth/refresh")) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isExpired = error.response?.status === 401 && error.response?.data?.code === "TOKEN_EXPIRED";

    console.log(
      "Interceptor caught error. Status:", error.response?.status,
      "Code:", error.response?.data?.code,
      "isExpired:", isExpired,
      "_retry:", originalRequest?._retry
    );

    if (isExpired && originalRequest && !originalRequest._retry) {
      console.log("Entering refresh block");

      if (isRefreshing) {
        originalRequest._retry = true;   // 👈 FIX: mark queued requests too, prevents infinite re-queueing if the retry itself fails again
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await refreshInstance.post("/api/auth/refresh");
        if (!data) console.log(data);
        else console.log("refresh request sent and came", data);

        setAccessToken(data.token);
        processQueue(null, data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;