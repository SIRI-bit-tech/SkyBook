'use client';

import { Airline } from '@/types/global';
import { Checkbox } from '@/components/ui/checkbox';

interface AirlineFilterProps {
  airlines: Airline[];
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
    <div className="space-y-2">
      {airlines.map((airline) => (
        <label key={airline._id} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={selectedAirlines.includes(airline._id || '')}
            onChange={() => handleToggle(airline._id || '')}
            className="w-4 h-4"
          />
          <div className="flex items-center gap-2">
            <img src={airline.logo || "/placeholder.svg"} alt={airline.name} className="w-6 h-6 object-contain" />
            <span className="text-sm text-slate-300 group-hover:text-white">{airline.name}</span>
          </div>
        </label>
      ))}
    </div>
  );
}
