'use client';

import { useState, FormEvent } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface PaymentFormProps {
  onSubmit: (paymentToken: string, billingDetails: BillingDetails) => Promise<void>;
  totalAmount: number;
  processing: boolean;
}

interface BillingDetails {
  name: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

export default function PaymentForm({ onSubmit, totalAmount, processing }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [name, setName] = useState('');
  const [showBilling, setShowBilling] = useState(false);
  const [billingAddress, setBillingAddress] = useState({
    line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      return;
    }

    setError(null);

    try {
      // Create payment method token using Stripe
      const { error: tokenError, token } = await stripe.createToken(cardElement, {
        name,
        address_line1: showBilling ? billingAddress.line1 : undefined,
        address_city: showBilling ? billingAddress.city : undefined,
        address_state: showBilling ? billingAddress.state : undefined,
        address_zip: showBilling ? billingAddress.postal_code : undefined,
        address_country: showBilling ? billingAddress.country : undefined,
      });

      if (tokenError) {
        setError(tokenError.message || 'Failed to process card');
        return;
      }

      if (!token) {
        setError('Failed to create payment token');
        return;
      }

      // Send only the token to the backend
      await onSubmit(token.id, {
        name,
        address: showBilling ? billingAddress : undefined,
      });
    } catch (err) {
      setError('Payment processing failed. Please try again.');
      console.error('Payment error:', err);
    }
  };

  const isFormValid = () => {
    return name.trim() && cardComplete && !processing;
  };

  return (
    <Card className="bg-slate-800 border-slate-700 p-8">
      <h3 className="text-2xl font-bold text-white mb-6">Payment Details</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Cardholder Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            placeholder="Name on card"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Card Details *
          </label>
          <div className="w-full bg-slate-700 rounded-lg px-4 py-3 border border-slate-600 focus-within:border-sky-500">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#ffffff',
                    '::placeholder': {
                      color: '#94a3b8',
                    },
                  },
                  invalid: {
                    color: '#ef4444',
                  },
                },
              }}
              onChange={(e) => {
                setCardComplete(e.complete);
                if (e.error) {
                  setError(e.error.message);
                } else {
                  setError(null);
                }
              }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Secure card processing powered by Stripe
          </p>
        </div>

        {/* Billing Address Toggle */}
        <div className="border-t border-slate-600 pt-4">
          <button
            type="button"
            onClick={() => setShowBilling(!showBilling)}
            className="text-sky-400 hover:text-sky-300 text-sm"
          >
            {showBilling ? '− Hide' : '+ Add'} Billing Address
          </button>
        </div>

        {showBilling && (
          <div className="space-y-4 border border-slate-600 rounded-lg p-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={billingAddress.line1}
                onChange={(e) => setBillingAddress({ ...billingAddress, line1: e.target.value })}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                placeholder="123 Main Street"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={billingAddress.city}
                  onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  value={billingAddress.state}
                  onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                  placeholder="State"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  value={billingAddress.postal_code}
                  onChange={(e) => setBillingAddress({ ...billingAddress, postal_code: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                  placeholder="12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={billingAddress.country}
                  onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                  placeholder="US"
                />
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={!isFormValid() || processing}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-3 disabled:bg-slate-600 disabled:text-slate-400"
        >
          {processing ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </div>
          ) : (
            `Pay $${totalAmount.toFixed(0)}`
          )}
        </Button>

        <div className="flex items-center gap-2 justify-center pt-2">
          <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <p className="text-xs text-slate-400">
            Secure payment • SSL encrypted • PCI compliant
          </p>
        </div>
      </form>
    </Card>
  );
}