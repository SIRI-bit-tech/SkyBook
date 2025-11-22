import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const { id } = await params;

    const booking = await prisma.booking.update({
      where: { id },
      data: { 
        status,
        ...(status === 'checked-in' && { checkedInAt: new Date() })
      },
      include: {
        flight: {
          include: {
            airline: true,
            departureAirport: true,
            arrivalAirport: true,
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

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('[Update Booking Error]', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
