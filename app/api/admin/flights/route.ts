import { NextResponse } from 'next/server';

/**
 * Admin Flight Management - DISABLED
 * 
 * Flight data now comes from Amadeus API in real-time.
 * Admins should not manually create/manage flights.
 * 
 * All flight data is fetched dynamically from Amadeus when users search.
 */
export async function GET() {
  return NextResponse.json({
    error: 'Flight management disabled',
    message: 'Flight data comes from Amadeus API. Use /api/flights/search to view available flights.',
    note: 'Admins cannot manually create flights. All flight data is real-time from Amadeus.',
  }, { status: 410 }); // 410 Gone
}

export async function POST() {
  return NextResponse.json({
    error: 'Flight creation disabled',
    message: 'Cannot create flights manually. Flight data comes from Amadeus API.',
  }, { status: 410 });
}
