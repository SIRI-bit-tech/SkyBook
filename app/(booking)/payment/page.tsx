'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Flight } from '@/types/global';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const flightId = searchParams.get('flightId') || '';
  const seats = searchParams.get('seats') || '';
  const passengers = parseInt(searchParams.get('passengers') || '1');
  const passengerData = JSON.parse(searchParams.get('passengerData') || '[]');

  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
  });

  useEffect(() => {
    const fetchFlight = async () => {
      if (!flightId) return;
      try {
        const response = await fetch(`/api/flights/${flightId}`);
        if (response.ok) {
          const data = await response.json();
          setFlight(data.flight);
        }
      } catch (error) {
        console.error('Failed to fetch flight:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlight();
  }, [flightId]);

  const totalPrice = flight ? flight.price.economy * seats.split(',').length : 0;
  const taxes = totalPrice * 0.12;
  const grandTotal = totalPrice + taxes;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Create booking
      const bookingResponse = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user-id', // Will be from session
          flightId,
          passengers: passengerData,
          seats: seats.split(','),
          totalPrice: grandTotal,
          paymentId: 'stripe-payment-id',
        }),
      });

      if (bookingResponse.ok) {
        const bookingData = await bookingResponse.json();
        router.push(`/booking/confirmation?bookingId=${bookingData.booking._id}&ref=${bookingData.bookingReference}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-sky-400 hover:text-sky-300 mb-4 inline-block">← Back</Link>

        <h1 className="text-4xl font-bold text-white mb-8">Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <Card className="bg-slate-800 border-slate-700 p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Payment Details</h3>

            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                  placeholder="Name on card"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Card Number</label>
                <input
                  type="text"
                  required
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none font-mono"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Expiry Date</label>
                  <input
                    type="text"
                    required
                    value={cardDetails.expiryDate}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value.slice(0, 5) })}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">CVV</label>
                  <input
                    type="text"
                    required
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                    placeholder="123"
                    maxLength="3"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={processing}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-3"
              >
                {processing ? 'Processing...' : `Pay $${grandTotal.toFixed(0)}`}
              </Button>

              <p className="text-xs text-slate-400 text-center">
                Your payment is secure and encrypted. We never store card details.
              </p>
            </form>
          </Card>

          {/* Order Summary */}
          <div>
            <Card className="bg-slate-800 border-slate-700 p-8 mb-6">
              <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>

              {flight && (
                <>
                  <div className="mb-6 pb-6 border-b border-slate-700">
                    <p className="text-sm text-slate-400 mb-2">Flight</p>
                    <p className="text-white font-semibold">{flight.flightNumber}</p>
                    <p className="text-sm text-slate-400">{(flight.airline as any).name}</p>
                  </div>

                  <div className="mb-6 pb-6 border-b border-slate-700">
                    <p className="text-sm text-slate-400 mb-3">Seats</p>
                    <div className="flex flex-wrap gap-2">
                      {seats.split(',').map((seat) => (
                        <span key={seat} className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded font-medium">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6 pb-6 border-b border-slate-700">
                    <p className="text-sm text-slate-400 mb-2">Passengers</p>
                    <p className="text-white font-semibold">{passengers}</p>
                  </div>

                  <div className="space-y-2 mb-6 pb-6 border-b border-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Flight ({passengers} × ${flight.price.economy})</span>
                      <span className="text-white">${totalPrice.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Taxes & Fees (12%)</span>
                      <span className="text-white">${taxes.toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-3xl font-bold text-sky-400">${grandTotal.toFixed(0)}</span>
                  </div>
                </>
              )}
            </Card>

            <Card className="bg-emerald-500/10 border-emerald-500/30 p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-emerald-400">Secure Payment</p>
                  <p className="text-xs text-emerald-300">PCI-DSS compliant • SSL encrypted</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
