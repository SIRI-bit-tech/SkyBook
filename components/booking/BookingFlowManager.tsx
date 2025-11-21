'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flight, PassengerFormData, BookingAddOns } from '@/types/global';
import SeatMap from './SeatMap';
import BookingSummary from './BookingSummary';
import PassengerForm from './PassengerForm';
import AddOnsSelector from './AddOnsSelector';
import PaymentForm from './PaymentForm';
import PriceCalculator, { calculatePrice } from './PriceCalculator';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StripeProvider from '@/components/providers/StripeProvider';

export type BookingStep = 'seats' | 'passengers' | 'addons' | 'payment' | 'confirmation';

interface BookingFlowManagerProps {
  flight: Flight;
  passengers: number;
  initialStep?: BookingStep;
  onComplete?: (bookingId: string) => void;
}

export default function BookingFlowManager({
  flight,
  passengers,
  initialStep = 'seats',
  onComplete,
}: BookingFlowManagerProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<BookingStep>(initialStep);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [currentPassengerIndex, setCurrentPassengerIndex] = useState(0);
  const [passengerData, setPassengerData] = useState<PassengerFormData[]>(
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
    selectedAddOns: [],
  });
  const [processing, setProcessing] = useState(false);

  const handleSeatSelect = (seat: string) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else if (selectedSeats.length < passengers) {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleSeatsComplete = () => {
    if (selectedSeats.length === passengers) {
      setCurrentStep('passengers');
    }
  };

  const handlePassengerUpdate = (field: keyof PassengerFormData, value: string) => {
    const updated = [...passengerData];
    updated[currentPassengerIndex] = { ...updated[currentPassengerIndex], [field]: value };
    setPassengerData(updated);
  };

  const handlePassengerNext = () => {
    if (currentPassengerIndex < passengers - 1) {
      setCurrentPassengerIndex(currentPassengerIndex + 1);
    } else {
      setCurrentStep('addons');
    }
  };

  const handlePassengerPrevious = () => {
    if (currentPassengerIndex > 0) {
      setCurrentPassengerIndex(currentPassengerIndex - 1);
    }
  };

  const handleAddOnsComplete = () => {
    setCurrentStep('payment');
  };

  const handleAddOnsSkip = () => {
    setCurrentStep('payment');
  };

  const handlePayment = async (paymentToken: string, billingDetails: { name: string; address?: any }) => {
    setProcessing(true);
    try {
      const priceBreakdown = calculatePrice(flight, passengers, bookingAddOns);
      
      const bookingResponse = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightId: flight._id,
          passengers: passengerData,
          seats: selectedSeats,
          addOns: bookingAddOns,
          totalPrice: priceBreakdown.grandTotal,
          paymentToken,
          billingDetails,
        }),
      });

      if (bookingResponse.ok) {
        const bookingData = await bookingResponse.json();
        if (onComplete) {
          onComplete(bookingData.booking._id);
        } else {
          router.push(`/booking/confirmation?bookingId=${bookingData.booking._id}&ref=${bookingData.bookingReference}`);
        }
      } else {
        throw new Error('Booking failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const isPassengerFormValid = (passenger: PassengerFormData): boolean => {
    return !!(passenger.firstName && passenger.lastName && passenger.dateOfBirth && passenger.email);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'seats': return 'Select Seats';
      case 'passengers': return 'Passenger Details';
      case 'addons': return 'Add-Ons & Extras';
      case 'payment': return 'Payment';
      default: return 'Booking';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'seats':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SeatMap
                flight={flight}
                selectedSeats={selectedSeats}
                onSelectSeat={handleSeatSelect}
                passengerCount={passengers}
              />
            </div>
            <div>
              <BookingSummary
                flight={flight}
                selectedSeats={selectedSeats}
                passengers={passengers}
                onContinue={handleSeatsComplete}
                continueDisabled={selectedSeats.length !== passengers}
              />
            </div>
          </div>
        );

      case 'passengers':
        return (
          <div className="max-w-2xl mx-auto">
            <PassengerForm
              passenger={passengerData[currentPassengerIndex]}
              passengerIndex={currentPassengerIndex}
              totalPassengers={passengers}
              onUpdate={handlePassengerUpdate}
              onNext={handlePassengerNext}
              onPrevious={currentPassengerIndex > 0 ? handlePassengerPrevious : undefined}
              isValid={isPassengerFormValid(passengerData[currentPassengerIndex])}
              isLastPassenger={currentPassengerIndex === passengers - 1}
            />
          </div>
        );

      case 'addons':
        return (
          <AddOnsSelector
            addOns={bookingAddOns}
            passengers={passengers}
            onUpdate={setBookingAddOns}
            onContinue={handleAddOnsComplete}
            onSkip={handleAddOnsSkip}
          />
        );

      case 'payment': {
        const priceBreakdown = calculatePrice(flight, passengers, bookingAddOns);
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <StripeProvider>
              <PaymentForm
                onSubmit={handlePayment}
                totalAmount={priceBreakdown.grandTotal}
                processing={processing}
              />
            </StripeProvider>
            <div>
              <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
                
                {/* Flight Info */}
                <div className="mb-4 pb-4 border-b border-slate-700">
                  <p className="text-sm text-slate-400 mb-1">Flight</p>
                  <p className="text-white font-semibold">{flight.flightNumber}</p>
                  <p className="text-sm text-slate-400">{(flight.airline as any)?.name || 'Airline'}</p>
                </div>

                {/* Seats */}
                <div className="mb-4 pb-4 border-b border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Seats</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map((seat) => (
                      <span key={seat} className="px-2 py-1 bg-sky-500/20 text-sky-400 rounded text-sm">
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Passengers */}
                <div className="mb-4 pb-4 border-b border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Passengers</p>
                  {passengerData.map((passenger, index) => (
                    <p key={index} className="text-white text-sm">
                      {passenger.firstName} {passenger.lastName}
                    </p>
                  ))}
                </div>

                {/* Price Breakdown */}
                <PriceCalculator
                  flight={flight}
                  passengers={passengers}
                  addOns={bookingAddOns}
                />
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
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => {
              if (currentStep === 'seats') {
                router.back();
              } else if (currentStep === 'passengers') {
                setCurrentStep('seats');
                setCurrentPassengerIndex(0);
              } else if (currentStep === 'addons') {
                setCurrentStep('passengers');
                setCurrentPassengerIndex(passengers - 1);
              } else if (currentStep === 'payment') {
                setCurrentStep('addons');
              }
            }}
            variant="ghost"
            className="text-sky-400 hover:text-sky-300 mb-4 p-0"
          >
            ← Back
          </Button>
          
          <h1 className="text-4xl font-bold text-white mb-2">{getStepTitle()}</h1>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className={currentStep === 'seats' ? 'text-sky-400' : ''}>Seats</span>
            <span>→</span>
            <span className={currentStep === 'passengers' ? 'text-sky-400' : ''}>Passengers</span>
            <span>→</span>
            <span className={currentStep === 'addons' ? 'text-sky-400' : ''}>Add-Ons</span>
            <span>→</span>
            <span className={currentStep === 'payment' ? 'text-sky-400' : ''}>Payment</span>
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}
      </div>
    </div>
  );
}