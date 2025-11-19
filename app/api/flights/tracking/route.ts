import { flightTrackingClient } from '@/lib/flight-tracking';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flightNumber = searchParams.get('flightNumber');
    const departureDate = searchParams.get('departureDate');

    if (!flightNumber) {
      return NextResponse.json(
        { error: 'Flight number is required' },
        { status: 400 }
      );
    }

    // Get real-time flight status
    const flightStatus = await flightTrackingClient.getFlightStatus(
      flightNumber,
      departureDate || new Date().toISOString().split('T')[0]
    );

    if (!flightStatus) {
      // Try live tracking
      const liveStatus = await flightTrackingClient.trackFlightRealtime(flightNumber);
      return NextResponse.json({
        success: true,
        flightStatus: liveStatus,
      });
    }

    return NextResponse.json({
      success: true,
      flightStatus,
    });
  } catch (error) {
    console.error('Flight tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track flight' },
      { status: 500 }
    );
  }
}
