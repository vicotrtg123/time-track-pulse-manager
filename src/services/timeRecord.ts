
import { TimeRecord } from "@/types";
import { getCurrentDate, getCurrentTime, isValidTimeRange } from "@/lib/utils";
import { timeRecords as mockTimeRecords } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";

// Using a copy of the data to allow runtime changes
let timeRecords = [...mockTimeRecords];

// Function to generate IDs (simulating database)
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper function to transform Supabase record to our TimeRecord type
const transformRecord = (record: any): TimeRecord => ({
  id: record.id,
  userId: record.user_id,
  date: record.date,
  checkIn: record.check_in,
  checkOut: record.check_out,
  notes: record.notes
});

// Helper function to convert a date string to DB format (YYYY-MM-DD)
const formatDateForDB = (dateStr: string) => {
  // Assuming dateStr is already in YYYY-MM-DD format
  return dateStr;
};

// Time records related API functions
export const timeRecordService = {
  // Get all records
  getAllRecords: async (): Promise<TimeRecord[]> => {
    try {
      // First try to get records from Supabase
      const { data: recordsData, error } = await supabase
        .from('time_records')
        .select('*')
        .order('date', { ascending: false })
        .order('check_in', { ascending: false });
      
      if (!error && recordsData) {
        return recordsData.map(transformRecord);
      }
      
      // Fallback to mock data
      console.log("Falling back to mock data for getAllRecords");
      
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
      // Try to get records from Supabase
      const { data: recordsData, error } = await supabase
        .from('time_records')
        .select('*')
        .gte('date', formatDateForDB(startDate))
        .lte('date', formatDateForDB(endDate))
        .order('date', { ascending: false })
        .order('check_in', { ascending: false });
      
      if (!error && recordsData) {
        return recordsData.map(transformRecord);
      }
      
      // Fallback to mock data
      console.log("Falling back to mock data for getAllRecordsBetweenDates");
      
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
      // Try to get records from Supabase
      const { data: recordsData, error } = await supabase
        .from('time_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('check_in', { ascending: false });
      
      if (!error && recordsData) {
        return recordsData.map(transformRecord);
      }
      
      // Fallback to mock data
      console.log("Falling back to mock data for getUserRecords");
      
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
      // Try to get records from Supabase
      const { data: recordsData, error } = await supabase
        .from('time_records')
        .select('*')
        .eq('user_id', userId)
        .gte('date', formatDateForDB(startDate))
        .lte('date', formatDateForDB(endDate))
        .order('date', { ascending: false })
        .order('check_in', { ascending: false });
      
      if (!error && recordsData) {
        return recordsData.map(transformRecord);
      }
      
      // Fallback to mock data
      console.log("Falling back to mock data for getUserRecordsBetweenDates");
      
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
      const today = getCurrentDate();
      
      // Try to get records from Supabase
      const { data: recordsData, error } = await supabase
        .from('time_records')
        .select('*')
        .eq('user_id', userId)
        .eq('date', formatDateForDB(today))
        .order('check_in', { ascending: false });
      
      if (!error && recordsData) {
        return recordsData.map(transformRecord);
      }
      
      // Fallback to mock data
      console.log("Falling back to mock data for getTodayRecords");
      
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
      const today = getCurrentDate();
      
      // Try to get record from Supabase
      const { data: recordsData, error } = await supabase
        .from('time_records')
        .select('*')
        .eq('user_id', userId)
        .eq('date', formatDateForDB(today))
        .is('check_out', null)
        .maybeSingle();
      
      if (!error && recordsData) {
        return transformRecord(recordsData);
      }
      
      // Fallback to mock data
      console.log("Falling back to mock data for getActiveRecord");
      
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
      // Check if there is an active check-in without check-out
      const hasActive = await timeRecordService.hasActiveCheckIn(userId);
      
      if (hasActive) {
        console.error("Usuário já possui um registro de entrada ativo");
        return null;
      }

      const today = getCurrentDate();
      const now = getCurrentTime();

      // Create new record in Supabase
      const { data: newRecordData, error } = await supabase
        .from('time_records')
        .insert({
          user_id: userId,
          date: formatDateForDB(today),
          check_in: now,
          check_out: null,
          notes
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error inserting record into Supabase:", error);
        
        // Fallback to mock data
        const newRecord: TimeRecord = {
          id: generateId(),
          userId,
          date: today,
          checkIn: now,
          checkOut: null,
          notes
        };
        
        timeRecords.push(newRecord);
        console.log("Nova entrada registrada (mock):", newRecord);
        
        return newRecord;
      }
      
      const newRecord = transformRecord(newRecordData);
      console.log("Nova entrada registrada (Supabase):", newRecord);
      
      return newRecord;
    } catch (error) {
      console.error("Erro ao registrar entrada:", error);
      return null;
    }
  },

  // Register a check-out
  checkOut: async (userId: string, recordId: string, notes?: string): Promise<TimeRecord | null> => {
    try {
      const checkOutTime = getCurrentTime();
      
      // First, get the current record to validate time range
      let currentRecord: TimeRecord | null = null;
      
      // Try to get from Supabase
      const { data: recordData, error: fetchError } = await supabase
        .from('time_records')
        .select('*')
        .eq('id', recordId)
        .maybeSingle();
        
      if (!fetchError && recordData) {
        currentRecord = transformRecord(recordData);
      } else {
        // Fallback to mock data
        currentRecord = timeRecords.find(r => r.id === recordId) || null;
      }
      
      if (!currentRecord) {
        console.error("Registro não encontrado para saída:", recordId);
        return null;
      }
      
      if (currentRecord.checkOut) {
        console.error("Registro já possui horário de saída");
        return null;
      }
      
      // Validate time range
      if (!isValidTimeRange(currentRecord.checkIn, checkOutTime)) {
        console.error("Intervalo de tempo inválido: saída antes da entrada");
        return null;
      }
      
      // Update the record in Supabase
      const { data: updatedData, error: updateError } = await supabase
        .from('time_records')
        .update({
          check_out: checkOutTime,
          notes: notes || currentRecord.notes
        })
        .eq('id', recordId)
        .select()
        .single();
        
      if (updateError) {
        console.error("Error updating record in Supabase:", updateError);
        
        // Fallback to mock data
        const recordIndex = timeRecords.findIndex(r => r.id === recordId);
        if (recordIndex !== -1) {
          const updatedRecord = {
            ...timeRecords[recordIndex],
            checkOut: checkOutTime,
            notes: notes || timeRecords[recordIndex].notes
          };
          
          timeRecords[recordIndex] = updatedRecord;
          console.log("Registro de saída atualizado (mock):", updatedRecord);
          
          return updatedRecord;
        }
        
        return null;
      }
      
      const updatedRecord = transformRecord(updatedData);
      console.log("Registro de saída atualizado (Supabase):", updatedRecord);
      
      return updatedRecord;
    } catch (error) {
      console.error("Erro durante o registro de saída:", error);
      return null;
    }
  }
};
