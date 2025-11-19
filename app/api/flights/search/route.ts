import { NextRequest, NextResponse } from 'next/server';
import { amadeusClient } from '@/lib/amadeus-client';
import { formatFlightSearchResult } from '@/lib/flight-utils';

/**
 * Flight Search API
 * 
 * GET /api/flights/search
 * 
 * Query Parameters:
 * - departure: IATA code (required)
 * - arrival: IATA code (required)
 * - departureDate: YYYY-MM-DD (required)
 * - returnDate: YYYY-MM-DD (optional)
 * - passengers: number (default: 1)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Validate required parameters - support both old and new parameter names
    const departure = searchParams.get('departure') || searchParams.get('origin');
    const arrival = searchParams.get('arrival') || searchParams.get('destination');
    const departureDate = searchParams.get('departureDate');
    
    if (!departure || !arrival || !departureDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: departure, arrival, departureDate' },
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
    const passengers = parseInt(searchParams.get('passengers') || '1');
    const adults = parseInt(searchParams.get('adults') || passengers.toString());
    const children = parseInt(searchParams.get('children') || '0');
    const infants = parseInt(searchParams.get('infants') || '0');

    // Validate passenger counts
    if (adults < 1 || adults > 9) {
      return NextResponse.json(
        { error: 'Passengers must be between 1 and 9' },
        { status: 400 }
      );
    }

    // Search flights via Amadeus
    const flights = await amadeusClient.searchFlights(
      departure,
      arrival,
      departureDate,
      adults,
      children,
      infants,
      returnDate || undefined
    );

    // Return raw flights for now (we'll format on the client side)
    return NextResponse.json({
      success: true,
      count: flights.length,
      flights: flights,
      searchParams: {
        departure,
        arrival,
        departureDate,
        returnDate,
        passengers: adults + children + infants,
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
