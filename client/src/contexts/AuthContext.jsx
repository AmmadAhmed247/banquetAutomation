import React, { createContext, useState, useEffect } from "react";
import api from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/api/auth/me");
        setUser(response.data.client || response.data.user);
        setIsAuthenticated(true);
        console.log("Auth check: Authenticated");
      } catch (error) {
        console.log("Auth check: Not authenticated");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {});
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, logout, login }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
