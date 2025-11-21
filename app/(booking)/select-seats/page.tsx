'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Flight } from '@/types/global';
import BookingFlowManager from '@/components/booking/BookingFlowManager';

export default function SelectSeatsPage() {
  const searchParams = useSearchParams();
  
  const flightId = searchParams.get('flightId');
  const passengers = parseInt(searchParams.get('passengers') || '1');
  
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlight = async () => {
      if (!flightId) return;
      try {
        const response = await fetch(`/api/flights/${flightId}`);
        if (response.ok) {
          const data = await response.json();
          setFlight(data.flight);
        }
      } catch (error) {
        console.error('Failed to fetch flight:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlight();
  }, [flightId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <div className="text-center py-12 text-slate-300">Flight not found</div>
      </div>
    );
  }

  return (
    <BookingFlowManager
      flight={flight}
      passengers={passengers}
      initialStep="seats"
    />
  );
}
