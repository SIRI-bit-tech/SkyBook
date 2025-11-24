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
 * 
 * Uses deterministic selection based on day-of-week for cacheability
 */
export async function GET() {
  try {
    // Major hub airports to get inspiration from
    const majorHubs = ['JFK', 'LAX', 'LHR', 'DXB', 'SIN', 'CDG', 'FRA', 'NRT'];
    
    // Deterministically select 3 hubs based on day of week for cacheability
    // This rotates through different hub combinations each day while remaining consistent within the day
    const selectedHubs = selectDeterministicHubs(majorHubs, 3);
    
    const allRoutes: any[] = [];
    
    // Fetch flight inspiration from each selected hub
    for (const hub of selectedHubs) {
      try {
        const destinations = await amadeusClient.getFlightInspiration(hub, 2000);
        
        // Filter out invalid destinations before mapping
        const validDestinations = destinations.filter((dest: any) => {
          if (!dest || typeof dest.destination !== 'string' || !dest.destination.trim()) {
            console.warn(`Skipping invalid destination from ${hub}:`, dest);
            return false;
          }
          return true;
        });
        
        // Transform Amadeus data to our format
        const routes = validDestinations.slice(0, 3).map((dest: any) => ({
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
    
    // Deterministically select 8 from the top 20 based on day of week
    const selectedRoutes = selectDeterministicRoutes(sortedRoutes, 8)
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

/**
 * Deterministic selection utilities
 * 
 * These functions use the current day-of-week as a stable seed to rotate through
 * different selections while keeping responses consistent and cacheable within each day.
 * 
 * The rotation strategy:
 * - Day 0 (Sunday): Start at index 0
 * - Day 1 (Monday): Start at index 1
 * - Day 2 (Tuesday): Start at index 2
 * - etc.
 * 
 * This provides variety across the week while ensuring all requests on the same day
 * return identical results, making responses cacheable.
 */

/**
 * Get the current day of week (0-6, where 0 is Sunday)
 * Exported for testing purposes
 */
export function getDayOfWeek(): number {
  return new Date().getDay();
}

/**
 * Deterministically select items from an array based on day of week
 * @param items - Array to select from
 * @param count - Number of items to select
 * @returns Selected items in a deterministic order
 */
function selectDeterministicHubs<T>(items: T[], count: number): T[] {
  const dayOfWeek = getDayOfWeek();
  const startIndex = dayOfWeek % items.length;
  
  const selected: T[] = [];
  for (let i = 0; i < count && i < items.length; i++) {
    const index = (startIndex + i) % items.length;
    selected.push(items[index]);
  }
  
  return selected;
}

/**
 * Deterministically select routes from sorted route list based on day of week
 * Uses a different rotation pattern to provide variety
 * @param routes - Sorted array of routes to select from
 * @param count - Number of routes to select
 * @returns Selected routes in a deterministic order
 */
function selectDeterministicRoutes<T>(routes: T[], count: number): T[] {
  const dayOfWeek = getDayOfWeek();
  // Use a different offset calculation for routes to vary selection pattern
  const startIndex = (dayOfWeek * 2) % routes.length;
  
  const selected: T[] = [];
  for (let i = 0; i < count && i < routes.length; i++) {
    const index = (startIndex + i) % routes.length;
    selected.push(routes[index]);
  }
  
  return selected;
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
