import React, { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { guestSession } from '@/shared/services/guestSession';

export interface User {
  id: string;
  username: string;
  email: string;
  /** Playing without an account: nothing is saved or ranked. */
  isGuest: boolean;
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
  const navigate = useNavigate();
  const guest = useSyncExternalStore(guestSession.subscribe, guestSession.get);

  // Signing in replaces a guest session for good
  useEffect(() => {
    if (clerkUser) guestSession.clear();
  }, [clerkUser]);

  const user = useMemo<User | null>(() => {
    if (clerkUser) {
      return {
        id: clerkUser.id,
        username: clerkUser.username ?? 'player',
        email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
        isGuest: false,
      };
    }
    if (isLoaded && guest) {
      return { id: guest.playerId, username: guest.username, email: '', isGuest: true };
    }
    return null;
  }, [clerkUser, guest, isLoaded]);

  const logout = useCallback(async () => {
    if (clerkUser) {
      await signOut({ redirectUrl: '/login' });
    } else {
      guestSession.clear();
      navigate('/login');
    }
    // Don't leak the previous player's cached data to the next login
    queryClient.clear();
  }, [clerkUser, signOut, navigate, queryClient]);

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
