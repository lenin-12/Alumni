import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../UserContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
    const { user } = useUser();

    if (!user) {
        // Redirect to Login if not authenticated
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Show access denied if not authorized
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-[#FAF8F6] p-6 text-center">
                <div className="bg-white p-8 rounded-xl shadow-md border border-[#E7DDD6] max-w-md w-full">
                    <h1 className="text-4xl font-extrabold text-[#6B1F1F] mb-4">Access Denied</h1>
                    <p className="text-[#2C2C2C] mb-6">
                        You do not have the required permissions to view this administrative resource.
                    </p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2 bg-[#6B1F1F] text-white rounded-lg hover:bg-[#5B1A1A] transition"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
