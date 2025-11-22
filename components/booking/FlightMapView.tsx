'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import L from 'leaflet';

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
  departure: { code: string; time: string };
  arrival: { code: string; time: string };
  duration: number;
  stops: number;
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
    
    // Fix Leaflet default marker icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [departure, arrival]);

  const fetchAirportCoordinates = async () => {
    try {
      setLoading(true);
      
      // Fetch departure airport data from Amadeus API
      const depResponse = await fetch(`/api/airports/search?q=${departure}`);
      const depData = await depResponse.json();
      
      // Fetch arrival airport data from Amadeus API
      const arrResponse = await fetch(`/api/airports/search?q=${arrival}`);
      const arrData = await arrResponse.json();

      // Find exact matches
      const depAirport = depData.data?.find((a: any) => a.iataCode === departure);
      const arrAirport = arrData.data?.find((a: any) => a.iataCode === arrival);

      // Set coordinates from API response
      if (depAirport?.geoCode) {
        setDepartureCoords([depAirport.geoCode.latitude, depAirport.geoCode.longitude]);
      }
      
      if (arrAirport?.geoCode) {
        setArrivalCoords([arrAirport.geoCode.latitude, arrAirport.geoCode.longitude]);
      }
    } catch (error) {
      console.error('Error fetching airport coordinates:', error);
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

            {/* Flight Routes */}
            {flights.slice(0, 10).map((flight, index) => (
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
            ))}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-[#1E3A5F]"></div>
              <span className="text-gray-700">Direct Flight</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-gray-400 border-dashed border-t-2"></div>
              <span className="text-gray-700">With Stops</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-700">Airport</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
