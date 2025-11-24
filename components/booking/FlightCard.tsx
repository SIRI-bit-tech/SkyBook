'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FlightDetailsModal from '@/components/flights/FlightDetailsModal';
import type { FlightResult } from '@/types/global';

interface FlightCardFlight {
  _id?: string;
  flightNumber: string;
  airline?: { name: string; code: string; logo: string };
  departure: { code?: string; time?: string | Date };
  arrival: { code?: string; time?: string | Date };
  duration: number;
  stops?: number;
  price: { economy?: number };
}

interface FlightCardProps {
  flight: FlightCardFlight;
  passengers: number;
}

export default function FlightCard({ flight, passengers }: FlightCardProps) {
  const router = useRouter();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const departureTime = flight.departure?.time ? new Date(flight.departure.time) : new Date();
  const arrivalTime = flight.arrival?.time ? new Date(flight.arrival.time) : new Date();
  const totalPrice = ((flight.price as any)?.economy || 0) * passengers;

  // Convert FlightCardFlight to FlightResult format for the modal
  const convertToFlightResult = (): FlightResult => {
    return {
      id: flight._id || '',
      airline: {
        code: flight.airline?.code || '',
        name: flight.airline?.name || '',
      },
      price: {
        amount: flight.price?.economy || 0,
        currency: 'USD',
        total: String(flight.price?.economy || 0),
      },
      departure: {
        airport: flight.departure?.code || '',
        time: flight.departure?.time ? new Date(flight.departure.time).toISOString() : new Date().toISOString(),
      },
      arrival: {
        airport: flight.arrival?.code || '',
        time: flight.arrival?.time ? new Date(flight.arrival.time).toISOString() : new Date().toISOString(),
      },
      duration: formatDuration(flight.duration),
      stops: flight.stops || 0,
      segments: [],
      validatingAirlineCodes: [flight.airline?.code || ''],
      numberOfBookableSeats: 10,
      itineraries: [{
        duration: `PT${Math.floor(flight.duration / 60)}H${flight.duration % 60}M`,
        segments: [{
          departure: {
            iataCode: flight.departure?.code || '',
            at: flight.departure?.time ? new Date(flight.departure.time).toISOString() : new Date().toISOString(),
            terminal: undefined,
            timeZone: undefined,
          },
          arrival: {
            iataCode: flight.arrival?.code || '',
            at: flight.arrival?.time ? new Date(flight.arrival.time).toISOString() : new Date().toISOString(),
            terminal: undefined,
            timeZone: undefined,
          },
          carrierCode: flight.airline?.code || '',
          number: flight.flightNumber.replace(/[A-Z]+/, ''),
          flightNumber: flight.flightNumber,
          duration: `PT${Math.floor(flight.duration / 60)}H${flight.duration % 60}M`,
          aircraft: undefined,
        }],
      }],
    };
  };

  const handleViewDetails = () => {
    setShowDetailsModal(true);
  };

  const handleSelectFlight = (flightResult: FlightResult) => {
    if (flight._id) {
      router.push(`/booking/select-seats?flightId=${flight._id}&passengers=${passengers}`);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-[#1E3A5F] hover:shadow-md transition p-5">
      <div className="flex items-center justify-between">
        {/* Left: Airline Logo */}
        <div className="flex items-center gap-3 w-20">
          {flight.airline && (
            <img
              src={(flight.airline as any).logo || "/placeholder.svg"}
              alt={(flight.airline as any).name}
              className="w-12 h-12 object-contain bg-gray-50 rounded p-1"
            />
          )}
        </div>

        {/* Center: Flight Times and Duration */}
        <div className="flex items-center gap-8 flex-1">
          {/* Departure */}
          <div className="text-left">
            <p className="text-2xl font-bold text-gray-900">{formatTime(departureTime)}</p>
            <p className="text-sm text-gray-600 mt-1">{flight.departure?.code || 'N/A'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(departureTime)}</p>
          </div>

          {/* Duration Arrow */}
          <div className="flex flex-col items-center flex-1">
            <p className="text-sm text-gray-600 mb-1">{formatDuration(flight.duration)}</p>
            <div className="w-full h-px bg-gray-300 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {(flight.stops ?? 0) === 0 ? (
                <span className="text-emerald-600 font-medium">Nonstop</span>
              ) : (
                <span className="text-orange-600 font-medium">
                  {flight.stops} Stop{(flight.stops ?? 0) > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{formatTime(arrivalTime)}</p>
            <p className="text-sm text-gray-600 mt-1">{flight.arrival?.code || 'N/A'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{formatDate(arrivalTime)}</p>
          </div>
        </div>

        {/* Right: Price and Select Button */}
        <div className="flex flex-col items-end gap-2 ml-8">
          <div className="text-right">
            <p className="text-xs text-gray-500">From</p>
            <p className="text-3xl font-bold text-gray-900">${totalPrice.toFixed(0)}</p>
            <p className="text-xs text-gray-500">per traveler</p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Button 
              onClick={handleViewDetails}
              className="bg-[#1E3A5F] hover:bg-[#2A4A73] text-white px-8 py-2.5 rounded-lg font-medium w-full"
            >
              View Details
            </Button>
            {flight._id ? (
              <Link href={`/booking/select-seats?flightId=${flight._id}&passengers=${passengers}`} className="w-full">
                <Button 
                  variant="outline"
                  className="border-[#1E3A5F] text-[#1E3A5F] hover:bg-blue-50 px-8 py-2.5 rounded-lg font-medium w-full"
                >
                  Select
                </Button>
              </Link>
            ) : (
              <Button 
                disabled 
                variant="outline"
                className="bg-gray-100 text-gray-400 px-8 py-2.5 rounded-lg font-medium cursor-not-allowed w-full"
                title="Flight ID not available"
              >
                Unavailable
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Flight Details Modal */}
      <FlightDetailsModal
        flight={showDetailsModal ? convertToFlightResult() : null}
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onSelectFlight={handleSelectFlight}
      />
    </div>
  );
}
