import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { FlightModel } from '@/models/Flight';
import { AirlineModel } from '@/models/Airline';
import { UserModel } from '@/models/User';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const [
      totalBookings,
      confirmedBookings,
      totalFlights,
      activeFlights,
      totalAirlines,
      totalUsers,
      revenueData,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      FlightModel.countDocuments(),
      FlightModel.countDocuments({ status: 'scheduled' }),
      AirlineModel.countDocuments({ isActive: true }),
      UserModel.countDocuments({ role: 'user' }),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'checked-in'] } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' },
            averagePrice: { $avg: '$totalPrice' },
          },
        },
      ]),
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, averagePrice: 0 };

    return NextResponse.json({
      stats: {
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          pending: totalBookings - confirmedBookings,
        },
        flights: {
          total: totalFlights,
          active: activeFlights,
        },
        airlines: {
          total: totalAirlines,
        },
        users: {
          total: totalUsers,
        },
        revenue: {
          total: revenue.totalRevenue,
          average: revenue.averagePrice,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
