/**
 * Flight Utilities
 * Helper functions for transforming and formatting flight data
 */

import { Flight } from '@/types/global';

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
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
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
 * Get airline name from code
 * This is a basic mapping - in production, fetch from database or API
 */
export function getAirlineName(code: string): string {
  const airlines: Record<string, string> = {
    'AA': 'American Airlines',
    'DL': 'Delta Air Lines',
    'UA': 'United Airlines',
    'BA': 'British Airways',
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    'SQ': 'Singapore Airlines',
    'LH': 'Lufthansa',
    'AF': 'Air France',
    'KL': 'KLM',
  };
  
  return airlines[code] || code;
}

/**
 * Transform Amadeus flight offer to our Flight model
 */
export function transformAmadeusToFlight(offer: any, airlineId?: string): Partial<Flight> {
  const firstSegment = offer.itineraries[0].segments[0];
  const lastSegment = offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1];
  
  return {
    flightNumber: `${firstSegment.carrierCode}${firstSegment.number}`,
    airline: airlineId, // Will be populated from database
    departure: {
      airport: firstSegment.departure.iataCode,
      time: new Date(firstSegment.departure.at),
      terminal: firstSegment.departure.terminal,
    },
    arrival: {
      airport: lastSegment.arrival.iataCode,
      time: new Date(lastSegment.arrival.at),
      terminal: lastSegment.arrival.terminal,
    },
    aircraft: firstSegment.aircraft.code,
    availableSeats: offer.numberOfBookableSeats,
    price: {
      economy: parseFloat(offer.price.total),
      business: parseFloat(offer.price.total) * 2.5, // Estimate
      firstClass: parseFloat(offer.price.total) * 4, // Estimate
    },
    status: 'scheduled',
    duration: parseDuration(offer.itineraries[0].duration),
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
  return Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
}
