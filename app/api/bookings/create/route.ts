import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { FlightModel } from '@/models/Flight';
import { getSession } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get user session
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      flightId,
      passengers,
      seats,
      addOns,
      totalPrice,
      paymentDetails,
    } = body;

    // Validate required fields
    if (!flightId || !passengers || !seats || !totalPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify flight exists and seats are available
    const flight = await FlightModel.findById(flightId);
    if (!flight) {
      return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
    }

    // Check if seats are still available
    const unavailableSeats = seats.filter((seat: string) => 
      flight.seatMap.reserved.includes(seat)
    );
    
    if (unavailableSeats.length > 0) {
      return NextResponse.json(
        { error: `Seats ${unavailableSeats.join(', ')} are no longer available` },
        { status: 409 }
      );
    }

    // Generate booking reference
    const bookingReference = `SB${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    // Create booking
    const booking = new Booking({
      bookingReference,
      user: session.user.id,
      flight: flightId,
      passengers: passengers.map((p: any) => ({
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: new Date(p.dateOfBirth),
        passportNumber: p.passportNumber,
        nationality: p.nationality,
        email: p.email,
        phone: p.phone,
      })),
      seats,
      addOns: addOns || {},
      totalPrice,
      paymentId: `payment_${Date.now()}`, // In real app, this would come from Stripe
      status: 'confirmed',
      qrCode: `qr_${bookingReference}`,
      ticketUrl: `/booking/ticket/${bookingReference}`,
    });

    await booking.save();

    // Update flight seat availability
    await FlightModel.findByIdAndUpdate(flightId, {
      $push: { 'seatMap.reserved': { $each: seats } },
      $inc: { availableSeats: -seats.length },
    });

    // Populate booking with flight and user data for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('flight')
      .populate('user', 'firstName lastName email');

    return NextResponse.json({
      success: true,
      booking: populatedBooking,
      bookingReference,
      message: 'Booking created successfully',
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}