import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { getSession } from '@/lib/auth-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    // Get user session
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: bookingId } = await params;

    // Find booking and populate related data
    const booking = await Booking.findById(bookingId)
      .populate('flight')
      .populate('user', 'firstName lastName email');

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user owns this booking or is admin
    if (!booking.user) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    const bookingUserId = (booking.user as any)._id?.toString() ?? booking.user?.toString();
    if (bookingUserId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      booking,
    });

  } catch (error) {
    console.error('Booking fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    // Get user session
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const body = await request.json();

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user owns this booking or is admin
    if (!booking.user) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    const bookingUserId = (booking.user as any)._id?.toString() ?? booking.user?.toString();
    if (bookingUserId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update allowed fields with validation
    const updates: any = {};
    
    // Validate status
    if (body.status !== undefined) {
      const validStatuses = ['pending', 'confirmed', 'checked-in', 'cancelled'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }
    
    // Validate checkedInAt
    if (body.checkedInAt !== undefined) {
      if (body.checkedInAt === null) {
        updates.checkedInAt = null;
      } else {
        const date = new Date(body.checkedInAt);
        if (isNaN(date.getTime())) {
          return NextResponse.json(
            { error: 'Invalid checkedInAt date. Must be a valid ISO-8601 date/time or null' },
            { status: 400 }
          );
        }
        updates.checkedInAt = date;
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updates,
      { new: true }
    ).populate('flight').populate('user', 'firstName lastName email');

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: 'Booking updated successfully',
    });

  } catch (error) {
    console.error('Booking update error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}