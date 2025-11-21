interface StatusBadgeProps {
  status: string;
  type?: 'flight' | 'booking';
}

export function StatusBadge({ status, type = 'flight' }: StatusBadgeProps) {
  const getStatusColor = () => {
    const lowerStatus = status.toLowerCase();
    
    if (type === 'flight') {
      switch (lowerStatus) {
        case 'cancelled':
          return 'bg-red-500/20 text-red-400';
        case 'delayed':
          return 'bg-amber-500/20 text-amber-400';
        case 'completed':
        case 'landed':
          return 'bg-emerald-500/20 text-emerald-400';
        case 'scheduled':
        case 'boarding':
        case 'in-flight':
          return 'bg-sky-500/20 text-sky-400';
        default:
          return 'bg-slate-500/20 text-slate-400';
      }
    } else {
      switch (lowerStatus) {
        case 'cancelled':
          return 'bg-red-500/20 text-red-400';
        case 'checked-in':
          return 'bg-emerald-500/20 text-emerald-400';
        case 'confirmed':
          return 'bg-sky-500/20 text-sky-400';
        case 'pending':
          return 'bg-amber-500/20 text-amber-400';
        default:
          return 'bg-slate-500/20 text-slate-400';
      }
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
      {status}
    </span>
  );
}
