'use client';

import { useEffect, useState } from 'react';
import { PopulatedBooking } from '@/types/global';
import { useUser } from '@/lib/auth-client';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import FlightBookingCard from '@/components/dashboard/FlightBookingCard';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const user = useUser();
  const router = useRouter();
  const [bookings, setBookings] = useState<PopulatedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookings/user');
      const data = await response.json();

      if (!response.ok) {
        // If unauthorized, redirect to login
        if (response.status === 401) {
          console.error('User not authenticated, redirecting to login');
          router.push('/login?redirect=/dashboard');
          return;
        }
        console.error('API error:', data.error || 'Failed to fetch bookings');
        setBookings([]);
        return;
      }

      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
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

  const handleManageBooking = (bookingId: string) => {
    router.push(`/dashboard/bookings/${bookingId}`);
  };

  const handleDownloadTicket = async (bookingId: string) => {
    try {
      const booking = bookings.find((b) => b._id === bookingId);
      if (booking?.ticketUrl) {
        window.open(booking.ticketUrl, '_blank');
      } else {
        alert('Ticket not available');
      }
    } catch (error) {
      console.error('Download ticket error:', error);
      alert('Failed to download ticket');
    }
  };

  // Filter bookings based on active tab
  const now = new Date();
  const filteredBookings = bookings.filter((booking) => {
    const departureTime = new Date(booking.flight.departure.time);
    if (activeTab === 'upcoming') {
      return departureTime >= now && booking.status !== 'cancelled';
    } else {
      return departureTime < now || booking.status === 'cancelled';
    }
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar user={user} />

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hello, {user?.firstName || user?.name || 'User'}
          </h1>
          <p className="text-gray-600">Here are your upcoming and past flight bookings.</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-3 px-1 font-medium transition-colors relative ${
                activeTab === 'upcoming'
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming Flights
              {activeTab === 'upcoming' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`pb-3 px-1 font-medium transition-colors relative ${
                activeTab === 'past' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Past Bookings
              {activeTab === 'past' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
              )}
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-[#1E3A5F] animate-spin" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">
              {activeTab === 'upcoming' ? 'No upcoming flights' : 'No past bookings'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <FlightBookingCard
                key={booking._id}
                booking={booking}
                onCheckIn={handleCheckIn}
                onManageBooking={handleManageBooking}
                onDownloadTicket={handleDownloadTicket}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
