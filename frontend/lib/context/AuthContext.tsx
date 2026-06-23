"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../api/axios-instance";
import { clearAuthCookies } from "../cookies";

interface User {
  id?: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  studentId: string;
  profileImage?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const response = await axiosInstance.get("/api/v1/auth/whoami");
      if (response.data && response.data.success) {
        setUser(response.data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = async () => {
    setIsLoading(true);
    await clearAuthCookies();
    setUser(null);
    setIsLoading(false);
    router.push("/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
