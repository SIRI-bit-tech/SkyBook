import { NextRequest, NextResponse } from 'next/server';

/**
 * Get Flight Details by ID - DEPRECATED
 * 
 * GET /api/flights/[id]
 * 
 * This endpoint is deprecated because flights are no longer stored in database.
 * Flight data comes from Amadeus API in real-time.
 * 
 * Use /api/flights/search instead to find flights.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    return NextResponse.json({
      error: 'Endpoint deprecated',
      message: 'Flight details by ID are no longer available. Flights are fetched from Amadeus API in real-time.',
      suggestion: 'Use /api/flights/search to find flights by route and date',
      flightId: id,
    }, { status: 410 }); // 410 Gone

  } catch (error: any) {
    console.error('Flight details error:', error);
    
    return NextResponse.json(
      { error: 'Endpoint deprecated' },
      { status: 410 }
    );
  }
}
