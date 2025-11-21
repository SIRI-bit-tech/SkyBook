'use client';

import { PopulatedBooking } from '@/types/global';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Plane } from 'lucide-react';
import Link from 'next/link';

interface BookingCardProps {
  booking: PopulatedBooking;
  onCancel?: (bookingId: string) => void;
  onCheckIn?: (bookingId: string) => void;
}

export default function BookingCard({ booking, onCancel, onCheckIn }: BookingCardProps) {
  const departureTime = new Date(booking.flight.departure.time);
  const arrivalTime = new Date(booking.flight.arrival.time);
  const now = new Date();
  
  const isPast = arrivalTime < now;
  const canCheckIn = booking.status === 'confirmed' && 
                     departureTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000 &&
                     departureTime > now;
  const canCancel = booking.status === 'confirmed' && !isPast;

  const getStatusColor = () => {
    switch (booking.status) {
      case 'confirmed': return 'bg-emerald-500/20 text-emerald-400';
      case 'checked-in': return 'bg-sky-500/20 text-sky-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      case 'pending': return 'bg-amber-500/20 text-amber-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 p-6 hover:border-sky-500/50 transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            {booking.flight.flightNumber}
          </h3>
          <p className="text-sm text-slate-400">
            Booking Ref: <span className="text-sky-400 font-semibold">{booking.bookingReference}</span>
          </p>
        </div>
        <span className={`px-3 py-1 rounded text-sm font-medium capitalize ${getStatusColor()}`}>
          {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <MapPin className="w-4 h-4" />
            <span>From</span>
          </div>
          <p className="text-white font-semibold">{booking.flight.departure.airport}</p>
          <p className="text-sm text-slate-400">
            {departureTime.toLocaleDateString()} at {departureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <MapPin className="w-4 h-4" />
            <span>To</span>
          </div>
          <p className="text-white font-semibold">{booking.flight.arrival.airport}</p>
          <p className="text-sm text-slate-400">
            {arrivalTime.toLocaleDateString()} at {arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-400 mb-4 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{booking.passengers.length} passenger{booking.passengers.length > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <Plane className="w-4 h-4" />
          <span>Seats: {booking.seats.join(', ')}</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Link href={`/dashboard/bookings/${booking._id}`}>
          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
            View Details
          </Button>
        </Link>

        {canCheckIn && onCheckIn && (
          <Button 
            size="sm" 
            className="bg-sky-500 hover:bg-sky-600"
            onClick={() => onCheckIn(booking._id!)}
          >
            Check In
          </Button>
        )}

        {canCancel && onCancel && (
          <Button 
            size="sm" 
            variant="outline" 
            className="border-red-500 text-red-400 hover:bg-red-500/10"
            onClick={() => onCancel(booking._id!)}
          >
            Cancel Booking
          </Button>
        )}

        <Link href={`/api/tickets/download/${booking.bookingReference}`} target="_blank">
          <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
            Download Ticket
          </Button>
        </Link>
      </div>
    </Card>
  );
}
