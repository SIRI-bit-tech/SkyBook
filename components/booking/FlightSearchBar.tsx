'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { API_ROUTES } from '@/config/constants';

interface SearchParams {
  departure: string;
  arrival: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  tripType: 'one-way' | 'round-trip';
}

interface Airport {
  code: string;
  name: string;
  city: string;
}

export default function FlightSearchBar() {
  const router = useRouter();
  const [search, setSearch] = useState<SearchParams>({
    departure: '',
    arrival: '',
    departureDate: '',
    passengers: 1,
    tripType: 'one-way',
  });

  const [departureAirports, setDepartureAirports] = useState<Airport[]>([]);
  const [arrivalAirports, setArrivalAirports] = useState<Airport[]>([]);
  const [showDepartureDropdown, setShowDepartureDropdown] = useState(false);
  const [showArrivalDropdown, setShowArrivalDropdown] = useState(false);
  const departureInputRef = useRef<HTMLInputElement>(null);
  const arrivalInputRef = useRef<HTMLInputElement>(null);

  const searchAirports = async (query: string, type: 'departure' | 'arrival') => {
    if (query.length < 2) {
      if (type === 'departure') setDepartureAirports([]);
      else setArrivalAirports([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_ROUTES.AIRPORTS.SEARCH}?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (type === 'departure') {
        setDepartureAirports(data.airports || []);
      } else {
        setArrivalAirports(data.airports || []);
      }
    } catch (error) {
      console.error('Airport search error:', error);
    }
  };

  const handleDepartureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch({ ...search, departure: value });
    searchAirports(value, 'departure');
    setShowDepartureDropdown(true);
  };

  const handleArrivalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch({ ...search, arrival: value });
    searchAirports(value, 'arrival');
    setShowArrivalDropdown(true);
  };

  const selectDepartureAirport = (airport: Airport) => {
    setSearch({ ...search, departure: airport.code });
    setShowDepartureDropdown(false);
  };

  const selectArrivalAirport = (airport: Airport) => {
    setSearch({ ...search, arrival: airport.code });
    setShowArrivalDropdown(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams({
      departure: search.departure,
      arrival: search.arrival,
      departureDate: search.departureDate,
      passengers: search.passengers.toString(),
      tripType: search.tripType,
      ...(search.returnDate && { returnDate: search.returnDate }),
    });

    router.push(`/flights/search?${params.toString()}`);
  };

  return (
    <Card className="bg-slate-800 border-slate-700 p-8 shadow-xl">
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Trip Type */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-slate-300 mb-2">Trip Type</label>
          <select
            value={search.tripType}
            onChange={(e) => setSearch({ ...search, tripType: e.target.value as any })}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
          >
            <option value="one-way">One Way</option>
            <option value="round-trip">Round Trip</option>
          </select>
        </div>

        {/* Departure with Autocomplete */}
        <div className="lg:col-span-1 relative">
          <label className="block text-sm font-medium text-slate-300 mb-2">From</label>
          <input
            ref={departureInputRef}
            type="text"
            placeholder="City or airport code"
            value={search.departure}
            onChange={handleDepartureChange}
            onFocus={() => setShowDepartureDropdown(true)}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            required
          />
          {showDepartureDropdown && departureAirports.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10">
              {departureAirports.map((airport, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectDepartureAirport(airport)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-600 text-white text-sm"
                >
                  {airport.code} - {airport.city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Arrival with Autocomplete */}
        <div className="lg:col-span-1 relative">
          <label className="block text-sm font-medium text-slate-300 mb-2">To</label>
          <input
            ref={arrivalInputRef}
            type="text"
            placeholder="City or airport code"
            value={search.arrival}
            onChange={handleArrivalChange}
            onFocus={() => setShowArrivalDropdown(true)}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            required
          />
          {showArrivalDropdown && arrivalAirports.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10">
              {arrivalAirports.map((airport, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectArrivalAirport(airport)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-600 text-white text-sm"
                >
                  {airport.code} - {airport.city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Departure Date */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-slate-300 mb-2">Depart</label>
          <input
            type="date"
            value={search.departureDate}
            onChange={(e) => setSearch({ ...search, departureDate: e.target.value })}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            required
          />
        </div>

        {/* Passengers */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-slate-300 mb-2">Passengers</label>
          <select
            value={search.passengers}
            onChange={(e) => setSearch({ ...search, passengers: parseInt(e.target.value) })}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
            ))}
          </select>
        </div>

        {/* Return Date (if round trip) */}
        {search.tripType === 'round-trip' && (
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">Return</label>
            <input
              type="date"
              value={search.returnDate || ''}
              onChange={(e) => setSearch({ ...search, returnDate: e.target.value })}
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            />
          </div>
        )}

        {/* Search Button */}
        <div className="col-span-full lg:col-span-1 flex items-end">
          <Button
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-2"
          >
            Search Flights
          </Button>
        </div>
      </form>
    </Card>
  );
}
