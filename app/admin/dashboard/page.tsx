'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/admin/StatsCard';
import { Plane, DollarSign, Building2, Users } from 'lucide-react';

interface Stats {
  bookings: { total: number; confirmed: number; pending: number };
  flights: { total: number; active: number };
  airlines: { total: number };
  users: { total: number };
  revenue: { total: number; average: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-300 mb-8">Manage flights, bookings, and airlines</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Bookings"
            value={stats?.bookings.total || 0}
            subtitle={`${stats?.bookings.confirmed || 0} confirmed`}
            icon={<Plane className="w-6 h-6 text-sky-500" />}
            colorClass="bg-sky-500/20"
          />
          <StatsCard
            title="Active Flights"
            value={stats?.flights.active || 0}
            subtitle={`${stats?.flights.total || 0} total flights`}
            icon={<Plane className="w-6 h-6 text-emerald-500" />}
            colorClass="bg-emerald-500/20"
          />
          <StatsCard
            title="Revenue"
            value={`$${((stats?.revenue.total || 0) / 1000).toFixed(1)}K`}
            subtitle={`Avg: $${(stats?.revenue.average || 0).toFixed(0)}`}
            icon={<DollarSign className="w-6 h-6 text-amber-500" />}
            colorClass="bg-amber-500/20"
          />
          <StatsCard
            title="Airlines"
            value={stats?.airlines.total || 0}
            subtitle={`${stats?.users.total || 0} users`}
            icon={<Building2 className="w-6 h-6 text-purple-500" />}
            colorClass="bg-purple-500/20"
          />
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
