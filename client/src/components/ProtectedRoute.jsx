import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ProtectedRoute - loading:", loading, "isAuthenticated:", isAuthenticated);
    
    if (!loading && !isAuthenticated) {
      console.log("ProtectedRoute - redirecting to /login");
      navigate("/login", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute - not authenticated, returning null");
    return null;
  }

  return children;
};

export default ProtectedRoute;
