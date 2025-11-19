'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const slides = [
  {
    image: '/carousel/flight-1.jpg',
    title: 'Book Your Dream Flight',
    subtitle: 'Find the perfect flight at the best price',
    cta: 'Search Flights',
  },
  {
    image: '/carousel/flight-2.jpg',
    title: 'Explore the World',
    subtitle: 'Discover destinations from California to Dubai',
    cta: 'Start Journey',
  },
  {
    image: '/carousel/flight-3.jpg',
    title: 'Premium Comfort',
    subtitle: 'Experience luxury at every step of your journey',
    cta: 'Upgrade Now',
  },
  {
    image: '/carousel/flight-4.jpg',
    title: 'Travel with Confidence',
    subtitle: 'Real-time tracking and digital tickets included',
    cta: 'Book Now',
  },
];

export default function ImageCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlay(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlay(false);
  };

  return (
    <div className="relative w-full h-96 md:h-[500px] overflow-hidden rounded-xl shadow-2xl group">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={slide.image || "/placeholder.svg"}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Text content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              {slide.title}
            </h2>
            <p className="text-lg md:text-xl text-slate-100 mb-8 drop-shadow-md max-w-2xl">
              {slide.subtitle}
            </p>
            <button className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 active:scale-95 drop-shadow-lg">
              {slide.cta}
            </button>
          </div>
        </div>
      ))}

      {/* Previous Button */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all duration-200 active:scale-90 group-hover:bg-white/40"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all duration-200 active:scale-90 group-hover:bg-white/40"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/50 w-3 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={() => setIsAutoPlay(!isAutoPlay)}
        className="absolute top-6 right-6 z-10 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all duration-200 active:scale-90"
        aria-label={isAutoPlay ? 'Pause slideshow' : 'Play slideshow'}
      >
        {isAutoPlay ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}
