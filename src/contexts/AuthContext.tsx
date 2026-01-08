import { createContext, useContext, useState, ReactNode } from "react";

export interface AuthUser {
  name: string;
  email: string;
  initials: string;
  joinedDate: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => void;
  signUp: (name: string, email: string, password: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  });

  const signIn = (email: string, _password: string) => {
    // For now, create user from email
    const name = email.split("@")[0];
    const initials = name.slice(0, 2).toUpperCase();
    const newUser: AuthUser = {
      name,
      email,
      initials,
      joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    };
    setUser(newUser);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
  };

  const signUp = (name: string, email: string, _password: string) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const newUser: AuthUser = {
      name,
      email,
      initials,
      joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    };
    setUser(newUser);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signIn, signUp, signOut }}>
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
