import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateTicketPDF } from '@/lib/pdf-ticket-generator';
import { getSession } from '@/lib/auth-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingReference: string }> }
) {
  try {
    // Verify user authentication
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { bookingReference } = await params;

    if (!bookingReference) {
      return NextResponse.json({ error: 'Booking reference is required' }, { status: 400 });
    }

    // Fetch booking with populated data
    const booking = await prisma.booking.findUnique({
      where: { bookingReference },
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

    // Verify the user owns this booking (or is admin)
    const isAdmin = session.user.role === 'admin';
    if (booking.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify booking is confirmed before generating ticket
    if (booking.status !== 'confirmed') {
      return NextResponse.json({ 
        error: 'Tickets can only be generated for confirmed bookings' 
      }, { status: 400 });
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
