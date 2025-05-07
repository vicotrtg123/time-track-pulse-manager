
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { TimeRecord, ChangeRequest } from "@/types";
import { useAuth } from "./AuthContext";
import { timeRecordService, changeRequestService } from "@/services/api";
import { toast } from "sonner";

interface TimeRecordsContextType {
  timeRecords: TimeRecord[];
  changeRequests: ChangeRequest[];
  getUserRecords: (userId: string) => TimeRecord[];
  getPendingChangeRequests: () => ChangeRequest[];
  checkIn: (userId: string, notes?: string) => void;
  checkOut: (userId: string, recordId: string, notes?: string) => void;
  createChangeRequest: (
    recordId: string,
    userId: string,
    userName: string,
    suggestedCheckIn: string,
    suggestedCheckOut: string | null,
    reason: string
  ) => void;
  approveChangeRequest: (requestId: string) => void;
  rejectChangeRequest: (requestId: string) => void;
  getTodayRecords: (userId: string) => TimeRecord[];
  getActiveRecord: (userId: string) => TimeRecord | null;
  hasActiveCheckIn: (userId: string) => boolean;
}

const TimeRecordsContext = createContext<TimeRecordsContextType | undefined>(undefined);

export const TimeRecordsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const { currentUser } = useAuth();
  
  // Fetch initial data
  useEffect(() => {
    // Load initial data
    const loadTimeRecords = async () => {
      const records = timeRecordService.getAllRecords();
      setTimeRecords(records);
    };
    
    const loadChangeRequests = async () => {
      const requests = changeRequestService.getPendingRequests();
      setChangeRequests(requests);
    };
    
    loadTimeRecords();
    loadChangeRequests();
  }, []);
  
  const getUserRecords = (userId: string): TimeRecord[] => {
    return timeRecordService.getUserRecords(userId);
  };

  const getPendingChangeRequests = (): ChangeRequest[] => {
    return changeRequestService.getPendingRequests();
  };

  const getTodayRecords = (userId: string): TimeRecord[] => {
    return timeRecordService.getTodayRecords(userId);
  };

  const getActiveRecord = (userId: string): TimeRecord | null => {
    return timeRecordService.getActiveRecord(userId);
  };

  const hasActiveCheckIn = (userId: string): boolean => {
    const activeRecord = getActiveRecord(userId);
    return activeRecord !== null;
  };

  const checkIn = (userId: string, notes?: string): void => {
    // Check if there is an active check-in without check-out
    if (hasActiveCheckIn(userId)) {
      toast.error("Existe um registro de entrada sem saída. Registre a saída antes de uma nova entrada.");
      return;
    }

    const newRecord = timeRecordService.checkIn(userId, notes);
    
    if (newRecord) {
      setTimeRecords(prev => [...prev, newRecord]);
      toast.success("Entrada registrada com sucesso!");
    } else {
      toast.error("Não foi possível registrar sua entrada.");
    }
  };

  const checkOut = (userId: string, recordId: string, notes?: string): void => {
    const updatedRecord = timeRecordService.checkOut(userId, recordId, notes);
    
    if (!updatedRecord) {
      toast.error("Não foi possível registrar sua saída.");
      return;
    }

    setTimeRecords(prev =>
      prev.map(r => r.id === recordId ? updatedRecord : r)
    );

    toast.success("Saída registrada com sucesso!");
  };

  const createChangeRequest = (
    recordId: string,
    userId: string,
    userName: string,
    suggestedCheckIn: string,
    suggestedCheckOut: string | null,
    reason: string
  ): void => {
    const newRequest = changeRequestService.createChangeRequest(
      recordId,
      userId,
      userName,
      suggestedCheckIn,
      suggestedCheckOut,
      reason
    );
    
    if (newRequest) {
      setChangeRequests(prev => [...prev, newRequest]);
      toast.success("Solicitação enviada para aprovação!");
    } else {
      toast.error("Não foi possível criar a solicitação.");
    }
  };

  const approveChangeRequest = (requestId: string): void => {
    const success = changeRequestService.approveChangeRequest(requestId);
    
    if (success) {
      // Update local state
      const updatedRequest = changeRequests.find(r => r.id === requestId);
      if (updatedRequest) {
        setChangeRequests(prev =>
          prev.map(r => r.id === requestId ? { ...r, status: "approved" } : r)
        );
        
        // Find and update the corresponding time record
        const record = timeRecords.find(r => r.id === updatedRequest.recordId);
        if (record) {
          setTimeRecords(prev =>
            prev.map(r => r.id === record.id ? {
              ...r,
              checkIn: updatedRequest.suggestedCheckIn,
              checkOut: updatedRequest.suggestedCheckOut
            } : r)
          );
        }
      }
      
      toast.success("Solicitação aprovada com sucesso!");
    } else {
      toast.error("Não foi possível aprovar a solicitação.");
    }
  };

  const rejectChangeRequest = (requestId: string): void => {
    const success = changeRequestService.rejectChangeRequest(requestId);
    
    if (success) {
      setChangeRequests(prev =>
        prev.map(r => r.id === requestId ? { ...r, status: "rejected" } : r)
      );
      
      toast.info("Solicitação rejeitada");
    } else {
      toast.error("Não foi possível rejeitar a solicitação.");
    }
  };

  return (
    <TimeRecordsContext.Provider
      value={{
        timeRecords,
        changeRequests,
        getUserRecords,
        getPendingChangeRequests,
        checkIn,
        checkOut,
        createChangeRequest,
        approveChangeRequest,
        rejectChangeRequest,
        getTodayRecords,
        getActiveRecord,
        hasActiveCheckIn,
      }}
    >
      {children}
    </TimeRecordsContext.Provider>
  );
};

export const useTimeRecords = (): TimeRecordsContextType => {
  const context = useContext(TimeRecordsContext);
  if (context === undefined) {
    throw new Error("useTimeRecords must be used within a TimeRecordsProvider");
  }
  return context;
};
