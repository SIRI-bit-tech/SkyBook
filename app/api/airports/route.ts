import { NextRequest, NextResponse } from 'next/server';
import { amadeusClient } from '@/lib/amadeus-client';

/**
 * Airport List API - Uses Amadeus API for real-time airport data
 * 
 * GET /api/airports?search=london
 * 
 * This endpoint now fetches airports directly from Amadeus API
 * instead of using database seed data.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    if (!search || search.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Fetch airports from Amadeus API
    const results = await amadeusClient.getAirportData(search);

    // Transform results to match expected format
    const airports = results.map((location: any) => ({
      id: location.id,
      code: location.iataCode,
      name: location.name,
      city: location.address?.cityName || '',
      country: location.address?.countryName || '',
      timezone: location.timeZoneOffset || '',
      type: location.subType, // AIRPORT or CITY
    }));

    return NextResponse.json({ 
      airports,
      count: airports.length,
      source: 'amadeus-api'
    });
  } catch (error) {
    console.error('Error fetching airports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airports from API' },
      { status: 500 }
    );
  }
}
