'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface BookingItem {
  _id: string;
  bookingReference: string;
  flight: {
    flightNumber: string;
    airline: { name: string };
    departure: { airport: string; time: string };
    arrival: { airport: string; time: string };
  };
  seats: string[];
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/bookings/user');
        if (response.ok) {
          const data = await response.json();
          setBookings(data.bookings);
        }
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500/20 text-emerald-400';
      case 'checked-in': return 'bg-sky-500/20 text-sky-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">My Bookings</h1>
          <Link href="/">
            <Button className="bg-sky-500 hover:bg-sky-600 text-white">
              Book New Flight
            </Button>
          </Link>
        </div>

        {bookings.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700 p-12 text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21,16V14L13,9V7A1,1 0 0,0 12,6A1,1 0 0,0 11,7V9L3,14V16L11,13.5V19L8,20.5V22L12,21L16,22V20.5L13,19V13.5L21,16Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No bookings yet</h2>
            <p className="text-slate-400 mb-6">Start planning your next adventure!</p>
            <Link href="/">
              <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                Search Flights
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const departureTime = new Date(booking.flight.departure.time);
              const arrivalTime = new Date(booking.flight.arrival.time);
              
              return (
                <Card key={booking._id} className="bg-slate-800 border-slate-700 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {booking.flight.flightNumber}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <p className="text-slate-400 text-sm mb-3">
                        {booking.flight.airline.name}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">From</p>
                          <p className="text-white font-medium">{booking.flight.departure.airport}</p>
                          <p className="text-slate-300">
                            {departureTime.toLocaleDateString()} at {departureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-slate-400">To</p>
                          <p className="text-white font-medium">{booking.flight.arrival.airport}</p>
                          <p className="text-slate-300">
                            {arrivalTime.toLocaleDateString()} at {arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-slate-400">Seats</p>
                          <div className="flex flex-wrap gap-1">
                            {booking.seats.map((seat) => (
                              <span key={seat} className="px-2 py-1 bg-sky-500/20 text-sky-400 rounded text-xs">
                                {seat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-slate-400 text-sm">Total</p>
                        <p className="text-2xl font-bold text-white">${booking.totalPrice.toFixed(0)}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-slate-400 text-xs">Booking Reference</p>
                        <p className="text-sky-400 font-mono text-sm">{booking.bookingReference}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link href={`/booking/confirmation?bookingId=${booking._id}`}>
                          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                            View Details
                          </Button>
                        </Link>
                        
                        {booking.status === 'confirmed' && (
                          <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
                            Check In
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}