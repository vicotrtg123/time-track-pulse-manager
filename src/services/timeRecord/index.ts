
import * as queries from './queries';
import * as mutations from './mutations';
import { hasActiveCheckIn } from './mutations';

// Time records related API functions
export const timeRecordService = {
  // Queries
  getAllRecords: queries.getAllRecords,
  getAllRecordsBetweenDates: queries.getAllRecordsBetweenDates,
  getUserRecords: queries.getUserRecords,
  getUserRecordsBetweenDates: queries.getUserRecordsBetweenDates,
  getTodayRecords: queries.getTodayRecords,
  getActiveRecord: queries.getActiveRecord,
  
  // Mutations
  checkIn: mutations.checkIn,
  checkOut: mutations.checkOut,
  
  // Helper functions
  hasActiveCheckIn
};
