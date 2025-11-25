'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Plane, 
  Clock, 
  Briefcase, 
  ShieldCheck, 
  Wifi, 
  Coffee,
  Monitor,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { formatTime, formatDate, formatDuration } from '@/lib/flight-utils';
import { getAirlineLogo, getAirlineName } from '@/lib/airline-logos';
import type { FlightResult } from '@/types/global';

type TabType = 'baggage' | 'policies' | 'amenities';

export default function FlightDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [flight, setFlight] = useState<FlightResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('baggage');

  useEffect(() => {
    const fetchFlightDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get flight from sessionStorage (client-side cache)
        // Wrap in try-catch to handle SecurityError in restricted contexts
        try {
          const cachedFlights = sessionStorage.getItem('flightSearchResults');
          if (cachedFlights) {
            const flights: FlightResult[] = JSON.parse(cachedFlights);
            const foundFlight = flights.find(f => f.id === params.flightId);
            
            if (foundFlight) {
              setFlight(foundFlight);
              setLoading(false);
              return;
            }
          }
        } catch (storageError) {
          // SessionStorage inaccessible (SecurityError, QuotaExceededError, etc.)
          // Fall through to API fetch
          console.warn('SessionStorage access failed:', storageError);
        }

        // If not in sessionStorage, try the API
        // Note: Database storage needs to be set up first
        const response = await fetch(`/api/flights/${params.flightId}`);
        const data = await response.json();
        
        if (data.success && data.flight) {
          setFlight(data.flight);
        } else {
          // Show user-friendly message
          setError('Flight details are only available from the search results page. Please search for flights again to view details.');
        }
      } catch (err) {
        console.error('Error loading flight details:', err);
        setError('Flight details are no longer available. Flight offers expire quickly. Please search for flights again.');
      } finally {
        setLoading(false);
      }
    };

    if (params.flightId) {
      fetchFlightDetails();
    }
  }, [params.flightId]);

  const handleSelectFlight = () => {
    if (flight) {
      // Navigate to passenger details with flight info
      const searchParams = new URLSearchParams({
        flightId: flight.id,
        passengers: '1',
      });
      router.push(`/passenger-details?${searchParams.toString()}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#1E3A5F] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading flight details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Flight Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/flights')}
              className="bg-[#1E3A5F] hover:bg-[#2A4A73] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Search Flights
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const itinerary = flight.itineraries?.[0];
  const segments = itinerary?.segments || [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  const stops = segments.length - 1;

  const departureTime = firstSegment?.departure.at;
  const arrivalTime = lastSegment?.arrival.at;
  const duration = itinerary?.duration;
  const price = parseFloat(flight.price.total);
  const currency = flight.price.currency;
  const airlines = flight.validatingAirlineCodes || [];
  const mainAirline = airlines[0] || firstSegment?.carrierCode;

  // Calculate price breakdown
  const basePrice = price * 0.85;
  const taxes = price * 0.15;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[#1E3A5F] hover:text-[#2A4A73] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Search Results</span>
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <span>Search Results</span>
              <span>›</span>
              <span className="text-gray-900 font-medium">Flight Details</span>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative h-80 w-full bg-gradient-to-br from-[#1E3A5F] via-[#2A4A73] to-[#1E3A5F] overflow-hidden">
          {/* Actual cabin image */}
          <img
            src="/aircraft-cabin.png"
            alt="Aircraft Cabin"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
            onError={(e) => {
              // Fallback to gradient with decorative pattern if image fails
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          {/* Decorative Pattern (fallback) */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Plane className="w-64 h-64 text-white opacity-20" />
            </div>
          </div>
          <div className="absolute bottom-8 left-0 right-0">
            <div className="max-w-6xl mx-auto px-4">
              <h1 className="text-4xl font-bold text-white mb-2">Review Your Flight</h1>
              <p className="text-xl text-blue-100">
                {getAirlineName(mainAirline)} {firstSegment?.flightNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Flight Route Summary */}
              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-2">Total duration: {formatDuration(duration || 'PT0H')}</p>
                <h2 className="text-3xl font-bold text-[#1E3A5F] mb-2">
                  {firstSegment?.departure.iataCode} to {lastSegment?.arrival.iataCode}
                </h2>
                <p className="text-gray-600">
                  {formatDate(departureTime, firstSegment?.departure.timeZone)}, {new Date(departureTime).getFullYear()} • 1 Adult • Economy
                </p>
              </div>

              {/* Itinerary Section */}
              <div className="mb-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Itinerary</h3>
                
                {segments.map((segment, index) => (
                  <div key={index} className="mb-8 last:mb-0">
                    {/* Departure */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-[#1E3A5F] rounded-full flex items-center justify-center">
                          <Plane className="w-6 h-6 text-white rotate-45" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <p className="text-3xl font-bold text-gray-900">
                            {formatTime(segment.departure.at, segment.departure.timeZone)}
                          </p>
                          <span className="text-gray-500">
                            ({segment.departure.timeZone?.split('/')[1] || 'Local'})
                          </span>
                          <span className="text-gray-400">—</span>
                          <span className="text-gray-600 font-semibold">{segment.departure.iataCode}</span>
                        </div>
                        <p className="text-gray-600 mt-2">
                          {segment.departure.iataCode} International Airport
                          {segment.departure.terminal && ` • Terminal ${segment.departure.terminal}`}
                        </p>
                      </div>
                    </div>

                    {/* Flight Duration Line */}
                    <div className="ml-6 pl-6 border-l-2 border-gray-300 py-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">{formatDuration(segment.duration)} flight time</span>
                      </div>
                      <p className="text-gray-600">
                        {getAirlineName(segment.carrierCode)} • {segment.flightNumber}
                        {segment.aircraft?.code && ` • ${segment.aircraft.code}`}
                      </p>
                    </div>

                    {/* Arrival */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-[#1E3A5F] rounded-full flex items-center justify-center">
                          <Plane className="w-6 h-6 text-white -rotate-45" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <p className="text-3xl font-bold text-gray-900">
                            {formatTime(segment.arrival.at, segment.arrival.timeZone)}
                          </p>
                          <span className="text-gray-500">
                            (+{Math.floor((new Date(segment.arrival.at).getTime() - new Date(segment.departure.at).getTime()) / (1000 * 60 * 60 * 24))})
                          </span>
                          <span className="text-gray-400">—</span>
                          <span className="text-gray-600 font-semibold">{segment.arrival.iataCode}</span>
                        </div>
                        <p className="text-gray-600 mt-2">
                          {segment.arrival.iataCode} International Airport
                          {segment.arrival.terminal && ` • Terminal ${segment.arrival.terminal}`}
                        </p>
                      </div>
                    </div>

                    {/* Layover Info */}
                    {index < segments.length - 1 && (
                      <div className="mt-4 ml-6 pl-6 border-l-2 border-dashed border-gray-300 py-4">
                        <p className="text-sm font-semibold text-orange-600">
                          Layover: {segment.arrival.iataCode} • {
                            (() => {
                              const nextSegment = segments[index + 1];
                              const layoverMinutes = Math.floor(
                                (new Date(nextSegment.departure.at).getTime() - new Date(segment.arrival.at).getTime()) / (1000 * 60)
                              );
                              return formatDuration(`PT${layoverMinutes}M`);
                            })()
                          }
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Tabs Section */}
              <div className="mb-8">
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    onClick={() => setActiveTab('baggage')}
                    className={`px-6 py-3 font-semibold transition-colors ${
                      activeTab === 'baggage'
                        ? 'text-[#1E3A5F] border-b-2 border-[#1E3A5F]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Baggage
                  </button>
                  <button
                    onClick={() => setActiveTab('policies')}
                    className={`px-6 py-3 font-semibold transition-colors ${
                      activeTab === 'policies'
                        ? 'text-[#1E3A5F] border-b-2 border-[#1E3A5F]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Policies
                  </button>
                  <button
                    onClick={() => setActiveTab('amenities')}
                    className={`px-6 py-3 font-semibold transition-colors ${
                      activeTab === 'amenities'
                        ? 'text-[#1E3A5F] border-b-2 border-[#1E3A5F]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Amenities
                  </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  {activeTab === 'baggage' && (
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <Briefcase className="w-7 h-7 text-[#1E3A5F] flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2 text-lg">Carry-on</h4>
                          <p className="text-gray-600">1 Personal Item + 1 Carry-on bag included.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Briefcase className="w-7 h-7 text-[#1E3A5F] flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2 text-lg">Checked Baggage</h4>
                          <p className="text-gray-600">
                            First bag $60, second bag $100. <a href="#" className="text-[#1E3A5F] hover:underline font-medium">See details</a>.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'policies' && (
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <ShieldCheck className="w-7 h-7 text-[#1E3A5F] flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2 text-lg">Cancellation Policy</h4>
                          <p className="text-gray-600">
                            Free cancellation within 24 hours of booking. After that, cancellation fees may apply.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <ShieldCheck className="w-7 h-7 text-[#1E3A5F] flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2 text-lg">Change Policy</h4>
                          <p className="text-gray-600">
                            Changes allowed with a fee. Fare difference may apply.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'amenities' && (
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <Wifi className="w-7 h-7 text-[#1E3A5F] flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2 text-lg">Wi-Fi</h4>
                          <p className="text-gray-600">Available for purchase on most flights.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Coffee className="w-7 h-7 text-[#1E3A5F] flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2 text-lg">Food & Beverages</h4>
                          <p className="text-gray-600">Complimentary snacks and beverages.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Monitor className="w-7 h-7 text-[#1E3A5F] flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2 text-lg">Entertainment</h4>
                          <p className="text-gray-600">Personal seatback screens with movies, TV shows, and music.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Price Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Price Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Base Fare</span>
                      <span>${basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Taxes & Fees</span>
                      <span>${taxes.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-3xl font-bold text-[#1E3A5F]">
                        ${price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSelectFlight}
                    className="w-full bg-[#1E3A5F] hover:bg-[#2A4A73] text-white py-4 rounded-lg font-semibold text-lg transition-colors mb-3"
                  >
                    Select Flight
                  </button>

                  <p className="text-center text-sm text-gray-500">
                    Free cancellation within 24 hours of booking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
