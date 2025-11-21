import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { FlightModel } from '@/models/Flight';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await context.params;
    const flight = await FlightModel.findById(id)
      .populate('airline', 'name code logo')
      .populate('departure.airport', 'name code city')
      .populate('arrival.airport', 'name code city')
      .lean();

    if (!flight) {
      return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
    }

    return NextResponse.json({ flight });
  } catch (error) {
    console.error('Error fetching flight:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flight' },
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

    const flight = await FlightModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('airline', 'name code logo')
      .populate('departure.airport', 'name code city')
      .populate('arrival.airport', 'name code city')
      .lean();

    if (!flight) {
      return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
    }

    return NextResponse.json({ flight });
  } catch (error) {
    console.error('Error updating flight:', error);
    return NextResponse.json(
      { error: 'Failed to update flight' },
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
    const flight = await FlightModel.findByIdAndDelete(id);

    if (!flight) {
      return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Flight deleted successfully' });
  } catch (error) {
    console.error('Error deleting flight:', error);
    return NextResponse.json(
      { error: 'Failed to delete flight' },
      { status: 500 }
    );
  }
}
