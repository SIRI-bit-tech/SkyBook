'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flight, Airline, Airport } from '@/types/global';
import FlightCard from '@/components/booking/FlightCard';
import AirlineFilter from '@/components/booking/AirlineFilter';
import RealTimeFlightSearch from '@/components/booking/RealTimeFlightSearch';
import { Suspense } from 'react';

function FlightSearchContent() {
  const searchParams = useSearchParams();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price');

  const departure = searchParams.get('departure') || '';
  const arrival = searchParams.get('arrival') || '';
  const departureDate = searchParams.get('departureDate') || '';
  const passengers = parseInt(searchParams.get('passengers') || '1');

  useEffect(() => {
    const searchFlights = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/flights/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            departureCity: departure,
            arrivalCity: arrival,
            departureDate,
            passengers,
            cabinClass: 'economy',
            airlines: selectedAirlines.length > 0 ? selectedAirlines : undefined,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setFlights(data.flights);
          
          // Get unique airlines from flights
          const uniqueAirlines = Array.from(
            new Map((data.flights || []).map((f: any) => [f.airline._id, f.airline])).values()
          );
          setAirlines(uniqueAirlines as Airline[]);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (departure && arrival && departureDate) {
      searchFlights();
    }
  }, [departure, arrival, departureDate, selectedAirlines, passengers]);

  // Sort and filter flights
  useEffect(() => {
    let sorted = [...flights];

    if (sortBy === 'price') {
      sorted.sort((a, b) => a.price.economy - b.price.economy);
    } else if (sortBy === 'duration') {
      sorted.sort((a, b) => a.duration - b.duration);
    } else {
      sorted.sort((a, b) => new Date(a.departure.time).getTime() - new Date(b.departure.time).getTime());
    }

    setFilteredFlights(sorted);
  }, [flights, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sky-400 hover:text-sky-300 mb-4 inline-block">← Back Home</Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            {departure} → {arrival}
          </h1>
          <p className="text-slate-300">
            {filteredFlights.length} flights found for {new Date(departureDate).toLocaleDateString()} • {passengers} passenger{passengers !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 p-4 sticky top-4">
              <h3 className="font-bold text-white mb-4">Filters</h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600"
                >
                  <option value="price">Lowest Price</option>
                  <option value="duration">Shortest Duration</option>
                  <option value="departure">Earliest Departure</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Airlines</label>
                <AirlineFilter
                  airlines={airlines}
                  selectedAirlines={selectedAirlines}
                  onSelect={setSelectedAirlines}
                />
              </div>
            </Card>
          </div>

          {/* Flight Results */}
          <div className="lg:col-span-3">
            {filteredFlights.length > 0 ? (
              <div className="space-y-4">
                {filteredFlights.map((flight) => (
                  <FlightCard
                    key={flight._id}
                    flight={flight}
                    passengers={passengers}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-slate-800 border-slate-700 p-8 text-center">
                <p className="text-slate-300 text-lg">No flights found for your search.</p>
                <Link href="/">
                  <Button className="mt-4 bg-sky-500 hover:bg-sky-600 text-white">
                    New Search
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </div>

        <RealTimeFlightSearch
          departure={departure}
          arrival={arrival}
          departureDate={departureDate}
          passengers={passengers}
        />
      </div>
    </div>
  );
}

export default function FlightSearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-white">Loading flights...</div>}>
      <FlightSearchContent />
    </Suspense>
  );
}
