'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Airline, FlightResult } from '@/types/global';
import AirlineFlightCard from '@/components/airlines/AirlineFlightCard';
import Footer from '@/components/layout/Footer';
import { Search } from 'lucide-react';

type TabType = 'all-flights' | 'popular-routes' | 'about';

export default function AirlineDetailsPage() {
  const params = useParams();
  const [airline, setAirline] = useState<Airline | null>(null);
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all-flights');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAirlineData = async () => {
      try {
        // Fetch specific airline data and flights from the new endpoint
        const response = await fetch(`/api/airlines/${params.code}`);
        if (response.ok) {
          const data = await response.json();
          setAirline(data.airline);
          setFlights(data.flights || []);
        } else if (response.status === 404) {
          // Airline not found
          setAirline(null);
          setFlights([]);
        }
      } catch (error) {
        console.error('Failed to fetch airline:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.code) {
      fetchAirlineData();
    }
  }, [params.code]);

  // Filter flights based on search query
  const filteredFlights = flights.filter((flight) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const segments = flight.itineraries?.[0]?.segments ?? [];
    const origin = segments[0]?.departure?.iataCode?.toLowerCase() || '';
    const destination = segments[segments.length - 1]?.arrival?.iataCode?.toLowerCase() || '';
    const price = flight.price?.total?.toLowerCase() || '';
    return origin.includes(query) || destination.includes(query) || price.includes(query);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F] mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading airline details...</p>
        </div>
      </div>
    );
  }

  if (!airline) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Airline Not Found</h2>
          <p className="text-gray-600 mb-6">The airline you're looking for doesn't exist.</p>
          <Link 
            href="/airlines"
            className="bg-[#1E3A5F] text-white px-6 py-3 rounded-lg hover:bg-[#2A4A73] transition-colors inline-block"
          >
            Browse All Airlines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            href="/airlines" 
            className="text-[#1E3A5F] hover:text-[#2A4A73] mb-6 inline-block font-medium"
          >
            ← Back to Airlines
          </Link>

          {/* Airline Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 flex items-start gap-6">
            <div className="w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center p-4 flex-shrink-0">
              <img
                src={airline.logo || '/placeholder-airline.svg'}
                alt={airline.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{airline.name}</h1>
              <p className="text-gray-600 text-lg mb-3">
                {airline.description}
              </p>
              <p className="text-gray-500">
                {airline.destinations} Destinations | {airline.foundedYear ? `${new Date().getFullYear() - airline.foundedYear} Years in Service` : 'Established Airline'}
              </p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('all-flights')}
                className={`pb-4 px-2 font-medium transition-colors relative ${
                  activeTab === 'all-flights'
                    ? 'text-[#1E3A5F]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Flights
                {activeTab === 'all-flights' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A5F]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('popular-routes')}
                className={`pb-4 px-2 font-medium transition-colors relative ${
                  activeTab === 'popular-routes'
                    ? 'text-[#1E3A5F]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Popular Routes
                {activeTab === 'popular-routes' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A5F]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`pb-4 px-2 font-medium transition-colors relative ${
                  activeTab === 'about'
                    ? 'text-[#1E3A5F]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                About
                {activeTab === 'about' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A5F]" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'all-flights' && (
            <div>
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by destination, date, or price"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Flights Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Flights</h2>
                {filteredFlights.length > 0 ? (
                  <div className="space-y-4">
                    {filteredFlights.map((flight, index) => (
                      <AirlineFlightCard 
                        key={`${flight.id || 'flight'}-${index}-${flight.price?.total || ''}`} 
                        flight={flight} 
                      />
                    ))}
                  </div>
                ) : flights.length > 0 ? (
                  <Card className="bg-gray-50 border border-gray-200 p-12 text-center">
                    <p className="text-gray-600 text-lg">
                      No flights match your search criteria.
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-4 text-[#1E3A5F] hover:text-[#2A4A73] font-medium"
                    >
                      Clear search
                    </button>
                  </Card>
                ) : (
                  <Card className="bg-gray-50 border border-gray-200 p-12 text-center">
                    <p className="text-gray-600 text-lg">
                      No flights available for this airline at the moment.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Flight data is fetched in real-time from Amadeus API. Please check back later.
                    </p>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === 'popular-routes' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Routes</h2>
              {airline.popularRoutes && airline.popularRoutes.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {airline.popularRoutes.map((route, index) => {
                    const [origin, destination] = route.split('-');
                    return (
                      <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-center flex-1">
                            <p className="text-2xl font-bold text-gray-900">{origin}</p>
                            <p className="text-sm text-gray-500">Origin</p>
                          </div>
                          <div className="px-4">
                            <svg className="w-6 h-6 text-[#1E3A5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </div>
                          <div className="text-center flex-1">
                            <p className="text-2xl font-bold text-gray-900">{destination}</p>
                            <p className="text-sm text-gray-500">Destination</p>
                          </div>
                        </div>
                        <Link
                          href={`/flights?from=${origin}&to=${destination}`}
                          className="block w-full text-center bg-[#1E3A5F] text-white py-2 rounded-lg hover:bg-[#2A4A73] transition-colors"
                        >
                          Search Flights
                        </Link>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="bg-gray-50 border border-gray-200 p-12 text-center">
                  <p className="text-gray-600 text-lg">
                    No popular routes available for this airline.
                  </p>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">About {airline.name}</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Our History & Mission */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Our History & Mission</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Founded in {airline.foundedYear || '1978'}, {airline.name} began with a single aircraft and a vision to connect major global destinations. 
                    Today, we proudly serve over {airline.destinations || '250'} destinations with a state-of-the-art fleet of {airline.fleetSize} aircraft. 
                    {airline.headquarters && ` Headquartered in ${airline.headquarters}, we operate`} from major hubs around the world. 
                    Our mission is to provide safe, reliable, and comfortable air travel, making the world more accessible for everyone. 
                    We are committed to sustainability and exceptional customer service on every flight.
                  </p>
                </div>

                {/* Contact & Support */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Contact & Support</h3>
                  <div className="space-y-3">
                    <a 
                      href={airline.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-[#1E3A5F] hover:text-[#2A4A73] font-medium"
                    >
                      Official Website →
                    </a>
                    <a 
                      href={`${airline.website}/baggage`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-[#1E3A5F] hover:text-[#2A4A73] font-medium"
                    >
                      Baggage Policy →
                    </a>
                    <a 
                      href={`${airline.website}/support`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-[#1E3A5F] hover:text-[#2A4A73] font-medium"
                    >
                      Customer Support →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
