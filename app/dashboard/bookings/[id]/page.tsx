'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PopulatedBooking } from '@/types/global';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Calendar, MapPin, Users, Plane, Clock } from 'lucide-react';
import Link from 'next/link';

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<PopulatedBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [params.id]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await fetch(`/api/bookings/${params.id}/cancel`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert('Booking cancelled successfully');
        fetchBooking();
      } else {
        alert(data.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel booking');
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}/check-in`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert('Checked in successfully!');
        fetchBooking();
      } else {
        alert(data.error || 'Failed to check in');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Failed to check in');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Booking not found</p>
          <Link href="/dashboard">
            <Button className="bg-sky-500 hover:bg-sky-600">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const departureTime = new Date(booking.flight.departure.time);
  const arrivalTime = new Date(booking.flight.arrival.time);
  const now = new Date();
  
  const canCheckIn = booking.status === 'confirmed' && 
                     departureTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000 &&
                     departureTime > now;
  const canCancel = booking.status === 'confirmed' && arrivalTime > now;

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="text-sky-400 hover:text-sky-300 mb-4 p-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2">Booking Details</h1>
        </div>

        {/* Booking Reference & Status */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-400 mb-1">Booking Reference</p>
              <p className="text-3xl font-bold text-sky-400">{booking.bookingReference}</p>
            </div>
            <span className={`px-4 py-2 rounded text-sm font-medium capitalize ${getStatusColor()}`}>
              {booking.status}
            </span>
          </div>
        </Card>

        {/* Flight Information */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Flight Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Plane className="w-5 h-5" />
              <span className="text-white font-semibold text-lg">{booking.flight.flightNumber}</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Departure</span>
                </div>
                <p className="text-white font-semibold text-lg">{booking.flight.departure.airport}</p>
                <p className="text-slate-400">{departureTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-white font-semibold">{departureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-sm text-slate-400">Terminal {booking.flight.departure.terminal}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Arrival</span>
                </div>
                <p className="text-white font-semibold text-lg">{booking.flight.arrival.airport}</p>
                <p className="text-slate-400">{arrivalTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-white font-semibold">{arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-sm text-slate-400">Terminal {booking.flight.arrival.terminal}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400 pt-4 border-t border-slate-700">
              <Clock className="w-4 h-4" />
              <span>Duration: {Math.floor(booking.flight.duration / 60)}h {booking.flight.duration % 60}m</span>
            </div>
          </div>
        </Card>

        {/* Passenger Information */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Passengers</h2>
          <div className="space-y-3">
            {booking.passengers.map((passenger, index) => (
              <div key={index} className="flex justify-between items-center py-3 border-b border-slate-700 last:border-0">
                <div>
                  <p className="text-white font-semibold">{passenger.firstName} {passenger.lastName}</p>
                  <p className="text-sm text-slate-400">{passenger.email}</p>
                </div>
                <span className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded font-semibold">
                  Seat {booking.seats[index]}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Payment Information */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Payment Details</h2>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Total Amount Paid</span>
            <span className="text-3xl font-bold text-white">${booking.totalPrice.toFixed(2)}</span>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Link href={`/api/tickets/download/${booking.bookingReference}`} target="_blank">
            <Button className="bg-sky-500 hover:bg-sky-600">
              <Download className="w-4 h-4 mr-2" />
              Download Ticket
            </Button>
          </Link>

          {canCheckIn && (
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={handleCheckIn}
            >
              Check In Online
            </Button>
          )}

          {canCancel && (
            <Button 
              variant="outline" 
              className="border-red-500 text-red-400 hover:bg-red-500/10"
              onClick={handleCancel}
            >
              Cancel Booking
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
