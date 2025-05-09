
import { TimeRecord } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { timeRecords as mockTimeRecords } from "@/lib/mock-data";
import { transformRecord, formatDateForDB, generateId } from "./types";
import { getActiveRecord } from "./queries";

// Using a copy of the data to allow runtime changes
let timeRecords = [...mockTimeRecords];

export const checkIn = async (userId: string, notes?: string): Promise<TimeRecord | null> => {
  try {
    // Check if there is an active check-in without check-out
    const hasActive = await hasActiveCheckIn(userId);
    
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
};

export const checkOut = async (userId: string, recordId: string, notes?: string): Promise<TimeRecord | null> => {
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
};

export const hasActiveCheckIn = async (userId: string): Promise<boolean> => {
  const activeRecord = await getActiveRecord(userId);
  return activeRecord !== null;
};

// Import helper functions
import { getCurrentDate, getCurrentTime, isValidTimeRange } from "@/lib/utils";
