'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Booking {
  _id: string;
  bookingReference: string;
  airline: string;
  status: string;
  totalPrice: number;
  passenger: string;
  createdAt: string;
  flight: {
    flightNumber: string;
    departure: string;
    arrival: string;
  };
}

export default function BookingsManagementPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    confirmedBookings: 0,
    averagePrice: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings?limit=100');
      if (response.ok) {
        const data = await response.json();
        const bookingsList = data.bookings || [];
        setBookings(bookingsList);

        const totalRevenue = bookingsList.reduce((sum: number, b: Booking) => sum + b.totalPrice, 0);
        const confirmed = bookingsList.filter((b: Booking) => b.status === 'confirmed').length;

        setStats({
          totalBookings: bookingsList.length,
          totalRevenue,
          confirmedBookings: confirmed,
          averagePrice: bookingsList.length > 0 ? totalRevenue / bookingsList.length : 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/patch`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.airline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Bookings & Analytics</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700 p-6">
            <p className="text-sm text-slate-400 mb-2">Total Bookings</p>
            <p className="text-3xl font-bold text-white">{stats.totalBookings}</p>
            <p className="text-sky-400 text-sm mt-2">{stats.confirmedBookings} confirmed</p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <p className="text-sm text-slate-400 mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-emerald-400">${stats.totalRevenue.toLocaleString()}</p>
            <p className="text-sky-400 text-sm mt-2">All bookings</p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <p className="text-sm text-slate-400 mb-2">Average Price</p>
            <p className="text-3xl font-bold text-white">${stats.averagePrice.toFixed(2)}</p>
            <p className="text-sky-400 text-sm mt-2">Per booking</p>
          </Card>

          <Card className="bg-slate-800 border-slate-700 p-6">
            <p className="text-sm text-slate-400 mb-2">Conversion Rate</p>
            <p className="text-3xl font-bold text-sky-400">
              {((stats.confirmedBookings / stats.totalBookings) * 100 || 0).toFixed(1)}%
            </p>
            <p className="text-sky-400 text-sm mt-2">Of pending bookings</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by booking reference or airline..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked-in">Checked In</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Bookings Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/50 border-b border-slate-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Booking Ref</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Flight</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Airline</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
                  <td className="px-6 py-4 text-white font-semibold">{booking.bookingReference}</td>
                  <td className="px-6 py-4 text-slate-300">{booking.flight?.flightNumber}</td>
                  <td className="px-6 py-4 text-slate-300">{booking.airline}</td>
                  <td className="px-6 py-4 text-sky-400 font-semibold">${booking.totalPrice}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                      booking.status === 'checked-in' ? 'bg-emerald-500/20 text-emerald-400' :
                      booking.status === 'confirmed' ? 'bg-sky-500/20 text-sky-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <select
                      value={booking.status}
                      onChange={(e) => handleUpdateStatus(booking._id, e.target.value)}
                      className="bg-slate-700 text-white rounded px-2 py-1 border border-slate-600 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked-in">Checked In</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <Link href="/admin/dashboard">
            <Button variant="outline" className="text-white border-slate-500 hover:bg-slate-700">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
