import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user session
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: bookingId } = await params;

    // Find booking and populate related data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
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

    // Check if user owns this booking or is admin
    if (booking.userId !== session.user.id && session.user.role !== 'admin') {
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
    // Get user session
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const body = await request.json();

    // Find booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user owns this booking or is admin
    if (booking.userId !== session.user.id && session.user.role !== 'admin') {
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

    // Check if there are any fields to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No updatable fields provided' },
        { status: 400 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updates,
      include: {
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