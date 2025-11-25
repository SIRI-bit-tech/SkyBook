'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plane, Clock, Calendar, Users, GitCompare } from 'lucide-react';
import { formatDuration, formatTime, formatDate, parseDuration } from '@/lib/flight-utils';
import { getAirlineLogo, getAirlineName } from '@/lib/airline-logos';
import FlightComparison from './FlightComparison';
import FlightDetailsModal from './FlightDetailsModal';
import Image from 'next/image';
import type { FlightResult, Filters } from '@/types/global';

interface FlightResultsProps {
  flights: FlightResult[];
  loading: boolean;
  error: string | null;
  filters: Filters;
}

type SortOption = 'price-low' | 'price-high' | 'duration-short' | 'duration-long' | 'departure-early' | 'departure-late';

export default function FlightResults({ flights, loading, error, filters }: FlightResultsProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>('price-low');
  const [compareFlights, setCompareFlights] = useState<FlightResult[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { airlines: selectedAirlines, priceRange, stops: selectedStops, departureTime } = filters;

  // Cache flights in sessionStorage for the details page
  useEffect(() => {
    if (flights.length > 0) {
      sessionStorage.setItem('flightSearchResults', JSON.stringify(flights));
    }
  }, [flights]);

  // Filter and sort flights
  const filteredAndSortedFlights = useMemo(() => {
    let result = [...flights];

    // Apply airline filter
    if (selectedAirlines.length > 0) {
      result = result.filter(flight => {
        const airlineCodes = flight.validatingAirlineCodes || [];
        return airlineCodes.some(code => selectedAirlines.includes(code));
      });
    }

    // Apply price filter
    result = result.filter(flight => {
      const price = parseFloat(flight.price.total);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Apply stops filter
    if (selectedStops.length > 0) {
      result = result.filter(flight => {
        const stops = flight.itineraries?.[0]?.segments.length ? flight.itineraries[0].segments.length - 1 : 0;
        return selectedStops.some(maxStops => {
          if (maxStops === 0) return stops === 0;
          if (maxStops === 1) return stops === 1;
          return stops >= 2; // 2+ stops
        });
      });
    }

    // Apply departure time filter
    if (departureTime.length > 0) {
      result = result.filter(flight => {
        const firstSegment = flight.itineraries?.[0]?.segments[0];
        if (!firstSegment) return false;
        
        const depTime = new Date(firstSegment.departure.at);
        const hour = depTime.getHours();
        
        return departureTime.some(period => {
          if (period === 'morning') return hour >= 6 && hour < 12;
          if (period === 'afternoon') return hour >= 12 && hour < 18;
          if (period === 'evening') return hour >= 18 && hour < 24;
          if (period === 'night') return hour >= 0 && hour < 6;
          return false;
        });
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price.total) - parseFloat(b.price.total);
        case 'price-high':
          return parseFloat(b.price.total) - parseFloat(a.price.total);
        case 'duration-short': {
          const durationA = parseDuration(a.itineraries?.[0]?.duration || 'PT0H');
          const durationB = parseDuration(b.itineraries?.[0]?.duration || 'PT0H');
          return durationA - durationB;
        }
        case 'duration-long': {
          const durationA = parseDuration(a.itineraries?.[0]?.duration || 'PT0H');
          const durationB = parseDuration(b.itineraries?.[0]?.duration || 'PT0H');
          return durationB - durationA;
        }
        case 'departure-early': {
          const segmentA = a.itineraries?.[0]?.segments[0];
          const segmentB = b.itineraries?.[0]?.segments[0];
          const timeA = segmentA ? new Date(segmentA.departure.at).getTime() : 0;
          const timeB = segmentB ? new Date(segmentB.departure.at).getTime() : 0;
          return timeA - timeB;
        }
        case 'departure-late': {
          const segmentA = a.itineraries?.[0]?.segments[0];
          const segmentB = b.itineraries?.[0]?.segments[0];
          const timeA = segmentA ? new Date(segmentA.departure.at).getTime() : 0;
          const timeB = segmentB ? new Date(segmentB.departure.at).getTime() : 0;
          return timeB - timeA;
        }
        default:
          return 0;
      }
    });

    return result;
  }, [flights, sortBy, selectedAirlines, priceRange, selectedStops, departureTime]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-800 border-slate-700 p-6 animate-pulse">
            <div className="h-24 bg-slate-700 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-8 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-sky-500 hover:bg-sky-600">
          Try Again
        </Button>
      </Card>
    );
  }

  if (filteredAndSortedFlights.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-8 text-center">
        <Plane className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No flights found</h3>
        <p className="text-slate-400">Try adjusting your search criteria or filters</p>
      </Card>
    );
  }

  const toggleCompare = (flight: FlightResult) => {
    setCompareFlights(prev => {
      // Validate flight and flight.id
      if (!flight || flight.id == null) {
        console.warn('Cannot compare flight: missing flight or flight.id');
        return prev;
      }

      const exists = prev.find(f => f.id === flight.id);
      if (exists) {
        return prev.filter(f => f.id !== flight.id);
      }
      if (prev.length >= 3) {
        return prev; // Max 3 flights
      }
      return [...prev, flight];
    });
  };

  const handleViewDetails = (flight: FlightResult) => {
    setSelectedFlight(flight);
    setShowDetailsModal(true);
  };

  const handleSelectFlight = (flight: FlightResult) => {
    // Navigate to passenger details
    const searchParams = new URLSearchParams({
      flightId: flight.id,
      passengers: '1',
    });
    router.push(`/passenger-details?${searchParams.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Sort Options & Compare */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-slate-300 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
          >
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="duration-short">Duration: Shortest</option>
            <option value="duration-long">Duration: Longest</option>
            <option value="departure-early">Departure: Earliest</option>
            <option value="departure-late">Departure: Latest</option>
          </select>
          
          {compareFlights.length > 0 && (
            <Button
              onClick={() => setShowComparison(true)}
              className="bg-sky-500 hover:bg-sky-600 ml-auto"
            >
              <GitCompare className="w-4 h-4 mr-2" />
              Compare ({compareFlights.length})
            </Button>
          )}
          
          <span className="text-slate-400 ml-auto">
            {filteredAndSortedFlights.length} {filteredAndSortedFlights.length === 1 ? 'flight' : 'flights'} found
          </span>
        </div>
      </Card>

      {/* Flight Cards */}
      {filteredAndSortedFlights.map((flight, index) => (
        <FlightCard 
          key={flight.id || index} 
          flight={flight}
          isComparing={compareFlights.some(f => f.id === flight.id)}
          onToggleCompare={() => toggleCompare(flight)}
          onViewDetails={() => handleViewDetails(flight)}
        />
      ))}

      {/* Flight Details Modal */}
      <FlightDetailsModal
        flight={selectedFlight}
        open={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedFlight(null);
        }}
        onSelectFlight={handleSelectFlight}
      />

      {/* Comparison Modal */}
      {showComparison && (
        <FlightComparison
          flights={compareFlights}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}

interface FlightCardProps {
  flight: FlightResult;
  isComparing?: boolean;
  onToggleCompare?: () => void;
  onViewDetails?: () => void;
}

function FlightCard({ 
  flight, 
  isComparing, 
  onToggleCompare,
  onViewDetails
}: FlightCardProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const itinerary = flight.itineraries?.[0];
  const segments = itinerary?.segments || [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  const stops = segments.length - 1;

  const departureTime = firstSegment?.departure.at;
  const arrivalTime = lastSegment?.arrival.at;
  const duration = itinerary?.duration;
  const price = flight.price.total;
  const currency = flight.price.currency;
  const airlines = flight.validatingAirlineCodes || [];

  return (
    <Card className={`bg-slate-800 border-slate-700 p-6 hover:border-sky-500 transition ${isComparing ? 'border-sky-500 ring-2 ring-sky-500' : ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Airline Logo */}
        <div className="md:col-span-2">
          <div className="flex flex-col gap-2">
            {airlines.slice(0, 2).map((code, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 overflow-hidden">
                  <Image
                    src={getAirlineLogo(code)}
                    alt={code}
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <span className="text-sm text-slate-300">{getAirlineName(code)}</span>
              </div>
            ))}
            {airlines.length > 2 && (
              <span className="text-xs text-slate-500">+{airlines.length - 2} more</span>
            )}
          </div>
        </div>

        {/* Flight Details */}
        <div className="md:col-span-7">
          <div className="flex items-center justify-between">
            {/* Departure */}
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{formatTime(departureTime, firstSegment?.departure.timeZone)}</p>
              <p className="text-sm text-slate-400">{firstSegment?.departure.iataCode}</p>
              <p className="text-xs text-slate-500">{formatDate(departureTime, firstSegment?.departure.timeZone)}</p>
            </div>

            {/* Duration & Stops */}
            <div className="flex-1 px-4">
              <div className="relative">
                <div className="border-t-2 border-slate-600 relative">
                  <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-sky-400 rotate-90" />
                </div>
                <div className="text-center mt-2">
                  <p className="text-sm text-slate-400">{formatDuration(duration || 'PT0H')}</p>
                  <p className="text-xs text-slate-500">
                    {stops === 0 ? 'Non-stop' : `${stops} ${stops === 1 ? 'stop' : 'stops'}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{formatTime(arrivalTime, lastSegment?.arrival.timeZone)}</p>
              <p className="text-sm text-slate-400">{lastSegment?.arrival.iataCode}</p>
              <p className="text-xs text-slate-500">{formatDate(arrivalTime, lastSegment?.arrival.timeZone)}</p>
            </div>
          </div>

          {/* Segments Info */}
          {stops > 0 && (
            <div className="mt-3 text-xs text-slate-500">
              Stops: {segments.slice(0, -1).map(seg => seg.arrival.iataCode).join(', ')}
            </div>
          )}
        </div>

        {/* Price & Book */}
        <div className="md:col-span-3 text-center md:text-right">
          <p className="text-3xl font-bold text-white mb-2">
            {currency} {parseFloat(price).toFixed(2)}
          </p>
          <div className="space-y-2">
            <Button 
              className="w-full bg-sky-500 hover:bg-sky-600 text-white"
              onClick={onViewDetails}
            >
              View Details
            </Button>
            {onToggleCompare && (
              <Button
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={onToggleCompare}
              >
                {isComparing ? 'Remove from Compare' : 'Add to Compare'}
              </Button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {flight.numberOfBookableSeats} seats left
          </p>
        </div>
      </div>
    </Card>
  );
}


