'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Plane, 
  Clock, 
  Briefcase, 
  ShieldCheck, 
  Wifi, 
  Coffee,
  Monitor,
  X
} from 'lucide-react';
import { formatTime, formatDate, formatDuration } from '@/lib/flight-utils';
import { getAirlineLogo, getAirlineName } from '@/lib/airline-logos';
import type { FlightResult } from '@/types/global';

interface FlightDetailsModalProps {
  flight: FlightResult | null;
  open: boolean;
  onClose: () => void;
  onSelectFlight?: (flight: FlightResult) => void;
}

type TabType = 'baggage' | 'policies' | 'amenities';

export default function FlightDetailsModal({
  flight,
  open,
  onClose,
  onSelectFlight,
}: FlightDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('baggage');

  if (!flight) return null;

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

  // Get actual price breakdown from API data
  const rawOffer = (flight as any).rawOffer;
  const basePrice = rawOffer?.base_amount 
    ? parseFloat(rawOffer.base_amount) 
    : price * 0.85; // Fallback to estimate if not available
  const taxes = rawOffer?.tax_amount 
    ? parseFloat(rawOffer.tax_amount) 
    : price * 0.15; // Fallback to estimate if not available
  const hasActualBreakdown = !!(rawOffer?.base_amount && rawOffer?.tax_amount);

  const handleSelectFlight = () => {
    if (onSelectFlight && flight) {
      onSelectFlight(flight);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0" showCloseButton={false}>
        <DialogTitle className="sr-only">
          Flight Details - {getAirlineName(mainAirline)} {firstSegment?.flightNumber}
        </DialogTitle>
        
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
              <Plane className="w-48 h-48 text-white opacity-20" />
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => {
                if (flight?.id) {
                  window.open(`/flights/${flight.id}`, '_blank');
                }
              }}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 transition-colors"
              aria-label="Open in new tab"
              title="Open in new tab"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute bottom-6 left-6 text-white">
            <h2 className="text-3xl font-bold mb-2">Review Your Flight</h2>
            <p className="text-lg text-blue-100">
              {getAirlineName(mainAirline)} {firstSegment?.flightNumber}
            </p>
          </div>
        </div>

        <div className="p-6">
          {/* Flight Route Summary */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-gray-500">Total duration: {formatDuration(duration || 'PT0H')}</p>
                <h3 className="text-2xl font-bold text-[#1E3A5F]">
                  {firstSegment?.departure.iataCode} to {lastSegment?.arrival.iataCode}
                </h3>
              </div>
            </div>
            <p className="text-gray-600">
              {formatDate(departureTime, firstSegment?.departure.timeZone)}, {new Date(departureTime).getFullYear()} • 1 Adult • Economy
            </p>
          </div>

          {/* Itinerary Section */}
          <div className="mb-6 bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Itinerary</h4>
            
            {segments.map((segment, index) => (
              <div key={index} className="mb-6 last:mb-0">
                {/* Departure */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-[#1E3A5F] rounded-full flex items-center justify-center">
                      <Plane className="w-5 h-5 text-white rotate-45" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatTime(segment.departure.at, segment.departure.timeZone)}
                      </p>
                      <span className="text-gray-500">
                        ({segment.departure.timeZone?.split('/')[1] || 'Local'})
                      </span>
                      <span className="text-gray-400">—</span>
                      <span className="text-gray-600">{segment.departure.iataCode}</span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      {segment.departure.iataCode} International Airport
                      {segment.departure.terminal && ` • Terminal ${segment.departure.terminal}`}
                    </p>
                  </div>
                </div>

                {/* Flight Duration Line */}
                <div className="ml-5 pl-5 border-l-2 border-gray-300 py-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(segment.duration)} flight time</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {getAirlineName(segment.carrierCode)} • {segment.flightNumber}
                    {segment.aircraft?.code && ` • ${segment.aircraft.code}`}
                  </p>
                </div>

                {/* Arrival */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-[#1E3A5F] rounded-full flex items-center justify-center">
                      <Plane className="w-5 h-5 text-white -rotate-45" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatTime(segment.arrival.at, segment.arrival.timeZone)}
                      </p>
                      <span className="text-gray-500">
                        (+{Math.floor((new Date(segment.arrival.at).getTime() - new Date(segment.departure.at).getTime()) / (1000 * 60 * 60 * 24))})
                      </span>
                      <span className="text-gray-400">—</span>
                      <span className="text-gray-600">{segment.arrival.iataCode}</span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      {segment.arrival.iataCode} International Airport
                      {segment.arrival.terminal && ` • Terminal ${segment.arrival.terminal}`}
                    </p>
                  </div>
                </div>

                {/* Layover Info */}
                {index < segments.length - 1 && (
                  <div className="mt-4 ml-5 pl-5 border-l-2 border-dashed border-gray-300 py-3">
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
          <div className="mb-6">
            <div className="flex border-b border-gray-200 mb-4">
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
            <div className="py-4">
              {activeTab === 'baggage' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Briefcase className="w-6 h-6 text-[#1E3A5F] flex-shrink-0 mt-1" />
                    <div>
                      <h5 className="font-bold text-gray-900 mb-1">Carry-on</h5>
                      <p className="text-gray-600">1 Personal Item + 1 Carry-on bag included.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Briefcase className="w-6 h-6 text-[#1E3A5F] flex-shrink-0 mt-1" />
                    <div>
                      <h5 className="font-bold text-gray-900 mb-1">Checked Baggage</h5>
                      <p className="text-gray-600">
                        First bag ${60}, second bag ${100}. <a href="#" className="text-[#1E3A5F] hover:underline">See details</a>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'policies' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-[#1E3A5F] flex-shrink-0 mt-1" />
                    <div>
                      <h5 className="font-bold text-gray-900 mb-1">Cancellation Policy</h5>
                      <p className="text-gray-600">
                        Free cancellation within 24 hours of booking. After that, cancellation fees may apply.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <ShieldCheck className="w-6 h-6 text-[#1E3A5F] flex-shrink-0 mt-1" />
                    <div>
                      <h5 className="font-bold text-gray-900 mb-1">Change Policy</h5>
                      <p className="text-gray-600">
                        Changes allowed with a fee. Fare difference may apply.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'amenities' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Wifi className="w-6 h-6 text-[#1E3A5F] flex-shrink-0 mt-1" />
                    <div>
                      <h5 className="font-bold text-gray-900 mb-1">Wi-Fi</h5>
                      <p className="text-gray-600">Available for purchase on most flights.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Coffee className="w-6 h-6 text-[#1E3A5F] flex-shrink-0 mt-1" />
                    <div>
                      <h5 className="font-bold text-gray-900 mb-1">Food & Beverages</h5>
                      <p className="text-gray-600">Complimentary snacks and beverages.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Monitor className="w-6 h-6 text-[#1E3A5F] flex-shrink-0 mt-1" />
                    <div>
                      <h5 className="font-bold text-gray-900 mb-1">Entertainment</h5>
                      <p className="text-gray-600">Personal seatback screens with movies, TV shows, and music.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price Summary & CTA */}
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">Price Summary</h4>
                {!hasActualBreakdown && (
                  <span className="text-xs text-gray-500 italic">Estimated breakdown</span>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Base Fare</span>
                  <span>{currency} {basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes & Fees</span>
                  <span>{currency} {taxes.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-[#1E3A5F]">
                    {currency} {price.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSelectFlight}
                className="w-full bg-[#1E3A5F] hover:bg-[#2A4A73] text-white py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Select Flight
              </button>

              <p className="text-center text-sm text-gray-500 mt-3">
                Free cancellation within 24 hours of booking.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
