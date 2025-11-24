import { NextResponse } from 'next/server';
import { amadeusClient } from '@/lib/amadeus-client';
import fs from 'fs/promises';
import path from 'path';

/**
 * Popular Routes API
 * 
 * GET /api/flights/popular-routes
 * 
 * Returns popular flight routes from Amadeus Flight Inspiration Search API
 * Falls back to OpenFlights routes data if Amadeus fails
 */
export async function GET() {
  try {
    // Major hub airports to get inspiration from
    const majorHubs = ['JFK', 'LAX', 'LHR', 'DXB', 'SIN', 'CDG', 'FRA', 'NRT'];
    
    // Randomly select 2-3 hubs to get diverse routes
    const selectedHubs = majorHubs.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    const allRoutes: any[] = [];
    
    // Fetch flight inspiration from each selected hub
    for (const hub of selectedHubs) {
      try {
        const destinations = await amadeusClient.getFlightInspiration(hub, 2000);
        
        // Transform Amadeus data to our format
        const routes = destinations.slice(0, 3).map((dest: any) => ({
          from: hub,
          to: dest.destination,
          fromCity: getCityName(hub),
          toCity: getCityName(dest.destination),
          country: '',
          price: dest.price?.total || null,
        }));
        
        allRoutes.push(...routes);
      } catch (error) {
        console.error(`Failed to fetch inspiration from ${hub}:`, error);
        // Continue with other hubs
      }
    }
    
    // If Amadeus fails or returns no results, use OpenFlights data as fallback
    if (allRoutes.length === 0) {
      console.log('Amadeus failed, using OpenFlights routes as fallback');
      const openFlightsRoutes = await getOpenFlightsPopularRoutes();
      
      return NextResponse.json({
        success: true,
        routes: openFlightsRoutes,
        count: openFlightsRoutes.length,
        source: 'openflights',
      });
    }
    
    // Return up to 8 routes
    const selectedRoutes = allRoutes.slice(0, 8);

    return NextResponse.json({
      success: true,
      routes: selectedRoutes,
      count: selectedRoutes.length,
      source: 'amadeus',
    });
  } catch (error) {
    console.error('[Popular Routes Error]', error);
    
    // Final fallback to OpenFlights
    try {
      const openFlightsRoutes = await getOpenFlightsPopularRoutes();
      return NextResponse.json({
        success: true,
        routes: openFlightsRoutes,
        count: openFlightsRoutes.length,
        source: 'openflights-fallback',
      });
    } catch (fallbackError) {
      console.error('[OpenFlights Fallback Error]', fallbackError);
      return NextResponse.json(
        { error: 'Failed to fetch popular routes' },
        { status: 500 }
      );
    }
  }
}

// Get popular routes from OpenFlights routes database
async function getOpenFlightsPopularRoutes(): Promise<any[]> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'routes.dat');
    const csvData = await fs.readFile(filePath, 'utf-8');
    
    // Parse OpenFlights routes data
    const lines = csvData.trim().split('\n');
    const routeMap = new Map<string, number>();
    
    // Count frequency of each route
    for (const line of lines) {
      const fields = line.split(',');
      if (fields.length < 5) continue;
      
      const sourceAirport = fields[2];
      const destAirport = fields[4];
      
      // Only include routes with valid IATA codes
      if (sourceAirport && destAirport && sourceAirport.length === 3 && destAirport.length === 3) {
        const routeKey = `${sourceAirport}-${destAirport}`;
        routeMap.set(routeKey, (routeMap.get(routeKey) || 0) + 1);
      }
    }
    
    // Sort routes by frequency and get top routes
    const sortedRoutes = Array.from(routeMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20); // Get top 20 most frequent routes
    
    // Randomly select 8 from the top 20
    const selectedRoutes = sortedRoutes
      .sort(() => 0.5 - Math.random())
      .slice(0, 8)
      .map(([route]) => {
        const [from, to] = route.split('-');
        return {
          from,
          to,
          fromCity: getCityName(from),
          toCity: getCityName(to),
          country: '',
          price: null,
        };
      });
    
    return selectedRoutes;
  } catch (error) {
    console.error('Failed to load OpenFlights routes:', error);
    throw error;
  }
}

// Helper function to get city names for major airports
function getCityName(airportCode: string): string {
  const cityMap: { [key: string]: string } = {
    'JFK': 'New York',
    'LAX': 'Los Angeles',
    'LHR': 'London',
    'DXB': 'Dubai',
    'SIN': 'Singapore',
    'CDG': 'Paris',
    'FRA': 'Frankfurt',
    'NRT': 'Tokyo',
    'SFO': 'San Francisco',
    'ORD': 'Chicago',
    'ATL': 'Atlanta',
    'SYD': 'Sydney',
    'HKG': 'Hong Kong',
    'DOH': 'Doha',
    'AMS': 'Amsterdam',
    'MUC': 'Munich',
    'FCO': 'Rome',
    'MAD': 'Madrid',
    'BCN': 'Barcelona',
  };
  
  return cityMap[airportCode] || airportCode;
}
