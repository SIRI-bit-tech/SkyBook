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
  passengers: Passenger[];
  seats: string[];
  addOns: BookingAddOns;
  totalPrice: number;
  paymentId: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'cancelled';
  qrCode: string;
  ticketUrl: string;
  checkedInAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Populated Booking type for when references are populated
export interface PopulatedBooking extends Omit<Booking, 'user' | 'flight'> {
  user: User;
  flight: Flight;
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
  username?: string;
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

// Flight Results Component Types
export interface FlightSegment {
  departure: {
    iataCode: string;
    at: string;
    terminal?: string;
    timeZone?: string;
  };
  arrival: {
    iataCode: string;
    at: string;
    terminal?: string;
    timeZone?: string;
  };
  carrierCode: string;
  number: string;
  flightNumber: string;
  duration: string;
  aircraft?: {
    code: string;
  };
}

export interface FlightResult {
  id: string;
  airline: {
    code: string;
    name: string;
  };
  price: {
    amount: number;
    currency: string;
    total: string;
  };
  departure: {
    airport: string;
    time: string;
  };
  arrival: {
    airport: string;
    time: string;
  };
  duration: string;
  stops: number;
  segments: FlightSegment[];
  validatingAirlineCodes?: string[];
  numberOfBookableSeats?: number;
  itineraries?: Array<{
    duration: string;
    segments: FlightSegment[];
  }>;
}

export interface Filters {
  airlines: string[];
  priceRange: [number, number];
  stops: number[];
  departureTime: string[];
}

// Booking Component Types
export interface PassengerFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber: string;
  email: string;
  phone: string;
  nationality: string;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface BookingAddOns {
  baggage: number;
  meals: string;
  specialRequests: string;
  travelInsurance: boolean;
  selectedAddOns: { id: string; name: string; price: number; quantity: number }[];
}

export interface PriceBreakdown {
  basePrice: number;
  taxes: number;
  addOnsTotal: number;
  insuranceTotal: number;
  grandTotal: number;
}

export interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// Flight Tracker Types
export interface FlightStatus {
  flightNumber: string;
  airline: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  status: 'scheduled' | 'departed' | 'in_air' | 'landed' | 'delayed' | 'cancelled';
  delayMinutes?: number;
  currentAltitude?: number;
  currentSpeed?: number;
  position?: {
    latitude: number;
    longitude: number;
  };
  aircraft?: string;
  gate?: string;
  lastUpdate: string;
}

// Price Comparison Types
export interface PriceData {
  airline: string;
  price: number;
  source: string;
  departureTime: string;
  duration: string;
  stops: number;
}

// Breadcrumb Types
export interface BreadcrumbItem {
  label: string;
  href: string;
}
