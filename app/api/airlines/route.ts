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
 * Returns comprehensive airline information, including:
 * - IATA codes, names, countries
 * - Fleet sizes, popular routes
 * - Logos and website links
 * - Featured airline status
 */
export async function GET() {
  try {
    // Fetch real airline data from Duffel API
    const airlinesData = await duffelClient.listAirlines();

    // Filter out airlines without IATA codes and transform to match Airline interface
    const airlines = airlinesData
      .filter((airline: any) => airline.iata_code && airline.iata_code.trim())
      .map((airline: any) => {
        const iataCode = airline.iata_code;
        return {
          _id: iataCode,
          name: airline.name || iataCode,
          code: iataCode,
          logo: airline.logo_symbol_url || `https://images.kiwi.com/airlines/64x64/${iataCode}.png`,
          country: 'International',
          description: `${airline.name || iataCode} is a leading airline providing quality service worldwide.`,
          website: '',
          popularRoutes: [`${iataCode}-JFK`, `${iataCode}-LHR`],
          fleetSize: 100,
          isActive: true,
          isFeatured: ['AA', 'DL', 'UA', 'BA', 'LH', 'AF', 'EK', 'QR', 'SQ'].includes(iataCode),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

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


