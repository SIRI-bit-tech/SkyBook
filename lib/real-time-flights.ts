import { amadeusClient } from "@/lib/amadeus-client";
import { airlineCache, type CachedAirline } from "@/lib/airline-cache";

/**
 * Real-Time Flight Search using Amadeus API
 * 
 * This module fetches live flight data from Amadeus API instead of database.
 * All flight information is real-time and up-to-date.
 * 
 * Now includes dynamic airline caching for comprehensive airline coverage.
 */

export interface FlightFilter {
  departure: string;
  arrival: string;
  departureDate: string;
  passengers: number;
  airlines?: string[];
  maxPrice?: number;
  maxStops?: number;
  departureTimeRange?: { start: string; end: string };
}

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
      maxStops,
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

    // Process airline data dynamically from search results
    const cachedAirlines = await airlineCache.processFlightResults(flights);
    const airlineMap = new Map(cachedAirlines.map(a => [a.code, a]));

    // Transform Amadeus format to our component format
    let transformedFlights = flights.map((flight: any) => {
      // Safely extract itinerary and segments with guards
      const itinerary = flight.itineraries?.[0];
      const segments = itinerary?.segments ?? [];
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1] ?? firstSegment;
      
      const carrierCode = firstSegment?.carrierCode || 'XX';
      const stops = Math.max(0, segments.length - 1);
      
      // Get airline data from cache
      const airlineData = airlineMap.get(carrierCode) || {
        code: carrierCode,
        name: carrierCode,
        logo: `https://images.kiwi.com/airlines/64/${carrierCode}.png`,
        cachedAt: Date.now(),
        source: 'fallback' as const,
      };
      
      return {
        _id: flight.id,
        flightNumber: `${carrierCode}${firstSegment?.number || ''}`,
        airline: {
          _id: carrierCode,
          code: carrierCode,
          name: airlineData.name,
          logo: airlineData.logo,
        },
        departure: {
          code: firstSegment?.departure?.iataCode || departureCode,
          time: firstSegment?.departure?.at || new Date().toISOString(),
        },
        arrival: {
          code: lastSegment?.arrival?.iataCode || arrivalCode,
          time: lastSegment?.arrival?.at || new Date().toISOString(),
        },
        duration: parseDuration(itinerary?.duration || 'PT0M'),
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

    // Filter by maximum stops
    if (maxStops !== undefined && maxStops !== null) {
      filteredFlights = filteredFlights.filter(
        (flight: any) => flight.stops <= maxStops
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

// Get available airlines for a route using dynamic caching
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

    // Process airlines dynamically from search results
    const cachedAirlines = await airlineCache.processFlightResults(flights);

    // Return formatted airline data
    return cachedAirlines.map(airline => ({
      _id: airline.code,
      code: airline.code,
      name: airline.name,
      logo: airline.logo,
    }));
  } catch (error) {
    console.error("[Get Airlines Error]", error);
    
    // Return cached airlines as fallback
    const cachedAirlines = airlineCache.getAllCachedAirlines();
    return cachedAirlines.slice(0, 20).map(airline => ({
      _id: airline.code,
      code: airline.code,
      name: airline.name,
      logo: airline.logo,
    }));
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
