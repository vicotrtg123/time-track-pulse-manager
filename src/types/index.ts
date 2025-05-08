
export type UserRole = "admin" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  active: boolean; // Changed from optional to required since it has a default value in the database
}

export interface TimeRecord {
  id: string;
  userId: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  notes?: string;
}

export interface ChangeRequest {
  id: string;
  recordId: string;
  userId: string;
  userName: string;
  originalCheckIn: string;
  originalCheckOut: string | null;
  suggestedCheckIn: string;
  suggestedCheckOut: string | null;
  date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
