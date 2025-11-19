'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-300 mb-8">Manage flights, bookings, and airlines</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Bookings</p>
                <p className="text-3xl font-bold text-white">1,234</p>
              </div>
              <div className="w-12 h-12 bg-sky-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Flights</p>
                <p className="text-3xl font-bold text-white">56</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Revenue</p>
                <p className="text-3xl font-bold text-white">$45.2K</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm1-13h-2v6h2zm0 8h-2v2h2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Airlines</p>
                <p className="text-3xl font-bold text-white">8</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/flights">
            <Card className="bg-slate-800 border-slate-700 hover:border-sky-500 transition p-6 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sky-400 transition">Manage Flights</h3>
                  <p className="text-slate-400">Add, edit, or delete flights</p>
                </div>
                <svg className="w-12 h-12 text-slate-600 group-hover:text-sky-500 transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z" />
                </svg>
              </div>
            </Card>
          </Link>

          <Link href="/admin/airlines">
            <Card className="bg-slate-800 border-slate-700 hover:border-sky-500 transition p-6 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sky-400 transition">Manage Airlines</h3>
                  <p className="text-slate-400">Add, edit airline information</p>
                </div>
                <svg className="w-12 h-12 text-slate-600 group-hover:text-sky-500 transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z" />
                </svg>
              </div>
            </Card>
          </Link>

          <Link href="/admin/bookings">
            <Card className="bg-slate-800 border-slate-700 hover:border-sky-500 transition p-6 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sky-400 transition">View Bookings</h3>
                  <p className="text-slate-400">Monitor all bookings and revenue</p>
                </div>
                <svg className="w-12 h-12 text-slate-600 group-hover:text-sky-500 transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z" />
                </svg>
              </div>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="bg-slate-800 border-slate-700 hover:border-sky-500 transition p-6 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-sky-400 transition">Manage Users</h3>
                  <p className="text-slate-400">View user accounts and activity</p>
                </div>
                <svg className="w-12 h-12 text-slate-600 group-hover:text-sky-500 transition" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z" />
                </svg>
              </div>
            </Card>
          </Link>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="outline" className="text-white border-slate-500 hover:bg-slate-700">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
