"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearToken, getToken } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import type { LoginPayload, RegisterPayload, User } from "@/types/commerce";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const profile = await apiClient.me();
      setUser(profile);
      return profile;
    } catch {
      clearToken();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      void refreshUser().finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });
    });

    return () => {
      active = false;
    };
  }, [refreshUser]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await apiClient.login(payload);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await apiClient.register(payload);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    await apiClient.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
