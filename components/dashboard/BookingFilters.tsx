'use client';

import { Button } from '@/components/ui/button';

interface BookingFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { value: 'all', label: 'All Bookings' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked-in', label: 'Checked In' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'pending', label: 'Pending' },
];

export default function BookingFilters({ activeFilter, onFilterChange }: BookingFiltersProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          className={
            activeFilter === filter.value
              ? 'bg-sky-500 hover:bg-sky-600'
              : 'border-slate-600 text-slate-300 hover:bg-slate-700'
          }
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
