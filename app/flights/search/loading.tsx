import { Card } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 animate-pulse">
          <div className="h-10 bg-slate-700 rounded w-64 mb-2"></div>
          <div className="h-6 bg-slate-700 rounded w-48"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Skeleton */}
          <div className="lg:col-span-1 space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-slate-800 border-slate-700 p-4 animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-32 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-700 rounded"></div>
                </div>
              </Card>
            ))}
          </div>

          {/* Results Skeleton */}
          <div className="lg:col-span-3 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-slate-800 border-slate-700 p-6 animate-pulse">
                <div className="h-24 bg-slate-700 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
