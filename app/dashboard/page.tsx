'use client';

import { useEffect, useState } from 'react';
import { PopulatedBooking } from '@/types/global';
import BookingCard from '@/components/dashboard/BookingCard';
import BookingFilters from '@/components/dashboard/BookingFilters';
import BookingStats from '@/components/dashboard/BookingStats';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [bookings, setBookings] = useState<PopulatedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    checkedIn: 0,
    cancelled: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, [activeFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const url = activeFilter === 'all' 
        ? '/api/bookings/user'
        : `/api/bookings/user?status=${activeFilter}`;
      
      const response = await fetch(url);
      const data = await response.json();

      // Check HTTP status first
      if (!response.ok) {
        const errorMessage = data.error || response.statusText || 'Failed to fetch bookings';
        console.error('API error:', errorMessage);
        
        // Clear stale data on error
        setBookings([]);
        setStats({
          total: 0,
          confirmed: 0,
          checkedIn: 0,
          cancelled: 0,
        });
        return;
      }

      // Process successful response
      if (data.success) {
        setBookings(data.bookings);
        calculateStats(data.bookings, data.pagination?.total);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      // Clear stale data on exception
      setBookings([]);
      setStats({
        total: 0,
        confirmed: 0,
        checkedIn: 0,
        cancelled: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsList: PopulatedBooking[], paginationTotal?: number) => {
    setStats({
      total: paginationTotal !== undefined ? paginationTotal : bookingsList.length,
      confirmed: bookingsList.filter(b => b.status === 'confirmed').length,
      checkedIn: bookingsList.filter(b => b.status === 'checked-in').length,
      cancelled: bookingsList.filter(b => b.status === 'cancelled').length,
    });
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert('Booking cancelled successfully');
        fetchBookings();
      } else {
        alert(data.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel booking');
    }
  };

  const handleCheckIn = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/check-in`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert('Checked in successfully!');
        fetchBookings();
      } else {
        alert(data.error || 'Failed to check in');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Failed to check in');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-slate-400">Manage your flight bookings and check-in online</p>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <BookingStats stats={stats} />
        </div>

        {/* Filters */}
        <div className="mb-6 flex justify-between items-center">
          <BookingFilters 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter} 
          />
          <Link href="/flights">
            <Button className="bg-sky-500 hover:bg-sky-600">
              Book New Flight
            </Button>
          </Link>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg mb-4">No bookings found</p>
            <Link href="/flights">
              <Button className="bg-sky-500 hover:bg-sky-600">
                Book Your First Flight
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onCancel={handleCancel}
                onCheckIn={handleCheckIn}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
