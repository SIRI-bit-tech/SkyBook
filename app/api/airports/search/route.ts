import { NextRequest, NextResponse } from 'next/server';
import { amadeusClient } from '@/lib/amadeus-client';

/**
 * Airport Search API (Autocomplete)
 * 
 * GET /api/airports/search?q=london
 * 
 * Returns airports and cities matching the search query
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    try {
      // Search airports via Amadeus
      const results = await amadeusClient.getAirportData(query);

      // Transform results for autocomplete
      const formattedResults = results.map((location: any) => ({
        iataCode: location.iataCode,
        name: location.name,
        city: location.address?.cityName || '',
        country: location.address?.countryName || '',
        type: location.subType, // AIRPORT or CITY
        displayName: `${location.name} (${location.iataCode})`,
        fullName: `${location.name}, ${location.address?.cityName || ''}, ${location.address?.countryName || ''}`,
        geoCode: location.geoCode ? {
          latitude: location.geoCode.latitude,
          longitude: location.geoCode.longitude,
        } : null,
      }));

      return NextResponse.json({
        success: true,
        count: formattedResults.length,
        data: formattedResults,
      });
    } catch (amadeusError: any) {
      console.error('Amadeus API error, using fallback:', amadeusError.response?.data || amadeusError.message);
      
      // Fallback to common airports if Amadeus fails
      const fallbackAirports = getFallbackAirports(query);
      
      return NextResponse.json({
        success: true,
        count: fallbackAirports.length,
        data: fallbackAirports,
        source: 'fallback',
        note: 'Using fallback data due to API error. Please check Amadeus credentials.',
      });
    }

  } catch (error: any) {
    console.error('Airport search error:', error);
    
    return NextResponse.json(
      { error: 'Failed to search airports', message: error.message },
      { status: 500 }
    );
  }
}

// Fallback airport data for common searches
function getFallbackAirports(query: string): any[] {
  const commonAirports = [
    { iataCode: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', type: 'AIRPORT' },
    { iataCode: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', type: 'AIRPORT' },
    { iataCode: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', type: 'AIRPORT' },
    { iataCode: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'MCO', name: 'Orlando International Airport', city: 'Orlando', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'BOS', name: 'Boston Logan International Airport', city: 'Boston', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'United States', type: 'AIRPORT' },
  ];

  const lowerQuery = query.toLowerCase();
  return commonAirports
    .filter(airport => 
      airport.iataCode.toLowerCase().includes(lowerQuery) ||
      airport.name.toLowerCase().includes(lowerQuery) ||
      airport.city.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 10)
    .map(airport => ({
      ...airport,
      displayName: `${airport.name} (${airport.iataCode})`,
      fullName: `${airport.name}, ${airport.city}, ${airport.country}`,
    }));
}
