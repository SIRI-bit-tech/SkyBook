'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

interface Flight {
  _id: string;
  flightNumber: string;
  airline: { name: string; code: string; logo: string };
  departure: { code: string; time: string; latitude?: number; longitude?: number };
  arrival: { code: string; time: string; latitude?: number; longitude?: number };
  duration: number;
  stops: number;
  stopAirports?: Array<{
    code: string;
    name: string;
    city: string;
    latitude?: number;
    longitude?: number;
  }>;
  segments?: Array<{
    departure: {
      code: string;
      name: string;
      city: string;
      time: string;
      latitude?: number;
      longitude?: number;
    };
    arrival: {
      code: string;
      name: string;
      city: string;
      time: string;
      latitude?: number;
      longitude?: number;
    };
    carrier: {
      code: string;
      name: string;
      flightNumber: string;
    };
    duration: number;
    aircraft: string;
  }>;
  price: { economy: number };
}

interface FlightMapViewProps {
  flights: Flight[];
  departure: string;
  arrival: string;
  onClose: () => void;
}

export default function FlightMapView({ flights, departure, arrival, onClose }: FlightMapViewProps) {
  const [mounted, setMounted] = useState(false);
  const [departureCoords, setDepartureCoords] = useState<[number, number]>([0, 0]);
  const [arrivalCoords, setArrivalCoords] = useState<[number, number]>([0, 0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchAirportCoordinates();
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Fix Leaflet default marker icon issue (client-side only)
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      });
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [departure, arrival]);

  const fetchAirportCoordinates = async () => {
    try {
      setLoading(true);
      
      console.log('[FlightMapView] Using coordinates from flight data');
      
      // Use coordinates from the first flight's data if available
      if (flights.length > 0) {
        const firstFlight = flights[0];
        
        if (firstFlight.departure?.latitude && firstFlight.departure?.longitude) {
          console.log('[FlightMapView] Setting departure coords from flight data:', firstFlight.departure);
          setDepartureCoords([firstFlight.departure.latitude, firstFlight.departure.longitude]);
        }
        
        if (firstFlight.arrival?.latitude && firstFlight.arrival?.longitude) {
          console.log('[FlightMapView] Setting arrival coords from flight data:', firstFlight.arrival);
          setArrivalCoords([firstFlight.arrival.latitude, firstFlight.arrival.longitude]);
        }
      }
    } catch (error) {
      console.error('[FlightMapView] Error setting airport coordinates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A5F]"></div>
            <p className="text-gray-700">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate center point between departure and arrival
  const centerLat = (departureCoords[0] + arrivalCoords[0]) / 2;
  const centerLng = (departureCoords[1] + arrivalCoords[1]) / 2;
  
  // Calculate appropriate zoom level based on distance
  const latDiff = Math.abs(departureCoords[0] - arrivalCoords[0]);
  const lngDiff = Math.abs(departureCoords[1] - arrivalCoords[1]);
  const maxDiff = Math.max(latDiff, lngDiff);
  
  let zoomLevel = 4;
  if (maxDiff < 5) zoomLevel = 6;
  else if (maxDiff < 10) zoomLevel = 5;
  else if (maxDiff < 30) zoomLevel = 4;
  else zoomLevel = 3;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Flight Routes Map</h2>
            <p className="text-sm text-gray-600">
              {departure} → {arrival} • {flights.length} flights
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            className="rounded-full p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={zoomLevel}
            style={{ height: '100%', width: '100%' }}
            className="rounded-b-lg"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Departure Airport Marker */}
            {departureCoords[0] !== 0 && (
              <Marker position={departureCoords}>
                <Popup>
                  <div className="text-center">
                    <p className="font-bold text-[#1E3A5F]">{departure}</p>
                    <p className="text-xs text-gray-600">Departure Airport</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Arrival Airport Marker */}
            {arrivalCoords[0] !== 0 && (
              <Marker position={arrivalCoords}>
                <Popup>
                  <div className="text-center">
                    <p className="font-bold text-[#1E3A5F]">{arrival}</p>
                    <p className="text-xs text-gray-600">Arrival Airport</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Stop Airport Markers */}
            {flights.slice(0, 10).map((flight) => 
              flight.stopAirports?.map((stop, stopIndex) => 
                stop.latitude && stop.longitude ? (
                  <Marker 
                    key={`${flight._id}-stop-${stopIndex}`}
                    position={[stop.latitude, stop.longitude]}
                  >
                    <Popup>
                      <div className="text-center">
                        <p className="font-bold text-orange-600">{stop.code}</p>
                        <p className="text-xs text-gray-600">{stop.city}</p>
                        <p className="text-xs text-gray-500">Layover Stop</p>
                      </div>
                    </Popup>
                  </Marker>
                ) : null
              )
            )}

            {/* Flight Routes with Segments */}
            {flights.slice(0, 10).map((flight, index) => {
              // If flight has segments with coordinates, draw each segment
              if (flight.segments && flight.segments.length > 0) {
                const allSegmentsHaveCoords = flight.segments.every(
                  seg => seg.departure.latitude && seg.departure.longitude && 
                         seg.arrival.latitude && seg.arrival.longitude
                );

                if (allSegmentsHaveCoords) {
                  return flight.segments.map((segment, segIndex) => (
                    <Polyline
                      key={`${flight._id}-segment-${segIndex}`}
                      positions={[
                        [segment.departure.latitude!, segment.departure.longitude!],
                        [segment.arrival.latitude!, segment.arrival.longitude!]
                      ]}
                      pathOptions={{
                        color: index === 0 ? '#1E3A5F' : '#94a3b8',
                        weight: index === 0 ? 3 : 2,
                        opacity: index === 0 ? 0.8 : 0.4,
                      }}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          <div className="flex items-center gap-2 mb-2">
                            <img
                              src={flight.airline.logo}
                              alt={flight.airline.name}
                              className="w-8 h-8 object-contain"
                            />
                            <div>
                              <p className="font-bold text-sm">{segment.carrier.flightNumber}</p>
                              <p className="text-xs text-gray-600">{segment.carrier.name}</p>
                            </div>
                          </div>
                          <div className="text-xs space-y-1">
                            <p>
                              <span className="font-semibold">Route:</span>{' '}
                              {segment.departure.code} → {segment.arrival.code}
                            </p>
                            <p>
                              <span className="font-semibold">Duration:</span>{' '}
                              {Math.floor(segment.duration / 60)}h {segment.duration % 60}m
                            </p>
                            <p>
                              <span className="font-semibold">Aircraft:</span> {segment.aircraft}
                            </p>
                            <p>
                              <span className="font-semibold">Segment:</span> {segIndex + 1} of {flight.segments!.length}
                            </p>
                          </div>
                        </div>
                      </Popup>
                    </Polyline>
                  ));
                }
              }

              // Fallback: draw simple line if no segment data
              return (
                <Polyline
                  key={flight._id}
                  positions={[departureCoords, arrivalCoords]}
                  pathOptions={{
                    color: index === 0 ? '#1E3A5F' : '#94a3b8',
                    weight: index === 0 ? 3 : 2,
                    opacity: index === 0 ? 0.8 : 0.4,
                    dashArray: flight.stops > 0 ? '10, 10' : undefined,
                  }}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={flight.airline.logo}
                          alt={flight.airline.name}
                          className="w-8 h-8 object-contain"
                        />
                        <div>
                          <p className="font-bold text-sm">{flight.flightNumber}</p>
                          <p className="text-xs text-gray-600">{flight.airline.name}</p>
                        </div>
                      </div>
                      <div className="text-xs space-y-1">
                        <p>
                          <span className="font-semibold">Duration:</span>{' '}
                          {Math.floor(flight.duration / 60)}h {flight.duration % 60}m
                        </p>
                        <p>
                          <span className="font-semibold">Stops:</span>{' '}
                          {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop(s)`}
                        </p>
                        <p>
                          <span className="font-semibold">Price:</span> ${flight.price.economy}
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Polyline>
              );
            })}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-[#1E3A5F]"></div>
              <span className="text-gray-700">Flight Route</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-700">Departure/Arrival</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-700">Layover Stop</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
