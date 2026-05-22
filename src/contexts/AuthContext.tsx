import React, { useEffect, useState, createContext, useContext } from 'react';
import { User, Role } from '../types';
import { mockUsers } from '../data/mockData';
import { loadFromStorage } from '../lib/storage';
interface AuthContextType {
  user: User | null;
  login: (email: string, role?: Role) => void;
  logout: () => void;
  register: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Load synchronously from localStorage to avoid an initial null flash
  // that would bounce authenticated users to /login on refresh.
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('parksmart_user');
      return storedUser ? JSON.parse(storedUser) as User : null;
    } catch (e) {
      console.error('Failed to parse stored user');
      return null;
    }
  });
  const login = (email: string, role?: Role) => {
    // Check seed accounts first, then any users created via registration (persisted by ParkingContext)
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
    // In a real app, this would send to backend
    // For demo, we just log them in immediately as pending
    setUser(newUser);
    localStorage.setItem('parksmart_user', JSON.stringify(newUser));
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
    </AuthContext.Provider>);

};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};