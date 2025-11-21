'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import { Booking } from '@/types/global';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    if (bookingId) {
      // Fetch booking details
      fetch(`/api/bookings/${bookingId}`)
        .then((res) => res.json())
        .then((data) => {
          setBooking(data.booking);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
          <p className="text-slate-300 mt-4">Confirming your booking...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-300">Booking not found</p>
        </div>
      </div>
    );
  }

  return <BookingConfirmation booking={booking} />;
}
