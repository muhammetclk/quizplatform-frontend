import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthResponse } from '../types';

interface User {
  userId: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (authResponse: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('accessToken');
  });

  const login = (authResponse: AuthResponse) => {
    const userData: User = {
      userId: '', // will be extracted from JWT claims on backend; userId not in AuthResponse directly
      username: authResponse.username,
      email: authResponse.email,
      role: authResponse.role,
    };
    localStorage.setItem('accessToken', authResponse.accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(authResponse.accessToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
