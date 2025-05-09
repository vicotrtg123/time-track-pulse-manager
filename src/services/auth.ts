
import { User } from "@/types";
import { toast } from "sonner";
import { users as mockUsers } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";

// Using a copy of the data to allow runtime changes
let users = [...mockUsers];

// Function to generate IDs (simulating database)
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const authService = {
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      // Authenticate using Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Erro ao fazer login:", error);
        return null;
      }
      
      if (data.user) {
        // Get user data from Supabase
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error("Erro ao buscar perfil do usuário:", profileError);
          // Fallback to mock users if profile fetch fails
          const mockUser = users.find(u => u.email === email && u.active);
          return mockUser || null;
        }
        
        if (profileData) {
          const userData: User = {
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            role: profileData.role as "admin" | "employee",
            active: profileData.active,
            avatar: profileData.avatar
          };
          
          return userData;
        }
      }
      
      // Fallback to mock implementation
      const mockUser = users.find(u => u.email === email && u.active);
      
      if (!mockUser) {
        console.error("Usuário não encontrado ou inativo");
        return null;
      }
      
      // Simple simulation: for dsv4@bremen.com.br, accepts password "123"
      if (mockUser.email === "dsv4@bremen.com.br" && password !== "123") {
        console.error("Senha incorreta para usuário admin");
        return null;
      }
      
      console.log("Usuário autenticado:", mockUser);
      return mockUser;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return null;
    }
  },

  getUserById: async (userId: string): Promise<User | null> => {
    try {
      // First try to get the user from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!profileError && profileData) {
        return {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          role: profileData.role as "admin" | "employee",
          active: profileData.active,
          avatar: profileData.avatar
        };
      }
      
      // Fallback to mock data
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        console.error("Usuário não encontrado pelo ID:", userId);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      return null;
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      // Get users from Supabase
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
      
      if (!profilesError && profilesData) {
        return profilesData.map(profile => ({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as "admin" | "employee",
          active: profile.active,
          avatar: profile.avatar
        }));
      }
      
      // Fallback to mock data
      return [...users].sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error("Erro ao buscar todos os usuários:", error);
      return [];
    }
  },
  
  createUser: async (name: string, email: string, role: string): Promise<User | null> => {
    try {
      // Check if a user with the same email already exists in Supabase
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email);
        
      if (!checkError && existingUsers && existingUsers.length > 0) {
        console.error("Já existe um usuário com este email");
        throw new Error("Já existe um usuário com este email");
      }
      
      // Note: The actual user creation happens in AddEmployeeDialog.tsx
      // via supabase.auth.signUp, and a trigger in Supabase creates the profile
      
      // For backward compatibility, also add to mock users
      const newUser: User = {
        id: generateId(),
        name,
        email,
        role: role as "admin" | "employee",
        active: true
      };
      
      users.push(newUser);
      console.log("Novo usuário criado:", newUser);
      
      return newUser;
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      throw error;
    }
  },
  
  disableUser: async (userId: string): Promise<boolean> => {
    try {
      // Update user status in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ active: false })
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
      
      // Also update in mock data for backward compatibility
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          active: false
        };
      }
      
      console.log("Usuário desativado:", userId);
      return true;
    } catch (error) {
      console.error("Erro ao desativar usuário:", error);
      throw error;
    }
  }
};
