import { Link } from "react-router-dom";
import nitkkrLogo from '../assets/nitkkr-logo.jpeg';
import nitkkrImage from '../assets/nitkkr-pic.jpg';
import '../index.css';

function About() {

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#c6baae] to-[#F4F0EC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img 
                src={nitkkrImage} 
                alt="NIT Kurukshetra Campus" 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-8 md:w-1/2 flex flex-col justify-center">
              <div className="flex items-center mb-6">
                <img src={nitkkrLogo} alt="NIT Kurukshetra Logo" className="h-16 w-16 mr-4 rounded-full bg-white p-1 border border-gray-200" />
                <h1 className="text-3xl font-bold text-gray-800">About NIT KKR Alumni Association</h1>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Welcome to our platform! We are dedicated to connecting alumni and fostering meaningful relationships that benefit both our graduates and the institute.
              </p>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Our Story</h2>
          
          <div className="prose max-w-none text-gray-600 space-y-4">
            <p>
            The NIT Kurukshetra Alumni Association traces its origins to the mid-1970s, when the institute was 
            known as the Regional Engineering College (REC), Kurukshetra. The association has evolved alongside 
            the institute, growing from its early alumni organization into today's registered NIT Kurukshetra Alumni 
            Association (NITKKRAA). It serves as a platform to connect alumni, students, faculty, and regional chapters, 
            fostering professional networking, mentorship, knowledge sharing, reunions, scholarships, and support for 
            the institute's continued development
            </p>
          </div>
          
          <div className="mt-8 bg-stone-100 border border-stone-200 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-stone-800 mb-3">
             Our Mission
         </h3>
          <p className="text-gray-700">
              To build stronger connections between alumni and the institute, foster
              professional networking, and create opportunities for current students
              through the experience and support of our graduates.
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
