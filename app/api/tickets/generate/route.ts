import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { getSession } from '@/lib/auth-server';
import { generateTicketPDF } from '@/lib/pdf-ticket-generator';
import { generateQRCode } from '@/lib/qr-generator';
import { sendTicketEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, sendEmail } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Fetch booking with populated data
    const booking = await Booking.findById(bookingId)
      .populate('flight')
      .populate('user', 'firstName lastName email');

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify ownership
    if (booking.user._id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized access to booking' }, { status: 403 });
    }

    // Generate QR code
    const qrCodeDataUrl = await generateQRCode(booking.bookingReference, booking._id.toString());

    // Generate PDF ticket
    const pdfBuffer = await generateTicketPDF(booking);

    // Send email if requested
    let emailResult = null;
    if (sendEmail) {
      emailResult = await sendTicketEmail({
        booking,
        pdfBuffer,
        qrCodeDataUrl,
      });
    }

    // Update booking with QR code and ticket URL
    await Booking.findByIdAndUpdate(bookingId, {
      qrCode: qrCodeDataUrl,
      ticketUrl: `/api/tickets/download/${booking.bookingReference}`,
    });

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataUrl,
      ticketUrl: `/api/tickets/download/${booking.bookingReference}`,
      emailSent: emailResult?.success || false,
      message: 'Ticket generated successfully',
    });

  } catch (error) {
    console.error('Ticket generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate ticket' },
      { status: 500 }
    );
  }
}
