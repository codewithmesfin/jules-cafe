"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { API_URL } from '../utils/api';

interface AuthContextType {
  user: User | null;
  jwt: string | null;
  login: (email: string, password?: string) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  requiresOnboarding: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresOnboarding, setRequiresOnboarding] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedJwt = localStorage.getItem('jwt');
      if (savedUser && savedJwt) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setJwt(savedJwt);
        // Check if user requires onboarding
        setRequiresOnboarding(parsedUser.status === 'onboarding');
      }
    } catch (e) {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh user data from server
  const refreshUser = async () => {
    const savedJwt = localStorage.getItem('jwt');
    if (!savedJwt) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${savedJwt}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setRequiresOnboarding(userData.status === 'onboarding');
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const login = async (email: string, password?: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
      setJwt(data.jwt);
      setRequiresOnboarding(data.requiresOnboarding || false);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('jwt', data.jwt);
      return data;
    } else {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Login failed');
    }
  };

  const logout = () => {
    setUser(null);
    setJwt(null);
    setRequiresOnboarding(false);
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        jwt, 
        login, 
        logout, 
        isAuthenticated: !!user, 
        loading,
        requiresOnboarding,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Hook to check if user can access protected routes
 * Returns true if user is authenticated and not in onboarding (unless on allowed routes)
 */
export const useHasAccess = () => {
  const { user, isAuthenticated, requiresOnboarding } = useAuth();
  
  const hasAccess = isAuthenticated && (!requiresOnboarding || user?.role === 'customer');
  
  return {
    hasAccess,
    isOnboarding: requiresOnboarding,
    user,
  };
};
