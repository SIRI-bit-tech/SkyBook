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
    
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    const where: any = {};
    if (role && role !== 'all') {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Handle authentication/authorization errors
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (errorMessage.includes('Forbidden') || errorMessage.includes('Admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
