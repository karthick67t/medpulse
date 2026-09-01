import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../api/client';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  demoMode: boolean;
  toasts: Toast[];
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  setRole: (role: UserRole) => void;
  toggleDemoMode: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('caretrack_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('caretrack_role') as UserRole) || 'Doctor';
  });

  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const u = await api.login(email, pass);
      setUser(u);
      setRoleState(u.role as UserRole);
      localStorage.setItem('caretrack_user', JSON.stringify(u));
      localStorage.setItem('caretrack_role', u.role);
      addToast(`Welcome back, ${u.name}!`, 'success');
      return true;
    } catch (err) {
      addToast('Invalid email or password. Try demo credentials: admin@caretrack.ai / demo123', 'error');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('caretrack_user');
    localStorage.removeItem('caretrack_role');
    addToast('Logged out safely.', 'info');
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('caretrack_role', newRole);
    addToast(`Role switched to ${newRole}`, 'info');
  };

  const toggleDemoMode = () => {
    setDemoMode(prev => !prev);
    addToast(`Demo Mode ${!demoMode ? 'enabled' : 'disabled'}`, 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        demoMode,
        toasts,
        login,
        logout,
        setRole,
        toggleDemoMode,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
