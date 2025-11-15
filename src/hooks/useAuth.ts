import { useState, useCallback } from "react";
import supabase from "@/utils/supabase";

export interface User {
  id: string;
  email: string;
  username: string;
  level: number;
  xp: number;
  totalXp: number;
  user_metadata: {
    username?: string;
  }
}

export interface SignupResult {
  user: User | null;
  needsEmailConfirmation: boolean;
  email?: string;
}

const STORAGE_KEY = "bytebound_user";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const userStr = localStorage.getItem(STORAGE_KEY);
    return userStr ? JSON.parse(userStr) : null;
  });

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        throw new Error(error?.message || "Invalid credentials");
      }

      const userData = data.user as unknown as User;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      return userData;
    },
    []
  );

  const signup = useCallback(
    async (
      email: string,
      username: string,
      password: string
    ): Promise<SignupResult> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (error || !data.user) {
        throw new Error(error?.message || "Signup failed");
      }

      // Check if session was created (email confirmation disabled)
      // If email confirmation is enabled, data.session will be null
      if (!data.session) {
        // Email confirmation required
        return {
          user: null,
          needsEmailConfirmation: true,
          email: email,
        };
      }

      // Session created - user can proceed immediately
      const userData = data.user as unknown as User;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      return {
        user: userData,
        needsEmailConfirmation: false,
      };
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const getCurrentUser = useCallback((): User | null => {
    return user;
  }, [user]);

  const updateUserProgress = useCallback(
    async (xpGained: number): Promise<User> => {
      if (!user) {
        throw new Error("No user logged in");
      }

      const newTotalXp = user.totalXp + xpGained;
      const xpPerLevel = 500;
      const newLevel = Math.floor(newTotalXp / xpPerLevel) + 1;
      const xpInCurrentLevel = newTotalXp % xpPerLevel;

      const updatedUser: User = {
        ...user,
        level: newLevel,
        xp: xpInCurrentLevel,
        totalXp: newTotalXp,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    },
    [user]
  );

  return {
    user,
    login,
    signup,
    logout,
    getCurrentUser,
    updateUserProgress,
  };
};
