
import { TimeRecord } from "@/types";

// Helper function to transform Supabase record to our TimeRecord type
export const transformRecord = (record: any): TimeRecord => ({
  id: record.id,
  userId: record.user_id,
  date: record.date,
  checkIn: record.check_in,
  checkOut: record.check_out,
  notes: record.notes
});

// Helper function to convert a date string to DB format (YYYY-MM-DD)
export const formatDateForDB = (dateStr: string) => {
  // Assuming dateStr is already in YYYY-MM-DD format
  return dateStr;
};

// Function to generate IDs (simulating database)
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
