'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { getAirlineLogo, getAirlineName } from '@/lib/airline-logos';
import { FlightResult, Filters } from '@/types/global';
import Image from 'next/image';

interface FlightFiltersProps {
  flights: FlightResult[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export default function FlightFilters({ flights, filters, onFiltersChange }: FlightFiltersProps) {
  const { airlines: selectedAirlines, priceRange, stops: selectedStops, departureTime } = filters;

  // Extract unique airlines from flights
  const airlines = useMemo(() => {
    const airlineSet = new Set<string>();
    flights.forEach(flight => {
      const codes = flight.validatingAirlineCodes || [];
      codes.forEach(code => airlineSet.add(code));
    });
    return Array.from(airlineSet).sort();
  }, [flights]);

  // Calculate price range
  const { minPrice, maxPrice } = useMemo(() => {
    if (flights.length === 0) return { minPrice: 0, maxPrice: 10000 };
    
    const prices = flights.map(f => parseFloat(f.price.total));
    return {
      minPrice: Math.floor(Math.min(...prices)),
      maxPrice: Math.ceil(Math.max(...prices))
    };
  }, [flights]);

  const toggleAirline = (code: string) => {
    const newAirlines = selectedAirlines.includes(code)
      ? selectedAirlines.filter(c => c !== code)
      : [...selectedAirlines, code];
    onFiltersChange({ ...filters, airlines: newAirlines });
  };

  const toggleStops = (stops: number) => {
    const newStops = selectedStops.includes(stops)
      ? selectedStops.filter(s => s !== stops)
      : [...selectedStops, stops];
    onFiltersChange({ ...filters, stops: newStops });
  };

  const toggleDepartureTime = (time: string) => {
    const newTime = departureTime.includes(time)
      ? departureTime.filter(t => t !== time)
      : [...departureTime, time];
    onFiltersChange({ ...filters, departureTime: newTime });
  };

  const updatePriceRange = (value: [number, number]) => {
    onFiltersChange({ ...filters, priceRange: value });
  };

  return (
    <div className="space-y-4">
      {/* Price Range */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <h3 className="text-lg font-bold text-white mb-4">Price Range</h3>
        <div className="space-y-4">
          <Slider
            min={minPrice}
            max={maxPrice}
            step={10}
            value={priceRange}
            onValueChange={(value) => updatePriceRange(value as [number, number])}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-slate-400">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </Card>

      {/* Airlines */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <h3 className="text-lg font-bold text-white mb-4">Airlines</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {airlines.map((code) => (
            <div key={code} className="flex items-center space-x-2">
              <Checkbox
                id={`airline-${code}`}
                checked={selectedAirlines.includes(code)}
                onCheckedChange={() => toggleAirline(code)}
              />
              <Label
                htmlFor={`airline-${code}`}
                className="text-slate-300 cursor-pointer flex items-center gap-2 flex-1"
              >
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center p-1 overflow-hidden">
                  <Image
                    src={getAirlineLogo(code, 'small')}
                    alt={code}
                    width={32}
                    height={32}
                    className="object-contain"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = `<span class="text-xs font-bold text-slate-800">${code}</span>`;
                      }
                    }}
                  />
                </div>
                <span className="text-sm">{getAirlineName(code)}</span>
              </Label>
            </div>
          ))}
        </div>
      </Card>

      {/* Stops */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <h3 className="text-lg font-bold text-white mb-4">Stops</h3>
        <div className="space-y-3">
          {[
            { value: 0, label: 'Non-stop' },
            { value: 1, label: '1 Stop' },
            { value: 2, label: '2+ Stops' }
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                id={`stops-${value}`}
                checked={selectedStops.includes(value)}
                onCheckedChange={() => toggleStops(value)}
              />
              <Label
                htmlFor={`stops-${value}`}
                className="text-slate-300 cursor-pointer"
              >
                {label}
              </Label>
            </div>
          ))}
        </div>
      </Card>

      {/* Departure Time */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <h3 className="text-lg font-bold text-white mb-4">Departure Time</h3>
        <div className="space-y-3">
          {[
            { value: 'morning', label: 'Morning (6AM - 12PM)' },
            { value: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
            { value: 'evening', label: 'Evening (6PM - 12AM)' },
            { value: 'night', label: 'Night (12AM - 6AM)' }
          ].map(({ value, label }) => (
            <div key={value} className="flex items-center space-x-2">
              <Checkbox
                id={`time-${value}`}
                checked={departureTime.includes(value)}
                onCheckedChange={() => toggleDepartureTime(value)}
              />
              <Label
                htmlFor={`time-${value}`}
                className="text-slate-300 cursor-pointer"
              >
                {label}
              </Label>
            </div>
          ))}
        </div>
      </Card>

      {/* Reset Filters */}
      {(selectedAirlines.length > 0 || selectedStops.length > 0 || departureTime.length > 0) && (
        <button
          onClick={() => {
            onFiltersChange({
              airlines: [],
              stops: [],
              departureTime: [],
              priceRange: [minPrice, maxPrice],
            });
          }}
          className="w-full text-sky-400 hover:text-sky-300 text-sm font-medium"
        >
          Reset All Filters
        </button>
      )}
    </div>
  );
}
