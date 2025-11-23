import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    // Fetch stats from database (only user-generated data)
    // Note: Flights and airlines come from Amadeus API, not database
    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalUsers,
      revenueData,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'confirmed' } }),
      prisma.booking.count({ where: { status: 'cancelled' } }),
      prisma.user.count({ where: { role: 'user' } }),
      prisma.booking.aggregate({
        where: { status: { in: ['confirmed', 'checked-in'] } },
        _sum: { totalPrice: true },
        _avg: { totalPrice: true },
      }),
    ]);

    const revenue = {
      totalRevenue: revenueData._sum.totalPrice || 0,
      averagePrice: revenueData._avg.totalPrice || 0,
    };

    return NextResponse.json({
      stats: {
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          cancelled: cancelledBookings,
          pending: totalBookings - confirmedBookings - cancelledBookings,
        },
        users: {
          total: totalUsers,
        },
        revenue: {
          total: revenue.totalRevenue,
          average: revenue.averagePrice,
        },
      },
      note: 'Flight and airline data comes from Amadeus API, not stored in database',
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
