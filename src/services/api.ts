
import { User, TimeRecord, ChangeRequest } from "@/types";
import { getCurrentDate, getCurrentTime, isValidTimeRange } from "@/lib/utils";
import { toast } from "sonner";
import { users as mockUsers, timeRecords as mockTimeRecords, changeRequests as mockChangeRequests } from "@/lib/mock-data";

// Usando cópias dos dados para permitir alterações em tempo de execução
let users = [...mockUsers];
let timeRecords = [...mockTimeRecords];
let changeRequests = [...mockChangeRequests];

// Função para gerar IDs únicos (simulando banco de dados)
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// User related API functions
export const authService = {
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      // Simulando um pequeno atraso de rede (300ms)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Encontra um usuário com o email correspondente e que esteja ativo
      const user = users.find(u => u.email === email && u.active);
      
      if (!user) {
        console.error("Usuário não encontrado ou inativo");
        return null;
      }
      
      // Simulação simples: para dsv4@bremen.com.br, aceita senha "123"
      // Para outros, qualquer senha seria aceita para facilitar o teste
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
      // Retorna todos os usuários ordenados pelo nome
      return [...users].sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error("Erro ao buscar todos os usuários:", error);
      return [];
    }
  },
  
  createUser: async (name: string, email: string, role: string): Promise<User | null> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verifica se já existe um usuário com o mesmo email
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
      
      // Atualiza o usuário para inativo
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

// Time records related API functions
export const timeRecordService = {
  // Get all records
  getAllRecords: async (): Promise<TimeRecord[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Ordenar por data e hora de entrada (decrescente)
      return [...timeRecords].sort((a, b) => {
        // Primeiro compara por data
        const dateComparison = b.date.localeCompare(a.date);
        if (dateComparison !== 0) return dateComparison;
        
        // Se a data for a mesma, compara por hora de entrada
        return b.checkIn.localeCompare(a.checkIn);
      });
    } catch (error) {
      console.error("Erro ao buscar todos os registros:", error);
      return [];
    }
  },
  
  // Get records between dates (for all users - admin only)
  getAllRecordsBetweenDates: async (startDate: string, endDate: string): Promise<TimeRecord[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return [...timeRecords]
        .filter(record => {
          return record.date >= startDate && record.date <= endDate;
        })
        .sort((a, b) => {
          // Ordenar por data decrescente
          const dateComparison = b.date.localeCompare(a.date);
          if (dateComparison !== 0) return dateComparison;
          
          // Se a data for a mesma, ordenar por hora de entrada decrescente
          return b.checkIn.localeCompare(a.checkIn);
        });
    } catch (error) {
      console.error("Erro ao buscar registros por intervalo de datas:", error);
      return [];
    }
  },

  // Get records for a specific user
  getUserRecords: async (userId: string): Promise<TimeRecord[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return [...timeRecords]
        .filter(record => record.userId === userId)
        .sort((a, b) => {
          // Ordenar por data decrescente
          const dateComparison = b.date.localeCompare(a.date);
          if (dateComparison !== 0) return dateComparison;
          
          // Se a data for a mesma, ordenar por hora de entrada decrescente
          return b.checkIn.localeCompare(a.checkIn);
        });
    } catch (error) {
      console.error("Erro ao buscar registros do usuário:", error);
      return [];
    }
  },
  
  // Get user records between dates
  getUserRecordsBetweenDates: async (userId: string, startDate: string, endDate: string): Promise<TimeRecord[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return [...timeRecords]
        .filter(record => {
          return record.userId === userId && record.date >= startDate && record.date <= endDate;
        })
        .sort((a, b) => {
          // Ordenar por data decrescente
          const dateComparison = b.date.localeCompare(a.date);
          if (dateComparison !== 0) return dateComparison;
          
          // Se a data for a mesma, ordenar por hora de entrada decrescente
          return b.checkIn.localeCompare(a.checkIn);
        });
    } catch (error) {
      console.error("Erro ao buscar registros do usuário por intervalo de datas:", error);
      return [];
    }
  },

  // Get today's records for a user
  getTodayRecords: async (userId: string): Promise<TimeRecord[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const today = getCurrentDate();
      return [...timeRecords]
        .filter(record => record.userId === userId && record.date === today)
        .sort((a, b) => b.checkIn.localeCompare(a.checkIn));
    } catch (error) {
      console.error("Erro ao buscar registros de hoje:", error);
      return [];
    }
  },

  // Get active record (check in without check out)
  getActiveRecord: async (userId: string): Promise<TimeRecord | null> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const today = getCurrentDate();
      const activeRecord = timeRecords.find(
        record => record.userId === userId && record.date === today && record.checkOut === null
      );
      
      return activeRecord || null;
    } catch (error) {
      console.error("Erro ao buscar registro ativo:", error);
      return null;
    }
  },

  // Check if user has an active check-in
  hasActiveCheckIn: async (userId: string): Promise<boolean> => {
    const activeRecord = await timeRecordService.getActiveRecord(userId);
    return activeRecord !== null;
  },

  // Create a new check-in record
  checkIn: async (userId: string, notes?: string): Promise<TimeRecord | null> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check if there is an active check-in without check-out
      const hasActive = await timeRecordService.hasActiveCheckIn(userId);
      
      if (hasActive) {
        console.error("Usuário já possui um registro de entrada ativo");
        return null;
      }

      const today = getCurrentDate();
      const now = getCurrentTime();

      const newRecord: TimeRecord = {
        id: generateId(),
        userId,
        date: today,
        checkIn: now,
        checkOut: null,
        notes
      };
      
      timeRecords.push(newRecord);
      console.log("Nova entrada registrada:", newRecord);
      
      return newRecord;
    } catch (error) {
      console.error("Erro ao registrar entrada:", error);
      return null;
    }
  },

  // Register a check-out
  checkOut: async (userId: string, recordId: string, notes?: string): Promise<TimeRecord | null> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get current record to see if it can be updated
      const recordIndex = timeRecords.findIndex(r => r.id === recordId);
      
      if (recordIndex === -1) {
        console.error("Registro não encontrado para saída:", recordId);
        return null;
      }
      
      const record = timeRecords[recordIndex];
      
      if (record.checkOut) {
        console.error("Registro já possui horário de saída");
        return null;
      }

      const checkOutTime = getCurrentTime();
      
      // Validate time range
      if (!isValidTimeRange(record.checkIn, checkOutTime)) {
        console.error("Intervalo de tempo inválido: saída antes da entrada");
        return null;
      }

      // Update the record
      const updatedRecord = {
        ...record,
        checkOut: checkOutTime,
        notes: notes || record.notes
      };
      
      timeRecords[recordIndex] = updatedRecord;
      console.log("Registro de saída atualizado:", updatedRecord);
      
      return updatedRecord;
    } catch (error) {
      console.error("Erro durante o registro de saída:", error);
      return null;
    }
  }
};

