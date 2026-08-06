import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import GoogleRegister from "./loginComponents/GoogleRegister";
import CompleteProfile from "./loginComponents/CompleteProfile";
import './index.css';
import './App.css';
import Home from "./pages/Home";

import About from "./pages/About";
import Contact from "./pages/Contact";
import Connections from "./pages/Connections";
import ResetPassword from "./ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import AchievementsList from "./pages/Achievements";
import AchievementsForm from "./pages/AddAchievements";
import AddWorkExperience from "./pages/AddWorkExperience";
import WorkExperienceList from "./pages/WorkExperience";
import AlumniWorkExp from "./pages/AlumniWorkExp";
import AlumniAchievements from "./pages/AlumniAchievements";
import JobOpportunities from "./pages/JobOpportunities";
import AlumniList from "./pages/Alumni";
import Gallery from "./pages/Gallery";
import Events from "./pages/Events";
import UpdateProfile from "./pages/UpdateProfile";
import SearchResults from "./pages/SearchResults";
import EditWorkExperienceForm from "./pages/EditWorkExperienceForm";
import EditAchievementForm from "./pages/EditAchievementForm";
import Leaderboard from "./pages/Leaderboard";
import Chat from "./pages/Chat";
import GroupChat from "./pages/GroupChat";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/google-register" element={<GoogleRegister />} />
       
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/complete-profile" element={<CompleteProfile/>}/>
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard/>
            </ProtectedRoute>
          }
        />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/add-work-experience" element={<AddWorkExperience />} />
        <Route path="/add-achievements" element={<AchievementsForm />} />
        <Route path="/job-opportunities" element={<JobOpportunities />} />
        <Route path="/achievements" element={<AchievementsList />} />
        <Route path="/alumni/:alumniId/achievements" element={<AlumniAchievements />} />
        <Route path="/alumni/:alumniId/workexperience" element={<AlumniWorkExp />} />
       
        <Route path="/alumni" element={<AlumniList />} />
        <Route path="/work-experience" element={<WorkExperienceList />} />
        <Route path="/gallery" element={<Gallery/>}/>
        <Route path="/events" element={<Events />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/update-profile" element={<UpdateProfile/>}/>
        <Route path="/edit-work/:id" element={<EditWorkExperienceForm/>}/>
        <Route path="/edit-achievement/:id" element={<EditAchievementForm/>}/>
        <Route path="/chat" element={<Chat/>}/>
        <Route path="/group-chat" element={<GroupChat/>}/>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
        enableMultiContainer={false}
        aria-live="polite"
        aria-atomic="true"
        aria-relevant="additions text"
        aria-label="Notifications"
      />
      
    </>
  );
}

export default App;

