'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PriceData {
  airline: string;
  price: number;
  source: string;
  departureTime: string;
  duration: string;
  stops: number;
}

interface PriceComparisonProps {
  departureCode: string;
  arrivalCode: string;
  departureDate: string;
}

export default function PriceComparison({
  departureCode,
  arrivalCode,
  departureDate,
}: PriceComparisonProps) {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/flights/external-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            departureCity: departureCode,
            arrivalCity: arrivalCode,
            departureDate,
            passengers: 1,
          }),
        });

        const data = await response.json();
        if (data.success && data.flights) {
          const priceList = data.flights.map((flight: any) => ({
            airline: flight.airline?.name || flight.validatingAirlineCodes?.[0] || 'Unknown',
            price: parseFloat(flight.price?.total || flight.minPrice || 0),
            source: flight.source,
            departureTime: flight.departure?.time || flight.itineraries?.[0]?.segments?.[0]?.departure?.at || '',
            duration: flight.duration || '0',
            stops: flight.itineraries?.[0]?.segments?.length - 1 || 0,
          }));
          setPrices(priceList.sort((a, b) => a.price - b.price));
        }
      } catch (error) {
        console.error('Price comparison error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (departureCode && arrivalCode && departureDate) {
      fetchPrices();
    }
  }, [departureCode, arrivalCode, departureDate]);

  if (loading) {
    return <div className="text-center text-slate-400">Comparing prices...</div>;
  }

  if (prices.length === 0) {
    return null;
  }

  const minPrice = Math.min(...prices.map((p) => p.price));
  const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;

  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Price Comparison</h3>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400">Lowest Price</p>
          <p className="text-2xl font-bold text-emerald-400">${minPrice.toFixed(0)}</p>
        </div>
        <div className="bg-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400">Average Price</p>
          <p className="text-2xl font-bold text-sky-400">${avgPrice.toFixed(0)}</p>
        </div>
        <div className="bg-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400">Sources</p>
          <p className="text-2xl font-bold text-amber-400">{new Set(prices.map((p) => p.source)).size}</p>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {prices.slice(0, 10).map((price, idx) => (
          <div key={idx} className="flex items-center justify-between bg-slate-700 rounded-lg p-4">
            <div className="flex-1">
              <p className="font-semibold text-white">{price.airline}</p>
              <p className="text-xs text-slate-400">
                {price.stops === 0 ? 'Nonstop' : `${price.stops} stop${price.stops !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-sky-400">${price.price.toFixed(0)}</p>
              <p className="text-xs text-slate-400">{price.source}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
