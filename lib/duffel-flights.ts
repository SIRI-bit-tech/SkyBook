import { duffelClient } from '@/lib/duffel-client';
import { airlineCache } from '@/lib/airline-cache';
import type { DuffelOffer } from '@/types/global';

/**
 * Real-Time Flight Search using Duffel API
 * 
 * This module fetches live flight data from Duffel API.
 * All flight information is real-time and bookable.
 */

export interface FlightFilter {
  departure: string;
  arrival: string;
  departureDate: string;
  passengers: number;
  airlines?: string[];
  maxPrice?: number;
  maxStops?: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
}

// Helper to parse ISO duration (PT2H30M -> 150 minutes)
const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  const hours = match?.[1] ? parseInt(match[1]) : 0;
  const minutes = match?.[2] ? parseInt(match[2]) : 0;
  return hours * 60 + minutes;
};

export async function fetchDuffelFlights(filters: FlightFilter) {
  try {
    const {
      departure,
      arrival,
      departureDate,
      passengers,
      maxPrice,
      maxStops,
      cabinClass,
    } = filters;

    // Extract IATA codes
    const departureCode = departure.includes('(')
      ? departure.split('(')[1].split(')')[0].trim()
      : departure.trim().toUpperCase();

    const arrivalCode = arrival.includes('(')
      ? arrival.split('(')[1].split(')')[0].trim()
      : arrival.trim().toUpperCase();

    // Fetch flights from Duffel API
    const offers = await duffelClient.searchFlights(
      departureCode,
      arrivalCode,
      departureDate,
      passengers,
      0, // children
      0, // infants
      undefined, // returnDate
      cabinClass,
      maxStops
    );

    // Transform Duffel format to our component format
    let transformedFlights = offers.map((offer: DuffelOffer) => {
      const slice = offer.slices[0];
      const firstSegment = slice.segments[0];
      const lastSegment = slice.segments[slice.segments.length - 1];

      const carrierCode = offer.owner.iata_code;
      const stops = slice.segments.length - 1;

      // Get airline logo
      const airlineLogo =
        offer.owner.logo_symbol_url ||
        `https://images.kiwi.com/airlines/64/${carrierCode}.png`;

      return {
        _id: offer.id,
        flightNumber: `${firstSegment.marketing_carrier.iata_code}${firstSegment.marketing_carrier_flight_number}`,
        airline: {
          _id: carrierCode,
          code: carrierCode,
          name: offer.owner.name,
          logo: airlineLogo,
        },
        departure: {
          code: firstSegment.origin.iata_code,
          time: firstSegment.departing_at,
        },
        arrival: {
          code: lastSegment.destination.iata_code,
          time: lastSegment.arriving_at,
        },
        duration: parseDuration(slice.duration),
        stops,
        price: {
          economy: parseFloat(offer.total_amount),
        },
        status: 'scheduled',
        // Store full offer data for booking
        rawOffer: offer,
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
      source: 'duffel-api',
    };
  } catch (error) {
    console.error('[Duffel Flight Fetch Error]', error);
    throw new Error('Failed to fetch flights from Duffel API');
  }
}

// Get available airlines for a route
export async function getDuffelAirlinesForRoute(
  departure: string,
  arrival: string,
  departureDate: string
) {
  try {
    const departureCode = departure.includes('(')
      ? departure.split('(')[1].split(')')[0].trim()
      : departure.trim().toUpperCase();

    const arrivalCode = arrival.includes('(')
      ? arrival.split('(')[1].split(')')[0].trim()
      : arrival.trim().toUpperCase();

    // Fetch flights to get available airlines
    const offers = await duffelClient.searchFlights(
      departureCode,
      arrivalCode,
      departureDate,
      1
    );

    // Extract unique airlines from offers
    const airlinesMap = new Map();

    offers.forEach((offer: DuffelOffer) => {
      const code = offer.owner.iata_code;
      if (!airlinesMap.has(code)) {
        airlinesMap.set(code, {
          _id: code,
          code: code,
          name: offer.owner.name,
          logo:
            offer.owner.logo_symbol_url ||
            `https://images.kiwi.com/airlines/64/${code}.png`,
        });
      }
    });

    return Array.from(airlinesMap.values());
  } catch (error) {
    console.error('[Get Duffel Airlines Error]', error);

    // Return cached airlines as fallback
    const cachedAirlines = airlineCache.getAllCachedAirlines();
    return cachedAirlines.slice(0, 20).map((airline) => ({
      _id: airline.code,
      code: airline.code,
      name: airline.name,
      logo: airline.logo,
    }));
  }
}
