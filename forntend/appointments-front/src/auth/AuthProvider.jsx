import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiLogin, apiLogout, apiMe } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // para evitar parpadeos
  const isAuthenticated = !!localStorage.getItem("ACCESS_TOKEN");

  useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        if (!isAuthenticated) {
          if (mounted) setUser(null);
          return;
        }
        const me = await apiMe();
        if (mounted) setUser(me);
      } catch {
        // token inválido/expirado
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    boot();
    return () => (mounted = false);
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user, // basado en /me 
      async login(credentials) {
        await apiLogin(credentials);
        const me = await apiMe();
        setUser(me);
        return me;
      },
      async logout() {
        await apiLogout();
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}