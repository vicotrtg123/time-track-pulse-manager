
import { TimeRecord } from "@/types";
import { getCurrentDate, getCurrentTime, isValidTimeRange } from "@/lib/utils";
import { timeRecords as mockTimeRecords } from "@/lib/mock-data";

// Using a copy of the data to allow runtime changes
let timeRecords = [...mockTimeRecords];

// Function to generate IDs (simulating database)
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Time records related API functions
export const timeRecordService = {
  // Get all records
  getAllRecords: async (): Promise<TimeRecord[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Sort by date and check-in time (descending)
      return [...timeRecords].sort((a, b) => {
        // First compare by date
        const dateComparison = b.date.localeCompare(a.date);
        if (dateComparison !== 0) return dateComparison;
        
        // If date is the same, compare by check-in time
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
          // Sort by descending date
          const dateComparison = b.date.localeCompare(a.date);
          if (dateComparison !== 0) return dateComparison;
          
          // If date is the same, sort by descending check-in time
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
          // Sort by descending date
          const dateComparison = b.date.localeCompare(a.date);
          if (dateComparison !== 0) return dateComparison;
          
          // If date is the same, sort by descending check-in time
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
          // Sort by descending date
          const dateComparison = b.date.localeCompare(a.date);
          if (dateComparison !== 0) return dateComparison;
          
          // If date is the same, sort by descending check-in time
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
