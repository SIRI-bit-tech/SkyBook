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
    }));

    return NextResponse.json({
      success: true,
      count: formattedResults.length,
      data: formattedResults,
    });

  } catch (error: any) {
    console.error('Airport search error:', error);
    
    return NextResponse.json(
      { error: 'Failed to search airports', message: error.message },
      { status: 500 }
    );
  }
}
