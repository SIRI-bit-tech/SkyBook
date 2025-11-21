'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { API_ROUTES } from '@/config/constants';
import { FlightStatus } from '@/types/global';

export default function FlightTracker() {
  const [flightNumber, setFlightNumber] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [flightStatus, setFlightStatus] = useState<FlightStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trackFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        flightNumber: flightNumber.toUpperCase(),
        departureDate: departureDate || new Date().toISOString().split('T')[0],
      });

      const response = await fetch(`${API_ROUTES.FLIGHTS.TRACKING}?${params}`);
      const data = await response.json();

      if (data.success && data.flightStatus) {
        setFlightStatus(data.flightStatus);
      } else {
        setError('Flight not found. Please check the flight number.');
      }
    } catch (err) {
      setError('Failed to track flight. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_air':
        return 'bg-blue-500';
      case 'landed':
        return 'bg-green-500';
      case 'delayed':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  return (
    <div className="space-y-6">
      {/* Tracker Form */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Track Your Flight</h3>
        <form onSubmit={trackFlight} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Flight Number</label>
            <input
              type="text"
              placeholder="e.g., AA123"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none uppercase"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Date (Optional)</label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium"
            >
              {loading ? 'Tracking...' : 'Track Flight'}
            </Button>
          </div>
        </form>
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </Card>

      {/* Flight Status Display */}
      {flightStatus && (
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{flightStatus.airline}</p>
                <p className="text-2xl font-bold text-white">{flightStatus.flightNumber}</p>
              </div>
              <div className={`px-4 py-2 rounded-lg font-bold text-white ${getStatusColor(flightStatus.status)}`}>
                {getStatusText(flightStatus.status)}
              </div>
            </div>

            {/* Route */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-slate-700">
              <div>
                <p className="text-xs text-slate-400 uppercase">Departure</p>
                <p className="text-xl font-bold text-white">{flightStatus.departureAirport}</p>
                <p className="text-sm text-slate-300 mt-1">
                  {new Date(flightStatus.departureTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="flex items-center justify-center">
                <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase">Arrival</p>
                <p className="text-xl font-bold text-white">{flightStatus.arrivalAirport}</p>
                <p className="text-sm text-slate-300 mt-1">
                  {new Date(flightStatus.arrivalTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Flight Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {flightStatus.aircraft && (
                <div>
                  <p className="text-xs text-slate-400">Aircraft</p>
                  <p className="text-sm font-semibold text-white">{flightStatus.aircraft}</p>
                </div>
              )}
              {flightStatus.gate && (
                <div>
                  <p className="text-xs text-slate-400">Gate</p>
                  <p className="text-sm font-semibold text-white">{flightStatus.gate}</p>
                </div>
              )}
              {flightStatus.currentAltitude !== undefined && flightStatus.status === 'in_air' && (
                <div>
                  <p className="text-xs text-slate-400">Altitude</p>
                  <p className="text-sm font-semibold text-white">{flightStatus.currentAltitude.toLocaleString()} ft</p>
                </div>
              )}
              {flightStatus.currentSpeed !== undefined && flightStatus.status === 'in_air' && (
                <div>
                  <p className="text-xs text-slate-400">Speed</p>
                  <p className="text-sm font-semibold text-white">{flightStatus.currentSpeed} km/h</p>
                </div>
              )}
              {flightStatus.delayMinutes !== undefined && flightStatus.delayMinutes > 0 && (
                <div>
                  <p className="text-xs text-slate-400">Delay</p>
                  <p className="text-sm font-semibold text-yellow-400">+{flightStatus.delayMinutes} min</p>
                </div>
              )}
            </div>

            {/* Last Updated */}
            <p className="text-xs text-slate-500 text-right">
              Last updated: {new Date(flightStatus.lastUpdate).toLocaleTimeString()}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
