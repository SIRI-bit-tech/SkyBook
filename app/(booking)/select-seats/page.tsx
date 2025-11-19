'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flight } from '@/types/global';
import SeatMap from '@/components/booking/SeatMap';
import BookingSummary from '@/components/booking/BookingSummary';

export default function SelectSeatsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const flightId = searchParams.get('flightId');
  const passengers = parseInt(searchParams.get('passengers') || '1');
  
  const [flight, setFlight] = useState<Flight | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
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

  const handleSeatSelect = (seat: string) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else if (selectedSeats.length < passengers) {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === passengers) {
      const params = new URLSearchParams({
        flightId: flightId!,
        seats: selectedSeats.join(','),
        passengers: passengers.toString(),
      });
      router.push(`/booking/passenger-details?${params.toString()}`);
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

  if (!flight) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <div className="text-center py-12 text-slate-300">Flight not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="text-sky-400 hover:text-sky-300 mb-4 inline-block">← Back</Link>
        
        <h1 className="text-4xl font-bold text-white mb-8">Select Seats</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <SeatMap
              flight={flight}
              selectedSeats={selectedSeats}
              onSelectSeat={handleSeatSelect}
              passengerCount={passengers}
            />
          </div>

          {/* Booking Summary */}
          <div>
            <BookingSummary
              flight={flight}
              selectedSeats={selectedSeats}
              passengers={passengers}
              onContinue={handleContinue}
              continueDisabled={selectedSeats.length !== passengers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
