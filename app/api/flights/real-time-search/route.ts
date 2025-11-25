import { NextRequest, NextResponse } from "next/server";
import { fetchDuffelFlights, getDuffelAirlinesForRoute } from "@/lib/duffel-flights";

/**
 * Real-Time Flight Search API
 * 
 * POST /api/flights/real-time-search
 * 
 * Uses Duffel API for real-time flight data and booking
 */
export async function POST(request: NextRequest) {
  try {
    const { departure, arrival, departureDate, passengers, airlines, maxPrice, maxStops } = await request.json();

    // Validate required fields
    if (!departure || !arrival || !departureDate) {
      return NextResponse.json(
        { error: "Missing required fields: departure, arrival, departureDate" },
        { status: 400 }
      );
    }

    // Fetch flights from Duffel API
    const result = await fetchDuffelFlights({
      departure,
      arrival,
      departureDate,
      passengers: passengers || 1,
      airlines,
      maxPrice,
      maxStops,
    });

    // Extract unique airlines from flight results (avoid duplicate API call)
    const uniqueAirlines = Array.from(
      new Map(
        (result.flights || []).map((flight: any) => [
          flight.airline?.code,
          {
            _id: flight.airline?.code,
            code: flight.airline?.code,
            name: flight.airline?.name,
            logo: flight.airline?.logo,
          }
        ])
      ).values()
    );

    return NextResponse.json({
      success: true,
      flights: result.flights || [],
      airlines: uniqueAirlines,
      count: result.count || 0,
      source: 'duffel-api',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Real-time Flight Search Error]", error);
    
    // Handle rate limit errors specifically
    if (error.response?.status === 429 || error.status === 429) {
      return NextResponse.json({ 
        error: "Rate limit exceeded",
        message: "Too many requests to flight API. Please wait a moment and try again.",
        retryAfter: 60
      }, { status: 429 });
    }
    
    return NextResponse.json({ 
      error: "Failed to search flights",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
