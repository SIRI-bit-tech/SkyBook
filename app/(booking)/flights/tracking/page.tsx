'use client';

import FlightTracker from '@/components/booking/FlightTracker';

export default function FlightTrackingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Track Your Flight</h1>
          <p className="text-slate-300">
            Get real-time updates on any flight worldwide. Search by flight number to see live position, altitude, speed, and status.
          </p>
        </div>

        <FlightTracker />

        {/* How it works */}
        <div className="mt-12 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">How Flight Tracking Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold mb-3">1</div>
              <p className="text-slate-300">Enter your flight number and optional date</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold mb-3">2</div>
              <p className="text-slate-300">We retrieve real-time data from global flight tracking networks</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold mb-3">3</div>
              <p className="text-slate-300">View live position, altitude, speed, and estimated times</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
