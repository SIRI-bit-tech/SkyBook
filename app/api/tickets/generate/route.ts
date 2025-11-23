import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import { generateTicketPDF } from '@/lib/pdf-ticket-generator';
import { generateQRCode } from '@/lib/qr-generator';
import { sendTicketEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, sendEmail } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Fetch booking with populated data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        flight: {
          include: {
            airline: true,
            departureAirport: true,
            arrivalAirport: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        passengers: {
          include: {
            passenger: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify ownership
    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized access to booking' }, { status: 403 });
    }

    // Verify booking is confirmed before generating ticket
    if (booking.status !== 'confirmed') {
      return NextResponse.json({ 
        error: 'Tickets can only be generated for confirmed bookings' 
      }, { status: 400 });
    }

    // Generate QR code
    const qrCodeDataUrl = await generateQRCode(booking.bookingReference, booking.id);

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
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        qrCode: qrCodeDataUrl,
        ticketUrl: `/api/tickets/download/${booking.bookingReference}`,
      },
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
