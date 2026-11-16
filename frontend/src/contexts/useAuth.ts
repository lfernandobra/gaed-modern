import { createContext, useContext } from "react";
import type { Usuario } from "../types";

export interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  login: (loginStr: string, senha: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
