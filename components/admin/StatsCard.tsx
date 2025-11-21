import { Card } from '@/components/ui/card';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  colorClass?: string;
}

export function StatsCard({ title, value, subtitle, icon, colorClass = 'bg-sky-500/20' }: StatsCardProps) {
  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-sky-400 text-sm mt-2">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`w-12 h-12 ${colorClass} rounded-full flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
