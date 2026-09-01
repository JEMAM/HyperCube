"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePreferences } from "./PreferencesContext";

export interface UserProfile {
  id: number | string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  token?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, company?: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickDemoLogin: () => Promise<void>;
  savedTestAccounts: Array<{ email: string; label: string; role: string; password: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ACCOUNTS = [
  {
    email: "admin@hypercube.com",
    label: "Diretoria FP&A (Admin)",
    role: "Diretor de Planejamento (FP&A)",
    password: "admin123"
  },
  {
    email: "demo@hypercube.com",
    label: "Analista Financeiro",
    role: "Analista Financeiro Sênior",
    password: "demo123"
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { apiBaseUrl } = usePreferences();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore saved session on mount
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem("hypercube_auth_user");
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not restore saved auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistUserSession = (userProfile: UserProfile) => {
    setUser(userProfile);
    try {
      localStorage.setItem("hypercube_auth_user", JSON.stringify(userProfile));
    } catch (e) {
      console.warn("Could not persist auth session:", e);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    email = email.trim().toLowerCase();
    if (!email || !password) {
      return { success: false, error: "Preencha e-mail e senha." };
    }

    try {
      // 1. Try FastAPI backend SQLite endpoint
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const profile: UserProfile = {
          ...data.user,
          token: data.token
        };
        persistUserSession(profile);
        return { success: true };
      }

      // If backend responded with 401
      if (res.status === 401) {
        // Check if there is a local browser fallback user registered in offline mode
        const offlineUsersStr = localStorage.getItem("hypercube_offline_users");
        if (offlineUsersStr) {
          const offlineUsers = JSON.parse(offlineUsersStr);
          const found = offlineUsers.find((u: any) => u.email === email && u.password === password);
          if (found) {
            persistUserSession(found);
            return { success: true };
          }
        }
        return { success: false, error: "Credenciais inválidas. Verifique o e-mail e a senha." };
      }
    } catch (err: any) {
      console.warn("Backend login failed or unreachable, checking local demo & offline accounts:", err?.message);
    }

    // 2. Resilient Fallback: Demo accounts & LocalStorage user registry
    const demo = DEMO_ACCOUNTS.find(d => d.email === email && d.password === password);
    if (demo) {
      const profile: UserProfile = {
        id: "demo-local",
        name: demo.label,
        email: demo.email,
        company: "HyperCube Matriz",
        role: demo.role,
        token: `demo_token_${demo.email}`
      };
      persistUserSession(profile);
      return { success: true };
    }

    // Check custom offline users registered
    try {
      const offlineUsersStr = localStorage.getItem("hypercube_offline_users");
      if (offlineUsersStr) {
        const offlineUsers = JSON.parse(offlineUsersStr);
        const found = offlineUsers.find((u: any) => u.email === email && u.password === password);
        if (found) {
          persistUserSession(found);
          return { success: true };
        }
      }
    } catch (_) {}

    // Allow ANY login for test if requested by user
    const profile: UserProfile = {
      id: Date.now(),
      name: email.split("@")[0].replace(".", " ").toUpperCase(),
      email: email,
      company: "Empresa de Teste",
      role: "Planejador FP&A",
      token: `local_token_${Date.now()}`
    };
    persistUserSession(profile);
    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    company: string = "Empresa de Teste",
    role: string = "Planejador FP&A"
  ): Promise<{ success: boolean; error?: string }> => {
    name = name.trim() || "Usuário de Teste";
    email = email.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return { success: false, error: "Insira um endereço de e-mail válido." };
    }
    if (!password || password.length < 3) {
      return { success: false, error: "A senha deve conter ao menos 3 caracteres." };
    }

    try {
      // 1. Send to FastAPI backend SQLite
      const res = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, company, role }),
      });

      if (res.ok) {
        const data = await res.json();
        const profile: UserProfile = {
          ...data.user,
          token: data.token
        };
        persistUserSession(profile);
        return { success: true };
      }
    } catch (err: any) {
      console.warn("Backend register unreachable, saving locally in browser storage:", err?.message);
    }

    // 2. Offline / resilient registration fallback (permite qualquer cadastro para teste)
    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      name,
      email,
      company,
      role,
      token: `local_token_${Date.now()}`
    };

    // Save in offline users list
    try {
      const offlineUsersStr = localStorage.getItem("hypercube_offline_users") || "[]";
      const offlineUsers = JSON.parse(offlineUsersStr);
      offlineUsers.push({ ...profile, password });
      localStorage.setItem("hypercube_offline_users", JSON.stringify(offlineUsers));
    } catch (e) {
      console.warn("Offline user storage error:", e);
    }

    persistUserSession(profile);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("hypercube_auth_user");
    } catch (e) {}
  };

  const quickDemoLogin = async () => {
    const demo = DEMO_ACCOUNTS[0];
    await login(demo.email, demo.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        quickDemoLogin,
        savedTestAccounts: DEMO_ACCOUNTS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
