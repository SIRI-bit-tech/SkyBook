import { NextResponse } from 'next/server';
import { amadeusClient } from '@/lib/amadeus-client';
import { requireAdmin } from '@/lib/auth-server';

/**
 * Admin Airlines API - READ ONLY
 * 
 * Fetches airline data from Amadeus API.
 * Admins can view but not create/edit airlines.
 */
export async function GET() {
  try {
    await requireAdmin();

    // Fetch airlines from Amadeus API
    const airlines = await amadeusClient.getAllAirlines();

    return NextResponse.json({
      success: true,
      airlines,
      count: airlines.length,
      source: 'amadeus-api',
      note: 'Airline data is read-only from Amadeus API',
    });
  } catch (error) {
    console.error('Error fetching airlines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airlines from API' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({
    error: 'Airline creation disabled',
    message: 'Cannot create airlines manually. Airline data comes from Amadeus API.',
  }, { status: 410 });
}
