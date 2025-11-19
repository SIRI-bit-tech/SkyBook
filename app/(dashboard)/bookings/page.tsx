'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">My Bookings</h1>
            <p className="text-slate-300">Manage all your flight reservations</p>
          </div>
          <Link href="/">
            <Button className="bg-sky-500 hover:bg-sky-600 text-white">Book New Flight</Button>
          </Link>
        </div>

        <Card className="bg-slate-800 border-slate-700 p-8 text-center">
          <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No bookings yet</h3>
          <p className="text-slate-400 mb-6">You haven't booked any flights yet. Start your journey with SkyBook!</p>
          <Link href="/">
            <Button className="bg-sky-500 hover:bg-sky-600 text-white">Search Flights</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
