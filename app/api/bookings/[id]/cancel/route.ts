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

    // Only allow cancellation of confirmed bookings
    if (booking.status !== 'confirmed') {
      return NextResponse.json({ 
        error: `Cannot cancel booking with status: ${booking.status}` 
      }, { status: 400 });
    }

    // Fetch flight to check which seats are actually reserved
    const flight = await FlightModel.findById(booking.flight);
    if (!flight) {
      return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
    }

    // Calculate actual seats to release (intersection of booking.seats and flight.seatMap.reserved)
    const seatsToRelease = booking.seats.filter((seat: string) => 
      flight.seatMap.reserved.includes(seat)
    );

    // Atomic update: Only cancel if status is still 'confirmed' (prevents double cancellation)
    const updateResult = await Booking.updateOne(
      { 
        _id: id, 
        status: 'confirmed' // Only update if still confirmed
      },
      { 
        $set: { status: 'cancelled' } 
      }
    );

    // Check if booking was actually updated
    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ 
        error: 'Booking has already been cancelled or modified' 
      }, { status: 400 });
    }

    // Release seats back to flight atomically
    if (seatsToRelease.length > 0) {
      await FlightModel.updateOne(
        { _id: booking.flight },
        {
          $pull: { 'seatMap.reserved': { $in: seatsToRelease } },
          $inc: { availableSeats: seatsToRelease.length },
        }
      );
    }

    // Fetch updated booking for response
    const updatedBooking = await Booking.findById(id);

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
      seatsReleased: seatsToRelease.length,
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
