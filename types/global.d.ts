// Flight and Airline Types
export interface Airline {
  _id?: string;
  name: string;
  code: string;
  logo: string;
  country: string;
  description: string;
  website: string;
  popularRoutes: string[];
  fleetSize: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Airport {
  _id?: string;
  name: string;
  code: string;
  city: string;
  country: string;
  timezone: string;
  createdAt?: Date;
}

export interface Flight {
  _id?: string;
  flightNumber: string;
  airline: string;
  departure: {
    airport: string;
    time: Date;
    terminal: string;
  };
  arrival: {
    airport: string;
    time: Date;
    terminal: string;
  };
  aircraft: string;
  seatMap: {
    rows: number;
    columns: string[];
    reserved: string[];
  };
  availableSeats: number;
  price: {
    economy: number;
    business: number;
    firstClass: number;
  };
  status: 'scheduled' | 'delayed' | 'cancelled' | 'completed';
  duration: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Passenger {
  _id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  passportNumber: string;
  nationality: string;
  email: string;
  phone: string;
  createdAt?: Date;
}

export interface Booking {
  _id?: string;
  bookingReference: string;
  user: string;
  flight: string;
  passengers: string[];
  seats: string[];
  totalPrice: number;
  paymentId: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'cancelled';
  qrCode: string;
  ticketUrl: string;
  checkedInAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Payment {
  _id?: string;
  booking: string;
  amount: number;
  currency: string;
  stripePaymentId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt?: Date;
}

export interface User {
  _id?: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: Date;
  passportNumber: string;
  role: 'user' | 'admin';
  savedPassengers: string[];
  paymentMethods: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Search and Filter Types
export interface SearchFilters {
  departureCity: string;
  arrivalCity: string;
  departureDate: Date;
  returnDate?: Date;
  passengers: number;
  tripType: 'one-way' | 'round-trip' | 'multi-city';
  cabinClass: 'economy' | 'business' | 'first';
  airlines?: string[];
  maxStops?: number;
  priceRange?: { min: number; max: number };
}

export interface FlightSearchResult extends Flight {
  departureAirport?: Airport;
  arrivalAirport?: Airport;
  airlineData?: Airline;
}
