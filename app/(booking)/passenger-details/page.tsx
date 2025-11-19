'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

interface PassengerForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber: string;
  email: string;
  phone: string;
  nationality: string;
}

interface BookingAddOns {
  baggage: number;
  meals: string;
  specialRequests: string;
  travelInsurance: boolean;
  addOns: { name: string; price: number; quantity: number }[];
}

const ADD_ONS_CATALOG = [
  { id: 'extra-baggage', name: 'Extra Baggage (23kg)', price: 35 },
  { id: 'seat-upgrade', name: 'Seat Upgrade to Premium', price: 50 },
  { id: 'priority-boarding', name: 'Priority Boarding', price: 25 },
  { id: 'lounge-access', name: 'Airport Lounge Access', price: 80 },
];

const MEAL_OPTIONS = [
  { value: 'none', label: 'No Meal' },
  { value: 'standard', label: 'Standard Meal' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
];

export default function PassengerDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passengers = parseInt(searchParams.get('passengers') || '1');
  const seats = searchParams.get('seats') || '';
  const flightId = searchParams.get('flightId') || '';

  const [passengerData, setPassengerData] = useState<PassengerForm[]>(
    Array.from({ length: passengers }, () => ({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      passportNumber: '',
      email: '',
      phone: '',
      nationality: '',
    }))
  );

  const [bookingAddOns, setBookingAddOns] = useState<BookingAddOns>({
    baggage: 1,
    meals: 'standard',
    specialRequests: '',
    travelInsurance: false,
    addOns: [],
  });

  const [currentPassenger, setCurrentPassenger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddOns, setShowAddOns] = useState(false);

  const handleInputChange = (field: keyof PassengerForm, value: string) => {
    const updated = [...passengerData];
    updated[currentPassenger] = { ...updated[currentPassenger], [field]: value };
    setPassengerData(updated);
  };

  const handleAddOnToggle = (addOn: typeof ADD_ONS_CATALOG[0]) => {
    const existing = bookingAddOns.addOns.find(a => a.name === addOn.name);
    if (existing) {
      setBookingAddOns({
        ...bookingAddOns,
        addOns: bookingAddOns.addOns.filter(a => a.name !== addOn.name),
      });
    } else {
      setBookingAddOns({
        ...bookingAddOns,
        addOns: [...bookingAddOns.addOns, { name: addOn.name, price: addOn.price, quantity: 1 }],
      });
    }
  };

  const handleContinue = async () => {
    if (currentPassenger < passengers - 1) {
      setCurrentPassenger(currentPassenger + 1);
    } else {
      setLoading(true);
      const params = new URLSearchParams({
        flightId,
        seats,
        passengers: passengers.toString(),
        passengerData: JSON.stringify(passengerData),
        bookingAddOns: JSON.stringify(bookingAddOns),
      });
      router.push(`/booking/payment?${params.toString()}`);
    }
  };

  const current = passengerData[currentPassenger];
  const isFormValid = current.firstName && current.lastName && current.dateOfBirth && current.email;

  const calculateAddOnsTotal = () => {
    return bookingAddOns.addOns.reduce((total, addon) => total + addon.price * addon.quantity, 0);
  };

  if (showAddOns) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Booking Add-Ons & Extras</h1>

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
                        checked={bookingAddOns.baggage === num}
                        onChange={(e) => setBookingAddOns({ ...bookingAddOns, baggage: num })}
                        className="w-4 h-4"
                      />
                      <span className="ml-3 text-white">{num} bag{num > 1 ? 's' : ''} included ({num * 23}kg)</span>
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
                        checked={bookingAddOns.meals === option.value}
                        onChange={(e) => setBookingAddOns({ ...bookingAddOns, meals: e.target.value })}
                        className="w-4 h-4"
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
                  value={bookingAddOns.specialRequests}
                  onChange={(e) => setBookingAddOns({ ...bookingAddOns, specialRequests: e.target.value })}
                  placeholder="Wheelchair assistance, unaccompanied minor, etc."
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none h-24"
                />
                <p className="text-sm text-slate-400 mt-2">{bookingAddOns.specialRequests.length}/500 characters</p>
              </Card>

              {/* Travel Insurance */}
              <Card className="bg-slate-800 border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Travel Insurance</h2>
                    <p className="text-slate-300">Protect your trip with comprehensive coverage</p>
                  </div>
                  <Checkbox
                    checked={bookingAddOns.travelInsurance}
                    onCheckedChange={(checked) =>
                      setBookingAddOns({
                        ...bookingAddOns,
                        travelInsurance: checked as boolean,
                      })
                    }
                  />
                </div>
                {bookingAddOns.travelInsurance && (
                  <p className="text-sky-400 mt-3">Added: $45.00 per passenger</p>
                )}
              </Card>

              {/* Add-Ons Selection */}
              <Card className="bg-slate-800 border-slate-700 p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Optional Add-Ons</h2>
                <div className="space-y-3">
                  {ADD_ONS_CATALOG.map((addOn) => (
                    <label key={addOn.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition">
                      <div className="flex items-center">
                        <Checkbox
                          checked={bookingAddOns.addOns.some(a => a.name === addOn.name)}
                          onCheckedChange={() => handleAddOnToggle(addOn)}
                        />
                        <span className="ml-3 text-white">{addOn.name}</span>
                      </div>
                      <span className="text-sky-400 font-bold">${addOn.price}</span>
                    </label>
                  ))}
                </div>
              </Card>
            </div>

            {/* Summary */}
            <div>
              <Card className="bg-slate-800 border-slate-700 p-6 sticky top-4">
                <h3 className="text-xl font-bold text-white mb-4">Summary</h3>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-slate-300">
                    <span>Baggage</span>
                    <span>{bookingAddOns.baggage} bag(s)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Meals</span>
                    <span>{MEAL_OPTIONS.find(m => m.value === bookingAddOns.meals)?.label}</span>
                  </div>
                  {bookingAddOns.travelInsurance && (
                    <div className="flex justify-between text-slate-300">
                      <span>Insurance</span>
                      <span>${(45 * passengers).toFixed(2)}</span>
                    </div>
                  )}
                  {bookingAddOns.addOns.map((addon) => (
                    <div key={addon.name} className="flex justify-between text-slate-300">
                      <span>{addon.name}</span>
                      <span>${(addon.price * addon.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-600 pt-4">
                  <div className="flex justify-between font-bold text-white mb-6">
                    <span>Total Add-Ons</span>
                    <span>${(
                      calculateAddOnsTotal() +
                      (bookingAddOns.travelInsurance ? 45 * passengers : 0)
                    ).toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={() => setShowAddOns(false)}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sky-400 hover:text-sky-300 mb-4 inline-block">← Back</Link>

        <h1 className="text-4xl font-bold text-white mb-2">Passenger Details</h1>
        <p className="text-slate-300 mb-8">Passenger {currentPassenger + 1} of {passengers}</p>

        {/* Progress Bar */}
        <div className="mb-8 bg-slate-700 rounded-full h-2">
          <div
            className="bg-sky-500 h-full rounded-full transition-all"
            style={{ width: `${((currentPassenger + 1) / passengers) * 100}%` }}
          ></div>
        </div>

        <Card className="bg-slate-800 border-slate-700 p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleContinue();
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">First Name *</label>
                <input
                  type="text"
                  required
                  value={current.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Last Name *</label>
                <input
                  type="text"
                  required
                  value={current.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={current.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nationality</label>
                <input
                  type="text"
                  value={current.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                  placeholder="Country of citizenship"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Passport Number</label>
              <input
                type="text"
                value={current.passportNumber}
                onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                placeholder="Passport number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address *</label>
              <input
                type="email"
                required
                value={current.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                placeholder="Email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
              <input
                type="tel"
                value={current.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
                placeholder="Phone number"
              />
            </div>

            <div className="flex gap-4 pt-4">
              {currentPassenger > 0 && (
                <Button
                  type="button"
                  onClick={() => setCurrentPassenger(currentPassenger - 1)}
                  variant="outline"
                  className="flex-1 bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
                >
                  Previous
                </Button>
              )}
              <Button
                type="submit"
                disabled={!isFormValid}
                className={`flex-1 ${
                  isFormValid
                    ? 'bg-sky-500 hover:bg-sky-600 text-white'
                    : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                }`}
              >
                {currentPassenger === passengers - 1 ? 'Next: Add-Ons' : 'Next Passenger'}
              </Button>
            </div>
          </form>

          {currentPassenger === passengers - 1 && (
            <Button
              onClick={() => setShowAddOns(true)}
              variant="outline"
              className="w-full mt-4 text-sky-400 border-sky-500 hover:bg-sky-500/10"
            >
              Skip Add-Ons → Continue to Payment
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
