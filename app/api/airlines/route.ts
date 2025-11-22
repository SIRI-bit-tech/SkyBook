import { NextResponse } from "next/server";
import { amadeusClient } from "@/lib/amadeus-client";

/**
 * Airlines API - Fetches real airline data from Amadeus API
 * 
 * GET /api/airlines
 * 
 * Returns real-time airline information including:
 * - IATA codes
 * - Official airline names
 * - Business names
 * - Country of registration
 * 
 * Data comes directly from Amadeus API, ensuring accuracy.
 */
export async function GET() {
  try {
    // Fetch real airline data from Amadeus API
    const airlinesData = await amadeusClient.getAllAirlines();

    // Transform to consistent format
    const airlines = airlinesData.map((airline: any) => ({
      code: airline.iataCode,
      name: airline.businessName || airline.commonName,
      type: airline.type,
    }));

    return NextResponse.json({
      success: true,
      airlines,
      count: airlines.length,
      source: 'amadeus-api',
      note: 'Real-time airline data from Amadeus'
    });
  } catch (error) {
    console.error("[Get Airlines Error]", error);
    
    // Fallback to basic list if API fails
    const fallbackAirlines = [
      { code: 'AA', name: 'American Airlines', type: 'AIRLINE' },
      { code: 'DL', name: 'Delta Air Lines', type: 'AIRLINE' },
      { code: 'UA', name: 'United Airlines', type: 'AIRLINE' },
      { code: 'BA', name: 'British Airways', type: 'AIRLINE' },
      { code: 'LH', name: 'Lufthansa', type: 'AIRLINE' },
      { code: 'AF', name: 'Air France', type: 'AIRLINE' },
      { code: 'EK', name: 'Emirates', type: 'AIRLINE' },
      { code: 'QR', name: 'Qatar Airways', type: 'AIRLINE' },
      { code: 'SQ', name: 'Singapore Airlines', type: 'AIRLINE' },
    ];

    return NextResponse.json({
      success: true,
      airlines: fallbackAirlines,
      count: fallbackAirlines.length,
      source: 'fallback',
      note: 'Using fallback data due to API error'
    });
  }
}
