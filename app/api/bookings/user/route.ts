import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { getSession } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
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

    // Build query
    const query: any = { user: session.user.id };
    if (status) {
      query.status = status;
    }

    // Fetch bookings with pagination
    const bookings = await Booking.find(query)
      .populate('flight')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Booking.countDocuments(query);

    return NextResponse.json({
      success: true,
      bookings,
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
