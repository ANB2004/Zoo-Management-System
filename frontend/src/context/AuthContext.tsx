import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { api, ApiError, getTokens, setTokens, type Tokens } from "../api/client";

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getTokens()));

  const login = useCallback(async (username: string, password: string) => {
    try {
      const tokens = await api.post<Tokens>("/auth/login/", { username, password });
      setTokens(tokens);
      setIsAuthenticated(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        throw new Error("Incorrect username or password.");
      }
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setTokens(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
