import { createContext } from "react";

export type User = {
  id: number;
  email: string;
  role: "ADMIN" | "DEPARTMENT";
  department?: string;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (data: { user: User; access_token: string }) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

// Re-export hook for consumers that incorrectly import from this file
export { useAuth } from "./useAuth";
