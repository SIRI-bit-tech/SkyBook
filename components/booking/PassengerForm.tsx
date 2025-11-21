'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PassengerFormData } from '@/types/global';

interface PassengerFormProps {
  passenger: PassengerFormData;
  passengerIndex: number;
  totalPassengers: number;
  onUpdate: (field: keyof PassengerFormData, value: string) => void;
  onNext: () => void;
  onPrevious?: () => void;
  isValid: boolean;
  isLastPassenger: boolean;
}

export default function PassengerForm({
  passenger,
  passengerIndex,
  totalPassengers,
  onUpdate,
  onNext,
  onPrevious,
  isValid,
  isLastPassenger,
}: PassengerFormProps) {
  return (
    <Card className="bg-slate-800 border-slate-700 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Passenger {passengerIndex + 1} of {totalPassengers}
        </h2>
        <div className="bg-slate-700 rounded-full h-2">
          <div
            className="bg-sky-500 h-full rounded-full transition-all"
            style={{ width: `${((passengerIndex + 1) / totalPassengers) * 100}%` }}
          />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              First Name *
            </label>
            <input
              type="text"
              required
              value={passenger.firstName}
              onChange={(e) => onUpdate('firstName', e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
              placeholder="First name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              required
              value={passenger.lastName}
              onChange={(e) => onUpdate('lastName', e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
              placeholder="Last name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              required
              value={passenger.dateOfBirth}
              onChange={(e) => onUpdate('dateOfBirth', e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nationality
            </label>
            <input
              type="text"
              value={passenger.nationality}
              onChange={(e) => onUpdate('nationality', e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
              placeholder="Country of citizenship"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Passport Number
          </label>
          <input
            type="text"
            value={passenger.passportNumber}
            onChange={(e) => onUpdate('passportNumber', e.target.value)}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            placeholder="Passport number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={passenger.email}
            onChange={(e) => onUpdate('email', e.target.value)}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            placeholder="Email address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={passenger.phone}
            onChange={(e) => onUpdate('phone', e.target.value)}
            className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:border-sky-500 focus:outline-none"
            placeholder="Phone number"
          />
        </div>

        <div className="flex gap-4 pt-4">
          {onPrevious && (
            <Button
              type="button"
              onClick={onPrevious}
              variant="outline"
              className="flex-1 bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
            >
              Previous
            </Button>
          )}
          <Button
            type="submit"
            disabled={!isValid}
            className={`flex-1 ${
              isValid
                ? 'bg-sky-500 hover:bg-sky-600 text-white'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLastPassenger ? 'Continue to Add-Ons' : 'Next Passenger'}
          </Button>
        </div>
      </form>
    </Card>
  );
}