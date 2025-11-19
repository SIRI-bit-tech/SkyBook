'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FlightCard from './FlightCard';
import AirlineFilter from './AirlineFilter';

interface Flight {
  _id: string;
  flightNumber: string;
  airline: { _id: string; name: string; code: string; logo: string };
  departure: { code: string; time: string };
  arrival: { code: string; time: string };
  duration: number;
  stops: number;
  price: { economy: number };
  status: string;
}

interface Airline {
  _id: string;
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
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sortBy: 'price' as 'price' | 'duration' | 'departure' | 'stops',
    maxPrice: null as number | null,
    maxStops: null as number | null,
  });

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/flights/real-time-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            departure,
            arrival,
            departureDate,
            passengers,
            airlines: selectedAirlines.length > 0 ? selectedAirlines : undefined,
            maxPrice: filters.maxPrice,
            maxStops: filters.maxStops,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setFlights(data.flights || []);

          // Extract unique airlines from flights
          const uniqueAirlines = Array.from(
            new Map(
              (data.flights || []).map((f: Flight) => [f.airline._id, f.airline])
            ).values()
          );
          setAirlines(uniqueAirlines as Airline[]);
        }
      } catch (error) {
        console.error('Real-time flight search error:', error);
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

  if (loading && flights.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <Card className="bg-slate-800 border-slate-700 p-4 sticky top-4">
          <h3 className="font-bold text-white mb-6">Filters & Sort</h3>

          {/* Sort Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">Sort By</label>
            <div className="space-y-2">
              {['price', 'duration', 'stops', 'departure'].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    value={option}
                    checked={filters.sortBy === option}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-300 capitalize">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Max Price</label>
            <input
              type="number"
              min="0"
              step="10"
              value={filters.maxPrice || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  maxPrice: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="Any"
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
            />
          </div>

          {/* Stops Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">Stops</label>
            <div className="space-y-2">
              {['nonstop', '1stop', '2stops'].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="stops"
                    value={option === 'nonstop' ? '0' : option === '1stop' ? '1' : '2'}
                    checked={
                      filters.maxStops === null && option === 'nonstop'
                        ? true
                        : filters.maxStops === Number(option.match(/\d+/)?.[0] || 0)
                    }
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        maxStops: Number(e.target.value),
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-300 capitalize">
                    {option === 'nonstop' ? 'Nonstop' : option === '1stop' ? '1 Stop' : '2+ Stops'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Airline Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Airlines</label>
            <AirlineFilter
              airlines={airlines}
              selectedAirlines={selectedAirlines}
              onSelect={setSelectedAirlines}
            />
          </div>

          {/* Real-time indicator */}
          <div className="mt-6 pt-4 border-t border-slate-700">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              Live Updates
            </div>
          </div>
        </Card>
      </div>

      {/* Flight Results */}
      <div className="lg:col-span-3">
        {sortedFlights.length > 0 ? (
          <div className="space-y-4">
            <div className="text-slate-300 text-sm">
              {sortedFlights.length} flights found
              {selectedAirlines.length > 0 && ` • Filtered by ${selectedAirlines.length} airline(s)`}
            </div>
            {sortedFlights.map((flight) => (
              <FlightCard key={flight._id} flight={flight as any} passengers={passengers} />
            ))}
          </div>
        ) : (
          <Card className="bg-slate-800 border-slate-700 p-8 text-center">
            <p className="text-slate-300 text-lg">No flights found matching your criteria.</p>
            <p className="text-slate-400 text-sm mt-2">Try adjusting your filters or dates.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
