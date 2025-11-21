import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { decryptBookingData } from '@/lib/qr-generator';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { encryptedData } = await request.json();

    if (!encryptedData) {
      return NextResponse.json({ 
        valid: false, 
        error: 'No data provided' 
      }, { status: 400 });
    }

    // Decrypt QR code data
    const decryptedData = decryptBookingData(encryptedData);

    if (!decryptedData) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid or corrupted QR code' 
      }, { status: 400 });
    }

    // Check if QR code is not too old (24 hours for security)
    const qrAge = Date.now() - decryptedData.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (qrAge > maxAge) {
      return NextResponse.json({ 
        valid: false, 
        error: 'QR code has expired. Please generate a new ticket.' 
      }, { status: 400 });
    }

    // Fetch booking
    const booking = await Booking.findOne({
      _id: decryptedData.id,
      bookingReference: decryptedData.ref,
    })
      .populate('flight')
      .populate('user', 'firstName lastName email');

    if (!booking) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Booking not found' 
      }, { status: 404 });
    }

    // Check if booking is valid for travel
    const now = new Date();
    const departureTime = new Date(booking.flight.departure.time);
    const arrivalTime = new Date(booking.flight.arrival.time);

    // Booking should be confirmed and flight should be in the future or currently in progress
    if (booking.status === 'cancelled') {
      return NextResponse.json({ 
        valid: false, 
        error: 'This booking has been cancelled' 
      }, { status: 400 });
    }

    if (arrivalTime < now) {
      return NextResponse.json({ 
        valid: false, 
        error: 'This flight has already completed' 
      }, { status: 400 });
    }

    // Return verification success with booking details
    return NextResponse.json({
      valid: true,
      booking: {
        bookingReference: booking.bookingReference,
        status: booking.status,
        passengers: booking.passengers.map((p: any) => ({
          firstName: p.firstName,
          lastName: p.lastName,
        })),
        seats: booking.seats,
        flight: {
          flightNumber: booking.flight.flightNumber,
          departure: {
            airport: booking.flight.departure.airport,
            time: booking.flight.departure.time,
            terminal: booking.flight.departure.terminal,
          },
          arrival: {
            airport: booking.flight.arrival.airport,
            time: booking.flight.arrival.time,
            terminal: booking.flight.arrival.terminal,
          },
        },
      },
      message: 'Ticket verified successfully',
    });

  } catch (error) {
    console.error('Ticket verification error:', error);
    return NextResponse.json(
      { 
        valid: false, 
        error: 'Failed to verify ticket' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for URL-based verification (from QR code scan)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const encryptedData = searchParams.get('data');

    if (!encryptedData) {
      return NextResponse.json({ 
        valid: false, 
        error: 'No data provided' 
      }, { status: 400 });
    }

    // Decrypt and verify
    const decryptedData = decryptBookingData(decodeURIComponent(encryptedData));

    if (!decryptedData) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Invalid QR code' 
      }, { status: 400 });
    }

    await connectToDatabase();

    const booking = await Booking.findOne({
      _id: decryptedData.id,
      bookingReference: decryptedData.ref,
    })
      .populate('flight')
      .populate('user', 'firstName lastName');

    if (!booking) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Booking not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      bookingReference: booking.bookingReference,
      status: booking.status,
      message: 'Ticket is valid',
    });

  } catch (error) {
    console.error('Ticket verification error:', error);
    return NextResponse.json(
      { 
        valid: false, 
        error: 'Verification failed' 
      },
      { status: 500 }
    );
  }
}
