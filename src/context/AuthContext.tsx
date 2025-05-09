
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { User } from "@/types";
import { authService } from "@/services";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!currentUser;

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      
      try {
        // Check for existing Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const supabaseUser = session.user;
          const userData = await authService.getUserById(supabaseUser.id) || {
            id: supabaseUser.id,
            name: supabaseUser.email?.split('@')[0] || 'User', 
            email: supabaseUser.email || '',
            role: 'employee',
            active: true
          };
          
          setCurrentUser(userData);
          localStorage.setItem('currentUser', JSON.stringify(userData));
        } else {
          setCurrentUser(null);
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.error("Error checking user session:", error);
        localStorage.removeItem('currentUser');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Handle auth state changes
        if (session && event === 'SIGNED_IN') {
          // Using setTimeout to avoid Supabase auth deadlocks
          setTimeout(async () => {
            try {
              const supabaseUser = session.user;
              const userData = await authService.getUserById(supabaseUser.id) || {
                id: supabaseUser.id,
                name: supabaseUser.email?.split('@')[0] || 'User',
                email: supabaseUser.email || '',
                role: 'employee',
                active: true
              };
              
              setCurrentUser(userData);
              localStorage.setItem('currentUser', JSON.stringify(userData));
            } catch (error) {
              console.error("Error getting user data:", error);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          localStorage.removeItem('currentUser');
        }
      }
    );
    
    checkUser();
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Add the refreshUser function
  const refreshUser = async (): Promise<void> => {
    try {
      const users = await authService.getAllUsers();
      if (currentUser) {
        const updatedUser = users.find(user => user.id === currentUser.id);
        if (updatedUser) {
          setCurrentUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Authenticate using Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Get user data from our service
        const userData = await authService.getUserById(data.user.id) || {
          id: data.user.id,
          name: data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          role: 'admin',  // Default to admin for new Supabase users
          active: true
        };
        
        setCurrentUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
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

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAuthenticated,
        isLoading,
        refreshUser
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
