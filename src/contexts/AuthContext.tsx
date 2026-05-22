import React, { useEffect, useState, createContext, useContext } from 'react';
import { User, Role } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: { name: string; email: string; password: string; role: Role; vehiclePlate?: string; vehicleModel?: string }) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('parksmart_user');
      if (!stored) return null;
      const parsed = JSON.parse(stored) as User;
      if (parsed.status === 'PENDING' || parsed.status === 'REJECTED') return null;
      return parsed;
    } catch {
      return null;
    }
  });

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const { token, user: u } = await api.login(email, password);
      localStorage.setItem('parksmart_token', token);
      localStorage.setItem('parksmart_user', JSON.stringify(u));
      setUser(u);
    } catch (err: any) {
      const code = err.code || err.message;
      throw new Error(code);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('parksmart_token');
    localStorage.removeItem('parksmart_user');
  };

  const register = async (userData: {
    name: string; email: string; password: string; role: Role;
    vehiclePlate?: string; vehicleModel?: string;
  }): Promise<void> => {
    try {
      await api.register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        vehiclePlate: userData.vehiclePlate,
        vehicleModel: userData.vehicleModel
      });
    } catch (err: any) {
      throw new Error(err.code || err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
