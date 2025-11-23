'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface VerificationResult {
  valid: boolean;
  booking?: {
    bookingReference: string;
    status: string;
    passengers: Array<{ firstName: string; lastName: string }>;
    seats: string[];
    flightNumber: string;
    departureAirport: string;
    arrivalAirport: string;
    departureTime: string;
    arrivalTime: string;
    departureTerminal?: string;
    arrivalTerminal?: string;
  };
  message?: string;
  error?: string;
}

export default function VerifyTicketPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    const verifyTicket = async () => {
      const encryptedData = searchParams.get('data');

      if (!encryptedData) {
        setResult({
          valid: false,
          error: 'No ticket data provided',
        });
        setLoading(false);
        return;
      }

      try {
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

    verifyTicket();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="bg-slate-800 border-slate-700 p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-sky-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Verifying Ticket</h2>
          <p className="text-slate-400">Please wait...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        <Card className="bg-slate-800 border-slate-700 p-8">
          {result?.valid ? (
            <>
              <div className="text-center mb-6">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-white mb-2">Ticket Verified ✓</h1>
                <p className="text-emerald-400">{result.message || 'This ticket is valid'}</p>
              </div>

              {result.booking && (
                <div className="space-y-6">
                  {/* Booking Reference */}
                  <div className="bg-slate-700 rounded-lg p-4 text-center">
                    <p className="text-sm text-slate-400 mb-1">Booking Reference</p>
                    <p className="text-2xl font-bold text-sky-400">{result.booking.bookingReference}</p>
                  </div>

                  {/* Status */}
                  <div className="flex justify-between items-center py-3 border-b border-slate-700">
                    <span className="text-slate-400">Status</span>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded capitalize">
                      {result.booking.status}
                    </span>
                  </div>

                  {/* Flight Info */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Flight Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">Flight Number</span>
                        <span className="text-white font-semibold">{result.booking.flightNumber}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">From</span>
                        <span className="text-white">{result.booking.departureAirport}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">To</span>
                        <span className="text-white">{result.booking.arrivalAirport}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">Departure</span>
                        <span className="text-white">
                          {new Date(result.booking.departureTime).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Passengers */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Passengers</h3>
                    {result.booking.passengers.map((passenger, index) => (
                      <div key={index} className="flex justify-between py-2">
                        <span className="text-white">
                          {passenger.firstName} {passenger.lastName}
                        </span>
                        <span className="text-sky-400 font-semibold">
                          Seat {result.booking!.seats[index]}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Link href="/dashboard">
                      <Button className="w-full bg-sky-500 hover:bg-sky-600">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-white mb-2">Verification Failed</h1>
                <p className="text-red-400">{result?.error || 'This ticket is not valid'}</p>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-300">
                  This ticket could not be verified. Please contact support if you believe this is an error.
                </p>
              </div>

              <div className="space-y-3">
                <Link href="/contact">
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300">
                    Contact Support
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="w-full bg-sky-500 hover:bg-sky-600">
                    Return Home
                  </Button>
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
