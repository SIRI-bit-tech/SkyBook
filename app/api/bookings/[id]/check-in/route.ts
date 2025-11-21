import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
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
    
    // Fetch booking with flight data
    const booking = await Booking.findById(id).populate('flight');
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify ownership
    if (booking.user.toString() !== session.user.id) {
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
    const departureTime = new Date(booking.flight.departure.time);
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
    booking.status = 'checked-in';
    booking.checkedInAt = new Date();
    await booking.save();

    return NextResponse.json({
      success: true,
      message: 'Checked in successfully',
      booking,
    });

  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Failed to check in' },
      { status: 500 }
    );
  }
}
