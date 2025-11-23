'use client';

import { useEffect, useState } from 'react';
import { PopulatedBooking } from '@/types/global';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, Plane } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import Header from '@/components/layout/Header';

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<PopulatedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [selectedAirline, setSelectedAirline] = useState('all');

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
          router.push('/login?redirect=/bookings');
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
    router.push(`/bookings/${bookingId}`);
  };

  const handleViewTicket = async (bookingId: string) => {
    try {
      const booking = bookings.find((b) => b.id === bookingId);
      if (booking?.ticketUrl) {
        window.open(booking.ticketUrl, '_blank');
      } else {
        alert('Ticket not available');
      }
    } catch (error) {
      console.error('View ticket error:', error);
      alert('Failed to view ticket');
    }
  };

  // Filter bookings based on active tab and search
  const now = new Date();
  const filteredBookings = bookings.filter((booking) => {
    const departureTime = new Date(booking.departureTime);
    
    // Tab filter
    let tabMatch = false;
    if (activeTab === 'upcoming') {
      tabMatch = departureTime >= now && booking.status !== 'cancelled';
    } else if (activeTab === 'past') {
      tabMatch = departureTime < now && booking.status !== 'cancelled';
    } else if (activeTab === 'cancelled') {
      tabMatch = booking.status === 'cancelled';
    }

    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const searchMatch =
      !searchQuery ||
      booking.departureAirport.toLowerCase().includes(searchLower) ||
      booking.arrivalAirport.toLowerCase().includes(searchLower) ||
      booking.airlineName.toLowerCase().includes(searchLower) ||
      booking.bookingReference.toLowerCase().includes(searchLower);

    // Airline filter
    const airlineMatch =
      selectedAirline === 'all' || booking.airlineName === selectedAirline;

    return tabMatch && searchMatch && airlineMatch;
  });

  // Get unique airlines for filter
  const airlines = Array.from(new Set(bookings.map((b) => b.airlineName)));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage all your flight reservations in one place.</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`pb-3 px-1 font-medium transition-colors relative ${
                activeTab === 'upcoming'
                  ? 'text-[#1E3A5F]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming
              {activeTab === 'upcoming' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A5F]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`pb-3 px-1 font-medium transition-colors relative ${
                activeTab === 'past' ? 'text-[#1E3A5F]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Past
              {activeTab === 'past' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A5F]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`pb-3 px-1 font-medium transition-colors relative ${
                activeTab === 'cancelled'
                  ? 'text-[#1E3A5F]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Cancelled
              {activeTab === 'cancelled' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A5F]"></div>
              )}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by destination, airline, or booking reference"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F]"
            />
          </div>
          <select
            value={selectedAirline}
            onChange={(e) => setSelectedAirline(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F]"
          >
            <option value="all">All Airlines</option>
            {airlines.map((airline) => (
              <option key={airline} value={airline}>
                {airline}
              </option>
            ))}
          </select>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane className="w-10 h-10 text-[#1E3A5F]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Upcoming Flights</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven&apos;t booked a trip yet. Let&apos;s find your next adventure.
            </p>
            <Link href="/flights">
              <Button className="bg-[#1E3A5F] hover:bg-[#2A4A73] text-white px-8 py-3">
                Search for Flights
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const departureTime = new Date(booking.departureTime);
              const arrivalTime = new Date(booking.arrivalTime);
              const isCheckInOpen = booking.status === 'confirmed';
              const isCheckedIn = booking.status === 'checked-in';

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Left Section */}
                    <div className="flex-1">
                      {/* Airline and Flight Number */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#1E3A5F] rounded flex items-center justify-center text-white font-bold text-sm">
                          {booking.airlineCode}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {booking.airlineName} • {booking.flightNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.airlineCode} • {booking.flightNumber}
                          </div>
                        </div>
                      </div>

                      {/* Route */}
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {booking.departureAirport} to {booking.arrivalAirport}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 mb-1">Date</div>
                          <div className="font-medium text-gray-900">
                            {format(departureTime, 'MMMM dd, yyyy')}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Booking Reference</div>
                          <div className="font-medium text-gray-900">{booking.bookingReference}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1">Passengers</div>
                          <div className="font-medium text-gray-900">
                            {booking.passengers.map((p) => `${p.firstName} ${p.lastName}`).join(', ')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex flex-col gap-3 lg:items-end">
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-medium w-fit ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'checked-in'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {booking.status === 'confirmed'
                          ? 'CONFIRMED'
                          : booking.status === 'checked-in'
                          ? 'CHECKED-IN'
                          : booking.status.toUpperCase()}
                      </span>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleManageBooking(booking.id)}
                          variant="outline"
                          className="border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#E8EEF5]"
                        >
                          Manage
                        </Button>
                        {isCheckInOpen && (
                          <Button
                            onClick={() => handleCheckIn(booking.id)}
                            className="bg-[#1E3A5F] hover:bg-[#2A4A73] text-white"
                          >
                            Check-in
                          </Button>
                        )}
                        {isCheckedIn && (
                          <Button
                            onClick={() => handleViewTicket(booking.id)}
                            className="bg-[#1E3A5F] hover:bg-[#2A4A73] text-white"
                          >
                            View E-ticket
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
