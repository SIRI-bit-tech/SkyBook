import { NextRequest, NextResponse } from 'next/server';
import { duffelClient } from '@/lib/duffel-client';
import { airlineDataService } from '@/lib/airline-data';

/**
 * Individual Airline API - Fetches specific airline data and flights
 * 
 * GET /api/airlines/[code]
 * 
 * Returns:
 * - Airline information (from OpenFlights database)
 * - Real flight offers for that airline (from Duffel API)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const airlineCode = code.toUpperCase();

    // Get airline information from OpenFlights database
    const airline = await airlineDataService.getAirlineByCode(airlineCode);
    
    if (!airline) {
      return NextResponse.json(
        { error: 'Airline not found', code: airlineCode },
        { status: 404 }
      );
    }

    try {
      // Get real flight data from Duffel for this airline
      // We'll search for flights from major hubs for this airline
      const flights = await getAirlineFlights(airlineCode);
      
      return NextResponse.json({
        success: true,
        airline,
        flights,
        count: flights.length,
        source: 'duffel-api',
        note: `Real flight data for ${airline.name} from Duffel API`
      });
    } catch (flightError) {
      console.error(`Failed to fetch flights for ${airlineCode}:`, flightError);
      
      // Return airline info without flights if Duffel fails
      return NextResponse.json({
        success: true,
        airline,
        flights: [],
        count: 0,
        source: 'openflights-database',
        note: `Airline information available, but no flight data due to API error`
      });
    }

  } catch (error: any) {
    console.error('[Get Airline Error]', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch airline data', message: error.message },
      { status: 500 }
    );
  }
}

// Helper function to get flights for a specific airline
async function getAirlineFlights(airlineCode: string) {
  // Get major hub airports for different airlines
  const airlineHubs = getAirlineHubs(airlineCode);
  const flights = [];

  // Search for flights from the airline's main hub
  if (airlineHubs.length > 0) {
    const mainHub = airlineHubs[0];
    const destinations = ['JFK', 'LHR', 'CDG', 'DXB', 'NRT', 'SYD']; // Major international destinations
    
    for (const destination of destinations.slice(0, 3)) { // Limit to 3 destinations to avoid too many API calls
      if (destination !== mainHub) {
        try {
          // Search for flights from hub to destination
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const departureDate = tomorrow.toISOString().split('T')[0];
          
          const flightOffers = await duffelClient.searchFlights(
            mainHub,
            destination,
            departureDate,
            1 // 1 adult
          );
          
          // Filter flights to only include the specific airline
          const airlineFlights = flightOffers.filter((offer: any) => 
            offer.owner?.iata_code === airlineCode ||
            offer.slices?.[0]?.segments?.[0]?.marketing_carrier?.iata_code === airlineCode
          );
          
          flights.push(...airlineFlights.slice(0, 2)); // Max 2 flights per route
          
        } catch (routeError) {
          console.error(`Failed to fetch ${mainHub}-${destination} for ${airlineCode}:`, routeError);
          // Continue with other routes
        }
      }
    }
  }
  
  return flights.slice(0, 10); // Return max 10 flights total
}

// Get main hub airports for airlines
function getAirlineHubs(airlineCode: string): string[] {
  const hubMap: { [key: string]: string[] } = {
    // US Airlines
    'AA': ['DFW', 'MIA', 'JFK', 'LAX'],
    'DL': ['ATL', 'JFK', 'SEA', 'LAX'],
    'UA': ['ORD', 'SFO', 'EWR', 'IAH'],
    'WN': ['DAL', 'BWI', 'MDW', 'LAS'],
    'B6': ['JFK', 'BOS', 'FLL'],
    'AS': ['SEA', 'ANC', 'PDX'],
    
    // European Airlines
    'BA': ['LHR', 'LGW'],
    'LH': ['FRA', 'MUC'],
    'AF': ['CDG', 'ORY'],
    'KL': ['AMS'],
    'IB': ['MAD'],
    'AZ': ['FCO', 'MXP'],
    'SN': ['BRU'],
    'LX': ['ZUR'],
    'OS': ['VIE'],
    'SK': ['ARN', 'CPH'],
    
    // Middle East Airlines
    'EK': ['DXB'],
    'QR': ['DOH'],
    'EY': ['AUH'],
    'TK': ['IST'],
    
    // Asian Airlines
    'SQ': ['SIN'],
    'CX': ['HKG'],
    'JL': ['NRT', 'HND'],
    'NH': ['NRT', 'HND'],
    'KE': ['ICN'],
    'TG': ['BKK'],
    'MH': ['KUL'],
    'CI': ['TPE'],
    'BR': ['TPE'],
    
    // Chinese Airlines
    'CA': ['PEK', 'PVG'],
    'CZ': ['CAN', 'PEK'],
    'MU': ['PVG', 'PEK'],
    
    // Indian Airlines
    'AI': ['DEL', 'BOM'],
    '6E': ['DEL', 'BOM'],
    'SG': ['DEL', 'BOM'],
    
    // Australian Airlines
    'QF': ['SYD', 'MEL'],
    'JQ': ['SYD', 'MEL'],
    'VA': ['SYD', 'MEL', 'BNE'],
    
    // Canadian Airlines
    'AC': ['YYZ', 'YVR'],
    'WF': ['YYC', 'YVR'],
    
    // South American Airlines
    'LA': ['SCL', 'LIM', 'GRU'],
    'G3': ['GRU', 'GIG'],
    'AR': ['EZE'],
    
    // African Airlines
    'SA': ['JNB'],
    'ET': ['ADD'],
    'MS': ['CAI'],
    'AT': ['CMN'],
    
    // Low-Cost Carriers
    'FR': ['DUB', 'STN'],
    'U2': ['LGW', 'LTN'],
    'VY': ['BCN', 'MAD'],
    'W6': ['BUD'],
  };
  
  return hubMap[airlineCode] || ['JFK']; // Default to JFK if no specific hubs
}