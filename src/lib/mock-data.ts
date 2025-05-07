
import { User, TimeRecord, ChangeRequest } from "@/types";
import { getCurrentDate, getCurrentTime } from "@/lib/utils";

// Mock users
export const users: User[] = [
  {
    id: "1",
    name: "Admin Usuário",
    email: "admin@example.com",
    role: "admin",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "2",
    name: "João Silva",
    email: "joao@example.com",
    role: "employee",
    avatar: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: "3",
    name: "Maria Oliveira",
    email: "maria@example.com",
    role: "employee",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
];

// Mock time records
export const timeRecords: TimeRecord[] = [
  {
    id: "1",
    userId: "1",
    date: "2025-05-06",
    checkIn: "08:00",
    checkOut: "17:00",
    notes: "Reunião com cliente",
  },
  {
    id: "2",
    userId: "1",
    date: "2025-05-05",
    checkIn: "08:15",
    checkOut: "17:30",
  },
  {
    id: "3",
    userId: "2",
    date: "2025-05-06",
    checkIn: "09:00",
    checkOut: "18:00",
    notes: "Trabalho em projeto especial",
  },
  {
    id: "4",
    userId: "2",
    date: "2025-05-05",
    checkIn: "08:30",
    checkOut: "17:45",
  },
  {
    id: "5",
    userId: "3",
    date: "2025-05-06",
    checkIn: "08:45",
    checkOut: "17:15",
  },
  {
    id: "6",
    userId: "3",
    date: getCurrentDate(),
    checkIn: "08:30",
    checkOut: null,
  },
];

// Mock change requests
export const changeRequests: ChangeRequest[] = [
  {
    id: "1",
    recordId: "4",
    userId: "2",
    userName: "João Silva",
    originalCheckIn: "08:30",
    originalCheckOut: "17:45",
    suggestedCheckIn: "08:15",
    suggestedCheckOut: "17:30",
    date: "2025-05-05",
    reason: "Esqueci de registrar a entrada corretamente",
    status: "pending",
    createdAt: "2025-05-06T10:30:00",
  },
  {
    id: "2",
    recordId: "5",
    userId: "3",
    userName: "Maria Oliveira",
    originalCheckIn: "08:45",
    originalCheckOut: "17:15",
    suggestedCheckIn: "08:45",
    suggestedCheckOut: "18:00",
    date: "2025-05-06",
    reason: "Trabalhei horas extras",
    status: "pending",
    createdAt: "2025-05-06T18:15:00",
  },
];
