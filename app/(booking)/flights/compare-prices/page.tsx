'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PriceComparison from '@/components/booking/PriceComparison';

export default function ComparePricesPage() {
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (departure && arrival && departureDate) {
      setShowComparison(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Compare Flight Prices</h1>
          <p className="text-slate-300">
            Find the best prices across multiple airlines and booking platforms in real-time.
          </p>
        </div>

        {/* Search Form */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-8">
          <form onSubmit={handleCompare} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">From</label>
              <input
                type="text"
                placeholder="Airport code"
                value={departure}
                onChange={(e) => setDeparture(e.target.value.toUpperCase())}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">To</label>
              <input
                type="text"
                placeholder="Airport code"
                value={arrival}
                onChange={(e) => setArrival(e.target.value.toUpperCase())}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium">
                Compare Prices
              </Button>
            </div>
          </form>
        </Card>

        {/* Price Comparison Results */}
        {showComparison && departure && arrival && departureDate && (
          <PriceComparison
            departureCode={departure}
            arrivalCode={arrival}
            departureDate={departureDate}
          />
        )}

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Real-Time Prices</h3>
            <p className="text-slate-400">Get live price updates from multiple booking platforms and airlines</p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l-5.5 9h11z M17.5 13c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multiple Sources</h3>
            <p className="text-slate-400">Compare prices from Amadeus, Skyscanner, and our database</p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Best Deals</h3>
            <p className="text-slate-400">Find the lowest prices and compare flight options side-by-side</p>
          </Card>
        </div>

        {/* Navigation Links */}
        <div className="mt-12 flex gap-4 justify-center">
          <Link href="/flights/search">
            <Button className="bg-slate-700 hover:bg-slate-600 text-white">Search Flights</Button>
          </Link>
          <Link href="/flights/tracking">
            <Button className="bg-slate-700 hover:bg-slate-600 text-white">Track Flight</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
