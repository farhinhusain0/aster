import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/calls/auth";

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; redirectUrl?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  verifyRegistration: (token: string) => Promise<void>;
  isVerifying: boolean;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem("authToken");

    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    setIsVerifying(false);
    setIsLoading(false);
  }, []);

  const setTokenAndAuthenticated = (token: string) => {
    setToken(token);
    setIsAuthenticated(true);
    localStorage.setItem("authToken", token);
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await authApi.login({ email, password });

      setTokenAndAuthenticated(data.token);
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await authApi.register({ email, password, name });

      return data;
    } catch (error) {
      setError("Registration failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyRegistration = async (token: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authApi.verifyRegistration({ token });
      setTokenAndAuthenticated(response.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    setError(null);
    localStorage.removeItem("authToken");
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authApi.resetPassword({ token, newPassword });
      setTokenAndAuthenticated(response.token);
    } catch (error) {
      setError("Reset password failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authApi.forgotPassword({ email });
      return response;
    } catch (error) {
      setError("Forgot password failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    token,
    login,
    register,
    logout,
    isAuthenticated,
    isLoading,
    error,
    verifyRegistration,
    isVerifying,
    resetPassword,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
