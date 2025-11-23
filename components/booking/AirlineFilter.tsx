'use client';

import { Checkbox } from '@/components/ui/checkbox';

interface SimplifiedAirline {
  _id?: string;
  code: string;
  name: string;
  logo: string;
}

interface AirlineFilterProps {
  airlines: SimplifiedAirline[];
  selectedAirlines: string[];
  onSelect: (airlines: string[]) => void;
}

export default function AirlineFilter({ airlines, selectedAirlines, onSelect }: AirlineFilterProps) {
  const handleToggle = (airlineId: string) => {
    const updated = selectedAirlines.includes(airlineId)
      ? selectedAirlines.filter((id) => id !== airlineId)
      : [...selectedAirlines, airlineId];
    onSelect(updated);
  };

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {airlines.filter(airline => airline).map((airline, index) => {
        const airlineId = airline?._id || airline?.code || `airline-${index}`;
        return (
          <label key={airlineId} className="flex items-center gap-3 cursor-pointer group py-2 hover:bg-gray-50 px-2 rounded transition">
            <input
              type="checkbox"
              checked={selectedAirlines.includes(airlineId)}
              onChange={() => handleToggle(airlineId)}
              className="w-4 h-4 text-[#1E3A5F] border-gray-300 rounded focus:ring-[#1E3A5F]"
            />
            <div className="flex items-center gap-3 flex-1">
              <img 
                src={airline?.logo || "/placeholder-airline.svg"} 
                alt={airline?.name || 'Airline'} 
                className="w-8 h-8 object-contain bg-white rounded border border-gray-200 p-1" 
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{airline?.name}</span>
            </div>
          </label>
        );
      })}
    </div>
  );
}
