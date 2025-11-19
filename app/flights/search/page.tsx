'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FlightResults, { Flight, Filters } from '@/components/flights/FlightResults';
import FlightFilters from '@/components/flights/FlightFilters';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function FlightSearchPage() {
  const searchParams = useSearchParams();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    airlines: [],
    priceRange: [0, 10000],
    stops: [],
    departureTime: [],
  });

  const departure = searchParams.get('departure');
  const arrival = searchParams.get('arrival');
  const departureDate = searchParams.get('departureDate');
  const returnDate = searchParams.get('returnDate');
  const passengers = searchParams.get('passengers') || '1';
  const tripType = searchParams.get('tripType') || 'one-way';

  useEffect(() => {
    const fetchFlights = async () => {
      if (!departure || !arrival || !departureDate) {
        setError('Missing required search parameters');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          departure,
          arrival,
          departureDate,
          passengers,
        });

        if (returnDate) {
          params.append('returnDate', returnDate);
        }

        const response = await fetch(`/api/flights/search?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch flights');
        }

        const data = await response.json();
        setFlights(data.flights || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load flights');
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [departure, arrival, departureDate, returnDate, passengers]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:text-sky-400">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Summary */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            {departure} → {arrival}
          </h1>
          <p className="text-slate-300">
            {departureDate} {returnDate && `- ${returnDate}`} • {passengers} {parseInt(passengers) === 1 ? 'Passenger' : 'Passengers'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FlightFilters 
              flights={flights}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <FlightResults 
              flights={flights} 
              loading={loading} 
              error={error}
              filters={filters}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
