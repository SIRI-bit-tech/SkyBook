/**
 * Dynamic Airline Cache System
 * 
 * This module provides a dynamic airline caching system that:
 * 1. Builds airline data from actual flight search results
 * 2. Caches airline information to avoid repeated API calls
 * 3. Provides fallback mechanisms for unknown airlines
 * 4. Automatically expands the airline database over time
 */

interface CachedAirline {
  code: string;
  name: string;
  logo: string;
  cachedAt: number;
  source: 'amadeus' | 'fallback' | 'search-result';
}

class AirlineCache {
  private cache = new Map<string, CachedAirline>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly BATCH_SIZE = 10; // Max airlines to fetch in one API call

  constructor() {
    this.initializeWithKnownAirlines();
  }

  /**
   * Initialize cache with well-known airlines to provide immediate coverage
   */
  private initializeWithKnownAirlines() {
    const knownAirlines: Array<{ code: string; name: string }> = [
      { code: 'AA', name: 'American Airlines' },
      { code: 'DL', name: 'Delta Air Lines' },
      { code: 'UA', name: 'United Airlines' },
      { code: 'WN', name: 'Southwest Airlines' },
      { code: 'B6', name: 'JetBlue Airways' },
      { code: 'AS', name: 'Alaska Airlines' },
      { code: 'BA', name: 'British Airways' },
      { code: 'LH', name: 'Lufthansa' },
      { code: 'AF', name: 'Air France' },
      { code: 'KL', name: 'KLM' },
      { code: 'IB', name: 'Iberia' },
      { code: 'EK', name: 'Emirates' },
      { code: 'QR', name: 'Qatar Airways' },
      { code: 'EY', name: 'Etihad Airways' },
      { code: 'TK', name: 'Turkish Airlines' },
      { code: 'SQ', name: 'Singapore Airlines' },
      { code: 'CX', name: 'Cathay Pacific' },
      { code: 'JL', name: 'Japan Airlines' },
      { code: 'NH', name: 'All Nippon Airways' },
      { code: 'QF', name: 'Qantas' },
      { code: 'AC', name: 'Air Canada' },
      { code: 'AM', name: 'Aeromexico' },
      { code: 'LA', name: 'LATAM' },
      { code: 'AV', name: 'Avianca' },
    ];

    knownAirlines.forEach(airline => {
      this.cache.set(airline.code, {
        code: airline.code,
        name: airline.name,
        logo: `https://images.kiwi.com/airlines/64/${airline.code}.png`,
        cachedAt: Date.now(),
        source: 'fallback',
      });
    });
  }

  /**
   * Extract unique airline codes from flight search results
   */
  extractAirlineCodesFromFlights(flights: any[]): string[] {
    const codes = new Set<string>();
    
    flights.forEach(flight => {
      // Extract from segments
      flight.itineraries?.forEach((itinerary: any) => {
        itinerary.segments?.forEach((segment: any) => {
          if (segment.carrierCode) {
            codes.add(segment.carrierCode);
          }
          // Also check operating carrier
          if (segment.operating?.carrierCode) {
            codes.add(segment.operating.carrierCode);
          }
        });
      });
      
      // Extract from validating airline codes
      if (flight.validatingAirlineCodes) {
        flight.validatingAirlineCodes.forEach((code: string) => codes.add(code));
      }
    });

    return Array.from(codes);
  }

  /**
   * Get airline data with automatic caching and fallback
   */
  async getAirline(code: string): Promise<CachedAirline> {
    const cached = this.cache.get(code);
    
    // Return cached data if still valid
    if (cached && (Date.now() - cached.cachedAt) < this.CACHE_DURATION) {
      return cached;
    }

    // Try to fetch from Amadeus API
    try {
      const { amadeusClient } = await import('./amadeus-client');
      const airlineData = await amadeusClient.getAirlineData(code);
      
      if (airlineData) {
        const airline: CachedAirline = {
          code,
          name: airlineData.businessName || airlineData.commonName || code,
          logo: `https://images.kiwi.com/airlines/64/${code}.png`,
          cachedAt: Date.now(),
          source: 'amadeus',
        };
        
        this.cache.set(code, airline);
        return airline;
      }
    } catch (error) {
      console.warn(`Failed to fetch airline data for ${code}:`, error);
    }

    // Fallback to basic data
    const fallback: CachedAirline = {
      code,
      name: code, // Use code as name if no data available
      logo: `https://images.kiwi.com/airlines/64/${code}.png`,
      cachedAt: Date.now(),
      source: 'fallback',
    };
    
    this.cache.set(code, fallback);
    return fallback;
  }

  /**
   * Batch fetch multiple airlines efficiently
   */
  async getAirlines(codes: string[]): Promise<CachedAirline[]> {
    const results: CachedAirline[] = [];
    const uncachedCodes: string[] = [];

    // Check cache first
    for (const code of codes) {
      const cached = this.cache.get(code);
      if (cached && (Date.now() - cached.cachedAt) < this.CACHE_DURATION) {
        results.push(cached);
      } else {
        uncachedCodes.push(code);
      }
    }

    // Batch fetch uncached airlines
    if (uncachedCodes.length > 0) {
      const batches = this.chunkArray(uncachedCodes, this.BATCH_SIZE);
      
      for (const batch of batches) {
        try {
          const { amadeusClient } = await import('./amadeus-client');
          const response = await fetch(`/api/airlines/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codes: batch }),
          });
          
          if (response.ok) {
            const data = await response.json();
            data.airlines?.forEach((airline: any) => {
              const cached: CachedAirline = {
                code: airline.iataCode,
                name: airline.businessName || airline.commonName || airline.iataCode,
                logo: `https://images.kiwi.com/airlines/64/${airline.iataCode}.png`,
                cachedAt: Date.now(),
                source: 'amadeus',
              };
              
              this.cache.set(airline.iataCode, cached);
              results.push(cached);
            });
          }
        } catch (error) {
          console.warn('Batch airline fetch failed:', error);
          
          // Add fallbacks for failed batch
          batch.forEach(code => {
            const fallback: CachedAirline = {
              code,
              name: code,
              logo: `https://images.kiwi.com/airlines/64/${code}.png`,
              cachedAt: Date.now(),
              source: 'fallback',
            };
            
            this.cache.set(code, fallback);
            results.push(fallback);
          });
        }
      }
    }

    return results;
  }

  /**
   * Process flight search results and ensure all airlines are cached
   */
  async processFlightResults(flights: any[]): Promise<CachedAirline[]> {
    const airlineCodes = this.extractAirlineCodesFromFlights(flights);
    return this.getAirlines(airlineCodes);
  }

  /**
   * Get all cached airlines (for filter UI)
   */
  getAllCachedAirlines(): CachedAirline[] {
    return Array.from(this.cache.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Clear expired cache entries
   */
  cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [code, airline] of this.cache.entries()) {
      if ((now - airline.cachedAt) > this.CACHE_DURATION) {
        this.cache.delete(code);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const total = this.cache.size;
    const bySource = Array.from(this.cache.values()).reduce((acc, airline) => {
      acc[airline.source] = (acc[airline.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, bySource };
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Export singleton instance
export const airlineCache = new AirlineCache();

// Export types
export type { CachedAirline };