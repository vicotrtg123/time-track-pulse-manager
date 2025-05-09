
import { User } from "@/types";
import { toast } from "sonner";
import { users as mockUsers } from "@/lib/mock-data";

// Using a copy of the data to allow runtime changes
let users = [...mockUsers];

// Function to generate IDs (simulating database)
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const authService = {
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      // Simulating a small network delay (300ms)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Find user with matching email who is active
      const user = users.find(u => u.email === email && u.active);
      
      if (!user) {
        console.error("Usuário não encontrado ou inativo");
        return null;
      }
      
      // Simple simulation: for dsv4@bremen.com.br, accepts password "123"
      // For others, any password would be accepted for testing
      if (user.email === "dsv4@bremen.com.br" && password !== "123") {
        console.error("Senha incorreta para usuário admin");
        return null;
      }
      
      console.log("Usuário autenticado:", user);
      return user;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return null;
    }
  },

  getUserById: async (userId: string): Promise<User | null> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
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
      await new Promise(resolve => setTimeout(resolve, 200));
      // Return all users ordered by name
      return [...users].sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error("Erro ao buscar todos os usuários:", error);
      return [];
    }
  },
  
  createUser: async (name: string, email: string, role: string): Promise<User | null> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check if a user with the same email already exists
      if (users.some(u => u.email === email)) {
        console.error("Já existe um usuário com este email");
        throw new Error("Já existe um usuário com este email");
      }
      
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
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        console.error("Usuário não encontrado para desativar:", userId);
        throw new Error("Usuário não encontrado");
      }
      
      // Update user to inactive
      users[userIndex] = {
        ...users[userIndex],
        active: false
      };
      
      console.log("Usuário desativado:", userId);
      return true;
    } catch (error) {
      console.error("Erro ao desativar usuário:", error);
      throw error;
    }
  }
};
