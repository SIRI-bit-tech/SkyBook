'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Flight, Airline } from '@/types/global';
import FlightCard from '@/components/booking/FlightCard';

export default function AirlineDetailsPage() {
  const params = useParams();
  const [airline, setAirline] = useState<Airline | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAirlineFlights = async () => {
      try {
        const response = await fetch(`/api/airlines/${params.code}`);
        if (response.ok) {
          const data = await response.json();
          setAirline(data.airline);
          setFlights(data.flights);
        }
      } catch (error) {
        console.error('Failed to fetch airline:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.code) {
      fetchAirlineFlights();
    }
  }, [params.code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!airline) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <div className="text-center py-12 text-slate-300">Airline not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-sky-400 hover:text-sky-300 mb-6 inline-block">← Back Home</Link>

        {/* Airline Header */}
        <Card className="bg-slate-800 border-slate-700 p-8 mb-8 flex items-center gap-6">
          <img
            src={airline.logo || '/placeholder.svg'}
            alt={airline.name}
            className="w-24 h-24 object-contain"
          />
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{airline.name}</h1>
            <p className="text-slate-300 mb-2">{airline.country}</p>
            {airline.description && <p className="text-slate-400">{airline.description}</p>}
          </div>
        </Card>

        {/* Flights */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Available Flights</h2>
          {flights.length > 0 ? (
            <div className="space-y-4">
              {flights.map((flight) => (
                <FlightCard key={flight._id} flight={flight} passengers={1} />
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800 border-slate-700 p-8 text-center">
              <p className="text-slate-300">No flights available for this airline.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
