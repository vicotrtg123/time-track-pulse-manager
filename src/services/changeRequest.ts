import { ChangeRequest, TimeRecord } from "@/types";
import { changeRequests as mockChangeRequests } from "@/lib/mock-data";
import { isValidTimeRange } from "@/lib/utils";

// Using copies of the data to allow runtime changes
let changeRequests = [...mockChangeRequests];

// Importing the timeRecords array from the timeRecord service
// We need to know where to find the time records data
import { timeRecordService } from "./timeRecord";

// Function to generate IDs (simulating database)
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Getting a reference to the timeRecords array
// This is a bit of a hack for the refactoring, since we're keeping 
// the original functionality intact
let timeRecords: TimeRecord[] = [];
timeRecordService.getAllRecords().then(records => {
  timeRecords = records;
});

// Change requests related API functions
export const changeRequestService = {
  // Get all pending change requests
  getPendingRequests: async (): Promise<ChangeRequest[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return [...changeRequests]
        .filter(request => request.status === 'pending')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch (error) {
      console.error("Erro ao buscar solicitações pendentes:", error);
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
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get the original record first
      const record = timeRecords.find(r => r.id === recordId);
      
      if (!record) {
        console.error("Registro original não encontrado:", recordId);
        return null;
      }
      
      // Validate time range if both values are provided
      if (suggestedCheckIn && suggestedCheckOut && !isValidTimeRange(suggestedCheckIn, suggestedCheckOut)) {
        console.error("Intervalo de tempo inválido para solicitação de alteração");
        return null;
      }

      const now = new Date().toISOString();
      const newRequest: ChangeRequest = {
        id: generateId(),
        recordId,
        userId,
        userName,
        originalCheckIn: record.checkIn,
        originalCheckOut: record.checkOut,
        suggestedCheckIn,
        suggestedCheckOut,
        date: record.date,
        reason,
        status: 'pending',
        createdAt: now
      };
      
      changeRequests.push(newRequest);
      console.log("Nova solicitação de alteração criada:", newRequest);
      
      return newRequest;
    } catch (error) {
      console.error("Erro ao criar solicitação de alteração:", error);
      return null;
    }
  },

  // Approve a change request
  approveChangeRequest: async (requestId: string): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // First get the change request
      const requestIndex = changeRequests.findIndex(r => r.id === requestId);
      
      if (requestIndex === -1) {
        console.error("Solicitação de alteração não encontrada:", requestId);
        return false;
      }

      const request = changeRequests[requestIndex];
      
      // Update the change request status
      changeRequests[requestIndex] = {
        ...request,
        status: 'approved'
      };
      
      // Update the time record
      const recordIndex = timeRecords.findIndex(r => r.id === request.recordId);
      
      if (recordIndex === -1) {
        console.error("Registro de tempo não encontrado:", request.recordId);
        return false;
      }
      
      timeRecords[recordIndex] = {
        ...timeRecords[recordIndex],
        checkIn: request.suggestedCheckIn,
        checkOut: request.suggestedCheckOut
      };
      
      console.log("Solicitação de alteração aprovada:", requestId);
      return true;
    } catch (error) {
      console.error("Erro ao aprovar solicitação de alteração:", error);
      return false;
    }
  },

  // Reject a change request
  rejectChangeRequest: async (requestId: string): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const requestIndex = changeRequests.findIndex(r => r.id === requestId);
      
      if (requestIndex === -1) {
        console.error("Solicitação de alteração não encontrada:", requestId);
        return false;
      }
      
      changeRequests[requestIndex] = {
        ...changeRequests[requestIndex],
        status: 'rejected'
      };
      
      console.log("Solicitação de alteração rejeitada:", requestId);
      return true;
    } catch (error) {
      console.error("Erro ao rejeitar solicitação de alteração:", error);
      return false;
    }
  }
};
