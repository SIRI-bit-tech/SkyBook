import fs from 'fs';
import path from 'path';

/**
 * Airport Search Service using OpenFlights Data
 * 
 * Fast, comprehensive airport search using local OpenFlights database
 * No API calls needed - perfect for autocomplete
 */

interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

let airportsCache: Airport[] | null = null;

/**
 * Load airports from OpenFlights CSV file
 */
function loadAirports(): Airport[] {
  if (airportsCache) {
    return airportsCache;
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'airports-with-regions.csv');
    const csvData = fs.readFileSync(filePath, 'utf-8');
    
    const lines = csvData.trim().split('\n');
    const airports: Airport[] = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Parse CSV (handle quoted fields)
      const fields: string[] = [];
      let currentField = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      fields.push(currentField.trim()); // Add last field
      
      // Extract airport data
      // Format: id,ident,type,name,latitude_deg,longitude_deg,elevation_ft,continent,iso_country,iso_region,municipality,scheduled_service,gps_code,iata_code,local_code,home_link,wikipedia_link,keywords
      const iataCode = fields[13]?.replace(/"/g, '').trim();
      const name = fields[3]?.replace(/"/g, '').trim();
      const city = fields[10]?.replace(/"/g, '').trim();
      const country = fields[8]?.replace(/"/g, '').trim();
      const region = fields[9]?.replace(/"/g, '').trim();
      const type = fields[2]?.replace(/"/g, '').trim();
      
      // Only include airports with valid IATA codes and are actual airports
      if (iataCode && iataCode.length === 3 && name && (type === 'large_airport' || type === 'medium_airport' || type === 'small_airport')) {
        airports.push({
          id: iataCode,
          code: iataCode,
          name,
          city: city || name,
          country,
          region,
          latitude: parseFloat(fields[4]) || undefined,
          longitude: parseFloat(fields[5]) || undefined,
        });
      }
    }
    
    airportsCache = airports;
    console.log(`✅ Loaded ${airports.length} airports from OpenFlights database`);
    return airports;
  } catch (error) {
    console.error('Error loading airports:', error);
    return [];
  }
}

/**
 * Search airports by query (code, name, city, or country)
 */
export function searchAirports(query: string, limit: number = 10): Airport[] {
  const airports = loadAirports();
  const searchTerm = query.toLowerCase().trim();
  
  if (searchTerm.length < 2) {
    return [];
  }
  
  // Score each airport based on match quality
  const scored = airports.map(airport => {
    let score = 0;
    
    // Exact code match (highest priority)
    if (airport.code.toLowerCase() === searchTerm) {
      score += 1000;
    }
    // Code starts with query
    else if (airport.code.toLowerCase().startsWith(searchTerm)) {
      score += 500;
    }
    // Code contains query
    else if (airport.code.toLowerCase().includes(searchTerm)) {
      score += 100;
    }
    
    // City exact match
    if (airport.city.toLowerCase() === searchTerm) {
      score += 800;
    }
    // City starts with query
    else if (airport.city.toLowerCase().startsWith(searchTerm)) {
      score += 400;
    }
    // City contains query
    else if (airport.city.toLowerCase().includes(searchTerm)) {
      score += 80;
    }
    
    // Name starts with query
    if (airport.name.toLowerCase().startsWith(searchTerm)) {
      score += 300;
    }
    // Name contains query
    else if (airport.name.toLowerCase().includes(searchTerm)) {
      score += 60;
    }
    
    // Country match
    if (airport.country.toLowerCase().includes(searchTerm)) {
      score += 40;
    }
    
    return { airport, score };
  });
  
  // Filter out non-matches and sort by score
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.airport);
}

/**
 * Get airport by IATA code
 */
export function getAirportByCode(code: string): Airport | null {
  const airports = loadAirports();
  return airports.find(a => a.code.toUpperCase() === code.toUpperCase()) || null;
}
