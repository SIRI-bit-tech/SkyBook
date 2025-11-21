'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/admin/DataTable';
import { SearchFilter } from '@/components/admin/SearchFilter';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { FlightForm } from '@/components/admin/FlightForm';
import { Flight } from '@/types/global';

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

export default function FlightsManagementPage() {
  const [flights, setFlights] = useState<PopulatedFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFlight, setEditingFlight] = useState<PopulatedFlight | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchFlights();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchFlights();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, statusFilter]);

  const fetchFlights = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/flights?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFlights(data.flights || []);
      }
    } catch (error) {
      console.error('Failed to fetch flights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFlight = async (data: any) => {
    try {
      const method = editingFlight ? 'PATCH' : 'POST';
      const url = editingFlight
        ? `/api/admin/flights/${editingFlight._id}`
        : '/api/admin/flights';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchFlights();
        setShowForm(false);
        setEditingFlight(null);
      }
    } catch (error) {
      console.error('Failed to save flight:', error);
    }
  };

  const handleDeleteFlight = async (id: string) => {
    if (confirm('Are you sure you want to delete this flight?')) {
      try {
        const response = await fetch(`/api/admin/flights/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          await fetchFlights();
        }
      } catch (error) {
        console.error('Failed to delete flight:', error);
      }
    }
  };

  const columns = [
    {
      header: 'Flight',
      accessor: (flight: PopulatedFlight) => (
        <div>
          <div className="text-white font-semibold">{flight.flightNumber}</div>
          <div className="text-slate-400 text-sm">{flight.airline.name}</div>
        </div>
      ),
    },
    {
      header: 'Route',
      accessor: (flight: PopulatedFlight) => (
        <span className="text-slate-300">
          {flight.departure.airport.code} → {flight.arrival.airport.code}
        </span>
      ),
    },
    {
      header: 'Departure',
      accessor: (flight: PopulatedFlight) => (
        <span className="text-slate-300">
          {new Date(flight.departure.time).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Price',
      accessor: (flight: PopulatedFlight) => (
        <span className="text-sky-400 font-semibold">
          ${flight.price.economy}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (flight: PopulatedFlight) => (
        <StatusBadge status={flight.status} type="flight" />
      ),
    },
    {
      header: 'Seats',
      accessor: (flight: PopulatedFlight) => (
        <span className="text-slate-300">
          {flight.seatMap?.reserved?.length || 0}/{flight.availableSeats}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (flight: PopulatedFlight) => (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setEditingFlight(flight);
              setShowForm(true);
            }}
            size="sm"
            variant="outline"
            className="text-sky-400 border-sky-400 hover:bg-sky-400/10"
          >
            Edit
          </Button>
          <Button
            onClick={() => handleDeleteFlight(flight._id!)}
            size="sm"
            variant="outline"
            className="text-red-400 border-red-400 hover:bg-red-400/10"
          >
            Delete
          </Button>
        </div>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Manage Flights</h1>
            <p className="text-slate-300">Add, edit, or delete flights and manage schedules</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingFlight(null);
            }}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            + Add Flight
          </Button>
        </div>

        {showForm && (
          <FlightForm
            flight={
              editingFlight
                ? {
                    ...editingFlight,
                    airline: editingFlight.airline._id,
                    departure: {
                      ...editingFlight.departure,
                      airport: editingFlight.departure.airport._id,
                      terminal: editingFlight.departure.terminal || '',
                    },
                    arrival: {
                      ...editingFlight.arrival,
                      airport: editingFlight.arrival.airport._id,
                      terminal: editingFlight.arrival.terminal || '',
                    },
                  }
                : undefined
            }
            onSubmit={handleSaveFlight}
            onCancel={() => {
              setShowForm(false);
              setEditingFlight(null);
            }}
          />
        )}

        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by flight number..."
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={[
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'delayed', label: 'Delayed' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'completed', label: 'Completed' },
          ]}
          filterPlaceholder="All Status"
        />

        <DataTable columns={columns} data={flights} />

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
