import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { FlightModel } from '@/models/Flight';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    
    // Validate and sanitize pagination parameters
    const pageParam = parseInt(searchParams.get('page') || '1');
    const limitParam = parseInt(searchParams.get('limit') || '20');
    
    const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const maxLimit = 100;
    const limit = isNaN(limitParam) ? 20 : Math.min(Math.max(limitParam, 1), maxLimit);
    
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { flightNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [flights, total] = await Promise.all([
      FlightModel.find(query)
        .populate('airline', 'name code logo')
        .populate('departure.airport', 'name code city')
        .populate('arrival.airport', 'name code city')
        .sort({ 'departure.time': -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FlightModel.countDocuments(query),
    ]);

    return NextResponse.json({
      flights,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching flights:', error);
    
    // Handle authentication/authorization errors
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (errorMessage.includes('Forbidden') || errorMessage.includes('Admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch flights' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const data = await request.json();
    const flight = await FlightModel.create(data);

    return NextResponse.json({ flight }, { status: 201 });
  } catch (error) {
    console.error('Error creating flight:', error);
    
    // Handle authentication/authorization errors
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (errorMessage.includes('Forbidden') || errorMessage.includes('Admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: 'Failed to create flight' },
      { status: 500 }
    );
  }
}
