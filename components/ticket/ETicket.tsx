'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flight, Booking, Passenger } from '@/types/global';

interface ETicketProps {
  booking: Booking;
  flight: Flight;
  passengers: Passenger[];
}

export default function ETicket({ booking, flight, passengers }: ETicketProps) {
  const departureTime = new Date(flight.departure.time);
  const arrivalTime = new Date(flight.arrival.time);

  const handleDownload = async () => {
    // Create and download PDF
    const link = document.createElement('a');
    link.href = booking.ticketUrl;
    link.download = `${booking.bookingReference}-ticket.pdf`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600 p-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-slate-600">
        <div>
          <h2 className="text-3xl font-bold text-sky-400">SkyBook</h2>
          <p className="text-slate-400">E-Ticket</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white font-mono">{booking.bookingReference}</p>
          <p className="text-sm text-slate-400">Booking Reference</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Flight Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Flight Number and Airline */}
          <div>
            <p className="text-sm text-slate-400 mb-1">Flight</p>
            <p className="text-2xl font-bold text-white">{flight.flightNumber}</p>
            <p className="text-slate-300">{(flight.airline as any).name}</p>
          </div>

          {/* Route and Times */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase">Departure</p>
              <p className="text-2xl font-bold text-white">{departureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
              <p className="text-sm text-slate-300">{(flight.departure.airport as any)?.code}</p>
            </div>

            <div className="flex flex-col justify-center items-center">
              <svg className="w-6 h-6 text-slate-400 mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
              <p className="text-xs text-slate-400">{flight.duration}m</p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase">Arrival</p>
              <p className="text-2xl font-bold text-white">{arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</p>
              <p className="text-sm text-slate-300">{(flight.arrival.airport as any)?.code}</p>
            </div>
          </div>

          {/* Seats */}
          <div>
            <p className="text-sm text-slate-400 mb-2">Seats</p>
            <div className="flex flex-wrap gap-2">
              {booking.seats.map((seat) => (
                <span key={seat} className="px-3 py-1 bg-sky-500/20 text-sky-300 rounded font-mono font-bold">
                  {seat}
                </span>
              ))}
            </div>
          </div>

          {/* Passengers */}
          <div>
            <p className="text-sm text-slate-400 mb-2">Passengers</p>
            <ul className="space-y-1">
              {passengers.map((passenger, index) => (
                <li key={passenger._id} className="text-white">
                  {index + 1}. {passenger.firstName} {passenger.lastName}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* QR Code and Status */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center bg-slate-900/50 rounded-lg p-6">
          {booking.qrCode && (
            <>
              <p className="text-xs text-slate-400 mb-3 uppercase">Scan at Check-in</p>
              <img src={booking.qrCode || "/placeholder.svg"} alt="QR Code" className="w-48 h-48 mb-4" />
            </>
          )}

          <div className={`px-4 py-2 rounded-full text-sm font-bold ${
            booking.status === 'confirmed'
              ? 'bg-emerald-500/20 text-emerald-400'
              : booking.status === 'checked-in'
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-slate-500/20 text-slate-400'
          }`}>
            {booking.status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6 border-t border-slate-600">
        <Button onClick={handleDownload} className="flex-1 bg-sky-500 hover:bg-sky-600 text-white">
          Download PDF
        </Button>
        <Button onClick={handlePrint} variant="outline" className="flex-1 border-slate-500 text-white hover:bg-slate-700">
          Print
        </Button>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-slate-600 text-center">
        <p className="text-xs text-slate-400">
          This is your official e-ticket. Please have it ready at airport check-in.
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Ticket ID: {booking._id}
        </p>
      </div>
    </Card>
  );
}
