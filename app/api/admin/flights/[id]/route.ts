import { NextResponse } from 'next/server';

/**
 * Admin Flight Management - DISABLED
 * 
 * Flight data now comes from Amadeus API in real-time.
 * Individual flight management is not available.
 */
export async function GET() {
  return NextResponse.json({
    error: 'Flight management disabled',
    message: 'Flight data comes from Amadeus API. Use /api/flights/search instead.',
  }, { status: 410 });
}

export async function PATCH() {
  return NextResponse.json({
    error: 'Flight updates disabled',
    message: 'Cannot update flights. Flight data is managed by Amadeus API.',
  }, { status: 410 });
}

export async function DELETE() {
  return NextResponse.json({
    error: 'Flight deletion disabled',
    message: 'Cannot delete flights. Flight data is managed by Amadeus API.',
  }, { status: 410 });
}
