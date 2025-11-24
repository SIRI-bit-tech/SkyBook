import fs from 'fs/promises';
import path from 'path';
import { Airline } from '@/types/global';

export interface OpenFlightsAirline {
  id: number;
  name: string;
  alias: string;
  iataCode: string;
  icaoCode: string;
  callsign: string;
  country: string;
  active: boolean;
}

class AirlineDataService {
  private airlines: OpenFlightsAirline[] = [];
  private initialized = false;
  private loadingPromise: Promise<void> | null = null;

  private async loadAirlines(): Promise<void> {
    // If already initialized, return immediately
    if (this.initialized) return;

    // If already loading, wait for that promise
    if (this.loadingPromise) return this.loadingPromise;

    // Start loading
    this.loadingPromise = (async () => {
      try {
        const filePath = path.join(process.cwd(), 'public', 'airlines.dat');
        const csvData = await fs.readFile(filePath, 'utf-8');
        
        // Parse CSV data (OpenFlights format)
        const lines = csvData.trim().split('\n');
        const parsedAirlines = lines
          .map(line => {
            // Parse CSV line with proper handling of quoted fields
            const fields = this.parseCSVLine(line);
            
            if (fields.length < 8) return null;
            
            const iataCode = fields[3]?.replace(/"/g, '').trim();
            const icaoCode = fields[4]?.replace(/"/g, '').trim();
            
            // Only include airlines with valid IATA codes and active status
            if (!iataCode || iataCode === '\\N' || iataCode === '-' || iataCode.length !== 2) {
              return null;
            }

            const active = fields[7]?.replace(/"/g, '').trim() === 'Y';
            if (!active) return null;

            return {
              id: parseInt(fields[0]) || 0,
              name: fields[1]?.replace(/"/g, '').trim() || '',
              alias: fields[2]?.replace(/"/g, '').trim() || '',
              iataCode,
              icaoCode: icaoCode === '\\N' ? '' : icaoCode,
              callsign: fields[5]?.replace(/"/g, '').trim() || '',
              country: fields[6]?.replace(/"/g, '').trim() || '',
              active: true, // We only return active airlines
            };
          })
          .filter((airline): airline is OpenFlightsAirline => airline !== null && airline.active);

        // Only set airlines and initialized on success
        this.airlines = parsedAirlines;
        this.initialized = true;
        console.log(`Loaded ${this.airlines.length} active airlines from OpenFlights database`);
      } catch (error) {
        console.error('Failed to load airlines database:', error instanceof Error ? error.message : error);
        // Don't set initialized = true on error, allowing retry on next call
        // Clear the loading promise so next call can retry
        this.loadingPromise = null;
        throw error; // Re-throw to let caller handle
      }
    })();

    return this.loadingPromise;
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

  async getAllAirlines(): Promise<Airline[]> {
    await this.loadAirlines();
    
    // Transform to match Airline interface from global.d.ts
    return this.airlines.map(airline => ({
      _id: airline.iataCode,
      name: airline.name,
      code: airline.iataCode,
      logo: `https://images.kiwi.com/airlines/64x64/${airline.iataCode}.png`,
      country: airline.country,
      description: this.getAirlineDescription(airline.iataCode, airline.name, airline.country),
      website: this.getAirlineWebsite(airline.iataCode),
      popularRoutes: this.getPopularRoutes(airline.iataCode),
      fleetSize: this.estimateFleetSize(airline.iataCode, airline.country),
      foundedYear: this.getFoundedYear(airline.iataCode),
      destinations: this.getDestinations(airline.iataCode),
      headquarters: this.getHeadquarters(airline.iataCode, airline.country),
      isActive: true,
      isFeatured: this.isFeaturedAirline(airline.iataCode),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async getAirlineByCode(code: string): Promise<Airline | null> {
    await this.loadAirlines();
    
    const airline = this.airlines.find(
      a => a.iataCode.toLowerCase() === code.toLowerCase()
    );
    
    if (!airline) return null;
    
    return {
      _id: airline.iataCode,
      name: airline.name,
      code: airline.iataCode,
      logo: `https://images.kiwi.com/airlines/64x64/${airline.iataCode}.png`,
      country: airline.country,
      description: this.getAirlineDescription(airline.iataCode, airline.name, airline.country),
      website: this.getAirlineWebsite(airline.iataCode),
      popularRoutes: this.getPopularRoutes(airline.iataCode),
      fleetSize: this.estimateFleetSize(airline.iataCode, airline.country),
      foundedYear: this.getFoundedYear(airline.iataCode),
      destinations: this.getDestinations(airline.iataCode),
      headquarters: this.getHeadquarters(airline.iataCode, airline.country),
      isActive: true,
      isFeatured: this.isFeaturedAirline(airline.iataCode),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getStats(): Promise<{ totalAirlines: number; countries: number; }> {
    await this.loadAirlines();
    
    const uniqueCountries = new Set(this.airlines.map(a => a.country));
    
    return {
      totalAirlines: this.airlines.length,
      countries: uniqueCountries.size,
    };
  }

  private getAirlineWebsite(code: string): string {
    const websiteMap: { [key: string]: string } = {
      'AA': 'https://www.aa.com',
      'DL': 'https://www.delta.com',
      'UA': 'https://www.united.com',
      'WN': 'https://www.southwest.com',
      'B6': 'https://www.jetblue.com',
      'AS': 'https://www.alaskaair.com',
      'BA': 'https://www.britishairways.com',
      'LH': 'https://www.lufthansa.com',
      'AF': 'https://www.airfrance.com',
      'KL': 'https://www.klm.com',
      'EK': 'https://www.emirates.com',
      'QR': 'https://www.qatarairways.com',
      'SQ': 'https://www.singaporeair.com',
      'CX': 'https://www.cathaypacific.com',
      'JL': 'https://www.jal.co.jp',
      'NH': 'https://www.ana.co.jp',
      'QF': 'https://www.qantas.com',
      'AC': 'https://www.aircanada.com',
    };
    
    return websiteMap[code] || `https://www.${code.toLowerCase()}.com`;
  }

  private getPopularRoutes(code: string): string[] {
    const routeMap: { [key: string]: string[] } = {
      'AA': ['JFK-LAX', 'DFW-LHR', 'MIA-LGW'],
      'DL': ['ATL-LAX', 'JFK-CDG', 'SEA-NRT'],
      'UA': ['ORD-LHR', 'SFO-NRT', 'EWR-FRA'],
      'BA': ['LHR-JFK', 'LGW-DXB', 'LHR-SYD'],
      'LH': ['FRA-JFK', 'MUC-LAX', 'FRA-NRT'],
      'AF': ['CDG-JFK', 'CDG-NRT', 'ORY-DXB'],
      'EK': ['DXB-LHR', 'DXB-JFK', 'DXB-SYD'],
      'QR': ['DOH-LHR', 'DOH-JFK', 'DOH-SYD'],
      'SQ': ['SIN-LHR', 'SIN-JFK', 'SIN-SYD'],
    };
    
    return routeMap[code] || [`${code}-JFK`, `${code}-LHR`];
  }

  private estimateFleetSize(code: string, country: string): number {
    // Major airlines fleet sizes (approximate)
    const fleetMap: { [key: string]: number } = {
      'AA': 950, 'DL': 900, 'UA': 850, 'WN': 800,
      'BA': 280, 'LH': 750, 'AF': 220, 'KL': 110,
      'EK': 270, 'QR': 250, 'SQ': 140, 'CX': 200,
      'JL': 230, 'NH': 280, 'QF': 130, 'AC': 400,
    };
    
    if (fleetMap[code]) return fleetMap[code];
    
    // Estimate based on country (rough approximation)
    const countryMultiplier: { [key: string]: number } = {
      'United States': 200,
      'United Kingdom': 100,
      'Germany': 150,
      'France': 120,
      'China': 300,
      'Japan': 150,
      'Australia': 80,
      'Canada': 100,
    };
    
    return countryMultiplier[country] || 50;
  }

  private isFeaturedAirline(code: string): boolean {
    const featuredAirlines = [
      'AA', 'DL', 'UA', 'WN', 'B6', // US
      'BA', 'LH', 'AF', 'KL', // Europe
      'EK', 'QR', 'TK', // Middle East
      'SQ', 'CX', 'JL', 'NH', // Asia
      'QF', 'AC' // Oceania/Canada
    ];
    
    return featuredAirlines.includes(code);
  }

  private getFoundedYear(code: string): number {
    const foundedYearMap: { [key: string]: number } = {
      // US Airlines
      'AA': 1930, 'DL': 1924, 'UA': 1926, 'WN': 1967, 'B6': 1998, 'AS': 1932,
      // European Airlines
      'BA': 1974, 'LH': 1953, 'AF': 1933, 'KL': 1919, 'IB': 1927, 'AZ': 1946,
      'SN': 1923, 'LX': 2002, 'OS': 1957, 'SK': 1946,
      // Middle East Airlines
      'EK': 1985, 'QR': 1993, 'EY': 2003, 'TK': 1933,
      // Asian Airlines
      'SQ': 1947, 'CX': 1946, 'JL': 1951, 'NH': 1952, 'KE': 1969, 'TG': 1960,
      'MH': 1947, 'CI': 1959, 'BR': 1989,
      // Chinese Airlines
      'CA': 1988, 'CZ': 1988, 'MU': 1988,
      // Indian Airlines
      'AI': 1932, '6E': 2006, 'SG': 2003,
      // Australian Airlines
      'QF': 1920, 'JQ': 2003, 'VA': 2000,
      // Canadian Airlines
      'AC': 1937, 'WF': 1996,
      // South American Airlines
      'LA': 1929, 'G3': 2001, 'AR': 1950,
      // African Airlines
      'SA': 1934, 'ET': 1945, 'MS': 1932, 'AT': 1957,
      // Low-Cost Carriers
      'FR': 1984, 'U2': 1995, 'VY': 2004, 'W6': 2003,
      // Mexican Airlines
      'AM': 1934, 'Y4': 2005,
    };
    
    return foundedYearMap[code] || 1980;
  }

  private getDestinations(code: string): number {
    const destinationsMap: { [key: string]: number } = {
      // US Airlines
      'AA': 350, 'DL': 325, 'UA': 342, 'WN': 121, 'B6': 100, 'AS': 115,
      // European Airlines
      'BA': 183, 'LH': 220, 'AF': 201, 'KL': 145, 'IB': 135, 'AZ': 94,
      'SN': 120, 'LX': 106, 'OS': 130, 'SK': 125,
      // Middle East Airlines
      'EK': 157, 'QR': 170, 'EY': 84, 'TK': 315,
      // Asian Airlines
      'SQ': 137, 'CX': 119, 'JL': 220, 'NH': 230, 'KE': 124, 'TG': 84,
      'MH': 60, 'CI': 102, 'BR': 62,
      // Chinese Airlines
      'CA': 200, 'CZ': 224, 'MU': 248,
      // Indian Airlines
      'AI': 102, '6E': 96, 'SG': 46,
      // Australian Airlines
      'QF': 85, 'JQ': 85, 'VA': 41,
      // Canadian Airlines
      'AC': 220, 'WF': 109,
      // South American Airlines
      'LA': 145, 'G3': 104, 'AR': 81,
      // African Airlines
      'SA': 38, 'ET': 125, 'MS': 75, 'AT': 94,
      // Low-Cost Carriers
      'FR': 225, 'U2': 156, 'VY': 122, 'W6': 155,
      // Mexican Airlines
      'AM': 90, 'Y4': 43,
    };
    
    return destinationsMap[code] || 50;
  }

  private getHeadquarters(code: string, country: string): string {
    const headquartersMap: { [key: string]: string } = {
      // US Airlines
      'AA': 'Fort Worth, Texas', 'DL': 'Atlanta, Georgia', 'UA': 'Chicago, Illinois',
      'WN': 'Dallas, Texas', 'B6': 'New York City, New York', 'AS': 'Seattle, Washington',
      // European Airlines
      'BA': 'London, United Kingdom', 'LH': 'Cologne, Germany', 'AF': 'Paris, France',
      'KL': 'Amstelveen, Netherlands', 'IB': 'Madrid, Spain', 'AZ': 'Rome, Italy',
      'SN': 'Brussels, Belgium', 'LX': 'Basel, Switzerland', 'OS': 'Vienna, Austria',
      'SK': 'Stockholm, Sweden',
      // Middle East Airlines
      'EK': 'Dubai, UAE', 'QR': 'Doha, Qatar', 'EY': 'Abu Dhabi, UAE', 'TK': 'Istanbul, Turkey',
      // Asian Airlines
      'SQ': 'Singapore', 'CX': 'Hong Kong', 'JL': 'Tokyo, Japan', 'NH': 'Tokyo, Japan',
      'KE': 'Seoul, South Korea', 'TG': 'Bangkok, Thailand', 'MH': 'Kuala Lumpur, Malaysia',
      'CI': 'Taipei, Taiwan', 'BR': 'Taipei, Taiwan',
      // Chinese Airlines
      'CA': 'Beijing, China', 'CZ': 'Guangzhou, China', 'MU': 'Shanghai, China',
      // Indian Airlines
      'AI': 'New Delhi, India', '6E': 'Gurgaon, India', 'SG': 'Gurgaon, India',
      // Australian Airlines
      'QF': 'Sydney, Australia', 'JQ': 'Melbourne, Australia', 'VA': 'Brisbane, Australia',
      // Canadian Airlines
      'AC': 'Montreal, Canada', 'WF': 'Calgary, Canada',
      // South American Airlines
      'LA': 'Santiago, Chile', 'G3': 'São Paulo, Brazil', 'AR': 'Buenos Aires, Argentina',
      // African Airlines
      'SA': 'Johannesburg, South Africa', 'ET': 'Addis Ababa, Ethiopia',
      'MS': 'Cairo, Egypt', 'AT': 'Casablanca, Morocco',
      // Low-Cost Carriers
      'FR': 'Dublin, Ireland', 'U2': 'Luton, United Kingdom', 'VY': 'Barcelona, Spain',
      'W6': 'Budapest, Hungary',
      // Mexican Airlines
      'AM': 'Mexico City, Mexico', 'Y4': 'Toluca, Mexico',
    };
    
    return headquartersMap[code] || country;
  }

  private getAirlineDescription(code: string, name: string, country: string): string {
    const descriptionMap: { [key: string]: string } = {
      'AA': 'Connecting continents with unparalleled comfort and service.',
      'DL': 'Premium air travel with exceptional service and reliability.',
      'UA': 'Fly the friendly skies with global connectivity.',
      'BA': 'To fly, to serve - British excellence in aviation.',
      'LH': 'Connecting the world with German precision and quality.',
      'AF': 'French elegance meets world-class aviation.',
      'EK': 'Experience luxury in the skies with world-class service.',
      'QR': 'Five-star airline service connecting the world.',
      'SQ': 'A great way to fly with award-winning service.',
      'AC': 'Canada\'s flag carrier connecting the world.',
      'QF': 'The spirit of Australia in the skies.',
      'TK': 'Widen your world with extensive global network.',
    };
    
    return descriptionMap[code] || `${name} - Connecting destinations with quality service.`;
  }
}

export const airlineDataService = new AirlineDataService();