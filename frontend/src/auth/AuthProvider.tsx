import { useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const getStoredUser = (): User | null => {
    try {
      if (typeof window === "undefined") return null;
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const getStoredToken = (): string | null => {
    try {
      if (typeof window === "undefined") return null;
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const login = (data: { user: User; access_token: string }) => {
    setUser(data.user);
    setToken(data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.access_token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
