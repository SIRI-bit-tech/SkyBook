'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BookingConfirmation {
  bookingReference: string;
  flightNumber: string;
  seats: string[];
  totalPrice: number;
  passengers: number;
  ticketUrl: string;
  qrCode: string;
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);
  const [loading, setLoading] = useState(true);

  const bookingId = searchParams.get('bookingId');
  const ref = searchParams.get('ref');

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-slate-300 mb-4">Your flight is booked. Check your email for details.</p>
        </div>

        {/* Booking Reference */}
        <Card className="bg-sky-500/10 border-sky-500/30 p-6 mb-6">
          <p className="text-sm text-slate-300 mb-2">Booking Reference</p>
          <p className="text-3xl font-bold text-sky-400 font-mono">{ref}</p>
          <p className="text-xs text-slate-400 mt-2">Save this reference for check-in at the airport</p>
        </Card>

        {/* Booking Details */}
        <Card className="bg-slate-800 border-slate-700 p-8 mb-6">
          <h3 className="text-xl font-bold text-white mb-6">What's Next?</h3>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">1</div>
              <div>
                <p className="font-semibold text-white">Check Your Email</p>
                <p className="text-sm text-slate-400">We've sent your e-ticket and QR code to your inbox</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">2</div>
              <div>
                <p className="font-semibold text-white">Online Check-in</p>
                <p className="text-sm text-slate-400">Check in 24 hours before departure in your dashboard</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">3</div>
              <div>
                <p className="font-semibold text-white">Arrive Early</p>
                <p className="text-sm text-slate-400">Please arrive 2-3 hours before departure</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/bookings">
            <Button className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-3">
              View My Bookings
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full text-white border-slate-500 hover:bg-slate-700 font-medium py-3">
              Book Another Flight
            </Button>
          </Link>
        </div>

        {/* FAQ */}
        <Card className="bg-slate-800 border-slate-700 p-6 mt-8">
          <h4 className="font-bold text-white mb-4">Need Help?</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• Your booking confirmation has been sent to your email</li>
            <li>• Download the SkyBook app to manage your booking on the go</li>
            <li>• Contact support if you need to make changes to your booking</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
