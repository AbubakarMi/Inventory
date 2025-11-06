'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, api } from '@/lib/api-client';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Storekeeper' | 'Staff';
  status: 'Active' | 'Inactive' | 'Suspended';
  email_verified: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  userData: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: User['role']) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  hasPermission: (allowedRoles: User['role'][]) => boolean;
  isAdmin: () => boolean;
  isManagerOrAbove: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setCurrentUser(response.user);
      setUserData(response.user);
    } catch (error) {
      // Token invalid or expired
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      setCurrentUser(null);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('[AUTH] Calling login API...');
      const response = await authApi.login(email, password);
      console.log('[AUTH] Login API successful, user:', response.user);
      setCurrentUser(response.user);
      setUserData(response.user);
      console.log('[AUTH] User state updated successfully');
      return response;
    } catch (error: any) {
      console.error('[AUTH] Login failed:', error);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: User['role']
  ) => {
    try {
      const response = await authApi.register({ name, email, password, role });
      setCurrentUser(response.user);
      setUserData(response.user);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to register');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setCurrentUser(null);
      setUserData(null);
      router.push('/login');
    }
  };

  const resetPassword = async (email: string) => {
    // TODO: Implement password reset via email
    throw new Error('Password reset not yet implemented');
  };

  const updateUserProfile = async (displayName: string) => {
    if (!currentUser) throw new Error('No user logged in');

    try {
      await api.put('/users', { id: currentUser.id, name: displayName });
      setCurrentUser({ ...currentUser, name: displayName });
      setUserData({ ...currentUser, name: displayName });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const hasPermission = (allowedRoles: User['role'][]): boolean => {
    if (!currentUser) return false;
    return allowedRoles.includes(currentUser.role);
  };

  const isAdmin = (): boolean => {
    return currentUser?.role === 'Admin';
  };

  const isManagerOrAbove = (): boolean => {
    return currentUser?.role === 'Admin' || currentUser?.role === 'Manager';
  };

  const value = {
    currentUser,
    userData,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    hasPermission,
    isAdmin,
    isManagerOrAbove,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
