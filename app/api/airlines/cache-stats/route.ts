import { NextResponse } from "next/server";
import { getAirlineCacheStats } from "@/lib/airline-cache-cleanup";

/**
 * Airline Cache Statistics API
 * 
 * GET /api/airlines/cache-stats
 * 
 * Returns comprehensive statistics about the airline cache,
 * including coverage, sources, and age distribution.
 */
export async function GET() {
  try {
    const stats = getAirlineCacheStats();
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Airline Cache Stats Error]", error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get cache statistics'
    }, { status: 500 });
  }
}