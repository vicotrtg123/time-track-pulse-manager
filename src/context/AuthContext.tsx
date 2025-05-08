
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { User } from "@/types";
import { authService } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!currentUser;

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      
      // Check if we have a session stored
      const user = localStorage.getItem('currentUser');
      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          setCurrentUser(parsedUser);
        } catch (error) {
          console.error("Error parsing stored user:", error);
          localStorage.removeItem('currentUser');
        }
      }
      
      setIsLoading(false);
    };
    
    checkUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // In a real implementation, this would authenticate using Supabase Auth
      // For now, we're just using our mocked auth service
      const user = await authService.login(email, password);
      
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAuthenticated,
        isLoading
      }}
    >
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
