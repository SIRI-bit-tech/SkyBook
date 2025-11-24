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
  const [error, setError] = useState<string | null>(null);

  const fetchPopularRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/flights/popular-routes');
      if (!response.ok) {
        throw new Error(`Failed to fetch routes: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setPopularRoutes(data.routes);
      } else {
        throw new Error('Failed to load popular routes');
      }
    } catch (error) {
      console.error('Failed to fetch popular routes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unable to load popular routes. Please try again.';
      setError(errorMessage);
      setPopularRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
            ) : error ? (
              <div className="max-w-2xl mx-auto">
                <div 
                  className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-center justify-center mb-3">
                    <svg 
                      className="w-6 h-6 text-red-600 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <h3 className="text-lg font-semibold text-red-900">Unable to Load Popular Routes</h3>
                  </div>
                  <p className="text-red-700 mb-4">{error}</p>
                  <button
                    onClick={fetchPopularRoutes}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2A4A73] transition-colors font-medium"
                  >
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                      />
                    </svg>
                    Retry
                  </button>
                </div>
              </div>
            ) : popularRoutes.length > 0 ? (
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
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No popular routes available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
