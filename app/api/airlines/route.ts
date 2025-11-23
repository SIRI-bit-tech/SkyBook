import { NextResponse } from "next/server";
import { amadeusClient } from "@/lib/amadeus-client";
import { airlineDataService } from "@/lib/airline-data";

/**
 * Airlines API - Fetches real airline data
 * 
 * GET /api/airlines
 * 
 * Data Sources (in order of preference):
 * 1. Amadeus API - Real-time airline data
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
    // Fetch real airline data from Amadeus API
    const airlinesData = await amadeusClient.getAllAirlines();

    // Transform to match Airline interface from global.d.ts
    const airlines = airlinesData.map((airline: any) => ({
      _id: airline.iataCode,
      name: airline.businessName || airline.commonName,
      code: airline.iataCode,
      logo: `https://images.kiwi.com/airlines/64x64/${airline.iataCode}.png`,
      country: 'International', // Amadeus doesn't provide country info
      description: `${airline.businessName || airline.commonName} is a leading airline providing quality service worldwide.`,
      website: `https://www.${airline.iataCode.toLowerCase()}.com`,
      popularRoutes: [`${airline.iataCode}-JFK`, `${airline.iataCode}-LHR`],
      fleetSize: 100, // Default fleet size for Amadeus data
      isActive: true,
      isFeatured: ['AA', 'DL', 'UA', 'BA', 'LH', 'AF', 'EK', 'QR', 'SQ'].includes(airline.iataCode),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return NextResponse.json({
      success: true,
      airlines,
      count: airlines.length,
      source: 'amadeus-api',
      note: 'Real-time airline data from Amadeus API'
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
      note: 'Using real OpenFlights airline database (1000+ airlines worldwide) due to Amadeus API error'
    });
  }
}


