'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Airline } from '@/types/global';

export default function PopularAirlines() {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        const response = await fetch('/api/airlines');
        if (response.ok) {
          const data = await response.json();
          setAirlines(data.airlines.slice(0, 6));
        }
      } catch (error) {
        console.error('Failed to fetch airlines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAirlines();
  }, []);

  if (loading) {
    return <div className="text-slate-400">Loading airlines...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {airlines.map((airline) => (
        <Link key={airline._id} href={`/airlines/${airline.code}`}>
          <Card className="bg-slate-800 border-slate-700 p-6 hover:border-sky-500 transition cursor-pointer group">
            <div className="flex items-center gap-4 mb-3">
              <img
                src={airline.logo || "/placeholder.svg"}
                alt={airline.name}
                className="w-16 h-16 object-contain group-hover:scale-110 transition"
              />
              <div>
                <h4 className="font-bold text-white">{airline.name}</h4>
                <p className="text-sm text-slate-400">{airline.code}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300">{airline.country}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
