import { NextRequest, NextResponse } from 'next/server';
import { amadeusClient } from '@/lib/amadeus-client';
import { formatFlightSearchResult } from '@/lib/flight-utils';

/**
 * Flight Search API
 * 
 * GET /api/flights/search
 * 
 * Query Parameters:
 * - origin: IATA code (required)
 * - destination: IATA code (required)
 * - departureDate: YYYY-MM-DD (required)
 * - returnDate: YYYY-MM-DD (optional)
 * - adults: number (default: 1)
 * - children: number (default: 0)
 * - infants: number (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Validate required parameters
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const departureDate = searchParams.get('departureDate');
    
    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: origin, destination, departureDate' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(departureDate)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Optional parameters
    const returnDate = searchParams.get('returnDate');
    const adults = parseInt(searchParams.get('adults') || '1');
    const children = parseInt(searchParams.get('children') || '0');
    const infants = parseInt(searchParams.get('infants') || '0');

    // Validate passenger counts
    if (adults < 1 || adults > 9) {
      return NextResponse.json(
        { error: 'Adults must be between 1 and 9' },
        { status: 400 }
      );
    }

    // Search flights via Amadeus
    const flights = await amadeusClient.searchFlights(
      origin,
      destination,
      departureDate,
      adults,
      children,
      infants,
      returnDate || undefined
    );

    // Transform results
    const formattedFlights = flights.map(formatFlightSearchResult);

    return NextResponse.json({
      success: true,
      count: formattedFlights.length,
      data: formattedFlights,
      searchParams: {
        origin,
        destination,
        departureDate,
        returnDate,
        passengers: { adults, children, infants },
      },
    });

  } catch (error: any) {
    console.error('Flight search error:', error);
    
    // Handle specific Amadeus errors
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Authentication failed with flight data provider' },
        { status: 500 }
      );
    }
    
    if (error.response?.status === 400) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.response.data },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to search flights', message: error.message },
      { status: 500 }
    );
  }
}
