'use client';

import { PopulatedBooking } from '@/types/global';
import { format } from 'date-fns';
import { Plane, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FlightBookingCardProps {
  booking: PopulatedBooking;
  onCheckIn: (bookingId: string) => void;
  onManageBooking: (bookingId: string) => void;
  onDownloadTicket: (bookingId: string) => void;
}

export default function FlightBookingCard({
  booking,
  onCheckIn,
  onManageBooking,
  onDownloadTicket,
}: FlightBookingCardProps) {
  const departureTime = new Date(booking.departureTime);
  const arrivalTime = new Date(booking.arrivalTime);
  const isCheckInOpen = booking.status === 'confirmed';
  const isCheckedIn = booking.status === 'checked-in';

  // Calculate duration in hours and minutes
  const durationMinutes = booking.duration;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row">
        {/* Left Section - Flight Details */}
        <div className="flex-1 p-6">
          {/* Airline Info */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
              <Plane className="w-4 h-4 text-[#1E3A5F]" />
            </div>
            <span className="text-sm text-gray-600">
              {booking.airlineName} - Flight {booking.flightNumber}
            </span>
          </div>

          {/* Route */}
          <div className="mb-4">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {booking.departureAirport}
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="h-px bg-gray-300 w-12"></div>
                  <Plane className="w-5 h-5 text-gray-400 rotate-90" />
                  <div className="h-px bg-gray-300 w-12"></div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {booking.arrivalAirport}
                </div>
              </div>
            </div>
          </div>

          {/* Time and Duration */}
          <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{format(departureTime, 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {format(departureTime, 'hh:mm a')} ➔ {format(arrivalTime, 'hh:mm a')}
              </span>
            </div>
            <span className="text-gray-500">
              ({hours}h {minutes}m)
            </span>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                booking.status === 'confirmed'
                  ? 'bg-green-100 text-green-700'
                  : booking.status === 'checked-in'
                  ? 'bg-blue-100 text-blue-700'
                  : booking.status === 'cancelled'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {booking.status === 'confirmed'
                ? 'Confirmed'
                : booking.status === 'checked-in'
                ? 'Checked In'
                : booking.status === 'cancelled'
                ? 'Cancelled'
                : 'Pending'}
            </span>
            {isCheckInOpen && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                Check-in Open
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {isCheckInOpen && (
              <Button
                onClick={() => onCheckIn(booking.id)}
                className="bg-[#1E3A5F] hover:bg-[#2A4A73] text-white"
              >
                Check-in
              </Button>
            )}
            {isCheckedIn && (
              <Button
                onClick={() => onDownloadTicket(booking.id)}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                Download Ticket
              </Button>
            )}
            <Button
              onClick={() => onManageBooking(booking.id)}
              variant="outline"
              className="border-[#1E3A5F] text-[#1E3A5F] hover:bg-[#E8EEF5]"
            >
              Manage Booking
            </Button>
          </div>
        </div>

        {/* Right Section - Destination Image */}
        <div className="lg:w-64 h-48 lg:h-auto relative bg-gradient-to-br from-blue-400 to-blue-600">
          <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold opacity-20">
            {booking.arrivalAirport}
          </div>
        </div>
      </div>
    </div>
  );
}
