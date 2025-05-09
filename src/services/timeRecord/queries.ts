
import { TimeRecord } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { timeRecords as mockTimeRecords } from "@/lib/mock-data";
import { transformRecord, formatDateForDB } from "./types";

// Using a copy of the data to allow runtime changes
let timeRecords = [...mockTimeRecords];

export const getAllRecords = async (): Promise<TimeRecord[]> => {
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
};

export const getAllRecordsBetweenDates = async (startDate: string, endDate: string): Promise<TimeRecord[]> => {
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
};

export const getUserRecords = async (userId: string): Promise<TimeRecord[]> => {
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
};

export const getUserRecordsBetweenDates = async (userId: string, startDate: string, endDate: string): Promise<TimeRecord[]> => {
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
};

export const getTodayRecords = async (userId: string): Promise<TimeRecord[]> => {
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
};

export const getActiveRecord = async (userId: string): Promise<TimeRecord | null> => {
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
};

// Import helper functions
import { getCurrentDate, getCurrentTime, isValidTimeRange } from "@/lib/utils";
