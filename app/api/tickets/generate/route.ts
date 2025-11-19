import { connectToDatabase } from '@/lib/mongodb';
import { BookingModel } from '@/models/Booking';
import { FlightModel } from '@/models/Flight';
import { PassengerModel } from '@/models/Passenger';
import { generateQRCode, encryptBookingData } from '@/lib/qrcode';
import { sendTicketEmail } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { bookingId } = await request.json();

    const booking = await BookingModel.findById(bookingId)
      .populate('flight')
      .populate('passengers');

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Generate QR code with encrypted booking data
    const firstPassenger = booking.passengers[0];
    const encryptedData = encryptBookingData(
      booking.bookingReference,
      `${firstPassenger.firstName} ${firstPassenger.lastName}`,
      (booking.flight as any).flightNumber
    );

    const qrCodeDataUrl = await generateQRCode(encryptedData);

    // Generate ticket PDF
    // For now, just create a placeholder URL - in production use pdf-lib
    const ticketPdfUrl = `https://skybook.com/tickets/${booking.bookingReference}.pdf`;

    // Update booking with ticket URLs
    booking.qrCode = qrCodeDataUrl;
    booking.ticketUrl = ticketPdfUrl;
    await booking.save();

    // Send email with ticket
    const passengerEmail = firstPassenger.email;
    await sendTicketEmail(
      passengerEmail,
      booking.bookingReference,
      `${firstPassenger.firstName} ${firstPassenger.lastName}`,
      ticketPdfUrl,
      qrCodeDataUrl
    );

    return NextResponse.json({
      success: true,
      booking,
      qrCode: qrCodeDataUrl,
      ticketUrl: ticketPdfUrl,
    });
  } catch (error) {
    console.error('[Generate Ticket Error]', error);
    return NextResponse.json({ error: 'Failed to generate ticket' }, { status: 500 });
  }
}
