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
  country: string;
  region?: string;
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
        `${API_ROUTES.AIRPORTS.SEARCH}?q=${encodeURIComponent(query)}`
      );
      const result = await response.json();

      // Transform API response to match our Airport interface
      const airports = (result.data || []).map((airport: any) => ({
        code: airport.code || airport.iataCode,
        name: airport.name,
        city: airport.city,
        country: airport.country || '',
        region: airport.region || '',
      }));

      if (type === 'departure') {
        setDepartureAirports(airports);
      } else {
        setArrivalAirports(airports);
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
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl p-6 rounded-2xl max-w-5xl mx-auto">
      <form onSubmit={handleSearch}>
        {/* All fields in one horizontal row */}
        <div className="flex flex-col lg:flex-row gap-3 items-end">
          {/* From */}
          <div className="flex-1 relative">
            <label htmlFor="flight-from" className="block text-xs font-medium text-gray-600 mb-1.5">
              From
            </label>
            <input
              id="flight-from"
              ref={departureInputRef}
              type="text"
              placeholder="City or airport"
              value={search.departure}
              onChange={handleDepartureChange}
              onFocus={() => setShowDepartureDropdown(true)}
              className="w-full bg-white text-gray-900 rounded-lg px-4 py-3 border border-gray-300 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none text-sm"
              required
            />
            {showDepartureDropdown && departureAirports.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {departureAirports.map((airport, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectDepartureAirport(airport)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-900 text-sm border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#1E3A5F]">{airport.code}</div>
                        <div className="text-xs text-gray-600">{airport.name}</div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div>{airport.city}{airport.region ? `, ${airport.region}` : ''}</div>
                        <div>{airport.country}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* To */}
          <div className="flex-1 relative">
            <label htmlFor="flight-to" className="block text-xs font-medium text-gray-600 mb-1.5">
              To
            </label>
            <input
              id="flight-to"
              ref={arrivalInputRef}
              type="text"
              placeholder="City or airport"
              value={search.arrival}
              onChange={handleArrivalChange}
              onFocus={() => setShowArrivalDropdown(true)}
              className="w-full bg-white text-gray-900 rounded-lg px-4 py-3 border border-gray-300 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none text-sm"
              required
            />
            {showArrivalDropdown && arrivalAirports.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {arrivalAirports.map((airport, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectArrivalAirport(airport)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-900 text-sm border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#1E3A5F]">{airport.code}</div>
                        <div className="text-xs text-gray-600">{airport.name}</div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div>{airport.city}{airport.region ? `, ${airport.region}` : ''}</div>
                        <div>{airport.country}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Depart Date */}
          <div className="flex-1">
            <label htmlFor="flight-depart" className="block text-xs font-medium text-gray-600 mb-1.5">
              Depart
            </label>
            <input
              id="flight-depart"
              type="date"
              value={search.departureDate}
              onChange={(e) => setSearch({ ...search, departureDate: e.target.value })}
              className="w-full bg-white text-gray-900 rounded-lg px-4 py-3 border border-gray-300 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none text-sm"
              required
            />
          </div>

          {/* Return Date (if round trip) */}
          {search.tripType === 'round-trip' && (
            <div className="flex-1">
              <label htmlFor="flight-return" className="block text-xs font-medium text-gray-600 mb-1.5">
                Return
              </label>
              <input
                id="flight-return"
                type="date"
                value={search.returnDate || ''}
                onChange={(e) => setSearch({ ...search, returnDate: e.target.value })}
                className="w-full bg-white text-gray-900 rounded-lg px-4 py-3 border border-gray-300 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none text-sm"
              />
            </div>
          )}

          {/* Search Button */}
          <div>
            <Button
              type="submit"
              className="bg-[#1E3A5F] hover:bg-[#2A4A73] text-white px-8 py-3 text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
            >
              Search Flights
            </Button>
          </div>
        </div>

        {/* Trip Type and Passengers Row Below */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <label htmlFor="flight-trip-type" className="block text-xs font-medium text-gray-600 mb-1.5">
              Trip Type
            </label>
            <select
              id="flight-trip-type"
              value={search.tripType}
              onChange={(e) => setSearch({ ...search, tripType: e.target.value as any })}
              className="w-full bg-white text-gray-900 rounded-lg px-4 py-3 border border-gray-300 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none text-sm"
            >
              <option value="one-way">One Way</option>
              <option value="round-trip">Round Trip</option>
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="flight-passengers" className="block text-xs font-medium text-gray-600 mb-1.5">
              Passengers
            </label>
            <select
              id="flight-passengers"
              value={search.passengers}
              onChange={(e) => setSearch({ ...search, passengers: parseInt(e.target.value) })}
              className="w-full bg-white text-gray-900 rounded-lg px-4 py-3 border border-gray-300 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/20 focus:outline-none text-sm"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </Card>
  );
}
