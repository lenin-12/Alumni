import React, { useEffect, useState } from "react";
import { FaUserCheck, FaUserTimes, FaUserClock, FaUserPlus } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useUser } from "../UserContext";
import axiosInstance from "../utils/axiosInstance";

const Connections = () => {
    const [pending, setPending] = useState([]);
    const [accepted, setAccepted] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        if(!user?.id){
            setLoading(false); 
            navigate("/login")
            return;
        }
         
        fetchConnections();
    }, [user]);

    const fetchConnections = async () => {
        try {
            const [pendingRes, acceptedRes] = await Promise.all([
                axiosInstance.get(`/api/connections/pending/${user.id}`, { withCredentials: true }),
                axiosInstance.get(`/api/connections/accepted/${user.id}`, { withCredentials: true })
            ]);
            setPending(pendingRes.data);
            setAccepted(acceptedRes.data);
        } catch (error) {
            console.error("Error fetching connections:", error);
            toast.error("Failed to load connections");
        } finally {
            setLoading(false);
        }
    };

    const acceptRequest = async (requestId) => {
        try {
            await axiosInstance.post(`/api/connections/accept/${requestId}`,{},{ withCredentials: true });
            const updatedRequest = pending.find(req => req.id === requestId);
            setPending(prev => prev.filter(req => req.id !== requestId));
            setAccepted(prev => [...prev, { ...updatedRequest, status: 'ACCEPTED' }]);
            toast.success("Connection request accepted!");
        } catch (error) {
            console.error("Error accepting request:", error);
            toast.error("Failed to accept connection request");
        }
    };

    const rejectRequest = async (requestId) => {
        try {
            await axiosInstance.post(`/api/connections/reject/${requestId}`, {}, { withCredentials: true });
            setPending(prev => prev.filter(req => req.id !== requestId));
            toast.success("Connection request rejected");
        } catch (error) {
            console.error("Error rejecting request:", error);
            toast.error("Failed to reject connection request");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-3 text-gray-700">Loading connections...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-brown-10 py-8 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">My Connections</h1>
                    
                    {/* Pending Requests */}
                    {pending.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                                <FaUserClock className="mr-2 text-yellow-500" />
                                Pending Connection Requests
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pending.map((req) => (
                                    <div key={req.id} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <FaUserPlus className="text-blue-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-800">{req.sender.name}</h3>
                                                <p className="text-sm text-gray-500">{req.sender.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => acceptRequest(req.id)}
                                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center space-x-2"
                                            >
                                                <FaUserCheck />
                                                <span>Accept</span>
                                            </button>
                                            <button
                                                onClick={() => rejectRequest(req.id)}
                                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center space-x-2"
                                            >
                                                <FaUserTimes />
                                                <span>Reject</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Accepted Connections */}
                    {accepted.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                                <FaUserCheck className="mr-2 text-green-500" />
                                Accepted Connections
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {accepted.map((conn) => (
                                    <div key={conn.id} className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                                <FaUserCheck className="text-green-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-800">
                                                    {conn.sender.id === user.id ? conn.receiver.name : conn.sender.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {conn.sender.id === user.id ? conn.receiver.email : conn.sender.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {pending.length === 0 && accepted.length === 0 && (
                        <div className="text-center py-12">
                            <FaUserPlus className="text-gray-400 text-4xl mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No connections yet</h3>
                            <p className="text-gray-500">Start connecting with other alumni from the alumni directory</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Connections;
