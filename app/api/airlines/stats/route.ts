import { NextResponse } from "next/server";
import { airlineDataService } from "@/lib/airline-data";

/**
 * Airlines Statistics API
 * 
 * GET /api/airlines/stats
 * 
 * Returns statistics about the airline database
 */
export async function GET() {
  try {
    const stats = await airlineDataService.getStats();
    
    return NextResponse.json({
      success: true,
      stats,
      source: 'openflights-database',
      note: 'Real airline statistics from OpenFlights database'
    });
  } catch (error) {
    console.error("[Get Airlines Stats Error]", error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch airline statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}