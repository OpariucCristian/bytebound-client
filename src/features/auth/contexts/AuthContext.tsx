import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useAuthHook, User, SignupResult } from '@/features/auth/hooks/useAuth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, username: string, password: string) => Promise<SignupResult>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const auth = useAuthHook();

  useEffect(() => {
    // Initial load complete
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      return await auth.login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (email: string, username: string, password: string) => {
    try {
      return await auth.signup(email, username, password);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    await auth.logout();
  };

  const updateUser = (updatedUser: User) => {
    console.debug('Updating user:', updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user: auth.user, login, signup, logout, updateUser, isLoading }}>
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
