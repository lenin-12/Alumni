import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; 
import './index.css';
import './App.css';
import App from './App';
import ScrollToTop from "./components/ScrollToTop";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { UserProvider } from "./UserContext"; 
import Footer from "./components/Footer";
import Header from './components/Header';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "979902143587-3aa66qlcam6aibmdrcud6uhi7judjcq9.apps.googleusercontent.com"}>
     
        <UserProvider> 
        <BrowserRouter>
        <ScrollToTop />
            <Header/>
          <App />
          <Footer/>
          </BrowserRouter>
        </UserProvider>
      
    </GoogleOAuthProvider>
  </React.StrictMode>
);

