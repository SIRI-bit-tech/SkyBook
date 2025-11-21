import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { FlightModel } from '@/models/Flight';
import { getSession } from '@/lib/auth-server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Fetch booking
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify ownership
    if (booking.user.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Booking already cancelled' }, { status: 400 });
    }

    // Check if already checked in
    if (booking.status === 'checked-in') {
      return NextResponse.json({ 
        error: 'Cannot cancel a booking that has been checked in' 
      }, { status: 400 });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Release seats back to flight
    await FlightModel.updateOne(
      { _id: booking.flight },
      {
        $pull: { 'seatMap.reserved': { $in: booking.seats } },
        $inc: { availableSeats: booking.seats.length },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking,
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
