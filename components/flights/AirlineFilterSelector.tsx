'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Airline {
  code: string;
  name: string;
  logo: string;
}

interface AirlineFilterSelectorProps {
  availableAirlines: Airline[];
  selectedAirlines: string[];
  onSelectionChange: (selectedCodes: string[]) => void;
}

export default function AirlineFilterSelector({
  availableAirlines,
  selectedAirlines,
  onSelectionChange,
}: AirlineFilterSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAirlines, setFilteredAirlines] = useState<Airline[]>(availableAirlines);

  // Filter airlines based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAirlines(availableAirlines);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = availableAirlines.filter(
        (airline) =>
          airline.name.toLowerCase().includes(query) ||
          airline.code.toLowerCase().includes(query)
      );
      setFilteredAirlines(filtered);
    }
  }, [searchQuery, availableAirlines]);

  const handleToggleAirline = (code: string) => {
    if (selectedAirlines.includes(code)) {
      onSelectionChange(selectedAirlines.filter((c) => c !== code));
    } else {
      onSelectionChange([...selectedAirlines, code]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(availableAirlines.map((a) => a.code));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleRemoveTag = (code: string) => {
    onSelectionChange(selectedAirlines.filter((c) => c !== code));
  };

  const selectedAirlineObjects = availableAirlines.filter((a) =>
    selectedAirlines.includes(a.code)
  );

  return (
    <Card className="p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Filter by Airline</h3>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search for an airline..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent text-sm"
        />
      </div>

      {/* Select All / Clear All Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleSelectAll}
          className="px-4 py-2 bg-blue-50 text-[#1E3A5F] rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
        >
          Select All
        </button>
        <button
          onClick={handleClearAll}
          className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Selected Airlines Tags */}
      {selectedAirlineObjects.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Selected Airlines</p>
          <div className="flex flex-wrap gap-2">
            {selectedAirlineObjects.map((airline) => (
              <div
                key={airline.code}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-[#1E3A5F] rounded-full text-sm"
              >
                <span>{airline.name}</span>
                <button
                  onClick={() => handleRemoveTag(airline.code)}
                  className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Airlines List */}
      <div className="max-h-80 overflow-y-auto space-y-2">
        {filteredAirlines.length > 0 ? (
          filteredAirlines.map((airline) => {
            const isSelected = selectedAirlines.includes(airline.code);
            return (
              <label
                key={airline.code}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <img
                    src={airline.logo}
                    alt={airline.name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-airline.svg';
                    }}
                  />
                </div>
                <span className="flex-1 text-gray-900 font-medium text-sm">
                  {airline.name}
                </span>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleAirline(airline.code)}
                  className="w-5 h-5 text-[#1E3A5F] border-gray-300 rounded focus:ring-[#1E3A5F] cursor-pointer"
                />
              </label>
            );
          })
        ) : (
          <p className="text-center text-gray-500 py-8 text-sm">
            No airlines found matching "{searchQuery}"
          </p>
        )}
      </div>

      {/* Apply Filters Button */}
      <button
        onClick={() => {
          // Trigger any additional actions if needed
          // The filtering happens in real-time via onSelectionChange
        }}
        className="w-full mt-4 bg-[#1E3A5F] text-white py-3 rounded-lg hover:bg-[#2A4A73] transition-colors font-medium"
      >
        Apply Filters
      </button>
    </Card>
  );
}
