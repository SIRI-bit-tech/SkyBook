import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    
    // Validate and sanitize pagination parameters
    const pageParam = parseInt(searchParams.get('page') || '1');
    const limitParam = parseInt(searchParams.get('limit') || '20');
    
    const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const maxLimit = 100;
    const limit = isNaN(limitParam) ? 20 : Math.min(Math.max(limitParam, 1), maxLimit);
    
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.bookingReference = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          flight: {
            include: {
              airline: {
                select: {
                  name: true,
                  code: true,
                  logo: true,
                },
              },
              departureAirport: {
                select: {
                  name: true,
                  code: true,
                  city: true,
                },
              },
              arrivalAirport: {
                select: {
                  name: true,
                  code: true,
                  city: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    
    // Handle authentication/authorization errors
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (errorMessage.includes('Forbidden') || errorMessage.includes('Admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
