
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
          
          // Try to get user profile from Supabase
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .maybeSingle();
          
          if (profileData) {
            // Use profile data from Supabase
            const userData: User = {
              id: profileData.id,
              name: profileData.name,
              email: profileData.email,
              role: profileData.role as "admin" | "employee",
              active: profileData.active,
              avatar: profileData.avatar
            };
            
            setCurrentUser(userData);
            localStorage.setItem('currentUser', JSON.stringify(userData));
          } else {
            // Fallback to basic user data from auth
            const userData = await authService.getUserById(supabaseUser.id) || {
              id: supabaseUser.id,
              name: supabaseUser.email?.split('@')[0] || 'User', 
              email: supabaseUser.email || '',
              role: 'employee',
              active: true
            };
            
            setCurrentUser(userData);
            localStorage.setItem('currentUser', JSON.stringify(userData));
          }
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
        if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          // Using setTimeout to avoid Supabase auth deadlocks
          setTimeout(async () => {
            try {
              const supabaseUser = session.user;
              
              // Try to get user profile from Supabase
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', supabaseUser.id)
                .maybeSingle();
              
              if (profileData) {
                // Special case for dsv4@bremen.com.br - ensure it's admin
                if (profileData.email === "dsv4@bremen.com.br" && profileData.role !== "admin") {
                  // Update the role in Supabase
                  await supabase
                    .from('profiles')
                    .update({ role: "admin" })
                    .eq('email', "dsv4@bremen.com.br");
                    
                  profileData.role = "admin";
                }
                
                const userData: User = {
                  id: profileData.id,
                  name: profileData.name,
                  email: profileData.email,
                  role: profileData.role as "admin" | "employee",
                  active: profileData.active,
                  avatar: profileData.avatar
                };
                
                setCurrentUser(userData);
                localStorage.setItem('currentUser', JSON.stringify(userData));
              } else {
                // Fallback to basic user data
                const userData = await authService.getUserById(supabaseUser.id) || {
                  id: supabaseUser.id,
                  name: supabaseUser.email?.split('@')[0] || 'User',
                  email: supabaseUser.email || '',
                  role: 'employee',
                  active: true
                };
                
                // Special case for dsv4@bremen.com.br - ensure it's admin
                if (userData.email === "dsv4@bremen.com.br" && userData.role !== "admin") {
                  userData.role = "admin";
                }
                
                setCurrentUser(userData);
                localStorage.setItem('currentUser', JSON.stringify(userData));
              }
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
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && currentUser) {
        // Try to get user profile from Supabase
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();
          
        if (profileData) {
          // Special case for dsv4@bremen.com.br - ensure it's admin
          if (profileData.email === "dsv4@bremen.com.br" && profileData.role !== "admin") {
            await supabase
              .from('profiles')
              .update({ role: "admin" })
              .eq('email', "dsv4@bremen.com.br");
              
            profileData.role = "admin";
          }
          
          const updatedUser: User = {
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            role: profileData.role as "admin" | "employee",
            active: profileData.active,
            avatar: profileData.avatar
          };
          
          setCurrentUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        } else {
          // Fallback to getting users from service
          const users = await authService.getAllUsers();
          const updatedUser = users.find(user => user.id === currentUser.id);
          if (updatedUser) {
            // Special case for dsv4@bremen.com.br - ensure it's admin
            if (updatedUser.email === "dsv4@bremen.com.br" && updatedUser.role !== "admin") {
              updatedUser.role = "admin";
            }
            
            setCurrentUser(updatedUser);
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          }
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
        // Special case for dsv4@bremen.com.br - ensure it's admin
        if (data.user.email === "dsv4@bremen.com.br") {
          // Check if profile exists and has admin role
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
            
          if (profileData && profileData.role !== "admin") {
            // Update to admin role
            await supabase
              .from('profiles')
              .update({ role: "admin" })
              .eq('id', data.user.id);
          }
        }
        
        // Get user data from service (which now includes Supabase integration)
        const userData = await authService.getUserById(data.user.id);
        
        if (userData) {
          setCurrentUser(userData);
          localStorage.setItem('currentUser', JSON.stringify(userData));
          return true;
        }
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
