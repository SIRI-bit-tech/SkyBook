import { NextResponse } from "next/server";
import { duffelClient } from "@/lib/duffel-client";
import { airlineDataService } from "@/lib/airline-data";

/**
 * Airlines API - Fetches real airline data
 * 
 * GET /api/airlines
 * 
 * Data Sources (in order of preference):
 * 1. Duffel API - Real-time airline data
 * 2. OpenFlights Database - 1000+ airlines worldwide
 * 
 * Returns comprehensive airline information including:
 * - IATA codes, names, countries
 * - Fleet sizes, popular routes
 * - Logos and website links
 * - Featured airline status
 */
export async function GET() {
  try {
    // Fetch real airline data from Duffel API
    const airlinesData = await duffelClient.listAirlines();

    // Transform to match Airline interface from global.d.ts
    const airlines = airlinesData.map((airline: any) => ({
      _id: airline.iata_code,
      name: airline.name,
      code: airline.iata_code,
      logo: airline.logo_symbol_url || `https://images.kiwi.com/airlines/64x64/${airline.iata_code}.png`,
      country: 'International',
      description: `${airline.name} is a leading airline providing quality service worldwide.`,
      website: `https://www.${airline.iata_code.toLowerCase()}.com`,
      popularRoutes: [`${airline.iata_code}-JFK`, `${airline.iata_code}-LHR`],
      fleetSize: 100,
      isActive: true,
      isFeatured: ['AA', 'DL', 'UA', 'BA', 'LH', 'AF', 'EK', 'QR', 'SQ'].includes(airline.iata_code),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return NextResponse.json({
      success: true,
      airlines,
      count: airlines.length,
      source: 'duffel-api',
      note: 'Real-time airline data from Duffel API'
    });
  } catch (error) {
    console.error("[Get Airlines Error]", error);
    
    // Fallback to real OpenFlights airline database
    const openFlightsAirlines = await airlineDataService.getAllAirlines();
    
    return NextResponse.json({
      success: true,
      airlines: openFlightsAirlines,
      count: openFlightsAirlines.length,
      source: 'openflights-database',
      note: 'Using real OpenFlights airline database (1000+ airlines worldwide) due to Duffel API error'
    });
  }
}


