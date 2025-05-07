
import { User, TimeRecord, ChangeRequest } from "@/types";
import { users, timeRecords, changeRequests } from "@/lib/mock-data";
import { getCurrentDate, getCurrentTime, isValidTimeRange } from "@/lib/utils";

// User related API functions
export const authService = {
  login: (email: string, password: string): User | null => {
    // In a real app, we would verify the password here
    const user = users.find((u) => u.email === email);
    return user || null;
  },

  getUserById: (userId: string): User | null => {
    return users.find(user => user.id === userId) || null;
  },

  getAllUsers: (): User[] => {
    return [...users];
  }
};

// Time records related API functions
export const timeRecordService = {
  // Get all records
  getAllRecords: (): TimeRecord[] => {
    return [...timeRecords].sort((a, b) => {
      // First sort by date (newest first)
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      
      // If same date, sort by check in time
      return b.checkIn.localeCompare(a.checkIn);
    });
  },

  // Get records for a specific user
  getUserRecords: (userId: string): TimeRecord[] => {
    return timeRecords
      .filter((record) => record.userId === userId)
      .sort((a, b) => {
        // First sort by date (newest first)
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        
        // If same date, sort by check in time
        return b.checkIn.localeCompare(a.checkIn);
      });
  },

  // Get today's records for a user
  getTodayRecords: (userId: string): TimeRecord[] => {
    const today = getCurrentDate();
    return timeRecords
      .filter((record) => record.userId === userId && record.date === today)
      .sort((a, b) => b.checkIn.localeCompare(a.checkIn)); // Latest check-in first
  },

  // Get active record (check in without check out)
  getActiveRecord: (userId: string): TimeRecord | null => {
    const today = getCurrentDate();
    return timeRecords.find(
      (record) => 
        record.userId === userId && 
        record.date === today && 
        record.checkOut === null
    ) || null;
  },

  // Check if user has an active check-in
  hasActiveCheckIn: (userId: string): boolean => {
    return this.getActiveRecord(userId) !== null;
  },

  // Create a new check-in record
  checkIn: (userId: string, notes?: string): TimeRecord | null => {
    // Check if there is an active check-in without check-out
    const today = getCurrentDate();
    const activeRecord = timeRecords.find(
      record => record.userId === userId && record.date === today && record.checkOut === null
    );

    if (activeRecord) {
      return null; // Cannot create new check-in if there's an active one
    }

    const newRecord: TimeRecord = {
      id: `tr-${Date.now()}`,
      userId,
      date: today,
      checkIn: getCurrentTime(),
      checkOut: null,
      notes,
    };

    // In a real backend, this would be a database insert
    timeRecords.push(newRecord);
    return newRecord;
  },

  // Register a check-out
  checkOut: (userId: string, recordId: string, notes?: string): TimeRecord | null => {
    const record = timeRecords.find((r) => r.id === recordId);
    
    if (!record || record.checkOut) {
      return null;
    }

    const checkOutTime = getCurrentTime();
    
    // Validate time range
    if (!isValidTimeRange(record.checkIn, checkOutTime)) {
      return null;
    }

    // In a real backend, this would update a database record
    const updatedRecord = {
      ...record,
      checkOut: checkOutTime,
      notes: notes || record.notes,
    };

    // Update the record in our "database"
    const index = timeRecords.findIndex(r => r.id === recordId);
    if (index !== -1) {
      timeRecords[index] = updatedRecord;
    }

    return updatedRecord;
  }
};

// Change requests related API functions
export const changeRequestService = {
  // Get all pending change requests
  getPendingRequests: (): ChangeRequest[] => {
    return changeRequests
      .filter((request) => request.status === "pending")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Create a new change request
  createChangeRequest: (
    recordId: string,
    userId: string,
    userName: string,
    suggestedCheckIn: string,
    suggestedCheckOut: string | null,
    reason: string
  ): ChangeRequest | null => {
    const record = timeRecords.find((r) => r.id === recordId);
    
    if (!record) {
      return null;
    }

    // Validate time range if both values are provided
    if (suggestedCheckIn && suggestedCheckOut && !isValidTimeRange(suggestedCheckIn, suggestedCheckOut)) {
      return null;
    }

    const newRequest: ChangeRequest = {
      id: `cr-${Date.now()}`,
      recordId,
      userId,
      userName,
      originalCheckIn: record.checkIn,
      originalCheckOut: record.checkOut,
      suggestedCheckIn,
      suggestedCheckOut,
      date: record.date,
      reason,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // In a real backend, this would be a database insert
    changeRequests.push(newRequest);
    return newRequest;
  },

  // Approve a change request
  approveChangeRequest: (requestId: string): boolean => {
    const request = changeRequests.find((r) => r.id === requestId);
    
    if (!request) {
      return false;
    }

    // Update the change request status
    const requestIndex = changeRequests.findIndex(r => r.id === requestId);
    if (requestIndex !== -1) {
      changeRequests[requestIndex] = { ...request, status: "approved" };
    }

    // Update the time record
    const recordIndex = timeRecords.findIndex(r => r.id === request.recordId);
    if (recordIndex !== -1) {
      timeRecords[recordIndex] = {
        ...timeRecords[recordIndex],
        checkIn: request.suggestedCheckIn,
        checkOut: request.suggestedCheckOut,
      };
    }

    return true;
  },

  // Reject a change request
  rejectChangeRequest: (requestId: string): boolean => {
    const requestIndex = changeRequests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) return false;
    
    changeRequests[requestIndex] = { 
      ...changeRequests[requestIndex], 
      status: "rejected" 
    };
    
    return true;
  }
};
