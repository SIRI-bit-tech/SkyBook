import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-server';
import { Prisma } from '@prisma/client';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        passengers: {
          include: {
            passenger: true,
          },
        },
        payment: true,
      },
    });

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

    const { id } = await context.params;
    const data = await request.json();

    try {
      const booking = await prisma.booking.update({
        where: { id },
        data,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          passengers: {
            include: {
              passenger: true,
            },
          },
          payment: true,
        },
      });

      return NextResponse.json({ booking });
    } catch (updateError) {
      // Handle Prisma "record not found" error
      if (updateError instanceof Prisma.PrismaClientKnownRequestError && updateError.code === 'P2025') {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      // Re-throw other errors to be caught by outer catch
      throw updateError;
    }
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
