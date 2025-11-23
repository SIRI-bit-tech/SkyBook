import { NextRequest, NextResponse } from "next/server";
import { fetchRealTimeFlights, getAirlinesForRoute } from "@/lib/real-time-flights";

/**
 * Real-Time Flight Search API
 * 
 * POST /api/flights/real-time-search
 * 
 * Now uses Amadeus API for real-time flight data instead of database.
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

    // Fetch flights from Amadeus API
    const result = await fetchRealTimeFlights({
      departure,
      arrival,
      departureDate,
      passengers: passengers || 1,
      airlines,
      maxPrice,
      maxStops,
    });

    // Get available airlines for this route
    const availableAirlines = await getAirlinesForRoute(departure, arrival, departureDate);

    return NextResponse.json({
      success: true,
      flights: result.flights || [],
      airlines: availableAirlines || [],
      count: result.count || 0,
      source: 'amadeus-api',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Real-time Flight Search Error]", error);
    return NextResponse.json({ 
      error: "Failed to search flights",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
