
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { TimeRecord, ChangeRequest } from "@/types";
import { useAuth } from "./AuthContext";
import { timeRecordService, changeRequestService } from "@/services/api";
import { toast } from "sonner";

interface TimeRecordsContextType {
  timeRecords: TimeRecord[];
  changeRequests: ChangeRequest[];
  getUserRecords: (userId: string) => Promise<TimeRecord[]>;
  getPendingChangeRequests: () => Promise<ChangeRequest[]>;
  checkIn: (userId: string, notes?: string) => Promise<void>;
  checkOut: (userId: string, recordId: string, notes?: string) => Promise<void>;
  createChangeRequest: (
    recordId: string,
    userId: string,
    userName: string,
    suggestedCheckIn: string,
    suggestedCheckOut: string | null,
    reason: string
  ) => Promise<void>;
  approveChangeRequest: (requestId: string) => Promise<void>;
  rejectChangeRequest: (requestId: string) => Promise<void>;
  getTodayRecords: (userId: string) => Promise<TimeRecord[]>;
  getActiveRecord: (userId: string) => Promise<TimeRecord | null>;
  hasActiveCheckIn: (userId: string) => Promise<boolean>;
  isLoading: boolean;
  refetchTimeRecords: () => Promise<void>;
  refetchChangeRequests: () => Promise<void>;
}

const TimeRecordsContext = createContext<TimeRecordsContextType | undefined>(undefined);

export const TimeRecordsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  
  // Fetch initial data
  useEffect(() => {
    const loadData = async () => {
      await refetchTimeRecords();
      await refetchChangeRequests();
    };
    
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);
  
  const refetchTimeRecords = async () => {
    setIsLoading(true);
    try {
      const records = await timeRecordService.getAllRecords();
      setTimeRecords(records);
    } catch (error) {
      console.error("Error fetching time records:", error);
      toast.error("Failed to load time records");
    } finally {
      setIsLoading(false);
    }
  };
  
  const refetchChangeRequests = async () => {
    setIsLoading(true);
    try {
      const requests = await changeRequestService.getPendingRequests();
      setChangeRequests(requests);
    } catch (error) {
      console.error("Error fetching change requests:", error);
      toast.error("Failed to load change requests");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getUserRecords = async (userId: string): Promise<TimeRecord[]> => {
    try {
      return await timeRecordService.getUserRecords(userId);
    } catch (error) {
      console.error("Error in getUserRecords:", error);
      return [];
    }
  };

  const getPendingChangeRequests = async (): Promise<ChangeRequest[]> => {
    try {
      return await changeRequestService.getPendingRequests();
    } catch (error) {
      console.error("Error in getPendingChangeRequests:", error);
      return [];
    }
  };

  const getTodayRecords = async (userId: string): Promise<TimeRecord[]> => {
    try {
      return await timeRecordService.getTodayRecords(userId);
    } catch (error) {
      console.error("Error in getTodayRecords:", error);
      return [];
    }
  };

  const getActiveRecord = async (userId: string): Promise<TimeRecord | null> => {
    try {
      return await timeRecordService.getActiveRecord(userId);
    } catch (error) {
      console.error("Error in getActiveRecord:", error);
      return null;
    }
  };

  const hasActiveCheckIn = async (userId: string): Promise<boolean> => {
    try {
      return await timeRecordService.hasActiveCheckIn(userId);
    } catch (error) {
      console.error("Error in hasActiveCheckIn:", error);
      return false;
    }
  };

  const checkIn = async (userId: string, notes?: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Check if there is an active check-in without check-out
      const hasActive = await hasActiveCheckIn(userId);
      if (hasActive) {
        toast.error("Existe um registro de entrada sem saída. Registre a saída antes de uma nova entrada.");
        return;
      }

      const newRecord = await timeRecordService.checkIn(userId, notes);
      
      if (newRecord) {
        setTimeRecords(prev => [newRecord, ...prev]);
        toast.success("Entrada registrada com sucesso!");
        await refetchTimeRecords();
      } else {
        toast.error("Não foi possível registrar sua entrada.");
      }
    } catch (error) {
      console.error("Error during check-in:", error);
      toast.error("Erro ao registrar entrada.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkOut = async (userId: string, recordId: string, notes?: string): Promise<void> => {
    setIsLoading(true);
    try {
      const updatedRecord = await timeRecordService.checkOut(userId, recordId, notes);
      
      if (!updatedRecord) {
        toast.error("Não foi possível registrar sua saída.");
        return;
      }

      setTimeRecords(prev =>
        prev.map(r => r.id === recordId ? updatedRecord : r)
      );

      toast.success("Saída registrada com sucesso!");
      await refetchTimeRecords();
    } catch (error) {
      console.error("Error during check-out:", error);
      toast.error("Erro ao registrar saída.");
    } finally {
      setIsLoading(false);
    }
  };

  const createChangeRequest = async (
    recordId: string,
    userId: string,
    userName: string,
    suggestedCheckIn: string,
    suggestedCheckOut: string | null,
    reason: string
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const newRequest = await changeRequestService.createChangeRequest(
        recordId,
        userId,
        userName,
        suggestedCheckIn,
        suggestedCheckOut,
        reason
      );
      
      if (newRequest) {
        setChangeRequests(prev => [newRequest, ...prev]);
        toast.success("Solicitação enviada para aprovação!");
        await refetchChangeRequests();
      } else {
        toast.error("Não foi possível criar a solicitação.");
      }
    } catch (error) {
      console.error("Error creating change request:", error);
      toast.error("Erro ao criar solicitação de alteração.");
    } finally {
      setIsLoading(false);
    }
  };

  const approveChangeRequest = async (requestId: string): Promise<void> => {
    setIsLoading(true);
    try {
      const success = await changeRequestService.approveChangeRequest(requestId);
      
      if (success) {
        // Update UI state
        setChangeRequests(prev =>
          prev.filter(r => r.id !== requestId)
        );
        
        // Refresh data
        await refetchTimeRecords();
        await refetchChangeRequests();
        toast.success("Solicitação aprovada com sucesso!");
      } else {
        toast.error("Não foi possível aprovar a solicitação.");
      }
    } catch (error) {
      console.error("Error approving change request:", error);
      toast.error("Erro ao aprovar solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  const rejectChangeRequest = async (requestId: string): Promise<void> => {
    setIsLoading(true);
    try {
      const success = await changeRequestService.rejectChangeRequest(requestId);
      
      if (success) {
        // Update UI state
        setChangeRequests(prev =>
          prev.filter(r => r.id !== requestId)
        );
        
        await refetchChangeRequests();
        toast.info("Solicitação rejeitada");
      } else {
        toast.error("Não foi possível rejeitar a solicitação.");
      }
    } catch (error) {
      console.error("Error rejecting change request:", error);
      toast.error("Erro ao rejeitar solicitação.");
    } finally {
      setIsLoading(false);
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
        isLoading,
        refetchTimeRecords,
        refetchChangeRequests
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
