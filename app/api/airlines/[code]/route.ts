import { NextRequest, NextResponse } from 'next/server';
import { amadeusClient } from '@/lib/amadeus-client';

/**
 * Get Airline Details by Code
 * 
 * GET /api/airlines/[code]
 * 
 * Fetches airline information from Amadeus API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    // Fetch airline data from Amadeus API
    const airline = await amadeusClient.getAirlineData(code.toUpperCase());

    if (!airline) {
      return NextResponse.json({ 
        error: 'Airline not found',
        message: `No airline found with code: ${code.toUpperCase()}`
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      airline,
      source: 'amadeus-api',
      note: 'To see flights for this airline, use /api/flights/search with airline filter',
    });
  } catch (error) {
    console.error('[Get Airline Error]', error);
    return NextResponse.json({ 
      error: 'Failed to fetch airline from API' 
    }, { status: 500 });
  }
}
