'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AddOn, BookingAddOns } from '@/types/global';

interface AddOnsSelectorProps {
  addOns: BookingAddOns;
  passengers: number;
  onUpdate: (addOns: BookingAddOns) => void;
  onContinue: () => void;
  onSkip: () => void;
}

const ADD_ONS_CATALOG: AddOn[] = [
  { id: 'extra-baggage', name: 'Extra Baggage (23kg)', price: 35, description: 'Additional checked baggage allowance' },
  { id: 'seat-upgrade', name: 'Seat Upgrade to Premium', price: 50, description: 'More legroom and priority boarding' },
  { id: 'priority-boarding', name: 'Priority Boarding', price: 25, description: 'Board before general passengers' },
  { id: 'lounge-access', name: 'Airport Lounge Access', price: 80, description: 'Complimentary food, drinks, and WiFi' },
];

const MEAL_OPTIONS = [
  { value: 'none', label: 'No Meal' },
  { value: 'standard', label: 'Standard Meal' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
];

export default function AddOnsSelector({
  addOns,
  passengers,
  onUpdate,
  onContinue,
  onSkip,
}: AddOnsSelectorProps) {
  const handleAddOnToggle = (addOn: AddOn) => {
    const existing = addOns.selectedAddOns.find(a => a.id === addOn.id);
    if (existing) {
      onUpdate({
        ...addOns,
        selectedAddOns: addOns.selectedAddOns.filter(a => a.id !== addOn.id),
      });
    } else {
      onUpdate({
        ...addOns,
        selectedAddOns: [...addOns.selectedAddOns, { 
          id: addOn.id, 
          name: addOn.name, 
          price: addOn.price, 
          quantity: 1 
        }],
      });
    }
  };

  const calculateTotal = () => {
    const addOnsTotal = addOns.selectedAddOns.reduce((total, addon) => total + addon.price * addon.quantity, 0);
    const insuranceTotal = addOns.travelInsurance ? 45 * passengers : 0;
    return addOnsTotal + insuranceTotal;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Baggage Selection */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Baggage Allowance</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((num) => (
              <label key={num} className="flex items-center p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition">
                <input
                  type="radio"
                  name="baggage"
                  value={num}
                  checked={addOns.baggage === num}
                  onChange={() => onUpdate({ ...addOns, baggage: num })}
                  className="w-4 h-4 text-sky-500"
                />
                <span className="ml-3 text-white">
                  {num} bag{num > 1 ? 's' : ''} included ({num * 23}kg)
                </span>
              </label>
            ))}
          </div>
        </Card>

        {/* Meal Preferences */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Meal Preferences</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MEAL_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition">
                <input
                  type="radio"
                  name="meals"
                  value={option.value}
                  checked={addOns.meals === option.value}
                  onChange={(e) => onUpdate({ ...addOns, meals: e.target.value })}
                  className="w-4 h-4 text-sky-500"
                />
                <span className="ml-3 text-white">{option.label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Special Requests */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Special Requests</h2>
          <textarea
            value={addOns.specialRequests}
            onChange={(e) => onUpdate({ ...addOns, specialRequests: e.target.value })}
            placeholder="Wheelchair assistance, unaccompanied minor, etc."
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none h-24 resize-none"
            maxLength={500}
          />
          <p className="text-sm text-slate-400 mt-2">{addOns.specialRequests.length}/500 characters</p>
        </Card>

        {/* Travel Insurance */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Travel Insurance</h2>
              <p className="text-slate-300">Protect your trip with comprehensive coverage</p>
              <p className="text-sm text-slate-400 mt-1">$45 per passenger</p>
            </div>
            <Checkbox
              checked={addOns.travelInsurance}
              onCheckedChange={(checked) =>
                onUpdate({ ...addOns, travelInsurance: !!checked })
              }
            />
          </div>
        </Card>

        {/* Optional Add-Ons */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Optional Add-Ons</h2>
          <div className="space-y-3">
            {ADD_ONS_CATALOG.map((addOn) => (
              <div key={addOn.id} className="p-3 bg-slate-700 rounded-lg">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center">
                    <Checkbox
                      checked={addOns.selectedAddOns.some(a => a.id === addOn.id)}
                      onCheckedChange={() => handleAddOnToggle(addOn)}
                    />
                    <div className="ml-3">
                      <span className="text-white font-medium">{addOn.name}</span>
                      {addOn.description && (
                        <p className="text-sm text-slate-400">{addOn.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-sky-400 font-bold">${addOn.price}</span>
                </label>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Summary Sidebar */}
      <div>
        <Card className="bg-slate-800 border-slate-700 p-6 sticky top-4">
          <h3 className="text-xl font-bold text-white mb-4">Add-Ons Summary</h3>
          
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between text-slate-300">
              <span>Baggage</span>
              <span>{addOns.baggage} bag(s)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Meals</span>
              <span>{MEAL_OPTIONS.find(m => m.value === addOns.meals)?.label}</span>
            </div>
            {addOns.travelInsurance && (
              <div className="flex justify-between text-slate-300">
                <span>Insurance</span>
                <span>${(45 * passengers).toFixed(2)}</span>
              </div>
            )}
            {addOns.selectedAddOns.map((addon) => (
              <div key={addon.id} className="flex justify-between text-slate-300">
                <span>{addon.name}</span>
                <span>${(addon.price * addon.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-slate-600 pt-4 mb-6">
            <div className="flex justify-between font-bold text-white">
              <span>Total Add-Ons</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={onContinue}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white"
            >
              Continue to Payment
            </Button>
            <Button
              onClick={onSkip}
              variant="outline"
              className="w-full text-sky-400 border-sky-500 hover:bg-sky-500/10"
            >
              Skip Add-Ons
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}