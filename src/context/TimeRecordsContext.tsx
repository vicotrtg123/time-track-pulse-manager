
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { TimeRecord, ChangeRequest } from "@/types";
import { timeRecords as mockTimeRecords, changeRequests as mockChangeRequests } from "@/lib/mock-data";
import { useAuth } from "./AuthContext";
import { getCurrentDate, getCurrentTime, isValidTimeRange } from "@/lib/utils";
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
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>(mockTimeRecords);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(mockChangeRequests);
  const { currentUser } = useAuth();

  const getUserRecords = (userId: string): TimeRecord[] => {
    return timeRecords
      .filter((record) => record.userId === userId)
      .sort((a, b) => {
        // First sort by date (newest first)
        const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateComparison !== 0) return dateComparison;
        
        // If same date, sort by check in time
        return b.checkIn.localeCompare(a.checkIn);
      });
  };

  const getPendingChangeRequests = (): ChangeRequest[] => {
    return changeRequests
      .filter((request) => request.status === "pending")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getTodayRecords = (userId: string): TimeRecord[] => {
    const today = getCurrentDate();
    return timeRecords
      .filter((record) => record.userId === userId && record.date === today)
      .sort((a, b) => b.checkIn.localeCompare(a.checkIn)); // Latest check-in first
  };

  const getActiveRecord = (userId: string): TimeRecord | null => {
    const today = getCurrentDate();
    return timeRecords.find(
      (record) => 
        record.userId === userId && 
        record.date === today && 
        record.checkOut === null
    ) || null;
  };

  const hasActiveCheckIn = (userId: string): boolean => {
    return getActiveRecord(userId) !== null;
  };

  const checkIn = (userId: string, notes?: string): void => {
    // Check if there is an active check-in without check-out
    if (hasActiveCheckIn(userId)) {
      toast.error("Existe um registro de entrada sem saída. Registre a saída antes de uma nova entrada.");
      return;
    }

    const newRecord: TimeRecord = {
      id: `tr-${Date.now()}`,
      userId,
      date: getCurrentDate(),
      checkIn: getCurrentTime(),
      checkOut: null,
      notes,
    };

    setTimeRecords((prev) => [...prev, newRecord]);
    toast.success("Entrada registrada com sucesso!");
  };

  const checkOut = (userId: string, recordId: string, notes?: string): void => {
    const record = timeRecords.find((r) => r.id === recordId);
    
    if (!record) {
      toast.error("Registro não encontrado");
      return;
    }

    if (record.checkOut) {
      toast.error("Saída já registrada");
      return;
    }

    const checkOutTime = getCurrentTime();
    
    // Validate time range
    if (!isValidTimeRange(record.checkIn, checkOutTime)) {
      toast.error("Hora de saída não pode ser anterior à hora de entrada");
      return;
    }

    const updatedRecord = {
      ...record,
      checkOut: checkOutTime,
      notes: notes || record.notes,
    };

    setTimeRecords((prev) =>
      prev.map((r) => (r.id === recordId ? updatedRecord : r))
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
    const record = timeRecords.find((r) => r.id === recordId);
    
    if (!record) {
      toast.error("Registro não encontrado");
      return;
    }

    // Validate time range if both values are provided
    if (suggestedCheckIn && suggestedCheckOut && !isValidTimeRange(suggestedCheckIn, suggestedCheckOut)) {
      toast.error("Hora de saída não pode ser anterior à hora de entrada");
      return;
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

    setChangeRequests((prev) => [...prev, newRequest]);
    toast.success("Solicitação enviada para aprovação!");
  };

  const approveChangeRequest = (requestId: string): void => {
    const request = changeRequests.find((r) => r.id === requestId);
    
    if (!request) {
      toast.error("Solicitação não encontrada");
      return;
    }

    // Update the change request status
    setChangeRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: "approved" } : r
      )
    );

    // Update the time record
    setTimeRecords((prev) =>
      prev.map((r) =>
        r.id === request.recordId
          ? {
              ...r,
              checkIn: request.suggestedCheckIn,
              checkOut: request.suggestedCheckOut,
            }
          : r
      )
    );

    toast.success("Solicitação aprovada com sucesso!");
  };

  const rejectChangeRequest = (requestId: string): void => {
    setChangeRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: "rejected" } : r
      )
    );
    toast.info("Solicitação rejeitada");
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
