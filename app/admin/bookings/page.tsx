'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/admin/DataTable';
import { SearchFilter } from '@/components/admin/SearchFilter';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { StatsCard } from '@/components/admin/StatsCard';
import { PopulatedBooking, Flight } from '@/types/global';
import { DollarSign, TrendingUp } from 'lucide-react';

interface PopulatedFlight extends Omit<Flight, 'airline' | 'departure' | 'arrival'> {
  airline: { _id: string; name: string; code: string; logo: string };
  departure: {
    airport: { _id: string; name: string; code: string; city: string };
    time: Date;
    terminal?: string;
  };
  arrival: {
    airport: { _id: string; name: string; code: string; city: string };
    time: Date;
    terminal?: string;
  };
}

interface ExtendedPopulatedBooking extends Omit<PopulatedBooking, 'flight'> {
  flight: PopulatedFlight;
}

export default function BookingsManagementPage() {
  const [bookings, setBookings] = useState<ExtendedPopulatedBooking[]>([]);
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

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchBookings();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, statusFilter]);

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/bookings?${params}`);
      if (response.ok) {
        const data = await response.json();
        const bookingsList = data.bookings || [];
        setBookings(bookingsList);

        const totalRevenue = bookingsList.reduce(
          (sum: number, b: ExtendedPopulatedBooking) => sum + b.totalPrice,
          0
        );
        const confirmed = bookingsList.filter(
          (b: ExtendedPopulatedBooking) => b.status === 'confirmed'
        ).length;

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
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchBookings();
      }
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  };

  const columns = [
    {
      header: 'Booking Ref',
      accessor: (booking: ExtendedPopulatedBooking) => (
        <span className="text-white font-semibold">{booking.bookingReference}</span>
      ),
    },
    {
      header: 'Flight',
      accessor: (booking: ExtendedPopulatedBooking) => (
        <div>
          <div className="text-white">{booking.flight.flightNumber}</div>
          <div className="text-slate-400 text-sm">
            {booking.flight.departure.airport.code} → {booking.flight.arrival.airport.code}
          </div>
        </div>
      ),
    },
    {
      header: 'Passenger',
      accessor: (booking: ExtendedPopulatedBooking) => (
        <div>
          <div className="text-white">
            {booking.user.firstName} {booking.user.lastName}
          </div>
          <div className="text-slate-400 text-sm">{booking.user.email}</div>
        </div>
      ),
    },
    {
      header: 'Price',
      accessor: (booking: ExtendedPopulatedBooking) => (
        <span className="text-sky-400 font-semibold">${booking.totalPrice}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (booking: ExtendedPopulatedBooking) => (
        <StatusBadge status={booking.status} type="booking" />
      ),
    },
    {
      header: 'Date',
      accessor: (booking: ExtendedPopulatedBooking) => (
        <span className="text-slate-300">
          {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (booking: ExtendedPopulatedBooking) => (
        <select
          value={booking.status}
          onChange={(e) => handleUpdateStatus(booking._id!, e.target.value)}
          className="bg-slate-700 text-white rounded px-2 py-1 border border-slate-600 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked-in">Checked In</option>
          <option value="cancelled">Cancelled</option>
        </select>
      ),
    },
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Bookings"
            value={stats.totalBookings}
            subtitle={`${stats.confirmedBookings} confirmed`}
            icon={<DollarSign className="w-6 h-6 text-sky-500" />}
            colorClass="bg-sky-500/20"
          />
          <StatsCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            subtitle="All bookings"
            icon={<DollarSign className="w-6 h-6 text-emerald-500" />}
            colorClass="bg-emerald-500/20"
          />
          <StatsCard
            title="Average Price"
            value={`$${stats.averagePrice.toFixed(2)}`}
            subtitle="Per booking"
            icon={<TrendingUp className="w-6 h-6 text-amber-500" />}
            colorClass="bg-amber-500/20"
          />
          <StatsCard
            title="Conversion Rate"
            value={`${((stats.confirmedBookings / stats.totalBookings) * 100 || 0).toFixed(1)}%`}
            subtitle="Confirmed bookings"
            icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
            colorClass="bg-purple-500/20"
          />
        </div>

        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by booking reference..."
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={[
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'checked-in', label: 'Checked In' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          filterPlaceholder="All Status"
        />

        <DataTable columns={columns} data={bookings} />

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
