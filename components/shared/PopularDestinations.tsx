'use client';

import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface Destination {
  city: string;
  country: string;
  image: string;
  flights: string;
}

const destinations: Destination[] = [
  {
    city: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop',
    flights: 'Flights from $450',
  },
  {
    city: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
    flights: 'Flights from $780',
  },
  {
    city: 'Rome',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=300&fit=crop',
    flights: 'Flights from $520',
  },
  {
    city: 'New York',
    country: 'USA',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop',
    flights: 'Flights from $380',
  },
];

export default function PopularDestinations() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] mb-3">
            Popular Destinations
          </h2>
          <p className="text-lg text-gray-600">
            Explore the world's top cities with SkyBook
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination, index) => (
            <Card
              key={index}
              className="group cursor-pointer overflow-hidden border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={destination.image}
                  alt={`${destination.city}, ${destination.country}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-1">
                  {destination.city}, {destination.country}
                </h3>
                <p className="text-sm text-gray-600">{destination.flights}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
