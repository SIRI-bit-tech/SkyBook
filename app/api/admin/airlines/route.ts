import { NextResponse } from 'next/server';
import { duffelClient } from '@/lib/duffel-client';
import { requireAdmin } from '@/lib/auth-server';

/**
 * Admin Airlines API - READ ONLY
 * 
 * Fetches airline data from Duffel API.
 * Admins can view but not create/edit airlines.
 */
export async function GET() {
  try {
    await requireAdmin();

    // Fetch airlines from Duffel API
    const airlines = await duffelClient.listAirlines();

    return NextResponse.json({
      success: true,
      airlines,
      count: airlines.length,
      source: 'duffel-api',
      note: 'Airline data is read-only from Duffel API',
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
    message: 'Cannot create airlines manually. Airline data comes from Duffel API.',
  }, { status: 410 });
}
