
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return format(date, "dd/MM/yyyy");
}

export function formatTime(timeString: string | null): string {
  if (!timeString) return "—";
  return timeString;
}

export function getCurrentDate(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function getCurrentTime(): string {
  return format(new Date(), "HH:mm");
}

export function isValidTimeRange(checkIn: string, checkOut: string | null): boolean {
  if (!checkOut) return true;
  
  const [checkInHours, checkInMinutes] = checkIn.split(":").map(Number);
  const [checkOutHours, checkOutMinutes] = checkOut.split(":").map(Number);
  
  if (checkOutHours < checkInHours) return false;
  if (checkOutHours === checkInHours && checkOutMinutes <= checkInMinutes) return false;
  
  return true;
}
