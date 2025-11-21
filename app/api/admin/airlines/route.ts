import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AirlineModel } from '@/models/Airline';
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
    
    const search = searchParams.get('search');

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [airlines, total] = await Promise.all([
      AirlineModel.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AirlineModel.countDocuments(query),
    ]);

    return NextResponse.json({
      airlines,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching airlines:', error);
    
    // Handle authentication/authorization errors
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (errorMessage.includes('Forbidden') || errorMessage.includes('Admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch airlines' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const data = await request.json();
    const airline = await AirlineModel.create(data);

    return NextResponse.json({ airline }, { status: 201 });
  } catch (error) {
    console.error('Error creating airline:', error);
    
    // Handle authentication/authorization errors
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (errorMessage.includes('Forbidden') || errorMessage.includes('Admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: 'Failed to create airline' },
      { status: 500 }
    );
  }
}
