import React, { useEffect, useState, createContext, useContext } from 'react';
import { User, Role } from '../types';
import { mockUsers } from '../data/mockData';
import { loadFromStorage, saveToStorage } from '../lib/storage';

interface AuthContextType {
  user: User | null;
  login: (email: string, role?: Role) => void;
  logout: () => void;
  register: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('parksmart_user');
      if (!storedUser) return null;
      const parsed = JSON.parse(storedUser) as User;
      if (parsed.status === 'PENDING' || parsed.status === 'REJECTED') return null;
      return parsed;
    } catch (e) {
      console.error('Failed to parse stored user');
      return null;
    }
  });

  const login = (email: string, role?: Role) => {
    let foundUser: User | undefined = mockUsers.find((u) => u.email === email);
    if (!foundUser) {
      const persistedUsers = loadFromStorage<User[]>('users', mockUsers);
      foundUser = persistedUsers.find((u) => u.email === email);
    }
    if (!foundUser && role) {
      foundUser = mockUsers.find((u) => u.role === role);
    }
    if (!foundUser) {
      throw new Error('NOT_FOUND');
    }
    if (foundUser.status === 'PENDING') {
      throw new Error('PENDING');
    }
    if (foundUser.status === 'REJECTED') {
      throw new Error('REJECTED');
    }
    setUser(foundUser);
    localStorage.setItem('parksmart_user', JSON.stringify(foundUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('parksmart_user');
  };

  const register = (userData: Partial<User>) => {
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: userData.name || 'New User',
      email: userData.email || '',
      role: userData.role || 'USER',
      status: 'PENDING',
      vehiclePlate: userData.vehiclePlate,
      vehicleModel: userData.vehicleModel
    };

    const existingUsers = loadFromStorage<User[]>('users', mockUsers);
    const emailExists = existingUsers.some((u) => u.email === newUser.email) ||
      mockUsers.some((u) => u.email === newUser.email);
    if (emailExists) {
      throw new Error('EMAIL_EXISTS');
    }

    saveToStorage('users', [...existingUsers, newUser]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        isAuthenticated: !!user
      }}>
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
