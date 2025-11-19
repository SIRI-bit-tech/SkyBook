'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Flight {
  _id: string;
  flightNumber: string;
  airline: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  seats: number;
  bookedSeats: string[];
  status: string;
}

export default function FlightsManagementPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    flightNumber: '',
    airline: '',
    departure: '',
    arrival: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
    seats: '',
    status: 'scheduled',
  });

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const response = await fetch('/api/flights/search?limit=100');
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

  const handleSaveFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/flights/${editingId}` : '/api/flights/search';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchFlights();
        setShowForm(false);
        setEditingId(null);
        setFormData({
          flightNumber: '',
          airline: '',
          departure: '',
          arrival: '',
          departureTime: '',
          arrivalTime: '',
          price: '',
          seats: '',
          status: 'scheduled',
        });
      }
    } catch (error) {
      console.error('Failed to save flight:', error);
    }
  };

  const handleDeleteFlight = async (id: string) => {
    if (confirm('Are you sure you want to delete this flight?')) {
      try {
        const response = await fetch(`/api/flights/${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchFlights();
        }
      } catch (error) {
        console.error('Failed to delete flight:', error);
      }
    }
  };

  const handleEditFlight = (flight: Flight) => {
    setFormData({
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      departure: flight.departure,
      arrival: flight.arrival,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      price: flight.price.toString(),
      seats: flight.seats.toString(),
      status: flight.status,
    });
    setEditingId(flight._id);
    setShowForm(true);
  };

  const filteredFlights = flights.filter(flight => {
    const matchesSearch = flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flight.airline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || flight.status === statusFilter;
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Manage Flights</h1>
            <p className="text-slate-300">Add, edit, or delete flights and manage schedules</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                flightNumber: '',
                airline: '',
                departure: '',
                arrival: '',
                departureTime: '',
                arrivalTime: '',
                price: '',
                seats: '',
                status: 'scheduled',
              });
            }}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            + Add Flight
          </Button>
        </div>

        {showForm && (
          <Card className="bg-slate-800 border-slate-700 p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">{editingId ? 'Edit' : 'Add'} Flight</h2>
            <form onSubmit={handleSaveFlight} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Flight Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.flightNumber}
                    onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                    placeholder="e.g., DL123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Airline *</label>
                  <input
                    type="text"
                    required
                    value={formData.airline}
                    onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                    placeholder="e.g., Delta"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Departure Airport *</label>
                  <input
                    type="text"
                    required
                    value={formData.departure}
                    onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                    placeholder="e.g., LAX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Arrival Airport *</label>
                  <input
                    type="text"
                    required
                    value={formData.arrival}
                    onChange={(e) => setFormData({ ...formData, arrival: e.target.value })}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                    placeholder="e.g., JFK"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Departure Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Arrival Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Price (USD) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                    placeholder="399.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Total Seats *</label>
                  <input
                    type="number"
                    required
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                    placeholder="200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="boarding">Boarding</option>
                    <option value="departed">Departed</option>
                    <option value="in-flight">In Flight</option>
                    <option value="landed">Landed</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
                >
                  {editingId ? 'Update' : 'Add'} Flight
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="flex-1 bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <input
            type="text"
            placeholder="Search flights..."
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
            <option value="scheduled">Scheduled</option>
            <option value="boarding">Boarding</option>
            <option value="in-flight">In Flight</option>
            <option value="landed">Landed</option>
            <option value="delayed">Delayed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div></div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/50 border-b border-slate-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Flight</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Route</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Seats</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlights.map((flight) => (
                <tr key={flight._id} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
                  <td className="px-6 py-4 text-white font-semibold">{flight.flightNumber}</td>
                  <td className="px-6 py-4 text-slate-300">{flight.departure} → {flight.arrival}</td>
                  <td className="px-6 py-4 text-sky-400 font-semibold">${flight.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      flight.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                      flight.status === 'delayed' ? 'bg-amber-500/20 text-amber-400' :
                      flight.status === 'landed' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-sky-500/20 text-sky-400'
                    }`}>
                      {flight.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{flight.bookedSeats?.length || 0}/{flight.seats}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button
                      onClick={() => handleEditFlight(flight)}
                      size="sm"
                      variant="outline"
                      className="text-sky-400 border-sky-400 hover:bg-sky-400/10"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteFlight(flight._id)}
                      size="sm"
                      variant="outline"
                      className="text-red-400 border-red-400 hover:bg-red-400/10"
                    >
                      Delete
                    </Button>
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
