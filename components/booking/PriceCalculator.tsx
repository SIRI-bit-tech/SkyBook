'use client';

import { Flight, BookingAddOns, PriceBreakdown } from '@/types/global';

interface PriceCalculatorProps {
  flight: Flight;
  passengers: number;
  addOns?: BookingAddOns;
  className?: string;
}

export function calculatePrice(
  flight: Flight, 
  passengers: number, 
  addOns?: BookingAddOns
): PriceBreakdown {
  const basePrice = flight.price.economy * passengers;
  const taxes = basePrice * 0.12; // 12% taxes and fees
  
  let addOnsTotal = 0;
  let insuranceTotal = 0;
  
  if (addOns) {
    addOnsTotal = addOns.selectedAddOns.reduce(
      (total, addon) => total + addon.price * addon.quantity, 
      0
    );
    insuranceTotal = addOns.travelInsurance ? 45 * passengers : 0;
  }
  
  const grandTotal = basePrice + taxes + addOnsTotal + insuranceTotal;
  
  return {
    basePrice,
    taxes,
    addOnsTotal,
    insuranceTotal,
    grandTotal,
  };
}

export default function PriceCalculator({ 
  flight, 
  passengers, 
  addOns, 
  className = '' 
}: PriceCalculatorProps) {
  const breakdown = calculatePrice(flight, passengers, addOns);
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-slate-300">
        <span>Flight ({passengers} × ${flight.price.economy})</span>
        <span>${breakdown.basePrice.toFixed(0)}</span>
      </div>
      
      <div className="flex justify-between text-slate-300">
        <span>Taxes & Fees (12%)</span>
        <span>${breakdown.taxes.toFixed(0)}</span>
      </div>
      
      {addOns && breakdown.addOnsTotal > 0 && (
        <div className="flex justify-between text-slate-300">
          <span>Add-Ons</span>
          <span>${breakdown.addOnsTotal.toFixed(0)}</span>
        </div>
      )}
      
      {addOns && breakdown.insuranceTotal > 0 && (
        <div className="flex justify-between text-slate-300">
          <span>Travel Insurance</span>
          <span>${breakdown.insuranceTotal.toFixed(0)}</span>
        </div>
      )}
      
      <div className="border-t border-slate-600 pt-2">
        <div className="flex justify-between font-bold text-white text-lg">
          <span>Total</span>
          <span className="text-sky-400">${breakdown.grandTotal.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}