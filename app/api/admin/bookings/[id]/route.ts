import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await context.params;
    const booking = await Booking.findById(id)
      .populate('user', 'firstName lastName email phone')
      .populate({
        path: 'flight',
        populate: [
          { path: 'airline', select: 'name code logo' },
          { path: 'departure.airport', select: 'name code city' },
          { path: 'arrival.airport', select: 'name code city' },
        ],
      })
      .lean();

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await context.params;
    const data = await request.json();

    const booking = await Booking.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('user', 'firstName lastName email phone')
      .populate({
        path: 'flight',
        populate: [
          { path: 'airline', select: 'name code logo' },
          { path: 'departure.airport', select: 'name code city' },
          { path: 'arrival.airport', select: 'name code city' },
        ],
      })
      .lean();

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
