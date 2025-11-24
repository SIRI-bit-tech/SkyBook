'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Airline } from '@/types/global';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane, MapPin, Users, Star } from 'lucide-react';

interface AirlineCardProps {
  airline: Airline;
}

export default function AirlineCard({ airline }: AirlineCardProps) {
  const getAirlineLogo = (code: string) => {
    return `https://images.kiwi.com/airlines/64x64/${code}.png`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-[#1E3A5F]/30 overflow-hidden">
      <div className="p-6">
        {/* Header with Logo and Featured Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2 overflow-hidden">
              <Image
                src={airline.logo || getAirlineLogo(airline.code)}
                alt={airline.name}
                width={48}
                height={48}
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-airline.svg';
                }}
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1E3A5F] transition-colors">
                {airline.name}
              </h3>
              <p className="text-sm text-gray-600 font-medium">{airline.code}</p>
            </div>
          </div>
          
          {airline.isFeatured && (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>

        {/* Airline Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{airline.country}</span>
          </div>
          
          {airline.fleetSize > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Plane className="w-4 h-4" />
              <span>{airline.fleetSize} Aircraft</span>
            </div>
          )}
          
          {airline.popularRoutes && airline.popularRoutes.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{airline.popularRoutes.length} Popular Routes</span>
            </div>
          )}
        </div>

        {/* Description */}
        {airline.description && (
          <p className="text-sm text-gray-600 mb-6 line-clamp-2">
            {airline.description}
          </p>
        )}

        {/* Popular Routes */}
        {airline.popularRoutes && airline.popularRoutes.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Popular Routes</h4>
            <div className="flex flex-wrap gap-1">
              {airline.popularRoutes.slice(0, 3).map((route, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {route}
                </Badge>
              ))}
              {airline.popularRoutes.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{airline.popularRoutes.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href={`/airlines/${airline.code}`}
            className="flex-1 bg-[#1E3A5F] text-white text-center py-2 px-4 rounded-lg hover:bg-[#2A4A73] transition-colors text-sm font-medium"
          >
            View Flights
          </Link>
          
          {airline.website && (
            <a
              href={airline.website}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Website
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}