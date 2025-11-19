// API Endpoints
export const API_ROUTES = {
  AUTH: '/api/auth',
  FLIGHTS: {
    SEARCH: '/api/flights/search',
    EXTERNAL_SEARCH: '/api/flights/external-search',
    TRACKING: '/api/flights/tracking',
    GET_ONE: (id: string) => `/api/flights/${id}`,
    BY_AIRLINE: (code: string) => `/api/flights/by-airline/${code}`,
  },
  AIRLINES: {
    GET_ALL: '/api/airlines',
    GET_ONE: (code: string) => `/api/airlines/${code}`,
  },
  AIRPORTS: {
    SEARCH: '/api/airports/search',
  },
  BOOKINGS: {
    CREATE: '/api/bookings/create',
    GET: (id: string) => `/api/bookings/${id}`,
  },
  PAYMENTS: {
    STRIPE: '/api/payments/stripe',
  },
  TICKETS: {
    GENERATE: '/api/tickets/generate',
    VERIFY: '/api/tickets/verify',
  },
};

// Flight Statuses
export const FLIGHT_STATUS = {
  SCHEDULED: 'scheduled',
  DELAYED: 'delayed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

// Booking Statuses
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked-in',
  CANCELLED: 'cancelled',
} as const;

// Cabin Classes
export const CABIN_CLASSES = {
  ECONOMY: 'economy',
  BUSINESS: 'business',
  FIRST_CLASS: 'firstClass',
} as const;

// Colors - Tailwind Safe Colors for Theming
export const COLORS = {
  PRIMARY: '#0F172A', // Deep Navy
  ACCENT: '#0EA5E9', // Sky Blue
  SUCCESS: '#10B981', // Emerald
  WARNING: '#F59E0B', // Amber
  ERROR: '#EF4444', // Red
  NEUTRAL: '#64748B', // Slate Gray
  BG_LIGHT: '#F8FAFC',
  BG_DARK: '#0F172A',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
} as const;

// Major Airlines (Initial Seeding Data)
export const MAJOR_AIRLINES = [
  {
    name: 'Delta Air Lines',
    code: 'DL',
    country: 'United States',
    logo: 'https://images.vivopay.com/mnt/QXJnby9tYXRlcmlhbHMvaW1hZ2UvcHl0aG9uL21hdGVyaWFsL2RlbHRhLWFpcmxpbmVzLmxvZ28ucG5n.png',
  },
  {
    name: 'United Airlines',
    code: 'UA',
    country: 'United States',
    logo: 'https://upload.wikimedia.org/wikipedia/en/b/bc/United_Airlines_logo.svg',
  },
  {
    name: 'American Airlines',
    code: 'AA',
    country: 'United States',
    logo: 'https://upload.wikimedia.org/wikipedia/en/0/0e/American_Airlines_logo.svg',
  },
  {
    name: 'Emirates',
    code: 'EK',
    country: 'United Arab Emirates',
    logo: 'https://upload.wikimedia.org/wikipedia/en/d/d0/Emirates_logo.svg',
  },
  {
    name: 'British Airways',
    code: 'BA',
    country: 'United Kingdom',
    logo: 'https://upload.wikimedia.org/wikipedia/en/b/ba/British_Airways.svg',
  },
  {
    name: 'Lufthansa',
    code: 'LH',
    country: 'Germany',
    logo: 'https://upload.wikimedia.org/wikipedia/en/6/6f/Lufthansa_logo.svg',
  },
];

// Socket.IO Events
export const SOCKET_EVENTS = {
  FLIGHT_UPDATE: 'flight:update',
  SEAT_UPDATE: 'seat:update',
  BOOKING_CONFIRMATION: 'booking:confirmation',
  PRICE_CHANGE: 'price:change',
  FLIGHT_STATUS_CHANGE: 'flight:status_change',
} as const;

// Booking Reference Generator
export const generateBookingReference = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Default Seat Map (Aircraft Configuration)
export const DEFAULT_SEAT_MAP = {
  rows: 30,
  columns: ['A', 'B', 'C', 'D', 'E', 'F'],
} as const;

// Passenger Types
export const PASSENGER_TYPES = {
  ADULT: 'adult',
  CHILD: 'child',
  INFANT: 'infant',
} as const;
