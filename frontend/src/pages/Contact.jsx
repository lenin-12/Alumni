import { Link } from "react-router-dom";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";

import userImage from '../assets/user.webp';
import '../index.css';
import { toast } from 'react-toastify';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
     
      await axiosInstance.post(`${import.meta.env.VITE_API_URL}/api/contact/submit`, formData,{withCredentials:true});
      
      toast.success("Thank you for your message! We'll get back to you soon.");
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Failed to submit your message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#c6baae] to-[#F4F0EC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#3D0707] mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions or want to connect with the Alumni Association? Reach out to our team members below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Team Members */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl border border-[#E7DDD6]">
            <div className="bg-gradient-to-r from-[#6B1F1F] to-[#8B2E2E] h-8"></div>
            <div className="p-6 text-center">
              <div className="relative mb-4">
                <img src={userImage} alt="Prof. Jayant Krishna" className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-white shadow-md -mt-16" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Prof. Gian Bhushan</h3>
              <p className="text-[#6B1F1F] font-semibold mb-2">Dean Academic</p>
              <div className="space-y-2 text-gray-600">
                <p className="flex items-center justify-center">
                  <FaEnvelope className="mr-2 text-[#6B1F1F]" />
                  <a href="mailto:dean_academic@nitkkr.ac.in" className="hover:text-[#7A2323] transition hover:underline">dean_academic@nitkkr.ac.in</a>
                </p>
                <p className="flex items-center justify-center">
                  <FaPhone className="mr-2 text-[#6B1F1F]" />
                  01744-233588
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl border border-[#E7DDD6]">
            <div className="bg-gradient-to-r from-[#6B1F1F] to-[#8B2E2E] h-8"></div>
            <div className="p-6 text-center">
              <div className="relative mb-4">
                <img src={userImage} alt="Prof. Debashish Chakravarty" className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-white shadow-md -mt-16" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Prof. Paratibha Aggarwal</h3>
              <p className="text-[#6B1F1F] font-semibold mb-2">Prof.-In-Charge(Alumni Affairs)</p>
              <div className="space-y-2 text-gray-600">
                <p className="flex items-center justify-center">
                  <FaEnvelope className="mr-2 text-[#6B1F1F]" />
                  <a href="mailto:paratibha@nitkkr.ac.in" className="hover:text-[#7A2323] transition hover:underline">paratibha@nitkkr.ac.in</a>
                </p>
                <p className="flex items-center justify-center">
                  <FaPhone className="mr-2 text-[#6B1F1F]" />
                  9416345245
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl border border-[#E7DDD6]">
            <div className="bg-gradient-to-r from-[#6B1F1F] to-[#8B2E2E] h-8"></div>
            <div className="p-6 text-center">
              <div className="relative mb-4">
                <img src={userImage} alt="Mrs. Archana Biswas" className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-white shadow-md -mt-16" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Prof. Dixit Garg</h3>
              <p className="text-[#6B1F1F] font-semibold mb-2">Member (Alumni EB)    President (Alumni EFMC)</p>
              <div className="space-y-2 text-gray-600">
                <p className="flex items-center justify-center">
                  <FaEnvelope className="mr-2 text-[#6B1F1F]" />
                  <a href="mailto:dixitgarg1@nitkkr.ac.in" className="hover:text-[#7A2323] transition hover:underline">dixitgarg1@nitkkr.ac.in</a>
                </p>
                <p className="flex items-center justify-center">
                  <FaPhone className="mr-2 text-[#6B1F1F]" />
                  (+91) 93552 11021
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#E7DDD6]">
          <div className="md:flex">
            <div className="md:w-1/2 bg-gradient-to-br from-[#6B1F1F] to-[#8B2E2E] p-8 text-white flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">Get In Touch</h3>
              <p className="mb-6 text-[#F8F5F2]/90">We'd love to hear from you. Fill out the form and we'll get back to you as soon as possible.</p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-4 text-xl" />
                  <p>National Institute of Technology<br />Kurukshetra-136119, Haryana</p>
                </div>
                <div className="flex items-center">
                  <FaPhone className="mr-4 text-xl" />
                  <p>+01744-233208</p>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="mr-4 text-xl" />
                  <p>alumni@nitkkr.ac.in</p>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2 p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#2C2C2C] mb-1">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-[#E7DDD6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] focus:border-[#6B1F1F] transition text-[#2C2C2C] bg-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#2C2C2C] mb-1">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-[#E7DDD6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] focus:border-[#6B1F1F] transition text-[#2C2C2C] bg-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#2C2C2C] mb-1">Message</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-[#E7DDD6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] focus:border-[#6B1F1F] transition text-[#2C2C2C] bg-white"
                    required
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-[#6B1F1F] hover:bg-[#7A2323] active:bg-[#5A1A1A] text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-md"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
