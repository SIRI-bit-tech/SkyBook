import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    
    // Parse and validate pagination parameters
    const rawLimit = Number(searchParams.get('limit') || '10');
    const rawSkip = Number(searchParams.get('skip') || '0');
    
    // Normalize with safe defaults and clamping
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 
      ? Math.min(Math.max(Math.floor(rawLimit), 1), 50) // Clamp between 1 and 50
      : 10; // Default
    
    const skip = Number.isFinite(rawSkip) && rawSkip >= 0 
      ? Math.max(Math.floor(rawSkip), 0) // Ensure non-negative
      : 0; // Default

    // Build where clause
    const where: any = { userId: session.user.id };
    if (status) {
      where.status = status;
    }

    // Fetch bookings with pagination
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        passengers: {
          include: {
            passenger: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    });

    const total = await prisma.booking.count({ where });

    // Transform to match expected format
    const transformedBookings = bookings.map((booking: any) => ({
      ...booking,
      passengers: booking.passengers.map((bp: any) => bp.passenger),
    }));

    return NextResponse.json({
      success: true,
      bookings: transformedBookings,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + bookings.length < total,
      },
    });

  } catch (error) {
    console.error('Fetch user bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
