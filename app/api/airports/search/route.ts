import { NextRequest, NextResponse } from 'next/server';
import { amadeusClient } from '@/lib/amadeus-client';

/**
 * Airport Search API (Autocomplete)
 * 
 * GET /api/airports/search?q=london
 * 
 * Returns airports and cities matching the search query
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    try {
      // Search airports via Amadeus
      const results = await amadeusClient.getAirportData(query);

      // Transform results for autocomplete
      const formattedResults = results.map((location: any) => ({
        iataCode: location.iataCode,
        name: location.name,
        city: location.address?.cityName || '',
        country: location.address?.countryName || '',
        type: location.subType, // AIRPORT or CITY
        displayName: `${location.name} (${location.iataCode})`,
        fullName: `${location.name}, ${location.address?.cityName || ''}, ${location.address?.countryName || ''}`,
        geoCode: location.geoCode ? {
          latitude: location.geoCode.latitude,
          longitude: location.geoCode.longitude,
        } : null,
      }));

      return NextResponse.json({
        success: true,
        count: formattedResults.length,
        data: formattedResults,
      });
    } catch (amadeusError: any) {
      console.error('Amadeus API error, using fallback:', amadeusError.response?.data || amadeusError.message);
      
      // Fallback to common airports if Amadeus fails
      const fallbackAirports = getFallbackAirports(query);
      
      return NextResponse.json({
        success: true,
        count: fallbackAirports.length,
        data: fallbackAirports,
        source: 'fallback',
        note: 'Using fallback data due to API error. Please check Amadeus credentials.',
      });
    }

  } catch (error: any) {
    console.error('Airport search error:', error);
    
    return NextResponse.json(
      { error: 'Failed to search airports', message: error.message },
      { status: 500 }
    );
  }
}

// Comprehensive fallback airport data for worldwide searches
function getFallbackAirports(query: string): any[] {
  const worldwideAirports = [
    // United States
    { iataCode: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'MCO', name: 'Orlando International Airport', city: 'Orlando', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'BOS', name: 'Boston Logan International Airport', city: 'Boston', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'United States', type: 'AIRPORT' },
    { iataCode: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'United States', type: 'AIRPORT' },
    
    // Europe
    { iataCode: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', type: 'AIRPORT' },
    { iataCode: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', type: 'AIRPORT' },
    { iataCode: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', type: 'AIRPORT' },
    { iataCode: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', type: 'AIRPORT' },
    { iataCode: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid', country: 'Spain', type: 'AIRPORT' },
    { iataCode: 'BCN', name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain', type: 'AIRPORT' },
    { iataCode: 'FCO', name: 'Leonardo da Vinci-Fiumicino Airport', city: 'Rome', country: 'Italy', type: 'AIRPORT' },
    { iataCode: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', type: 'AIRPORT' },
    { iataCode: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', type: 'AIRPORT' },
    { iataCode: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', type: 'AIRPORT' },
    
    // Middle East
    { iataCode: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', type: 'AIRPORT' },
    { iataCode: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', type: 'AIRPORT' },
    { iataCode: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates', type: 'AIRPORT' },
    { iataCode: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia', type: 'AIRPORT' },
    { iataCode: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia', type: 'AIRPORT' },
    
    // Asia
    { iataCode: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', type: 'AIRPORT' },
    { iataCode: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', type: 'AIRPORT' },
    { iataCode: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', type: 'AIRPORT' },
    { iataCode: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', type: 'AIRPORT' },
    { iataCode: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', type: 'AIRPORT' },
    { iataCode: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', type: 'AIRPORT' },
    { iataCode: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', type: 'AIRPORT' },
    { iataCode: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', type: 'AIRPORT' },
    { iataCode: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', type: 'AIRPORT' },
    { iataCode: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', type: 'AIRPORT' },
    { iataCode: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', type: 'AIRPORT' },
    { iataCode: 'CAN', name: 'Guangzhou Baiyun International Airport', city: 'Guangzhou', country: 'China', type: 'AIRPORT' },
    { iataCode: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines', type: 'AIRPORT' },
    { iataCode: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia', type: 'AIRPORT' },
    
    // Australia & Oceania
    { iataCode: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', type: 'AIRPORT' },
    { iataCode: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', type: 'AIRPORT' },
    { iataCode: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia', type: 'AIRPORT' },
    { iataCode: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia', type: 'AIRPORT' },
    { iataCode: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', type: 'AIRPORT' },
    
    // Africa
    { iataCode: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', type: 'AIRPORT' },
    { iataCode: 'JNB', name: 'O.R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', type: 'AIRPORT' },
    { iataCode: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa', type: 'AIRPORT' },
    { iataCode: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos', country: 'Nigeria', type: 'AIRPORT' },
    { iataCode: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya', type: 'AIRPORT' },
    { iataCode: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia', type: 'AIRPORT' },
    { iataCode: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco', type: 'AIRPORT' },
    
    // South America
    { iataCode: 'GRU', name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', type: 'AIRPORT' },
    { iataCode: 'GIG', name: 'Rio de Janeiro/Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil', type: 'AIRPORT' },
    { iataCode: 'EZE', name: 'Ministro Pistarini International Airport', city: 'Buenos Aires', country: 'Argentina', type: 'AIRPORT' },
    { iataCode: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia', type: 'AIRPORT' },
    { iataCode: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru', type: 'AIRPORT' },
    { iataCode: 'SCL', name: 'Arturo Merino Benítez International Airport', city: 'Santiago', country: 'Chile', type: 'AIRPORT' },
    
    // Canada
    { iataCode: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', type: 'AIRPORT' },
    { iataCode: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', type: 'AIRPORT' },
    { iataCode: 'YUL', name: 'Montréal-Pierre Elliott Trudeau International Airport', city: 'Montreal', country: 'Canada', type: 'AIRPORT' },
  ];

  const lowerQuery = query.toLowerCase();
  return worldwideAirports
    .filter(airport => 
      airport.iataCode.toLowerCase().includes(lowerQuery) ||
      airport.name.toLowerCase().includes(lowerQuery) ||
      airport.city.toLowerCase().includes(lowerQuery) ||
      airport.country.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 15)
    .map(airport => ({
      ...airport,
      displayName: `${airport.name} (${airport.iataCode})`,
      fullName: `${airport.name}, ${airport.city}, ${airport.country}`,
    }));
}
