/**
 * Flight Utilities
 * Helper functions for transforming and formatting flight data
 */

import { Flight } from '@/types/global';
import { getAirlineName } from '@/lib/airline-logos';

/**
 * Parse ISO 8601 duration to minutes
 * Example: "PT2H30M" -> 150
 */
export function parseDuration(duration: string): number {
  const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!matches) return 0;

  const hours = parseInt(matches[1] || '0');
  const minutes = parseInt(matches[2] || '0');

  return hours * 60 + minutes;
}

/**
 * Format minutes to readable duration
 * Example: 150 -> "2h 30m"
 */
export function formatDuration(duration: string | number): string {
  let minutes: number;
  
  if (typeof duration === 'string') {
    // Parse ISO 8601 duration format (e.g., "PT2H30M")
    minutes = parseDuration(duration);
  } else {
    minutes = duration;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Format time from ISO string
 * Example: "2024-01-15T14:30:00" -> "2:30 PM"
 */
export function formatTime(isoString: string, timeZone?: string): string {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...(timeZone && { timeZone })
  });
}

/**
 * Format date from ISO string
 * Example: "2024-01-15T14:30:00" -> "Jan 15"
 */
export function formatDate(isoString: string, timeZone?: string): string {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(timeZone && { timeZone })
  });
}

/**
 * Format price with currency
 */
export function formatPrice(amount: number | string, currency: string = 'USD'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(numAmount);
}

/**
 * Calculate number of stops
 */
export function calculateStops(segments: any[]): number {
  return Math.max(0, segments.length - 1);
}



/**
 * Transform Amadeus flight offer to our Flight model
 */
export function transformAmadeusToFlight(offer: any, airlineId?: string): Partial<Flight> {
  const segments = offer?.itineraries?.[0]?.segments;
  const firstSegment = segments?.[0];
  const lastSegment = segments?.[segments.length - 1];

  const carrierCode = firstSegment?.carrierCode || '';
  const flightNumber = firstSegment?.number || '';
  const departureIata = firstSegment?.departure?.iataCode || '';
  const departureTime = firstSegment?.departure?.at || new Date(0).toISOString();
  const departureTerminal = firstSegment?.departure?.terminal;
  const arrivalIata = lastSegment?.arrival?.iataCode || '';
  const arrivalTime = lastSegment?.arrival?.at || new Date(0).toISOString();
  const arrivalTerminal = lastSegment?.arrival?.terminal;
  const aircraftCode = firstSegment?.aircraft?.code || 'Unknown';
  const availableSeats = offer?.numberOfBookableSeats || 0;
  const priceTotal = parseFloat(offer?.price?.total || '0');
  const duration = offer?.itineraries?.[0]?.duration || 'PT0H0M';

  return {
    flightNumber: `${carrierCode}${flightNumber}`,
    airline: airlineId, // Will be populated from database
    departure: {
      airport: departureIata,
      time: new Date(departureTime),
      terminal: departureTerminal,
    },
    arrival: {
      airport: arrivalIata,
      time: new Date(arrivalTime),
      terminal: arrivalTerminal,
    },
    aircraft: aircraftCode,
    availableSeats: availableSeats,
    price: {
      economy: priceTotal,
      business: priceTotal * 2.5, // Estimate
      firstClass: priceTotal * 4, // Estimate
    },
    status: 'scheduled',
    duration: parseDuration(duration),
  };
}

/**
 * Format flight search results for display
 */
export function formatFlightSearchResult(offer: any) {
  const firstSegment = offer.itineraries[0].segments[0];
  const lastSegment = offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1];
  const segments = offer.itineraries[0].segments;

  return {
    id: offer.id,
    flightNumber: `${firstSegment.carrierCode}${firstSegment.number}`,
    airline: {
      code: firstSegment.carrierCode,
      name: getAirlineName(firstSegment.carrierCode),
    },
    departure: {
      airport: firstSegment.departure.iataCode,
      time: firstSegment.departure.at,
      terminal: firstSegment.departure.terminal || undefined,
    },
    arrival: {
      airport: lastSegment.arrival.iataCode,
      time: lastSegment.arrival.at,
      terminal: lastSegment.arrival.terminal || undefined,
    },
    duration: formatDuration(parseDuration(offer.itineraries[0].duration)),
    durationMinutes: parseDuration(offer.itineraries[0].duration),
    stops: calculateStops(segments),
    price: {
      amount: parseFloat(offer.price.total),
      currency: offer.price.currency,
      formatted: formatPrice(offer.price.total, offer.price.currency),
    },
    availableSeats: offer.numberOfBookableSeats,
    segments: segments.map((seg: any) => ({
      departure: seg.departure,
      arrival: seg.arrival,
      carrier: seg.carrierCode,
      flightNumber: `${seg.carrierCode}${seg.number}`,
      duration: formatDuration(parseDuration(seg.duration)),
    })),
  };
}

/**
 * Cache key generator for flight searches
 */
export function generateCacheKey(params: Record<string, any>): string {
  const sortedKeys = Object.keys(params).sort();
  const sortedParams: Record<string, any> = {};

  for (const key of sortedKeys) {
    sortedParams[key] = params[key];
  }

  const seen = new WeakSet();

  const replacer = (key: string, value: any): any => {
    if (value === undefined) {
      return null;
    }

    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }

    return value;
  };

  return JSON.stringify(sortedParams, replacer);
}
