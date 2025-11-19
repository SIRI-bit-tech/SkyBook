'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MAJOR_AIRLINES } from '@/config/constants';
import FlightSearchBar from '@/components/booking/FlightSearchBar';
import PopularAirlines from '@/components/booking/PopularAirlines';
import ImageCarousel from '@/components/hero/ImageCarousel';
import Footer from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L4 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-8-5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">SkyBook</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/bookings" className="text-slate-300 hover:text-white transition">My Bookings</Link>
            <Link href="/about" className="text-slate-300 hover:text-white transition">About</Link>
            <Link href="/contact" className="text-slate-300 hover:text-white transition">Contact</Link>
            <Link href="/login">
              <Button variant="outline" className="text-white border-slate-500 hover:bg-slate-700">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-sky-500 hover:bg-sky-600 text-white">Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <ImageCarousel />
      </section>

      {/* Search Bar Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Book Flights with <span className="text-sky-400">Confidence</span>
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Real-time flight search, secure payments, and instant digital tickets
          </p>
        </div>

        {/* Search Bar */}
        <FlightSearchBar />
      </section>

      {/* Popular Airlines Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-white mb-8">Popular Airlines</h3>
        <PopularAirlines />
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Best Prices</h4>
            <p className="text-slate-400">Compare prices across multiple airlines and find the best deals</p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Instant Booking</h4>
            <p className="text-slate-400">Secure your seat in seconds with real-time availability</p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Digital Tickets</h4>
            <p className="text-slate-400">Get instant e-tickets with QR codes for airport check-in</p>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-sky-500 p-6 hover:border-sky-400 transition cursor-pointer">
            <Link href="/flights/tracking">
              <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Real-Time Flight Tracking</h4>
              <p className="text-slate-400">Track any flight worldwide with live position, altitude, and speed updates</p>
            </Link>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500 p-6 hover:border-emerald-400 transition cursor-pointer">
            <Link href="/flights/compare-prices">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Compare Prices Live</h4>
              <p className="text-slate-400">Get real-time price comparisons from multiple airlines and booking sources</p>
            </Link>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
