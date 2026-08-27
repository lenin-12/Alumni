import React, { useState } from "react";
import { FaUserGraduate, FaBriefcase, FaMedal, FaSuitcase, FaBars, FaCalendarAlt, FaImages, FaEnvelope, FaUsers } from "react-icons/fa"; // Icons
import { useUser } from "../UserContext";
import AchievementsList from "./Achievements";
import JobOpportunities from "./JobOpportunities";
import AlumniList from "./Alumni";
import WorkExperienceList from "./WorkExperience";
import Events from "./Events";
import Gallery from "./Gallery";
import ContactSubmissions from "./ContactSubmissions";
import UserManagement from "./UserManagement";

const Dashboard = () => {
    const [activePage, setActivePage] = useState("alumni");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const user = useUser();
    // Sidebar menu items
    const menuItems = [
        { name: "Alumni", icon: <FaUserGraduate /> },
        { name: "Job Opportunities", icon: <FaBriefcase /> },
        { name: "Work Experience", icon: <FaSuitcase /> },
        { name: "Achievements", icon: <FaMedal /> },
        { name: "Events", icon: <FaCalendarAlt />},
        { name: "Gallery", icon: <FaImages /> },
        { name: "Contact Messages", icon: <FaEnvelope /> },
        { name: "User Management", icon: <FaUsers /> }
    ];

    return (

        <div className="flex flex-col min-h-screen bg-[#FAF6F0]">
            {/* Main Content Wrapper */}
            <div className="flex flex-1">

                {/* Sidebar */}
                <div className={`bg-gradient-to-b from-[#3D0707] via-[#531010] to-[#3D0707] shadow-xl text-white p-5 transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"} min-h-[calc(100vh-80px)]`}>
                    {/* Sidebar Toggle Button */}
                    <div className="flex justify-between items-center border-b border-[#6F1111] pb-4">
                        <h2 className={`text-lg font-bold tracking-wide uppercase transition-all duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 hidden"}`}>
                            Admin Panel
                        </h2>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white text-xl focus:outline-none hover:text-gray-300 transition-colors mx-auto md:mx-0">
                            <FaBars />
                        </button>
                    </div>

                    {/* Menu Items */}
                    <ul className="mt-6 space-y-1.5">
                        {menuItems.map((item) => (
                            <li
                                key={item.name}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                    activePage === item.name.toLowerCase().replace(/ /g, "")
                                        ? "bg-[#8B1E1E] text-white font-semibold shadow-md border-l-4 border-brand-gold"
                                        : "text-gray-300 hover:bg-[#6F1111]/80 hover:text-white"
                                }`}
                                onClick={() => setActivePage(item.name.toLowerCase().replace(/ /g, ""))}
                            >
                                <span className="text-lg flex-shrink-0">{item.icon}</span>
                                <span className={`text-sm font-medium tracking-wide transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 hidden"}`}>
                                    {item.name}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Dynamic Content Area */}
                <div className="flex-1 bg-[#FAF6F0] p-6 overflow-x-hidden">
                    {activePage === "jobopportunities" && <JobOpportunities />}
                    {activePage === "achievements" && <AchievementsList />}
                    {activePage === "alumni" && <AlumniList />}
                    {activePage === "workexperience" && <WorkExperienceList />}
                    {activePage === "events" && <Events />}
                    {activePage === "gallery" && <Gallery />}
                    {activePage === "contactmessages" && <ContactSubmissions />}
                    {activePage === "usermanagement" && <UserManagement />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
