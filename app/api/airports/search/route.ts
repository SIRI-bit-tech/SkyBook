import { NextRequest, NextResponse } from 'next/server';
import { searchAirports } from '@/lib/airport-search';

/**
 * Airport Search API using OpenFlights Data
 * 
 * GET /api/airports/search?query=london
 * GET /api/airports/search?q=london (also supported)
 * 
 * Fast, comprehensive airport search using local OpenFlights database
 * No external API calls - perfect for autocomplete
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    // Accept both 'query' and 'q' parameters for compatibility
    const query = searchParams.get('query') || searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Search using OpenFlights data (fast, no API calls)
    const airports = searchAirports(query, 10);

    // Transform to match global Airport type and consumer expectations
    const data = airports.map((airport) => ({
      id: airport.code,
      iataCode: airport.code,
      name: airport.name,
      code: airport.code,
      city: airport.city,
      country: airport.country,
      region: airport.region,
      timezone: 'UTC',
      displayName: `${airport.name} (${airport.code})`,
    }));

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      source: 'openflights',
    });
  } catch (error: any) {
    console.error('[Airport Search Error]', error);
    return NextResponse.json(
      {
        error: 'Failed to search airports',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
