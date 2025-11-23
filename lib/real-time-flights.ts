import { amadeusClient } from "@/lib/amadeus-client";

/**
 * Real-Time Flight Search using Amadeus API
 * 
 * This module fetches live flight data from Amadeus API instead of database.
 * All flight information is real-time and up-to-date.
 */

export interface FlightFilter {
  departure: string;
  arrival: string;
  departureDate: string;
  passengers: number;
  airlines?: string[];
  maxPrice?: number;
  stops?: number;
  departureTimeRange?: { start: string; end: string };
}

// Helper function to get airline name from code
const getAirlineName = (code: string): string => {
  const airlines: Record<string, string> = {
    'AA': 'American Airlines', 'DL': 'Delta Air Lines', 'UA': 'United Airlines',
    'WN': 'Southwest Airlines', 'B6': 'JetBlue Airways', 'AS': 'Alaska Airlines',
    'BA': 'British Airways', 'LH': 'Lufthansa', 'AF': 'Air France',
    'KL': 'KLM', 'IB': 'Iberia', 'EK': 'Emirates', 'QR': 'Qatar Airways',
    'EY': 'Etihad Airways', 'TK': 'Turkish Airlines', 'SQ': 'Singapore Airlines',
    'CX': 'Cathay Pacific', 'JL': 'Japan Airlines', 'NH': 'All Nippon Airways',
    'QF': 'Qantas', 'AC': 'Air Canada', 'AM': 'Aeromexico', 'LA': 'LATAM',
    'AV': 'Avianca',
  };
  return airlines[code] || code;
};

// Helper to parse ISO duration (PT2H30M -> 150 minutes)
const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  const hours = match?.[1] ? parseInt(match[1]) : 0;
  const minutes = match?.[2] ? parseInt(match[2]) : 0;
  return hours * 60 + minutes;
};

export async function fetchRealTimeFlights(filters: FlightFilter) {
  try {
    const {
      departure,
      arrival,
      departureDate,
      passengers,
      maxPrice,
      stops,
    } = filters;

    // Extract IATA codes
    const departureCode = departure.includes("(") 
      ? departure.split("(")[1].split(")")[0].trim()
      : departure.trim().toUpperCase();
    
    const arrivalCode = arrival.includes("(")
      ? arrival.split("(")[1].split(")")[0].trim()
      : arrival.trim().toUpperCase();

    // Fetch flights from Amadeus API
    const flights = await amadeusClient.searchFlights(
      departureCode,
      arrivalCode,
      departureDate,
      passengers
    );

    // Transform Amadeus format to our component format
    let transformedFlights = flights.map((flight: any) => {
      const firstSegment = flight.itineraries[0]?.segments[0];
      const lastSegment = flight.itineraries[0]?.segments[flight.itineraries[0]?.segments.length - 1];
      const carrierCode = firstSegment?.carrierCode || 'XX';
      const stops = (flight.itineraries[0]?.segments?.length || 1) - 1;
      
      return {
        _id: flight.id,
        flightNumber: `${carrierCode}${firstSegment?.number || ''}`,
        airline: {
          _id: carrierCode,
          code: carrierCode,
          name: getAirlineName(carrierCode),
          logo: `https://images.kiwi.com/airlines/64/${carrierCode}.png`,
        },
        departure: {
          code: firstSegment?.departure?.iataCode || departureCode,
          time: firstSegment?.departure?.at || new Date().toISOString(),
        },
        arrival: {
          code: lastSegment?.arrival?.iataCode || arrivalCode,
          time: lastSegment?.arrival?.at || new Date().toISOString(),
        },
        duration: parseDuration(flight.itineraries[0]?.duration || 'PT0M'),
        stops,
        price: {
          economy: parseFloat(flight.price?.total || '0'),
        },
        status: 'scheduled',
      };
    });

    // Apply client-side filters
    let filteredFlights = transformedFlights;

    // Filter by max price
    if (maxPrice) {
      filteredFlights = filteredFlights.filter(
        (flight: any) => flight.price.economy <= maxPrice
      );
    }

    // Filter by stops
    if (stops !== undefined && stops !== null) {
      filteredFlights = filteredFlights.filter(
        (flight: any) => flight.stops === stops
      );
    }

    // Filter by airlines
    if (filters.airlines && filters.airlines.length > 0) {
      filteredFlights = filteredFlights.filter((flight: any) => {
        return filters.airlines!.includes(flight.airline.code);
      });
    }

    return {
      success: true,
      flights: filteredFlights || [],
      count: filteredFlights?.length || 0,
      source: 'amadeus-api',
    };
  } catch (error) {
    console.error("[Real-time Flight Fetch Error]", error);
    throw new Error("Failed to fetch real-time flights from API");
  }
}

// Get available airlines for a route from Amadeus
export async function getAirlinesForRoute(departure: string, arrival: string, departureDate: string) {
  try {
    const departureCode = departure.includes("(")
      ? departure.split("(")[1].split(")")[0].trim()
      : departure.trim().toUpperCase();
    
    const arrivalCode = arrival.includes("(")
      ? arrival.split("(")[1].split(")")[0].trim()
      : arrival.trim().toUpperCase();

    // Fetch flights to get available airlines
    const flights = await amadeusClient.searchFlights(
      departureCode,
      arrivalCode,
      departureDate,
      1
    );

    // Extract unique airline codes
    const airlineSet = new Set<string>();
    flights.forEach((flight: any) => {
      flight.itineraries[0]?.segments?.forEach((segment: any) => {
        airlineSet.add(segment.carrierCode);
      });
    });

    // Return formatted airline data
    return Array.from(airlineSet).map(code => ({
      _id: code,
      code,
      name: getAirlineName(code),
      logo: `https://images.kiwi.com/airlines/64/${code}.png`,
    }));
  } catch (error) {
    console.error("[Get Airlines Error]", error);
    return [];
  }
}

// Subscribe to real-time flight updates
export async function subscribeToFlightUpdates(
  departure: string,
  arrival: string,
  departureDate: string,
  callback: (flights: any[]) => void
) {
  // This would integrate with WebSocket or Server-Sent Events for real-time updates
  const interval = setInterval(async () => {
    try {
      const result = await fetchRealTimeFlights({
        departure,
        arrival,
        departureDate,
        passengers: 1,
      });
      callback(result.flights);
    } catch (error) {
      console.error("[Subscribe Error]", error);
    }
  }, 5000); // Update every 5 seconds

  return () => clearInterval(interval);
}
