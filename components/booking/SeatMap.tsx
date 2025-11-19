'use client';

import { Card } from '@/components/ui/card';
import { Flight } from '@/types/global';

interface SeatMapProps {
  flight: Flight;
  selectedSeats: string[];
  onSelectSeat: (seat: string) => void;
  passengerCount: number;
}

export default function SeatMap({ flight, selectedSeats, onSelectSeat, passengerCount }: SeatMapProps) {
  const rows = flight.seatMap.rows;
  const columns = flight.seatMap.columns;
  const reserved = flight.seatMap.reserved;

  const getSeatStatus = (seat: string) => {
    if (reserved.includes(seat)) return 'reserved';
    if (selectedSeats.includes(seat)) return 'selected';
    return 'available';
  };

  const seatCategories: { [key: number]: string } = {
    0: 'First Class',
    1: 'First Class',
    2: 'Business',
    3: 'Business',
    4: 'Economy',
    5: 'Economy',
  };

  return (
    <Card className="bg-slate-800 border-slate-700 p-8">
      <h3 className="text-xl font-bold text-white mb-8 text-center">Aircraft Seating</h3>

      {/* Legend */}
      <div className="flex gap-6 justify-center mb-8 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-emerald-500 rounded border-2 border-emerald-600"></div>
          <span className="text-sm text-slate-300">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-sky-500 rounded border-2 border-sky-600"></div>
          <span className="text-sm text-slate-300">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-500 rounded border-2 border-slate-600 opacity-60"></div>
          <span className="text-sm text-slate-300">Reserved</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="bg-slate-700/50 rounded-lg p-6 overflow-x-auto">
        <div className="inline-block">
          {Array.from({ length: rows }, (_, row) => (
            <div key={row} className="flex gap-2 mb-2 items-center">
              <span className="text-xs text-slate-400 w-6 text-right">{row + 1}</span>
              <div className="flex gap-2">
                {columns.map((col) => {
                  const seat = `${row + 1}${col}`;
                  const status = getSeatStatus(seat);
                  
                  return (
                    <button
                      key={seat}
                      onClick={() => status === 'available' && onSelectSeat(seat)}
                      disabled={status === 'reserved' || (status === 'available' && selectedSeats.length >= passengerCount && !selectedSeats.includes(seat))}
                      className={`w-6 h-6 rounded text-xs flex items-center justify-center font-bold transition ${
                        status === 'available'
                          ? 'bg-emerald-500 border-2 border-emerald-600 cursor-pointer hover:bg-emerald-600'
                          : status === 'selected'
                          ? 'bg-sky-500 border-2 border-sky-600 text-white cursor-pointer'
                          : 'bg-slate-500 border-2 border-slate-600 opacity-60 cursor-not-allowed'
                      }`}
                      title={`${seat} - ${seatCategories[columns.indexOf(col)]}`}
                    >
                      {col}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-400 mt-6 text-center">
        Selected {selectedSeats.length} of {passengerCount} seat{passengerCount !== 1 ? 's' : ''}
      </p>
    </Card>
  );
}
