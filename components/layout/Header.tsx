'use client';

import Link from 'next/link';
import { Plane } from 'lucide-react';
import { UserNav } from '@/components/shared/UserNav';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Plane className="w-8 h-8 text-[#1E3A5F]" />
          <span className="text-2xl font-bold text-[#1E3A5F]">SkyBook</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/flights/search" className="text-gray-700 hover:text-[#1E3A5F] transition font-medium">
            Flights
          </Link>
          <Link href="/dashboard/bookings" className="text-gray-700 hover:text-[#1E3A5F] transition font-medium">
            My Bookings
          </Link>
          <Link href="/contact" className="text-gray-700 hover:text-[#1E3A5F] transition font-medium">
            Support
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
