'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ETicket from '@/components/ticket/ETicket';
import { Flight, Booking, Passenger } from '@/types/global';

export default function BookingDetailPage() {
  const params = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ticket' | 'details' | 'checkin'>('ticket');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setBooking(data.booking);
          setFlight(data.booking.flight);
          setPassengers(data.booking.passengers);
        }
      } catch (error) {
        console.error('Failed to fetch booking:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBooking();
    }
  }, [params.id]);

  const handleCheckIn = async () => {
    try {
      // Update booking status to checked-in
      const response = await fetch(`/api/bookings/${booking._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'checked-in' }),
      });

      if (response.ok) {
        setBooking({ ...booking, status: 'checked-in' });
        alert('Check-in successful!');
      }
    } catch (error) {
      console.error('Check-in error:', error);
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

  if (!booking || !flight) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <div className="text-center py-12 text-slate-300">Booking not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/bookings" className="text-sky-400 hover:text-sky-300 mb-6 inline-block">
          ← Back to Bookings
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Booking Details</h1>
          <p className="text-slate-300">Reference: {booking.bookingReference}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-700">
          {(['ticket', 'details', 'checkin'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition ${
                activeTab === tab
                  ? 'text-sky-400 border-b-2 border-sky-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab === 'ticket' && 'E-Ticket'}
              {tab === 'details' && 'Booking Details'}
              {tab === 'checkin' && 'Check-in'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'ticket' && (
          <div>
            <ETicket booking={booking} flight={flight} passengers={passengers} />
          </div>
        )}

        {activeTab === 'details' && (
          <Card className="bg-slate-800 border-slate-700 p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Flight Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Flight Number</p>
                    <p className="text-white font-semibold">{flight.flightNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Airline</p>
                    <p className="text-white font-semibold">{(flight.airline as any).name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Status</p>
                    <p className="text-white font-semibold capitalize">{booking.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Total Price</p>
                    <p className="text-white font-semibold">${booking.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Passengers</h3>
                <ul className="space-y-2">
                  {passengers.map((passenger, index) => (
                    <li key={passenger._id} className="p-3 bg-slate-700 rounded text-white">
                      {index + 1}. {passenger.firstName} {passenger.lastName}
                      <span className="ml-4 text-sm text-slate-400">Seat: {booking.seats[index]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'checkin' && (
          <Card className="bg-slate-800 border-slate-700 p-8">
            {booking.status === 'checked-in' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">You're Checked In!</h3>
                <p className="text-slate-300 mb-6">
                  Checked in on {booking.checkedInAt && new Date(booking.checkedInAt).toLocaleString()}
                </p>
                <p className="text-slate-400">Proceed to gate {Math.floor(Math.random() * 20) + 1}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-2xl font-bold text-white mb-4">Ready to Check In?</h3>
                <p className="text-slate-300 mb-8">
                  You can check in 24 hours before departure.
                </p>
                <Button
                  onClick={handleCheckIn}
                  className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 font-medium"
                >
                  Check In Now
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