// Change requests related API functions
export const changeRequestService = {
  // Get all pending change requests
  getPendingRequests: async (): Promise<ChangeRequest[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return [...changeRequests]
        .filter(request => request.status === 'pending')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch (error) {
      console.error("Erro ao buscar solicitações pendentes:", error);
      return [];
    }
  },

  // Create a new change request
  createChangeRequest: async (
    recordId: string,
    userId: string,
    userName: string,
    suggestedCheckIn: string,
    suggestedCheckOut: string | null,
    reason: string
  ): Promise<ChangeRequest | null> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get the original record first
      const record = timeRecords.find(r => r.id === recordId);
      
      if (!record) {
        console.error("Registro original não encontrado:", recordId);
        return null;
      }
      
      // Validate time range if both values are provided
      if (suggestedCheckIn && suggestedCheckOut && !isValidTimeRange(suggestedCheckIn, suggestedCheckOut)) {
        console.error("Intervalo de tempo inválido para solicitação de alteração");
        return null;
      }

      const now = new Date().toISOString();
      const newRequest: ChangeRequest = {
        id: generateId(),
        recordId,
        userId,
        userName,
        originalCheckIn: record.checkIn,
        originalCheckOut: record.checkOut,
        suggestedCheckIn,
        suggestedCheckOut,
        date: record.date,
        reason,
        status: 'pending',
        createdAt: now
      };
      
      changeRequests.push(newRequest);
      console.log("Nova solicitação de alteração criada:", newRequest);
      
      return newRequest;
    } catch (error) {
      console.error("Erro ao criar solicitação de alteração:", error);
      return null;
    }
  },

  // Approve a change request
  approveChangeRequest: async (requestId: string): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // First get the change request
      const requestIndex = changeRequests.findIndex(r => r.id === requestId);
      
      if (requestIndex === -1) {
        console.error("Solicitação de alteração não encontrada:", requestId);
        return false;
      }

      const request = changeRequests[requestIndex];
      
      // Update the change request status
      changeRequests[requestIndex] = {
        ...request,
        status: 'approved'
      };
      
      // Update the time record
      const recordIndex = timeRecords.findIndex(r => r.id === request.recordId);
      
      if (recordIndex === -1) {
        console.error("Registro de tempo não encontrado:", request.recordId);
        return false;
      }
      
      timeRecords[recordIndex] = {
        ...timeRecords[recordIndex],
        checkIn: request.suggestedCheckIn,
        checkOut: request.suggestedCheckOut
      };
      
      console.log("Solicitação de alteração aprovada:", requestId);
      return true;
    } catch (error) {
      console.error("Erro ao aprovar solicitação de alteração:", error);
      return false;
    }
  },

  // Reject a change request
  rejectChangeRequest: async (requestId: string): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const requestIndex = changeRequests.findIndex(r => r.id === requestId);
      
      if (requestIndex === -1) {
        console.error("Solicitação de alteração não encontrada:", requestId);
        return false;
      }
      
      changeRequests[requestIndex] = {
        ...changeRequests[requestIndex],
        status: 'rejected'
      };
      
      console.log("Solicitação de alteração rejeitada:", requestId);
      return true;
    } catch (error) {
      console.error("Erro ao rejeitar solicitação de alteração:", error);
      return false;
    }
  }
};
