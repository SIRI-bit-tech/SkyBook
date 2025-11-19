interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'list' | 'text';
  height?: string;
}

export default function LoadingSkeleton({ count = 3, type = 'card', height = 'h-64' }: LoadingSkeletonProps) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`bg-slate-200 dark:bg-slate-700 rounded-lg ${height} loading-shimmer`} />
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded loading-shimmer w-3/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded loading-shimmer w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded loading-shimmer" />
      ))}
    </div>
  );
}
