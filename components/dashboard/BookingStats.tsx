'use client';

import { Card } from '@/components/ui/card';
import { Plane, CheckCircle, XCircle, Clock } from 'lucide-react';

interface BookingStatsProps {
  stats: {
    total: number;
    confirmed: number;
    checkedIn: number;
    cancelled: number;
  };
}

export default function BookingStats({ stats }: BookingStatsProps) {
  const statCards = [
    {
      label: 'Total Bookings',
      value: stats.total,
      icon: Plane,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20',
    },
    {
      label: 'Confirmed',
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
    },
    {
      label: 'Checked In',
      value: stats.checkedIn,
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      label: 'Cancelled',
      value: stats.cancelled,
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.label} className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
