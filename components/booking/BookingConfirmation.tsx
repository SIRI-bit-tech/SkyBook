'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PopulatedBooking } from '@/types/global';
import Link from 'next/link';

interface BookingConfirmationProps {
  booking: PopulatedBooking;
}

export default function BookingConfirmation({ booking }: BookingConfirmationProps) {
  const departureTime = new Date(booking.flight.departure.time);
  const arrivalTime = new Date(booking.flight.arrival.time);

  const handleDownloadTicket = () => {
    // In a real app, this would generate and download a PDF ticket
    window.open(booking.ticketUrl, '_blank');
  };

  const handleAddToCalendar = () => {
    const startDate = departureTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = arrivalTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Flight ${booking.flight.flightNumber}&dates=${startDate}/${endDate}&details=Booking Reference: ${encodeURIComponent(booking.bookingReference)}%0ASeats: ${booking.seats.join(', ')}`;
    
    window.open(calendarUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-slate-300">Your flight has been successfully booked</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Details */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Booking Details</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Booking Reference</p>
                <p className="text-2xl font-bold text-sky-400">{booking.bookingReference}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Flight</p>
                  <p className="text-white font-semibold">{booking.flight.flightNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm capitalize">
                    {booking.status}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-slate-400 mb-2">Passengers</p>
                {booking.passengers.map((passenger, index) => (
                  <p key={index} className="text-white">
                    {passenger.firstName} {passenger.lastName}
                  </p>
                ))}
              </div>
              
              <div>
                <p className="text-sm text-slate-400 mb-2">Seats</p>
                <div className="flex flex-wrap gap-2">
                  {booking.seats.map((seat) => (
                    <span key={seat} className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded font-medium">
                      {seat}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-slate-600 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Paid</span>
                  <span className="text-2xl font-bold text-white">${booking.totalPrice.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Flight Information */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Flight Information</h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-400 mb-2">Airline</p>
                <p className="text-white font-semibold">{booking.flight.airline?.name || 'Airline'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Departure</p>
                  <p className="text-white font-semibold">
                    {booking.flight.departure.airport}
                  </p>
                  <p className="text-sm text-slate-300">
                    {departureTime.toLocaleDateString()} at {departureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-slate-400">Terminal {booking.flight.departure.terminal}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Arrival</p>
                  <p className="text-white font-semibold">
                    {booking.flight.arrival.airport}
                  </p>
                  <p className="text-sm text-slate-300">
                    {arrivalTime.toLocaleDateString()} at {arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-slate-400">Terminal {booking.flight.arrival.terminal}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-slate-400">Duration</p>
                <p className="text-white">{Math.floor(booking.flight.duration / 60)}h {booking.flight.duration % 60}m</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleDownloadTicket}
            className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            Download Ticket
          </Button>
          
          <Button
            onClick={handleAddToCalendar}
            variant="outline"
            className="border-sky-500 text-sky-400 hover:bg-sky-500/10 px-8 py-3"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,3H18V1H16V3H8V1H6V3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M19,19H5V8H19V19M12,9V17L16.25,14.5L12,9Z" />
            </svg>
            Add to Calendar
          </Button>
          
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 px-8 py-3"
            >
              View All Bookings
            </Button>
          </Link>
        </div>

        {/* Important Information */}
        <Card className="bg-amber-500/10 border-amber-500/30 p-6 mt-8">
          <h3 className="text-lg font-bold text-amber-400 mb-4">Important Information</h3>
          <div className="space-y-2 text-sm text-amber-200">
            <p>• Please arrive at the airport at least 2 hours before domestic flights and 3 hours before international flights</p>
            <p>• Check-in opens 24 hours before departure and closes 1 hour before departure</p>
            <p>• Ensure your passport is valid for at least 6 months from the travel date</p>
            <p>• Review baggage restrictions and prohibited items before packing</p>
            <p>• You can manage your booking and check-in online using your booking reference</p>
          </div>
        </Card>
      </div>
    </div>
  );
}