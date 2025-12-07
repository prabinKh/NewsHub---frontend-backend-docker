'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  email_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface RegisterData {
  email: string;
  name: string;
  password: string;
  password2: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    if (!authChecked) {
      checkAuth().then(() => {
        setAuthChecked(true);
      });
    }
  }, [authChecked]);

  const checkAuth = async () => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingAuth) {
      return;
    }
    
    setIsCheckingAuth(true);
    
    try {
      const response = await authAPI.checkAuth();
      if (response.data.authenticated) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error: any) {
      // If we get a 401 or 403, the user is not authenticated
      if (error.response?.status === 401 || error.response?.status === 403) {
        setUser(null);
      } else {
        // For other errors, we still set loading to false but keep current user state
        console.error('Auth check error:', error);
      }
    } finally {
      setIsCheckingAuth(false);
      if (loading) {
        setLoading(false);
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.data.success) {
        setUser(response.data.user);
        toast.success('Login successful!');
        router.push('/');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authAPI.register(data);
      
      if (response.data.success) {
        toast.success(response.data.message);
        router.push('/verify-email-sent');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      // Even if logout fails on the backend, clear local state
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}