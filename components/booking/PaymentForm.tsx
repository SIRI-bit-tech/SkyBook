'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentDetails } from '@/types/global';

interface PaymentFormProps {
  onSubmit: (paymentDetails: PaymentDetails) => Promise<void>;
  totalAmount: number;
  processing: boolean;
}

export default function PaymentForm({ onSubmit, totalAmount, processing }: PaymentFormProps) {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  const [showBilling, setShowBilling] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(paymentDetails);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const isFormValid = () => {
    return (
      paymentDetails.name.trim() &&
      paymentDetails.cardNumber.replace(/\s/g, '').length >= 13 &&
      paymentDetails.expiryDate.length === 5 &&
      paymentDetails.cvv.length >= 3
    );
  };

  return (
    <Card className="bg-slate-800 border-slate-700 p-8">
      <h3 className="text-2xl font-bold text-white mb-6">Payment Details</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Cardholder Name *
          </label>
          <input
            type="text"
            required
            value={paymentDetails.name}
            onChange={(e) => setPaymentDetails({ 
              ...paymentDetails, 
              name: e.target.value 
            })}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            placeholder="Name on card"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Card Number *
          </label>
          <input
            type="text"
            required
            value={paymentDetails.cardNumber}
            onChange={(e) => setPaymentDetails({ 
              ...paymentDetails, 
              cardNumber: formatCardNumber(e.target.value)
            })}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none font-mono"
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Expiry Date *
            </label>
            <input
              type="text"
              required
              value={paymentDetails.expiryDate}
              onChange={(e) => setPaymentDetails({ 
                ...paymentDetails, 
                expiryDate: formatExpiryDate(e.target.value)
              })}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
              placeholder="MM/YY"
              maxLength={5}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              CVV *
            </label>
            <input
              type="text"
              required
              value={paymentDetails.cvv}
              onChange={(e) => setPaymentDetails({ 
                ...paymentDetails, 
                cvv: e.target.value.replace(/\D/g, '').slice(0, 4)
              })}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
              placeholder="123"
              maxLength={4}
            />
          </div>
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
                value={paymentDetails.billingAddress.street}
                onChange={(e) => setPaymentDetails({
                  ...paymentDetails,
                  billingAddress: { ...paymentDetails.billingAddress, street: e.target.value }
                })}
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
                  value={paymentDetails.billingAddress.city}
                  onChange={(e) => setPaymentDetails({
                    ...paymentDetails,
                    billingAddress: { ...paymentDetails.billingAddress, city: e.target.value }
                  })}
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
                  value={paymentDetails.billingAddress.state}
                  onChange={(e) => setPaymentDetails({
                    ...paymentDetails,
                    billingAddress: { ...paymentDetails.billingAddress, state: e.target.value }
                  })}
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
                  value={paymentDetails.billingAddress.zipCode}
                  onChange={(e) => setPaymentDetails({
                    ...paymentDetails,
                    billingAddress: { ...paymentDetails.billingAddress, zipCode: e.target.value }
                  })}
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
                  value={paymentDetails.billingAddress.country}
                  onChange={(e) => setPaymentDetails({
                    ...paymentDetails,
                    billingAddress: { ...paymentDetails.billingAddress, country: e.target.value }
                  })}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                  placeholder="Country"
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