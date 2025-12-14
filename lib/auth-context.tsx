'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from './api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('checkAuth started');
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      console.log('checkAuth - token exists:', !!token);
      console.log('checkAuth - savedUser exists:', !!savedUser);
      console.log('checkAuth - savedUser value:', savedUser);

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log('checkAuth - parsed user:', parsedUser);
          setUser(parsedUser);
          console.log('checkAuth - user state set from localStorage');

          // Don't try to refresh from API for now since endpoint might not exist
          // Just use the cached data
        } catch (parseError) {
          console.error('Failed to parse saved user:', parseError);
          throw parseError;
        }
      } else {
        console.log('checkAuth - no token or savedUser found');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      console.log('checkAuth - setting loading to false');
      setLoading(false);
    }
  };

  const login = async (phoneNumber: string, password: string) => {
    try {
      const response = await authAPI.login(phoneNumber, password);
      console.log('Full login response:', response);
      console.log('Response data:', response.data);

      // Try different possible response structures
      let token, userData;

      if (response.data.token && response.data.user) {
        // Structure: { token, user }
        token = response.data.token;
        userData = response.data.user;
      } else if (response.data.data) {
        // Structure: { data: { token, user } }
        token = response.data.data.token;
        userData = response.data.data.user;
      } else {
        console.error('Unexpected response structure:', response.data);
        throw new Error('Invalid response structure from server');
      }

      if (!token || !userData) {
        throw new Error('Missing token or user data in response');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Set cookie for middleware
      document.cookie = `token=${token}; path=/; max-age=86400`;

      setUser(userData);
      toast.success('تم تسجيل الدخول بنجاح');
    } catch (error: any) {
      console.error('Login error details:', error);
      const message = error.response?.data?.message || error.message || 'خطأ في تسجيل الدخول';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; max-age=0';
    setUser(null);
    toast.success('تم تسجيل الخروج');
    router.push('/login');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
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
