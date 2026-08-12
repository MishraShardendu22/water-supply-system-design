'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole } from '../types';

interface AuthContextType {
  userRole: UserRole;
  userName: string;
  userEmail: string;
  isAuthenticated: boolean;
  setUserRole: (role: UserRole) => void;
  login: (token: string, name: string, email: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  userRole: 'Admin',
  userName: 'System Admin',
  userEmail: 'admin@water.gov',
  isAuthenticated: true,
  setUserRole: () => {},
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRoleState] = useState<UserRole>('Admin');
  const [userName, setUserName] = useState<string>('System Admin');
  const [userEmail, setUserEmail] = useState<string>('admin@water.gov');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('user_role') as UserRole;
      const storedName = localStorage.getItem('user_name');
      const token = localStorage.getItem('auth_token');

      if (storedRole) setUserRoleState(storedRole);
      if (storedName) setUserName(storedName);
      if (token) setIsAuthenticated(true);
    }
  }, []);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_role', role);
    }
  };

  const login = (token: string, name: string, email: string, role: UserRole) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_name', name);
    }
    setUserRoleState(role);
    setUserName(name);
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_name');
    }
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        userRole,
        userName,
        userEmail,
        isAuthenticated,
        setUserRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
