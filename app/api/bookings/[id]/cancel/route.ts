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
    
    // Fetch booking (no flight relation since flights are from API)
    const booking = await prisma.booking.findUnique({
      where: { id },
    });
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify ownership
    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Only allow cancellation of confirmed bookings
    if (booking.status !== 'confirmed') {
      return NextResponse.json({ 
        error: `Cannot cancel booking with status: ${booking.status}` 
      }, { status: 400 });
    }

    // Update booking status to cancelled
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    // Note: Seat availability is managed by Amadeus API in real-time
    // We don't need to manually release seats since we don't track them in database

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
      note: 'Seat availability is managed by the airline system',
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
