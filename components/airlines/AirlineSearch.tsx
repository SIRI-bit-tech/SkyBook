'use client';

import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AirlineSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function AirlineSearch({ value, onChange }: AirlineSearchProps) {
  return (
    <Card className="p-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search airlines by name, code, or country..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A5F]/20 focus:border-[#1E3A5F] outline-none text-sm"
        />
      </div>
    </Card>
  );
}