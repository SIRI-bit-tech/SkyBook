import { connectToDatabase } from '@/lib/mongodb';
import { BookingModel } from '@/models/Booking';
import { decryptBookingData } from '@/lib/qrcode';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { qrCodeData } = await request.json();

    // Decrypt QR code data
    const bookingData = decryptBookingData(qrCodeData);
    if (!bookingData) {
      return NextResponse.json({ error: 'Invalid QR code' }, { status: 400 });
    }

    // Find booking
    const booking = await BookingModel.findOne({
      bookingReference: bookingData.bookingRef,
    })
      .populate('flight')
      .populate('passengers');

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify status
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Booking has been cancelled', valid: false },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      booking: {
        reference: booking.bookingReference,
        status: booking.status,
        flightNumber: (booking.flight as any).flightNumber,
        seats: booking.seats,
        passengers: booking.passengers,
      },
    });
  } catch (error) {
    console.error('[Verify Ticket Error]', error);
    return NextResponse.json({ error: 'Failed to verify ticket' }, { status: 500 });
  }
}
