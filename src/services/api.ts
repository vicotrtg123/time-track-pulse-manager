
import { User, TimeRecord, ChangeRequest } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentDate, getCurrentTime, isValidTimeRange } from "@/lib/utils";
import { toast } from "sonner";

// Helper functions to transform database fields to camelCase for our types
const transformUser = (dbUser: any): User => {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role as "admin" | "employee",
    avatar: dbUser.avatar,
    active: dbUser.active !== false, // Default to true if active is not explicitly false
  };
};

const transformTimeRecord = (dbRecord: any): TimeRecord => {
  return {
    id: dbRecord.id,
    userId: dbRecord.user_id,
    date: dbRecord.date,
    checkIn: dbRecord.check_in,
    checkOut: dbRecord.check_out,
    notes: dbRecord.notes
  };
};

const transformChangeRequest = (dbRequest: any): ChangeRequest => {
  return {
    id: dbRequest.id,
    recordId: dbRequest.record_id,
    userId: dbRequest.user_id,
    userName: dbRequest.users?.name || "",
    originalCheckIn: dbRequest.original_check_in,
    originalCheckOut: dbRequest.original_check_out,
    suggestedCheckIn: dbRequest.suggested_check_in,
    suggestedCheckOut: dbRequest.suggested_check_out,
    date: dbRequest.date,
    reason: dbRequest.reason,
    status: dbRequest.status as "pending" | "approved" | "rejected",
    createdAt: dbRequest.created_at
  };
};

// User related API functions
export const authService = {
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      // In a real implementation, this would use Supabase auth
      // For now, fetch a user with matching email
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('active', true)
        .single();
      
      if (error) {
        console.error("Error fetching user:", error);
        return null;
      }
      
      return transformUser(data);
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  },

  getUserById: async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user:", error);
        return null;
      }
      
      return transformUser(data);
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching users:", error);
        return [];
      }
      
      return data.map(transformUser);
    } catch (error) {
      console.error("Error fetching all users:", error);
      return [];
    }
  },
  
  createUser: async (name: string, email: string, role: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          name,
          email,
          role,
          active: true
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating user:", error);
        throw error;
      }
      
      return transformUser(data);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },
  
  disableUser: async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ active: false })
        .eq('id', userId);
      
      if (error) {
        console.error("Error disabling user:", error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error("Error disabling user:", error);
      throw error;
    }
  }
};

// Time records related API functions
export const timeRecordService = {
  // Get all records
  getAllRecords: async (): Promise<TimeRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('time_records')
        .select('*')
        .order('date', { ascending: false })
        .order('check_in', { ascending: false });
      
      if (error) {
        console.error("Error fetching time records:", error);
        return [];
      }
      
      return data.map((record) => transformTimeRecord(record));
    } catch (error) {
      console.error("Error fetching all records:", error);
      return [];
    }
  },
  
  // Get records between dates (for all users - admin only)
  getAllRecordsBetweenDates: async (startDate: string, endDate: string): Promise<TimeRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('time_records')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .order('check_in', { ascending: false });
      
      if (error) {
        console.error("Error fetching time records by date range:", error);
        return [];
      }
      
      return data.map(transformTimeRecord);
    } catch (error) {
      console.error("Error fetching records by date range:", error);
      return [];
    }
  },

  // Get records for a specific user
  getUserRecords: async (userId: string): Promise<TimeRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('time_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('check_in', { ascending: false });
      
      if (error) {
        console.error("Error fetching user time records:", error);
        return [];
      }
      
      return data.map((record) => transformTimeRecord(record));
    } catch (error) {
      console.error("Error fetching user records:", error);
      return [];
    }
  },
  
  // Get user records between dates
  getUserRecordsBetweenDates: async (userId: string, startDate: string, endDate: string): Promise<TimeRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('time_records')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .order('check_in', { ascending: false });
      
      if (error) {
        console.error("Error fetching user time records by date range:", error);
        return [];
      }
      
      return data.map(transformTimeRecord);
    } catch (error) {
      console.error("Error fetching user records by date range:", error);
      return [];
    }
  },

  // Get today's records for a user
  getTodayRecords: async (userId: string): Promise<TimeRecord[]> => {
    try {
      const today = getCurrentDate();
      const { data, error } = await supabase
        .from('time_records')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .order('check_in', { ascending: false });
      
      if (error) {
        console.error("Error fetching today's records:", error);
        return [];
      }
      
      return data.map((record) => transformTimeRecord(record));
    } catch (error) {
      console.error("Error fetching today's records:", error);
      return [];
    }
  },

  // Get active record (check in without check out)
  getActiveRecord: async (userId: string): Promise<TimeRecord | null> => {
    try {
      const today = getCurrentDate();
      const { data, error } = await supabase
        .from('time_records')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .is('check_out', null)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching active record:", error);
        return null;
      }
      
      return data ? transformTimeRecord(data) : null;
    } catch (error) {
      console.error("Error fetching active record:", error);
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
        console.error("User already has an active check-in");
        return null;
      }

      const today = getCurrentDate();
      const now = getCurrentTime();

      const { data, error } = await supabase
        .from('time_records')
        .insert({
          user_id: userId,
          date: today,
          check_in: now,
          check_out: null,
          notes
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating check-in:", error);
        return null;
      }
      
      return transformTimeRecord(data);
    } catch (error) {
      console.error("Error during check-in:", error);
      return null;
    }
  },

  // Register a check-out
  checkOut: async (userId: string, recordId: string, notes?: string): Promise<TimeRecord | null> => {
    try {
      // Get current record to see if it can be updated
      const { data: record, error: fetchError } = await supabase
        .from('time_records')
        .select('*')
        .eq('id', recordId)
        .single();
      
      if (fetchError || !record) {
        console.error("Error fetching record for check-out:", fetchError);
        return null;
      }
      
      if (record.check_out) {
        console.error("Record already has a check-out time");
        return null;
      }

      const checkOutTime = getCurrentTime();
      
      // Validate time range
      if (!isValidTimeRange(record.check_in, checkOutTime)) {
        console.error("Invalid time range: check-out before check-in");
        return null;
      }

      // Update the record
      const { data, error } = await supabase
        .from('time_records')
        .update({
          check_out: checkOutTime,
          notes: notes || record.notes
        })
        .eq('id', recordId)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating check-out:", error);
        return null;
      }
      
      return transformTimeRecord(data);
    } catch (error) {
      console.error("Error during check-out:", error);
      return null;
    }
  }
};

