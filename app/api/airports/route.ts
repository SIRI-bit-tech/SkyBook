import { NextRequest, NextResponse } from 'next/server';
import { duffelClient } from '@/lib/duffel-client';

/**
 * Airport List API - Uses Duffel API for real-time airport data
 * 
 * GET /api/airports?search=london
 * 
 * This endpoint fetches airports directly from Duffel API
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

    // Fetch airports from Duffel API
    const results = await duffelClient.searchPlaces(search);

    // Transform results to match expected format
    const airports = results.map((place: any) => ({
      id: place.iata_code,
      code: place.iata_code,
      name: place.name,
      city: place.iata_city_code || place.iata_code,
      country: place.iata_country_code || '',
      timezone: place.time_zone || '',
      type: place.type, // airport or city
    }));

    return NextResponse.json({ 
      airports,
      count: airports.length,
      source: 'duffel-api'
    });
  } catch (error) {
    console.error('Error fetching airports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airports from API' },
      { status: 500 }
    );
  }
}
