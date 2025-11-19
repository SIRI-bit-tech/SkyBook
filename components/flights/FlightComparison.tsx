'use client';


import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Check } from 'lucide-react';
import { formatDuration, formatTime, formatDate } from '@/lib/flight-utils';
import { getAirlineLogo, getAirlineName } from '@/lib/airline-logos';
import { Flight } from './FlightResults';
import Image from 'next/image';

interface FlightComparisonProps {
  flights: Flight[];
  onClose: () => void;
}

export default function FlightComparison({ flights, onClose }: FlightComparisonProps) {
  if (flights.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-slate-800 border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Compare Flights</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flights.map((flight, index) => (
              <ComparisonCard key={flight.id || index} flight={flight} />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function ComparisonCard({ flight }: { flight: Flight }) {
  const itinerary = flight.itineraries?.[0];
  const segments = itinerary?.segments || [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  const stops = segments.length - 1;
  const airlines = flight.validatingAirlineCodes || [];

  return (
    <Card className="bg-slate-700 border-slate-600 p-4">
      {/* Airline */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-white rounded flex items-center justify-center p-1">
          <Image
            src={getAirlineLogo(airlines[0])}
            alt={airlines[0]}
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{getAirlineName(airlines[0])}</p>
          <p className="text-xs text-slate-400">{airlines[0]}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <p className="text-3xl font-bold text-white">
          {flight.price.currency} {parseFloat(flight.price.total).toFixed(2)}
        </p>
      </div>

      {/* Flight Details */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Departure</span>
          <span className="text-white font-medium">
            {formatTime(firstSegment?.departure.at, firstSegment?.departure.timeZone)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Arrival</span>
          <span className="text-white font-medium">
            {formatTime(lastSegment?.arrival.at, lastSegment?.arrival.timeZone)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Duration</span>
          <span className="text-white font-medium">
            {formatDuration(itinerary?.duration || 'PT0H')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Stops</span>
          <span className="text-white font-medium">
            {stops === 0 ? 'Non-stop' : `${stops} ${stops === 1 ? 'stop' : 'stops'}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Seats Available</span>
          <span className="text-white font-medium">
            {flight.numberOfBookableSeats}
          </span>
        </div>
      </div>

      {/* Features */}
      <div className="mt-4 pt-4 border-t border-slate-600 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Check className="w-4 h-4 text-green-400" />
          <span>Instant Confirmation</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Check className="w-4 h-4 text-green-400" />
          <span>Digital Ticket</span>
        </div>
      </div>

      <Button className="w-full mt-4 bg-sky-500 hover:bg-sky-600">
        Select Flight
      </Button>
    </Card>
  );
}
