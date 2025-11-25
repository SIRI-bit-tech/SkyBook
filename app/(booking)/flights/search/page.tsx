'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import RealTimeFlightSearch from '@/components/booking/RealTimeFlightSearch';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Plane, Calendar, Users, Pencil } from 'lucide-react';

function FlightSearchContent() {
  const searchParams = useSearchParams();

  const departure = searchParams.get('departure') || '';
  const arrival = searchParams.get('arrival') || '';
  const departureDate = searchParams.get('departureDate') || '';
  const passengers = parseInt(searchParams.get('passengers') || '1');

  const formatDateRange = (date: string) => {
    const d = new Date(date);
    const endDate = new Date(d);
    endDate.setDate(d.getDate() + 7);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Plane className="w-8 h-8 text-[#1E3A5F]" />
              <span className="text-2xl font-bold text-[#1E3A5F]">SkyBook</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button className="bg-[#1E3A5F] hover:bg-[#2A4A73] text-white px-6 py-2 rounded-lg">Sign Up</Button>
              <Button variant="outline" className="border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:border-[#1E3A5F]">Log In</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Summary Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-gray-400" />
                <span className="font-semibold text-gray-900">{departure} &gt; {arrival}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{formatDateRange(departureDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">{passengers} Adult{passengers !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <Link href="/flights" className="no-underline">
              <Button className="bg-[#1E3A5F] hover:bg-[#2A4A73] text-white px-6 py-2 rounded-lg flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Modify Search
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <RealTimeFlightSearch
          departure={departure}
          arrival={arrival}
          departureDate={departureDate}
          passengers={passengers}
        />
      </div>
    </div>
  );
}

export default function FlightSearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-600">Loading flights...</div>}>
      <FlightSearchContent />
    </Suspense>
  );
}
