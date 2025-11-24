'use client';

import { useEffect, useState } from 'react';
import FlightCard from './FlightCard';
import FlightMapView from './FlightMapView';
import AirlineFilterSelector from '@/components/flights/AirlineFilterSelector';

interface SimplifiedFlight {
  _id: string;
  flightNumber: string;
  airline: { _id?: string; name: string; code: string; logo: string };
  departure: { code: string; time: string };
  arrival: { code: string; time: string };
  duration: number;
  stops: number;
  price: { economy: number };
  status: string;
}

interface SimplifiedAirline {
  _id?: string;
  code: string;
  name: string;
  logo: string;
}

interface RealTimeFlightSearchProps {
  departure: string;
  arrival: string;
  departureDate: string;
  passengers: number;
}

export default function RealTimeFlightSearch({
  departure,
  arrival,
  departureDate,
  passengers,
}: RealTimeFlightSearchProps) {
  const [flights, setFlights] = useState<SimplifiedFlight[]>([]);
  const [airlines, setAirlines] = useState<SimplifiedAirline[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sortBy: 'price' as 'price' | 'duration' | 'departure' | 'stops',
    maxPrice: null as number | null,
    maxStops: null as number | null,
  });
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const fetchFlights = async () => {
      // Validate required fields before making API call
      if (!departure || !arrival || !departureDate) {
        console.warn('Missing required search parameters:', { departure, arrival, departureDate });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const requestBody = {
          departure,
          arrival,
          departureDate,
          passengers,
          airlines: selectedAirlines.length > 0 ? selectedAirlines : undefined,
          maxPrice: filters.maxPrice,
          maxStops: filters.maxStops,
        };

        console.log('Fetching flights with params:', requestBody);

        const response = await fetch('/api/flights/real-time-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error('API error:', data);
          setFlights([]);
          setAirlines([]);
          return;
        }

        if (data.success) {
          setFlights(data.flights || []);

          // Extract unique airlines from flights
          const uniqueAirlines = Array.from(
            new Map(
              (data.flights || []).map((f: SimplifiedFlight) => [f.airline?._id || f.airline?.code, f.airline])
            ).values()
          );
          setAirlines(uniqueAirlines as SimplifiedAirline[]);
        }
      } catch (error) {
        console.error('Real-time flight search error:', error);
        setFlights([]);
        setAirlines([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
    const interval = setInterval(fetchFlights, 10000);
    return () => clearInterval(interval);
  }, [departure, arrival, departureDate, passengers, selectedAirlines, filters]);

  // Sort flights based on selected criteria
  const sortedFlights = [...flights].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price':
        return a.price.economy - b.price.economy;
      case 'duration':
        return a.duration - b.duration;
      case 'stops':
        return a.stops - b.stops;
      case 'departure':
        return new Date(a.departure.time).getTime() - new Date(b.departure.time).getTime();
      default:
        return 0;
    }
  });

  // Show error if required parameters are missing
  if (!departure || !arrival || !departureDate) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-700 text-lg font-semibold mb-2">Missing Search Parameters</p>
        <p className="text-gray-500 text-sm">
          Please provide departure, arrival, and departure date to search for flights.
        </p>
      </div>
    );
  }

  if (loading && flights.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div>
        <p className="ml-4 text-gray-600">Searching for flights...</p>
      </div>
    );
  }

  return (
    <>
      {showMap && (
        <FlightMapView
          flights={sortedFlights as any}
          departure={departure}
          arrival={arrival}
          onClose={() => setShowMap(false)}
        />
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        {/* Airline Filter */}
        <AirlineFilterSelector
          availableAirlines={airlines}
          selectedAirlines={selectedAirlines}
          onSelectionChange={setSelectedAirlines}
        />

        {/* Other Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-4">
          <h3 className="font-bold text-gray-900 text-lg mb-6">Other Filters</h3>

          {/* Stops Filter */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Stops</label>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, maxStops: 0 }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filters.maxStops === 0
                    ? 'bg-blue-50 text-[#1E3A5F] border-2 border-[#1E3A5F]'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                Non-stop
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, maxStops: 1 }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filters.maxStops === 1
                    ? 'bg-blue-50 text-[#1E3A5F] border-2 border-[#1E3A5F]'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                1 Stop
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, maxStops: null }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filters.maxStops === null
                    ? 'bg-blue-50 text-[#1E3A5F] border-2 border-[#1E3A5F]'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                Any Stops
              </button>
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Max Price</label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={filters.maxPrice ?? 1000}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    maxPrice: Number(e.target.value),
                  }))
                }
                className="w-full accent-[#1E3A5F]"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>$0</span>
                <span className="font-semibold">${filters.maxPrice ?? 1000}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flight Results */}
      <div className="lg:col-span-3">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Select your departing flight</h2>
            <button 
              onClick={() => setShowMap(true)}
              className="flex items-center gap-2 text-[#1E3A5F] hover:text-[#2A4A73] font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Map View
            </button>
          </div>
          <p className="text-gray-600 text-sm mb-4">Showing {sortedFlights.length} flights</p>
          
          {/* Sort Tabs */}
          <div className="flex gap-4 border-b border-gray-200 mb-4">
            <button
              onClick={() => setFilters(prev => ({ ...prev, sortBy: 'price' }))}
              className={`pb-3 px-2 font-medium text-sm transition ${
                filters.sortBy === 'price'
                  ? 'text-[#1E3A5F] border-b-2 border-[#1E3A5F]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Price
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, sortBy: 'duration' }))}
              className={`pb-3 px-2 font-medium text-sm transition ${
                filters.sortBy === 'duration'
                  ? 'text-[#1E3A5F] border-b-2 border-[#1E3A5F]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Duration
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, sortBy: 'departure' }))}
              className={`pb-3 px-2 font-medium text-sm transition ${
                filters.sortBy === 'departure'
                  ? 'text-[#1E3A5F] border-b-2 border-[#1E3A5F]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Departure
            </button>
          </div>
        </div>

        {sortedFlights.length > 0 ? (
          <div className="space-y-3">
            {sortedFlights.map((flight, index) => (
              <FlightCard key={flight._id || `flight-${index}`} flight={flight as any} passengers={passengers} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-700 text-lg">No flights found for your search.</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or dates.</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
