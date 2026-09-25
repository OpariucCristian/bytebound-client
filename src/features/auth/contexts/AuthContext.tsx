import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useClerk, useUser } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';

export interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const queryClient = useQueryClient();

  const user = useMemo<User | null>(
    () =>
      clerkUser
        ? {
            id: clerkUser.id,
            username: clerkUser.username ?? 'player',
            email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
          }
        : null,
    [clerkUser],
  );

  const logout = useCallback(async () => {
    await signOut({ redirectUrl: '/login' });
    // Don't leak the previous player's cached data to the next login
    queryClient.clear();
  }, [signOut, queryClient]);

  const value = useMemo(
    () => ({ user, logout, isLoading: !isLoaded }),
    [user, logout, isLoaded],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
