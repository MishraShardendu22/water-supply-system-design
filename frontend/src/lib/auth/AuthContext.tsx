'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole } from '../types';

interface AuthContextType {
  userRole: UserRole;
  userName: string;
  userEmail: string;
  isAuthenticated: boolean;
  isLoaded: boolean;
  setUserRole: (role: UserRole) => void;
  login: (token: string, name: string, email: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  userRole: 'Admin',
  userName: '',
  userEmail: '',
  isAuthenticated: false,
  isLoaded: false,
  setUserRole: () => {},
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRoleState] = useState<UserRole>('Admin');
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const storedRole = localStorage.getItem('user_role') as UserRole;
      const storedName = localStorage.getItem('user_name');
      const storedEmail = localStorage.getItem('user_email');

      if (token) {
        setIsAuthenticated(true);
        if (storedRole) setUserRoleState(storedRole);
        if (storedName) setUserName(storedName);
        if (storedEmail) setUserEmail(storedEmail);
      } else {
        setIsAuthenticated(false);
        setUserName('');
        setUserEmail('');
      }
      setIsLoaded(true);
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
      localStorage.setItem('user_email', email);
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
      localStorage.removeItem('user_email');
    }
    setUserName('');
    setUserEmail('');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        userRole,
        userName,
        userEmail,
        isAuthenticated,
        isLoaded,
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
