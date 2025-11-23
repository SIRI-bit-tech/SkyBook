import { NextRequest, NextResponse } from 'next/server';
import { airportSearchService } from '@/lib/airport-search';

/**
 * Airport Search API (Autocomplete)
 * 
 * GET /api/airports/search?q=london
 * 
 * Returns airports and cities matching the search query using OpenFlights database
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

    // Search airports using OpenFlights database
    const results = await airportSearchService.searchAirports(query, 20);

    return NextResponse.json({
      success: true,
      count: results.length,
      data: results,
      source: 'OpenFlights',
      note: 'Worldwide airport search powered by OpenFlights database',
    });

  } catch (error: any) {
    console.error('Airport search error:', error);
    
    return NextResponse.json(
      { error: 'Failed to search airports', message: error.message },
      { status: 500 }
    );
  }
}