// Change requests related API functions
export const changeRequestService = {
  // Get all pending change requests
  getPendingRequests: async (): Promise<ChangeRequest[]> => {
    try {
      const { data, error } = await supabase
        .from('change_requests')
        .select(`
          *,
          users:user_id (
            name
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching pending requests:", error);
        return [];
      }
      
      // Transform the data to match our ChangeRequest type
      return data.map((request) => transformChangeRequest(request));
    } catch (error) {
      console.error("Error fetching pending requests:", error);
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
      // Get the original record first
      const { data: record, error: recordError } = await supabase
        .from('time_records')
        .select('*')
        .eq('id', recordId)
        .single();
      
      if (recordError || !record) {
        console.error("Error fetching original record:", recordError);
        return null;
      }
      
      // Validate time range if both values are provided
      if (suggestedCheckIn && suggestedCheckOut && !isValidTimeRange(suggestedCheckIn, suggestedCheckOut)) {
        console.error("Invalid time range for change request");
        return null;
      }

      const { data, error } = await supabase
        .from('change_requests')
        .insert({
          record_id: recordId,
          user_id: userId,
          original_check_in: record.check_in,
          original_check_out: record.check_out,
          suggested_check_in: suggestedCheckIn,
          suggested_check_out: suggestedCheckOut,
          date: record.date,
          reason,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating change request:", error);
        return null;
      }
      
      // Create response object that matches our ChangeRequest type
      return {
        id: data.id,
        recordId: data.record_id,
        userId: data.user_id,
        userName, // We already have this from the input
        originalCheckIn: data.original_check_in,
        originalCheckOut: data.original_check_out,
        suggestedCheckIn: data.suggested_check_in,
        suggestedCheckOut: data.suggested_check_out,
        date: data.date,
        reason: data.reason,
        status: data.status as "pending" | "approved" | "rejected",
        createdAt: data.created_at
      };
    } catch (error) {
      console.error("Error creating change request:", error);
      return null;
    }
  },

  // Approve a change request
  approveChangeRequest: async (requestId: string): Promise<boolean> => {
    try {
      // First get the change request
      const { data: request, error: requestError } = await supabase
        .from('change_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      
      if (requestError || !request) {
        console.error("Error fetching change request:", requestError);
        return false;
      }

      // Update the change request status
      const { error: statusError } = await supabase
        .from('change_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);
      
      if (statusError) {
        console.error("Error updating change request status:", statusError);
        return false;
      }

      // Update the time record
      const { error: recordError } = await supabase
        .from('time_records')
        .update({
          check_in: request.suggested_check_in,
          check_out: request.suggested_check_out
        })
        .eq('id', request.record_id);
      
      if (recordError) {
        console.error("Error updating time record:", recordError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error approving change request:", error);
      return false;
    }
  },

  // Reject a change request
  rejectChangeRequest: async (requestId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('change_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
      
      if (error) {
        console.error("Error rejecting change request:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error rejecting change request:", error);
      return false;
    }
  }
};
