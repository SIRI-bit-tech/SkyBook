import { NextResponse } from 'next/server';
import { duffelClient } from '@/lib/duffel-client';
import { requireAdmin } from '@/lib/auth-server';

/**
 * Admin Airline Details - READ ONLY
 * 
 * Fetches specific airline data from Duffel API.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    
    // Treat ID as airline code
    const airline = await duffelClient.getAirline(id.toUpperCase());

    if (!airline) {
      return NextResponse.json({ error: 'Airline not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      airline,
      source: 'duffel-api',
    });
  } catch (error) {
    console.error('Error fetching airline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airline from API' },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  return NextResponse.json({
    error: 'Airline updates disabled',
    message: 'Cannot update airlines. Airline data is managed by Duffel API.',
  }, { status: 410 });
}

export async function DELETE() {
  return NextResponse.json({
    error: 'Airline deletion disabled',
    message: 'Cannot delete airlines. Airline data is managed by Duffel API.',
  }, { status: 410 });
}
