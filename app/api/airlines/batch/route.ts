import { NextRequest, NextResponse } from "next/server";
import { amadeusClient } from "@/lib/amadeus-client";

/**
 * Batch Airlines API - Fetches multiple airline data efficiently
 * 
 * POST /api/airlines/batch
 * 
 * Body: { codes: string[] }
 * 
 * Returns airline information for multiple IATA codes in a single request.
 * This is more efficient than making individual requests for each airline.
 */
export async function POST(request: NextRequest) {
  try {
    const { codes } = await request.json();

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid codes array provided'
      }, { status: 400 });
    }

    // Limit batch size to prevent abuse
    const MAX_BATCH_SIZE = 20;
    const limitedCodes = codes.slice(0, MAX_BATCH_SIZE);

    try {
      // Fetch airline data from Amadeus API
      const token = await amadeusClient.authenticate();
      const baseUrl = process.env.AMADEUS_API_BASE_URL || 'https://test.api.amadeus.com';

      const response = await fetch(
        `${baseUrl}/v1/reference-data/airlines?airlineCodes=${limitedCodes.join(',')}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/vnd.amadeus+json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Amadeus API error: ${response.status}`);
      }

      const data = await response.json();
      
      return NextResponse.json({
        success: true,
        airlines: data.data || [],
        requestedCodes: limitedCodes,
        foundCount: data.data?.length || 0,
        source: 'amadeus-api'
      });

    } catch (apiError) {
      console.error("[Batch Airlines API Error]", apiError);
      
      // Return fallback data for all requested codes
      const fallbackAirlines = limitedCodes.map(code => ({
        iataCode: code,
        businessName: code,
        commonName: code,
        type: 'AIRLINE'
      }));

      return NextResponse.json({
        success: true,
        airlines: fallbackAirlines,
        requestedCodes: limitedCodes,
        foundCount: fallbackAirlines.length,
        source: 'fallback',
        note: 'Using fallback data due to API error'
      });
    }

  } catch (error) {
    console.error("[Batch Airlines Route Error]", error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch airline data'
    }, { status: 500 });
  }
}