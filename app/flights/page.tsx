'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FlightSearchBar from '@/components/booking/FlightSearchBar';
import { Plane } from 'lucide-react';

interface PopularRoute {
  from: string;
  to: string;
  fromCity: string;
  toCity: string;
  country: string;
}

export default function FlightsPage() {
  const [popularRoutes, setPopularRoutes] = useState<PopularRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularRoutes = async () => {
      try {
        const response = await fetch('/api/flights/popular-routes');
        const data = await response.json();
        if (data.success) {
          setPopularRoutes(data.routes);
        }
      } catch (error) {
        console.error('Failed to fetch popular routes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularRoutes();
  }, []);
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2A4A73] text-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Plane className="w-12 h-12" />
                <h1 className="text-4xl md:text-5xl font-bold">Search Flights</h1>
              </div>
              <p className="text-lg text-blue-100">
                Find the best flights for your next journey
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto">
              <FlightSearchBar />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#1E3A5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-gray-600">
                Compare prices from multiple airlines to find the best deals
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#1E3A5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Results</h3>
              <p className="text-gray-600">
                Get up-to-date flight information and availability
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#1E3A5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Filters</h3>
              <p className="text-gray-600">
                Filter by airline, price, stops, and more to find your perfect flight
              </p>
            </div>
          </div>
        </div>

        {/* Popular Routes */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Routes</h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularRoutes.map((route, index) => (
                  <a
                    key={index}
                    href={`/flights/search?departure=${route.from}&arrival=${route.to}&departureDate=${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&passengers=1`}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-[#1E3A5F] hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-[#1E3A5F]">{route.from}</span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span className="text-2xl font-bold text-[#1E3A5F]">{route.to}</span>
                    </div>
                    <p className="text-sm text-gray-600">{route.fromCity} → {route.toCity}</p>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
