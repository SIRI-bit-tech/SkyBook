import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { generateTicketPDF } from '@/lib/pdf-ticket-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingReference: string } }
) {
  try {
    await connectToDatabase();
    
    const { bookingReference } = params;

    if (!bookingReference) {
      return NextResponse.json({ error: 'Booking reference is required' }, { status: 400 });
    }

    // Fetch booking with populated data
    const booking = await Booking.findOne({ bookingReference })
      .populate('flight')
      .populate('user', 'firstName lastName email');

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Generate PDF ticket
    const pdfBuffer = await generateTicketPDF(booking);

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ticket-${bookingReference}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Ticket download error:', error);
    return NextResponse.json(
      { error: 'Failed to download ticket' },
      { status: 500 }
    );
  }
}
