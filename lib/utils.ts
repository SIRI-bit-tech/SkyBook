import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function calculateDuration(startDate: Date, endDate: Date): number {
  return Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 1000 / 60);
}

export function generateBookingReference(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getAirportName(code: string): string {
  const airports: { [key: string]: string } = {
    JFK: 'New York (JFK)',
    LAX: 'Los Angeles (LAX)',
    ORD: 'Chicago (ORD)',
    ATL: 'Atlanta (ATL)',
    DFW: 'Dallas (DFW)',
    LHR: 'London (LHR)',
    CDG: 'Paris (CDG)',
    NRT: 'Tokyo (NRT)',
    AMS: 'Amsterdam (AMS)',
    DXB: 'Dubai (DXB)',
  };
  return airports[code] || code;
}
