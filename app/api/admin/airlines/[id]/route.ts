import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AirlineModel } from '@/models/Airline';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await context.params;
    const airline = await AirlineModel.findById(id).lean();

    if (!airline) {
      return NextResponse.json({ error: 'Airline not found' }, { status: 404 });
    }

    return NextResponse.json({ airline });
  } catch (error) {
    console.error('Error fetching airline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airline' },
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
    await connectToDatabase();

    const { id } = await context.params;
    const data = await request.json();

    const airline = await AirlineModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    if (!airline) {
      return NextResponse.json({ error: 'Airline not found' }, { status: 404 });
    }

    return NextResponse.json({ airline });
  } catch (error) {
    console.error('Error updating airline:', error);
    return NextResponse.json(
      { error: 'Failed to update airline' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await context.params;
    const airline = await AirlineModel.findByIdAndDelete(id);

    if (!airline) {
      return NextResponse.json({ error: 'Airline not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Airline deleted successfully' });
  } catch (error) {
    console.error('Error deleting airline:', error);
    return NextResponse.json(
      { error: 'Failed to delete airline' },
      { status: 500 }
    );
  }
}
