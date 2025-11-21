'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flight, Airline, Airport } from '@/types/global';

interface FlightFormProps {
  flight?: Partial<Flight>;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function FlightForm({ flight, onSubmit, onCancel }: FlightFormProps) {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => ({
    flightNumber: flight?.flightNumber || '',
    airline: (flight?.airline as string) || '',
    departureAirport: (flight?.departure as any)?.airport || '',
    departureTime: flight?.departure?.time
      ? new Date(flight.departure.time).toISOString().slice(0, 16)
      : '',
    departureTerminal: (flight?.departure as any)?.terminal || '',
    arrivalAirport: (flight?.arrival as any)?.airport || '',
    arrivalTime: flight?.arrival?.time
      ? new Date(flight.arrival.time).toISOString().slice(0, 16)
      : '',
    arrivalTerminal: (flight?.arrival as any)?.terminal || '',
    aircraft: flight?.aircraft || '',
    economyPrice: flight?.price?.economy || '',
    businessPrice: flight?.price?.business || '',
    firstClassPrice: flight?.price?.firstClass || '',
    availableSeats: flight?.availableSeats || '',
    status: (flight?.status || 'scheduled') as 'scheduled' | 'delayed' | 'cancelled' | 'completed',
  }));

  useEffect(() => {
    fetchAirlines();
    fetchAirports();
  }, []);

  // Sync form data when flight prop changes (for reused form instances)
  useEffect(() => {
    if (!flight) return;
    
    setFormData({
      flightNumber: flight.flightNumber || '',
      airline: (flight.airline as string) || '',
      departureAirport: (flight.departure as any)?.airport || '',
      departureTime: flight.departure?.time
        ? new Date(flight.departure.time).toISOString().slice(0, 16)
        : '',
      departureTerminal: (flight.departure as any)?.terminal || '',
      arrivalAirport: (flight.arrival as any)?.airport || '',
      arrivalTime: flight.arrival?.time
        ? new Date(flight.arrival.time).toISOString().slice(0, 16)
        : '',
      arrivalTerminal: (flight.arrival as any)?.terminal || '',
      aircraft: flight.aircraft || '',
      economyPrice: flight.price?.economy || '',
      businessPrice: flight.price?.business || '',
      firstClassPrice: flight.price?.firstClass || '',
      availableSeats: flight.availableSeats || '',
      status: (flight.status || 'scheduled') as 'scheduled' | 'delayed' | 'cancelled' | 'completed',
    });
  }, [flight]);

  const fetchAirlines = async () => {
    try {
      const response = await fetch('/api/admin/airlines?limit=100');
      if (response.ok) {
        const data = await response.json();
        setAirlines(data.airlines || []);
      }
    } catch (error) {
      console.error('Failed to fetch airlines:', error);
    }
  };

  const fetchAirports = async () => {
    try {
      const response = await fetch('/api/airports?limit=100');
      if (response.ok) {
        const data = await response.json();
        setAirports(data.airports || []);
      }
    } catch (error) {
      console.error('Failed to fetch airports:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        flightNumber: formData.flightNumber,
        airline: formData.airline,
        departure: {
          airport: formData.departureAirport,
          time: new Date(formData.departureTime),
          terminal: formData.departureTerminal,
        },
        arrival: {
          airport: formData.arrivalAirport,
          time: new Date(formData.arrivalTime),
          terminal: formData.arrivalTerminal,
        },
        aircraft: formData.aircraft,
        price: {
          economy: Number(formData.economyPrice),
          business: Number(formData.businessPrice),
          firstClass: Number(formData.firstClassPrice),
        },
        availableSeats: Number(formData.availableSeats),
        status: formData.status,
      };

      await onSubmit(payload);
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 p-8 mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">
        {flight?._id ? 'Edit' : 'Add'} Flight
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Flight Number *
            </label>
            <input
              type="text"
              required
              value={formData.flightNumber}
              onChange={(e) =>
                setFormData({ ...formData, flightNumber: e.target.value })
              }
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
              placeholder="e.g., DL123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Airline *
            </label>
            <select
              required
              value={formData.airline}
              onChange={(e) =>
                setFormData({ ...formData, airline: e.target.value })
              }
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            >
              <option value="">Select Airline</option>
              {airlines.map((airline) => (
                <option key={airline._id} value={airline._id}>
                  {airline.name} ({airline.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Departure Airport *
            </label>
            <select
              required
              value={formData.departureAirport}
              onChange={(e) =>
                setFormData({ ...formData, departureAirport: e.target.value })
              }
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            >
              <option value="">Select Airport</option>
              {airports.map((airport) => (
                <option key={airport._id} value={airport._id}>
                  {airport.code} - {airport.city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Departure Time *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.departureTime}
              onChange={(e) =>
                setFormData({ ...formData, departureTime: e.target.value })
              }
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Terminal
            </label>
            <input
              type="text"
              value={formData.departureTerminal}
              onChange={(e) =>
                setFormData({ ...formData, departureTerminal: e.target.value })
              }
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
              placeholder="e.g., A"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Arrival Airport *
            </label>
            <select
              required
              value={formData.arrivalAirport}
              onChange={(e) =>
                setFormData({ ...formData, arrivalAirport: e.target.value })
              }
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            >
              <option value="">Select Airport</option>
              {airports.map((airport) => (
                <option key={airport._id} value={airport._id}>
                  {airport.code} - {airport.city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Arrival Time *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.arrivalTime}
              onChange={(e) =>
                setFormData({ ...formData, arrivalTime: e.target.value })
              }
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Terminal
            </label>
            <input
              type="text"
              value={formData.arrivalTerminal}
              onChange={(e) =>
                setFormData({ ...formData, arrivalTerminal: e.target.value })
              }
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
              placeholder="e.g., B"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Economy Price *
            </label>
            <input
              type="number"
              required
              value={formData.economyPrice}
              onChange={(e) =>
                setFormData({ ...formData, economyPrice: e.target.value })
              }
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
              placeholder="299"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Business Price *
            </label>
            <input
              type="number"
              required
              value={formData.businessPrice}
              onChange={(e) =>
                setFormData({ ...formData, businessPrice: e.target.value })
              }
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
              placeholder="899"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              First Class Price *
            </label>
            <input
              type="number"
              required
              value={formData.firstClassPrice}
              onChange={(e) =>
                setFormData({ ...formData, firstClassPrice: e.target.value })
              }
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
              placeholder="1499"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Available Seats *
            </label>
            <input
              type="number"
              required
              value={formData.availableSeats}
              onChange={(e) =>
                setFormData({ ...formData, availableSeats: e.target.value })
              }
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
              placeholder="200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Aircraft
            </label>
            <input
              type="text"
              value={formData.aircraft}
              onChange={(e) =>
                setFormData({ ...formData, aircraft: e.target.value })
              }
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
              placeholder="e.g., Boeing 737"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ 
                  ...formData, 
                  status: e.target.value as 'scheduled' | 'delayed' | 'cancelled' | 'completed'
                })
              }
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            >
              <option value="scheduled">Scheduled</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
          >
            {loading ? 'Saving...' : flight?._id ? 'Update' : 'Add'} Flight
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1 bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
