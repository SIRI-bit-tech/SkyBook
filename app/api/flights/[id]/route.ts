import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { FlightModel } from '@/models/Flight';

/**
 * Get Flight Details by ID
 * 
 * GET /api/flights/[id]
 * 
 * Returns detailed information about a specific flight
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Flight ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find flight in database
    const flight = await FlightModel.findById(id)
      .populate('airline')
      .populate('departure.airport')
      .populate('arrival.airport');

    if (!flight) {
      return NextResponse.json(
        { error: 'Flight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: flight,
    });

  } catch (error: any) {
    console.error('Flight details error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch flight details', message: error.message },
      { status: 500 }
    );
  }
}
