import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const user = useUser();
  const searchType = searchParams.get("type");
  const searchQuery = searchParams.get("query");

  useEffect(() => {
    // Only fetch search results if user is logged in
    if (user && user.user && user.user.id) {
      const fetchUsers = async () => {
        try {
          const response = await axiosInstance.get(
            `${import.meta.env.VITE_API_URL}/api/users/search?type=${searchType}&query=${searchQuery}`,
            { withCredentials: true }
          );
          setUsers(response.data);
        } catch (error) {
          console.error("Error fetching search results:", error);
        }
      };
      fetchUsers();
    }
  }, [searchType, searchQuery, user]);

  // If user is not logged in, show login message
  if (!user || !user.user || !user.user.id) {
    return (
      <div className="min-h-[calc(100vh-180px)] flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please login to view search results and connect with other alumni.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/login" 
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
            >
              Log In
            </Link>
            <Link 
              to="/" 
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-300"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const id = user.user.id;

  return (
    <div className="p-4 min-h-[calc(100vh-180px)]">
      <h1 className="text-2xl font-semibold mb-4">
        Search Results for "{searchQuery}"
      </h1>
      {users.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users
            .filter((user) => user.id !== id && user.email !== "admin@gmail.com") // Exclude user with matching id
            .map((user) => (
              <div
                key={user.id}
                className="cursor-pointer border rounded-2xl p-4 shadow-md flex items-center space-x-4 hover:shadow-lg transition"
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                <img
                  src={user.imageUrl || "https://via.placeholder.com/150"}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-lg font-semibold">{user.name}</h2>
                  <p className="text-gray-600">{user.batch}</p>
                  <p className="text-gray-500">{user.department}</p>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-gray-500">No results found.</p>
      )}
    </div>
  );
};

export default SearchResults;
