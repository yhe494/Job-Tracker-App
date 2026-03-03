import React, { useEffect, useState } from "react";
import * as authApi from "./authApi";

import { AuthContext } from "./authContext";

export type AuthContextType = {
  user: authApi.PublicUser | null;
  loading: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { email: string; password: string; name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<authApi.PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadMe(): Promise<void> {
    const me = await authApi.me();
    // Map backend /me shape (userId, email) into PublicUser
    setUser({ id: me.userId, email: me.email });
  }

  async function login(input: { email: string; password: string }): Promise<void> {
    const user = await authApi.login(input);
    setUser(user);
  }

  async function register(input: { email: string; password: string; name?: string }): Promise<void> {
    const user = await authApi.register(input);
    setUser(user);
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  async function refresh() {
    await authApi.refresh();
  }

  useEffect(() => {
    (async () => {
      try {
        await refresh();
        await loadMe();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}