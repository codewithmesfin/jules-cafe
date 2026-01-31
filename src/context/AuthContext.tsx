"use client";
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { MOCK_USERS } from '../utils/mockData';
import { API_URL } from '../utils/api';

interface AuthContextType {
  user: User | null;
  jwt: string | null;
  login: (email: string, password?: string) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedJwt = localStorage.getItem('jwt');
      if (savedUser && savedJwt) {
        setUser(JSON.parse(savedUser));
        setJwt(savedJwt);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string) => {
    console.log('Login attempt with:', email, password ? '******' : 'no password');

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: email, password }),
    });

    if (response.ok) {
      const data = await response.json(); // { jwt, user }
      setUser(data.user);
      setJwt(data.jwt);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('jwt', data.jwt);
      return data;
    } else {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
  };

  const logout = () => {
    setUser(null);
    setJwt(null);
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
  };

  return (
    <AuthContext.Provider value={{ user, jwt, login, logout, isAuthenticated: !!user, loading }}>
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
