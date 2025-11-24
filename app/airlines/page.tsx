'use client';

import { useState, useEffect } from 'react';
import { Airline } from '@/types/global';
import AirlineCard from '@/components/airlines/AirlineCard';
import AirlineFilters from '@/components/airlines/AirlineFilters';
import AirlineSearch from '@/components/airlines/AirlineSearch';
import { Plane } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AirlineFiltersState {
  search: string;
  country: string;
  region: string;
  featured: boolean;
}

export default function BrowseAirlinesPage() {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [filteredAirlines, setFilteredAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AirlineFiltersState>({
    search: '',
    country: '',
    region: '',
    featured: false,
  });

  useEffect(() => {
    fetchAirlines();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [airlines, filters]);

  const fetchAirlines = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/airlines');
      if (response.ok) {
        const data = await response.json();
        setAirlines(data.airlines || []);
      }
    } catch (error) {
      console.error('Failed to fetch airlines:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...airlines];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        airline =>
          airline.name.toLowerCase().includes(searchTerm) ||
          airline.code.toLowerCase().includes(searchTerm) ||
          airline.country.toLowerCase().includes(searchTerm)
      );
    }

    // Country filter
    if (filters.country) {
      filtered = filtered.filter(airline => airline.country === filters.country);
    }

    // Featured filter
    if (filters.featured) {
      filtered = filtered.filter(airline => airline.isFeatured);
    }

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredAirlines(filtered);
  };

  const handleFiltersChange = (newFilters: Partial<AirlineFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      country: '',
      region: '',
      featured: false,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Plane className="w-8 h-8 text-[#1E3A5F] animate-bounce mx-auto mb-4" />
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F] mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading airlines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2A4A73] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Our Partner Airlines
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Explore a wide range of airlines to find your perfect flight, 
              from major carriers to boutique operators.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-8">
              <AirlineSearch
                value={filters.search}
                onChange={(search) => handleFiltersChange({ search })}
              />
              
              <AirlineFilters
                airlines={airlines}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Airlines Grid */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredAirlines.length} Airlines Found
              </h2>
              
              {(filters.search || filters.country || filters.featured) && (
                <button
                  onClick={clearFilters}
                  className="text-[#1E3A5F] hover:text-[#2A4A73] font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Airlines Grid */}
            {filteredAirlines.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAirlines.map((airline) => (
                  <AirlineCard key={airline._id || airline.code} airline={airline} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="text-gray-500">
                  <h3 className="text-xl font-semibold mb-2">No Airlines Found</h3>
                  <p>Try adjusting your filters to see more results.</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 bg-[#1E3A5F] text-white px-6 py-2 rounded-lg hover:bg-[#2A4A73] transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}