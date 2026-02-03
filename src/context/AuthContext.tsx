"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Business } from '../types';
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
  businesses: Business[];
  currentBusiness: Business | null;
  switchBusiness: (businessId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresOnboarding, setRequiresOnboarding] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedJwt = localStorage.getItem('jwt');
      const savedBusinesses = localStorage.getItem('businesses');
      if (savedUser && savedJwt) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setJwt(savedJwt);
        setRequiresOnboarding(parsedUser.status === 'onboarding');
        if (savedBusinesses) {
          setBusinesses(JSON.parse(savedBusinesses));
        }
      }
    } catch (e) {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  }, []);

  // Get current business from user
  const currentBusiness = user?.default_business_id 
    ? businesses.find(b => (b as any)._id === (user.default_business_id as any)?._id || b._id === user.default_business_id) || null
    : null;

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
        
        // Update businesses from user data
        if (userData.businesses) {
          setBusinesses(userData.businesses);
          localStorage.setItem('businesses', JSON.stringify(userData.businesses));
        }
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
      
      // Store businesses
      if (data.businesses) {
        setBusinesses(data.businesses);
        localStorage.setItem('businesses', JSON.stringify(data.businesses));
      }
      
      return data;
    } else {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Login failed');
    }
  };

  const switchBusiness = async (businessId: string) => {
    const savedJwt = localStorage.getItem('jwt');
    if (!savedJwt) return;

    try {
      const response = await fetch(`${API_URL}/api/business/switch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedJwt}`,
        },
        body: JSON.stringify({ business_id: businessId }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update user's default_business_id
        if (user) {
          const updatedUser = { ...user, default_business_id: businessId };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        // Refresh to get updated data
        await refreshUser();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to switch business');
      }
    } catch (error) {
      console.error('Failed to switch business:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setJwt(null);
    setRequiresOnboarding(false);
    setBusinesses([]);
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
    localStorage.removeItem('businesses');
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
        refreshUser,
        businesses,
        currentBusiness,
        switchBusiness
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
  
  const hasAccess = isAuthenticated && !requiresOnboarding;
  
  return {
    hasAccess,
    isOnboarding: requiresOnboarding,
    user,
  };
};
