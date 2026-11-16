import { useState, type ReactNode } from "react";
import type { Usuario } from "../types";
import api from "../lib/api";
import { AuthContext } from "./useAuth";

function readStoredUser(): Usuario | null {
  try {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    return savedToken && savedUser ? (JSON.parse(savedUser) as Usuario) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const loading = false;

  const login = async (loginStr: string, senha: string) => {
    const response = await api.post("/auth/login", {
      login: loginStr,
      senha,
    });
    const { token: newToken, usuario } = response.data;

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(usuario));
    setToken(newToken);
    setUser(usuario);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
