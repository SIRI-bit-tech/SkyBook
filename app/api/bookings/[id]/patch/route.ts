import { connectToDatabase } from '@/lib/mongodb';
import { BookingModel } from '@/models/Booking';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { status } = await request.json();

    const booking = await BookingModel.findByIdAndUpdate(
      params.id,
      { 
        status,
        ...(status === 'checked-in' && { checkedInAt: new Date() })
      },
      { new: true }
    ).populate('flight').populate('passengers');

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('[Update Booking Error]', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
