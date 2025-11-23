'use client';

import { FlightResult } from '@/types/global';
import { Card } from '@/components/ui/card';
import { Plane, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AirlineFlightCardProps {
  flight: FlightResult;
}

export default function AirlineFlightCard({ flight }: AirlineFlightCardProps) {
  // Get first itinerary and segments
  const itinerary = flight.itineraries?.[0];
  const segments = itinerary?.segments || [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  if (!firstSegment || !lastSegment) return null;

  // Format time from ISO string
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Format airport code and name
  const formatAirport = (code: string) => {
    return code;
  };

  // Calculate duration
  const formatDuration = (duration: string) => {
    // Duration format: PT8H20M
    const hours = duration.match(/(\d+)H/)?.[1] || '0';
    const minutes = duration.match(/(\d+)M/)?.[1] || '0';
    return `${hours}h ${minutes}m`;
  };

  // Determine if non-stop
  const stops = segments.length - 1;
  const stopText = stops === 0 ? 'non-stop' : `${stops} stop${stops > 1 ? 's' : ''}`;

  return (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* Departure Info */}
          <div className="flex items-center gap-4">
            <Plane className="w-5 h-5 text-[#1E3A5F] transform -rotate-45" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(firstSegment.departure.at)}
              </div>
              <div className="text-sm text-gray-600">
                {formatAirport(firstSegment.departure.iataCode)}
              </div>
            </div>
          </div>

          {/* Flight Path */}
          <div className="flex-1 mx-8">
            <div className="flex items-center justify-center gap-2">
              <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
              <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
            </div>
          </div>

          {/* Arrival Info */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(lastSegment.arrival.at)}
              </div>
              <div className="text-sm text-gray-600">
                {formatAirport(lastSegment.arrival.iataCode)}
              </div>
            </div>
            <Plane className="w-5 h-5 text-[#1E3A5F] transform rotate-45" />
          </div>

          {/* Price and Book Button */}
          <div className="ml-8 flex items-center gap-6">
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                ${flight.price.total}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {itinerary?.duration ? formatDuration(itinerary.duration) : 'N/A'}, {stopText}
              </div>
            </div>
            <Button 
              className="bg-[#1E3A5F] hover:bg-[#2A4A73] text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}