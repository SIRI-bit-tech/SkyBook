'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flight } from '@/types/global';

interface FlightCardProps {
  flight: Flight;
  passengers: number;
}

export default function FlightCard({ flight, passengers }: FlightCardProps) {
  const departureTime = new Date(flight.departure.time);
  const arrivalTime = new Date(flight.arrival.time);
  const totalPrice = ((flight.price as any)?.economy || 0) * passengers;

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-sky-500 transition p-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        {/* Airline Info - Enhanced */}
        <div className="flex items-center gap-3">
          {flight.airline && (
            <>
              <img
                src={(flight.airline as any).logo || "/placeholder.svg"}
                alt={(flight.airline as any).name}
                className="w-12 h-12 object-contain"
              />
              <div>
                <p className="text-xs text-slate-500 font-semibold">{flight.flightNumber}</p>
                <p className="font-bold text-white">{(flight.airline as any).name}</p>
                <p className="text-xs text-sky-400">{(flight.airline as any).code}</p>
              </div>
            </>
          )}
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-white">
            {departureTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </p>
          <p className="text-xs text-slate-400 mt-1">{flight.departure.code}</p>
          <p className="text-xs text-slate-500 mt-1">Dep</p>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-slate-300">
            {Math.floor(flight.duration / 60)}h {flight.duration % 60}m
          </p>
          <div className="flex items-center justify-center my-2">
            <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <p className="text-xs text-emerald-400 font-medium">
            {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-white">
            {arrivalTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </p>
          <p className="text-xs text-slate-400 mt-1">{flight.arrival.code}</p>
          <p className="text-xs text-slate-500 mt-1">Arr</p>
        </div>

        {/* Price and Select Button */}
        <div className="flex flex-col items-end justify-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400">From</p>
            <p className="text-3xl font-bold text-sky-400">${totalPrice.toFixed(0)}</p>
            <p className="text-xs text-slate-400">{passengers} PAX</p>
          </div>
          <Link href={`/booking/select-seats?flightId=${flight._id}&passengers=${passengers}`}>
            <Button className="bg-sky-500 hover:bg-sky-600 text-white px-6">
              Select Flight
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
