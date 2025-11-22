'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plane, Menu, X } from 'lucide-react';
import { UserNav } from '@/components/shared/UserNav';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Plane className="w-8 h-8 text-[#1E3A5F]" />
          <span className="text-2xl font-bold text-[#1E3A5F]">SkyBook</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/flights/search" className="text-gray-700 hover:text-[#1E3A5F] transition font-medium">
            Flights
          </Link>
          <Link href="/bookings" className="text-gray-700 hover:text-[#1E3A5F] transition font-medium">
            My Bookings
          </Link>
          <Link href="/contact" className="text-gray-700 hover:text-[#1E3A5F] transition font-medium">
            Support
          </Link>
        </nav>

        {/* Desktop User Nav */}
        <div className="hidden md:flex items-center gap-4">
          <UserNav />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-gray-700 hover:text-[#1E3A5F] transition"
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <nav className="flex flex-col px-4 py-4 space-y-4">
            <Link 
              href="/flights/search" 
              className="text-gray-700 hover:text-[#1E3A5F] transition font-medium py-2"
              onClick={closeMobileMenu}
            >
              Flights
            </Link>
            <Link 
              href="/bookings" 
              className="text-gray-700 hover:text-[#1E3A5F] transition font-medium py-2"
              onClick={closeMobileMenu}
            >
              My Bookings
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-700 hover:text-[#1E3A5F] transition font-medium py-2"
              onClick={closeMobileMenu}
            >
              Support
            </Link>
            <div className="pt-4 border-t border-gray-200">
              <UserNav />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
