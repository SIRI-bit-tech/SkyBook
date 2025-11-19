import { ReactNode } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <nav className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/admin/dashboard" className="text-xl font-bold text-white hover:text-sky-400">
            SkyBook Admin
          </Link>
          <div className="flex gap-6">
            <Link href="/admin/dashboard" className="text-slate-300 hover:text-white transition">Dashboard</Link>
            <Link href="/admin/flights" className="text-slate-300 hover:text-white transition">Flights</Link>
            <Link href="/admin/airlines" className="text-slate-300 hover:text-white transition">Airlines</Link>
            <Link href="/admin/bookings" className="text-slate-300 hover:text-white transition">Bookings</Link>
            <Link href="/admin-auth/login" className="text-slate-300 hover:text-red-400 transition">Logout</Link>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
