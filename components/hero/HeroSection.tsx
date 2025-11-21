'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import FlightSearchBar from '@/components/booking/FlightSearchBar';

const carouselImages = [
  '/carousel/flight-1.jpg',
  '/carousel/flight-2.jpg',
  '/carousel/flight-3.jpg',
  '/carousel/flight-4.jpg',
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[600px] overflow-hidden">
      {/* Carousel Background */}
      <div className="absolute inset-0">
        {carouselImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image}
              alt={`Flight ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#6B8CAE]/80 via-[#5A7A9E]/70 to-[#4A6A8E]/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-6xl mx-auto px-4 w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Find Your Next Adventure
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Book flights with confidence and ease
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <FlightSearchBar />
          </div>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
