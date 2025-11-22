import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Fetch booking with flight data
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        flight: true,
      },
    });
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify ownership
    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if booking is confirmed
    if (booking.status !== 'confirmed') {
      return NextResponse.json({ 
        error: `Cannot check in. Booking status is ${booking.status}` 
      }, { status: 400 });
    }

    // Check if check-in window is open (24 hours before departure)
    const now = new Date();
    const departureTime = new Date(booking.flight.departureTime);
    const checkInOpens = new Date(departureTime.getTime() - 24 * 60 * 60 * 1000);
    const checkInCloses = new Date(departureTime.getTime() - 1 * 60 * 60 * 1000); // 1 hour before

    if (now < checkInOpens) {
      return NextResponse.json({ 
        error: 'Check-in opens 24 hours before departure' 
      }, { status: 400 });
    }

    if (now > checkInCloses) {
      return NextResponse.json({ 
        error: 'Check-in has closed for this flight' 
      }, { status: 400 });
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'checked-in',
        checkedInAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Checked in successfully',
      booking: updatedBooking,
    });

  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Failed to check in' },
      { status: 500 }
    );
  }
}
