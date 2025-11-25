import { NextResponse } from 'next/server';

/**
 * Flight Details API
 * 
 * GET /api/flights/[flightId]
 * 
 * Flight details are available from search results only
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ flightId: string }> }
) {
  try {
    const { flightId } = await params;

    if (!flightId) {
      return NextResponse.json(
        { success: false, error: 'Flight ID is required' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Flight details not available',
        message: 'Flight details are available from search results. Use the "View Details" button.',
      },
      { status: 404 }
    );

  } catch (error) {
    console.error('[Flight Details API Error]', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch flight details',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
