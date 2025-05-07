
import React, { createContext, useState, useContext, ReactNode } from "react";
import { User } from "@/types";
import { authService } from "@/services/api";
import { toast } from "sonner";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const login = (email: string, password: string): boolean => {
    const user = authService.login(email, password);
    
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      toast.success(`Bem-vindo, ${user.name}!`);
      return true;
    }
    
    toast.error("Email ou senha inválidos");
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    toast.info("Logout realizado com sucesso");
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
