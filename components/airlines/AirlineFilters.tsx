'use client';

import { useMemo } from 'react';
import { Airline } from '@/types/global';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X } from 'lucide-react';

interface AirlineFiltersProps {
  airlines: Airline[];
  filters: {
    search: string;
    country: string;
    region: string;
    featured: boolean;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export default function AirlineFilters({
  airlines,
  filters,
  onFiltersChange,
  onClearFilters,
}: AirlineFiltersProps) {
  // Get unique countries from airlines
  const countries = useMemo(() => {
    const countrySet = new Set<string>();
    airlines.forEach(airline => {
      if (airline.country) {
        countrySet.add(airline.country);
      }
    });
    return Array.from(countrySet).sort();
  }, [airlines]);

  const hasActiveFilters = filters.search || filters.country || filters.featured;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Featured Airlines */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Special</h4>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={filters.featured}
              onCheckedChange={(checked) => 
                onFiltersChange({ featured: checked })
              }
            />
            <label htmlFor="featured" className="text-sm text-gray-700 cursor-pointer">
              Featured Airlines Only
            </label>
          </div>
        </div>

        {/* Country Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Country</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="all-countries"
                checked={!filters.country}
                onCheckedChange={() => onFiltersChange({ country: '' })}
              />
              <label htmlFor="all-countries" className="text-sm text-gray-700 cursor-pointer">
                All Countries
              </label>
            </div>
            
            {countries.map((country) => {
              const airlineCount = airlines.filter(a => a.country === country).length;
              return (
                <div key={country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`country-${country}`}
                      checked={filters.country === country}
                      onCheckedChange={(checked) => 
                        onFiltersChange({ country: checked ? country : '' })
                      }
                    />
                    <label 
                      htmlFor={`country-${country}`} 
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {country}
                    </label>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {airlineCount}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="outline" className="text-xs">
                  Search: "{filters.search}"
                  <button
                    onClick={() => onFiltersChange({ search: '' })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.country && (
                <Badge variant="outline" className="text-xs">
                  {filters.country}
                  <button
                    onClick={() => onFiltersChange({ country: '' })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.featured && (
                <Badge variant="outline" className="text-xs">
                  Featured
                  <button
                    onClick={() => onFiltersChange({ featured: false })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}