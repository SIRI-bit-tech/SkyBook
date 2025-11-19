'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flight } from '@/types/global';

interface BookingSummaryProps {
  flight: Flight;
  selectedSeats: string[];
  passengers: number;
  onContinue: () => void;
  continueDisabled: boolean;
}

export default function BookingSummary({
  flight,
  selectedSeats,
  passengers,
  onContinue,
  continueDisabled,
}: BookingSummaryProps) {
  const pricePerSeat = flight.price.economy;
  const totalPrice = pricePerSeat * selectedSeats.length;
  const taxesAndFees = totalPrice * 0.12; // 12% taxes and fees
  const grandTotal = totalPrice + taxesAndFees;

  const departureTime = new Date(flight.departure.time);
  const arrivalTime = new Date(flight.arrival.time);

  return (
    <Card className="bg-slate-800 border-slate-700 p-6 sticky top-4">
      <h3 className="text-xl font-bold text-white mb-6">Booking Summary</h3>

      {/* Flight Info */}
      <div className="mb-6 pb-6 border-b border-slate-700">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm text-slate-400">{(flight.airline as any).name}</p>
            <p className="font-semibold text-white">{flight.flightNumber}</p>
          </div>
          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">On Time</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">{departureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-white font-semibold">{flight.duration}m</span>
          <span className="text-slate-400">{arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Seats */}
      <div className="mb-6 pb-6 border-b border-slate-700">
        <p className="text-sm text-slate-400 mb-2">Selected Seats</p>
        {selectedSeats.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seat) => (
              <span key={seat} className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded font-medium">
                {seat}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No seats selected</p>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2 mb-6 pb-6 border-b border-slate-700">
        <div className="flex justify-between">
          <span className="text-slate-400">${pricePerSeat.toFixed(0)} × {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''}</span>
          <span className="text-white font-medium">${totalPrice.toFixed(0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Taxes & Fees</span>
          <span className="text-white font-medium">${taxesAndFees.toFixed(0)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="mb-6 pb-6 border-b border-slate-700">
        <div className="flex justify-between items-center">
          <span className="text-white font-bold">Total</span>
          <span className="text-3xl font-bold text-sky-400">${grandTotal.toFixed(0)}</span>
        </div>
      </div>

      <Button
        onClick={onContinue}
        disabled={continueDisabled}
        className={`w-full font-medium py-3 ${
          continueDisabled
            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
            : 'bg-sky-500 hover:bg-sky-600 text-white'
        }`}
      >
        {continueDisabled ? `Select ${passengers} seat${passengers !== 1 ? 's' : ''}` : 'Continue to Passengers'}
      </Button>
    </Card>
  );
}
