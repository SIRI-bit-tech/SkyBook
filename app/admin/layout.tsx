import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth-server';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Server-side authentication and authorization check
  try {
    await requireAdmin();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // If user is not authenticated, redirect to login
    if (errorMessage === 'Unauthorized') {
      redirect('/login?redirect=/admin');
    }
    
    // If user is authenticated but not admin, redirect to dashboard
    if (errorMessage.includes('Forbidden') || errorMessage.includes('Admin')) {
      redirect('/dashboard');
    }
    
    // Default: redirect to home
    redirect('/');
  }

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
            <Link href="/admin/users" className="text-slate-300 hover:text-white transition">Users</Link>
            <Link href="/admin/verify-ticket" className="text-slate-300 hover:text-white transition">Verify Ticket</Link>
            <Link href="/" className="text-slate-300 hover:text-white transition">Back to Site</Link>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
