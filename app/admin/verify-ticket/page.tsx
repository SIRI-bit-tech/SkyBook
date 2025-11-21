'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Scan } from 'lucide-react';

interface VerificationResult {
  valid: boolean;
  booking?: {
    bookingReference: string;
    status: string;
    passengers: Array<{ firstName: string; lastName: string }>;
    seats: string[];
    flight: {
      flightNumber: string;
      departure: {
        airport: string;
        time: string;
        terminal: string;
      };
      arrival: {
        airport: string;
        time: string;
        terminal: string;
      };
    };
  };
  message?: string;
  error?: string;
}

/**
 * Admin Ticket Verification Page
 * 
 * This page is protected by server-side authentication in app/admin/layout.tsx
 * - Unauthenticated users are redirected to /login?redirect=/admin
 * - Non-admin users are redirected to /dashboard
 * - Only users with role='admin' can access this page
 */
export default function AdminVerifyTicketPage() {
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!qrData.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      // Extract encrypted data from URL if full URL is provided
      let encryptedData = qrData.trim();
      
      if (qrData.includes('data=')) {
        try {
          // Try to parse as URL
          const url = new URL(qrData);
          encryptedData = url.searchParams.get('data') || encryptedData;
        } catch (urlError) {
          // If URL parsing fails, try regex extraction as fallback
          console.warn('URL parsing failed, attempting regex extraction:', urlError);
          const match = qrData.match(/data=([^&\s]+)/);
          if (match && match[1]) {
            encryptedData = decodeURIComponent(match[1]);
          }
          // If regex also fails, encryptedData remains as the original qrData
        }
      }

      const response = await fetch('/api/tickets/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encryptedData }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        valid: false,
        error: 'Failed to verify ticket',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQrData('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-3xl mx-auto pt-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Ticket Verification</h1>
          <p className="text-slate-400">Scan or enter QR code data to verify tickets</p>
        </div>

        <Card className="bg-slate-800 border-slate-700 p-8 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                QR Code Data or URL
              </label>
              <textarea
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
                placeholder="Paste QR code URL or encrypted data here..."
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:border-sky-500 focus:outline-none min-h-[100px]"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleVerify}
                disabled={!qrData.trim() || loading}
                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
              >
                <Scan className="w-4 h-4 mr-2" />
                {loading ? 'Verifying...' : 'Verify Ticket'}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-slate-600 text-slate-300"
              >
                Reset
              </Button>
            </div>
          </div>
        </Card>

        {result && (
          <Card className={`border-2 p-8 ${
            result.valid 
              ? 'bg-emerald-500/10 border-emerald-500' 
              : 'bg-red-500/10 border-red-500'
          }`}>
            {result.valid ? (
              <>
                <div className="text-center mb-6">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Valid Ticket ✓</h2>
                  <p className="text-emerald-400">{result.message}</p>
                </div>

                {result.booking && (
                  <div className="space-y-4">
                    <div className="bg-slate-800 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-400">Booking Reference</p>
                          <p className="text-xl font-bold text-sky-400">{result.booking.bookingReference}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Status</p>
                          <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded capitalize">
                            {result.booking.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-4">
                      <h3 className="text-lg font-bold text-white mb-3">Flight Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Flight</span>
                          <span className="text-white font-semibold">{result.booking.flight.flightNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Route</span>
                          <span className="text-white">
                            {result.booking.flight.departure.airport} → {result.booking.flight.arrival.airport}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Departure</span>
                          <span className="text-white">
                            {new Date(result.booking.flight.departure.time).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Terminal</span>
                          <span className="text-white">{result.booking.flight.departure.terminal}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-4">
                      <h3 className="text-lg font-bold text-white mb-3">Passengers</h3>
                      {result.booking.passengers.map((passenger, index) => (
                        <div key={index} className="flex justify-between py-2 border-b border-slate-700 last:border-0">
                          <span className="text-white font-medium">
                            {passenger.firstName} {passenger.lastName}
                          </span>
                          <span className="text-sky-400 font-semibold">
                            Seat {result.booking!.seats[index]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Invalid Ticket</h2>
                  <p className="text-red-400">{result.error}</p>
                </div>

                <div className="bg-slate-800 rounded-lg p-4">
                  <p className="text-sm text-slate-300">
                    This ticket could not be verified. Possible reasons:
                  </p>
                  <ul className="list-disc list-inside text-sm text-slate-400 mt-2 space-y-1">
                    <li>Invalid or corrupted QR code</li>
                    <li>Expired ticket (older than 24 hours)</li>
                    <li>Cancelled booking</li>
                    <li>Flight already completed</li>
                  </ul>
                </div>
              </>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
