import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUserShield, FaUserPlus, FaSpinner, FaSearch, FaUser } from "react-icons/fa";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/admin/allUsers`,
        { withCredentials: true }
      );
      setUsers(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePromote = async (userId) => {
    setActionLoadingId(userId);
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}/promote`,
        {},
        { withCredentials: true }
      );
      toast.success(response.data.message || "User promoted successfully!");
      await fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to promote user.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDemote = async (userId) => {
    setActionLoadingId(userId);
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}/demote`,
        {},
        { withCredentials: true }
      );
      toast.success(response.data.message || "User demoted successfully!");
      await fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to demote user.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.name || ""} ${u.lastName || ""}`.toLowerCase();
    const email = (u.email || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-[#E7DDD6]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[#E7DDD6] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D0707]">User Access Control (RBAC)</h2>
          <p className="text-gray-500 text-sm">Promote users to administrators or demote them back to standard alumni.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative max-w-sm w-full">
          <FaSearch className="absolute left-4 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] text-sm text-[#2C2C2C] bg-white transition-all shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-[#8B1E1E] text-3xl" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-[#FAF8F6] rounded-xl border border-dashed border-[#E7DDD6]">No users found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#E7DDD6]">
          <table className="min-w-full divide-y divide-[#E7DDD6]">
            <thead>
              <tr className="bg-[#FAF8F6] text-[#2C2C2C] text-xs font-bold uppercase tracking-wider text-left border-b border-[#E7DDD6]">
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Current Role</th>
                <th className="px-6 py-3.5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7DDD6] bg-white text-[#2C2C2C] text-sm">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="odd:bg-white even:bg-[#FAF8F6]/40 hover:bg-[#FAF6F0] transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-[#E7DDD6] mr-3">
                        {u.imageUrl ? (
                          <img src={u.imageUrl} alt={u.name} className="object-cover w-full h-full" />
                        ) : (
                          <FaUser className="text-gray-400" />
                        )}
                      </div>
                      <div className="font-semibold text-gray-900">
                        {u.name} {u.lastName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        u.role === "ADMIN"
                          ? "bg-red-50 text-red-700 border-red-100"
                          : u.role === "STUDENT"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                          : "bg-green-50 text-green-700 border-green-100"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {actionLoadingId === u._id ? (
                      <FaSpinner className="animate-spin text-[#8B1E1E] inline-block mr-4" />
                    ) : u.role === "ADMIN" ? (
                      <button
                        onClick={() => handleDemote(u._id)}
                        className="px-4 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 font-semibold rounded-lg text-xs transition-all shadow-sm hover:-translate-y-0.5 inline-flex items-center gap-1.5"
                      >
                        <FaUserShield className="text-sm" />
                        Demote
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePromote(u._id)}
                        className="px-4 py-1.5 bg-[#8B1E1E] hover:bg-[#6F1111] text-white font-semibold rounded-lg text-xs transition-all shadow-sm hover:-translate-y-0.5 inline-flex items-center gap-1.5"
                      >
                        <FaUserPlus className="text-sm" />
                        Promote to Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
