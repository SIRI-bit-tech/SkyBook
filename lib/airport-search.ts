import fs from 'fs';
import path from 'path';

export interface Airport {
  id: number;
  name: string;
  city: string;
  country: string;
  iataCode: string;
  icaoCode: string;
  latitude: number;
  longitude: number;
  altitude: number;
  timezone: string;
  type: string;
  source: string;
}

export interface AirportSearchResult {
  iataCode: string;
  name: string;
  city: string;
  country: string;
  type: string;
  displayName: string;
  fullName: string;
  geoCode?: {
    latitude: number;
    longitude: number;
  };
}

class AirportSearchService {
  private airports: Airport[] = [];
  private initialized = false;

  private async loadAirports(): Promise<void> {
    if (this.initialized) return;

    try {
      const filePath = path.join(process.cwd(), 'public', 'airports.json');
      const csvData = fs.readFileSync(filePath, 'utf-8');
      
      // Parse CSV data
      const lines = csvData.trim().split('\n');
      this.airports = lines
        .map(line => {
          // Parse CSV line (handle quoted fields)
          const fields = this.parseCSVLine(line);
          
          if (fields.length < 14) return null;
          
          const iataCode = fields[4]?.replace(/"/g, '').trim();
          const icaoCode = fields[5]?.replace(/"/g, '').trim();
          
          // Only include airports with valid IATA codes
          if (!iataCode || iataCode === '\\N' || iataCode.length !== 3) {
            return null;
          }

          return {
            id: parseInt(fields[0]) || 0,
            name: fields[1]?.replace(/"/g, '').trim() || '',
            city: fields[2]?.replace(/"/g, '').trim() || '',
            country: fields[3]?.replace(/"/g, '').trim() || '',
            iataCode,
            icaoCode: icaoCode === '\\N' ? '' : icaoCode,
            latitude: parseFloat(fields[6]) || 0,
            longitude: parseFloat(fields[7]) || 0,
            altitude: parseInt(fields[8]) || 0,
            timezone: fields[11]?.replace(/"/g, '').trim() || '',
            type: fields[12]?.replace(/"/g, '').trim() || 'airport',
            source: fields[13]?.replace(/"/g, '').trim() || 'OpenFlights',
          };
        })
        .filter((airport): airport is Airport => airport !== null);

      console.log(`Loaded ${this.airports.length} airports from OpenFlights database`);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load airports database:', error);
      this.airports = [];
      this.initialized = true;
    }
  }

  private parseCSVLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Handle escaped quote ("" inside quoted field)
          current += '"';
          i++; // Skip the next quote
        } else {
          // Toggle inQuotes when entering/exiting quoted sections
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    fields.push(current); // Add the last field
    return fields;
  }

  async searchAirports(query: string, limit: number = 20): Promise<AirportSearchResult[]> {
    await this.loadAirports();
    
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const results: AirportSearchResult[] = [];

    // Search through airports
    for (const airport of this.airports) {
      if (results.length >= limit) break;

      const matches = 
        airport.iataCode.toLowerCase().includes(searchTerm) ||
        airport.name.toLowerCase().includes(searchTerm) ||
        airport.city.toLowerCase().includes(searchTerm) ||
        airport.country.toLowerCase().includes(searchTerm);

      if (matches) {
        results.push({
          iataCode: airport.iataCode,
          name: airport.name,
          city: airport.city,
          country: airport.country,
          type: 'AIRPORT',
          displayName: `${airport.name} (${airport.iataCode})`,
          fullName: `${airport.name}, ${airport.city}, ${airport.country}`,
          geoCode: {
            latitude: airport.latitude,
            longitude: airport.longitude,
          },
        });
      }
    }

    // Sort results by relevance
    return results.sort((a, b) => {
      // Exact IATA code match first
      if (a.iataCode.toLowerCase() === searchTerm) return -1;
      if (b.iataCode.toLowerCase() === searchTerm) return 1;
      
      // IATA code starts with query
      if (a.iataCode.toLowerCase().startsWith(searchTerm)) return -1;
      if (b.iataCode.toLowerCase().startsWith(searchTerm)) return 1;
      
      // City name starts with query
      if (a.city.toLowerCase().startsWith(searchTerm)) return -1;
      if (b.city.toLowerCase().startsWith(searchTerm)) return 1;
      
      // Airport name starts with query
      if (a.name.toLowerCase().startsWith(searchTerm)) return -1;
      if (b.name.toLowerCase().startsWith(searchTerm)) return 1;
      
      return 0;
    });
  }

  // Get popular airports for a specific region/country
  async getPopularAirports(country?: string, limit: number = 10): Promise<AirportSearchResult[]> {
    await this.loadAirports();
    
    let filteredAirports = this.airports;
    
    if (country) {
      filteredAirports = this.airports.filter(
        airport => airport.country.toLowerCase().includes(country.toLowerCase())
      );
    }
    
    // For now, just return the first airports (could be enhanced with popularity data)
    return filteredAirports
      .slice(0, limit)
      .map(airport => ({
        iataCode: airport.iataCode,
        name: airport.name,
        city: airport.city,
        country: airport.country,
        type: 'AIRPORT',
        displayName: `${airport.name} (${airport.iataCode})`,
        fullName: `${airport.name}, ${airport.city}, ${airport.country}`,
        geoCode: {
          latitude: airport.latitude,
          longitude: airport.longitude,
        },
      }));
  }

  // Get airport statistics
  async getStats(): Promise<{ totalAirports: number; countries: number; }> {
    await this.loadAirports();
    
    const uniqueCountries = new Set(this.airports.map(a => a.country));
    
    return {
      totalAirports: this.airports.length,
      countries: uniqueCountries.size,
    };
  }

  async getAirportByCode(iataCode: string): Promise<AirportSearchResult | null> {
    await this.loadAirports();
    
    const airport = this.airports.find(
      a => a.iataCode.toLowerCase() === iataCode.toLowerCase()
    );
    
    if (!airport) return null;
    
    return {
      iataCode: airport.iataCode,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      type: 'AIRPORT',
      displayName: `${airport.name} (${airport.iataCode})`,
      fullName: `${airport.name}, ${airport.city}, ${airport.country}`,
      geoCode: {
        latitude: airport.latitude,
        longitude: airport.longitude,
      },
    };
  }
}

export const airportSearchService = new AirportSearchService();