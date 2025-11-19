import { amadeusClient } from '@/lib/amadeus-client';
import { searchAirports } from '@/lib/airport-data';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ airports: [] });
    }

    // Try Amadeus API first for real-time data
    let airports = [];
    try {
      const amadeusAirports = await amadeusClient.getAirportData(query);
      airports = amadeusAirports;
    } catch (error) {
      console.warn('Amadeus airport search failed, using local database');
    }

    // Fallback to local database
    if (airports.length === 0) {
      airports = searchAirports(query);
    }

    return NextResponse.json({
      success: true,
      airports: airports.slice(0, 10),
    });
  } catch (error) {
    console.error('Airport search error:', error);
    return NextResponse.json(
      { error: 'Failed to search airports' },
      { status: 500 }
    );
  }
}
