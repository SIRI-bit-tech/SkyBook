import { connectToDatabase } from '@/lib/mongodb';
import { AirlineModel } from '@/models/Airline';
import { FlightModel } from '@/models/Flight';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    await connectToDatabase();

    const airline = await AirlineModel.findOne({ code: params.code.toUpperCase() });

    if (!airline) {
      return NextResponse.json({ error: 'Airline not found' }, { status: 404 });
    }

    // Get flights for this airline
    const flights = await FlightModel.find({ airline: airline._id })
      .populate('departure.airport')
      .populate('arrival.airport')
      .sort({ 'departure.time': 1 });

    return NextResponse.json({
      success: true,
      airline,
      flights,
    });
  } catch (error) {
    console.error('[Get Airline Error]', error);
    return NextResponse.json({ error: 'Failed to fetch airline' }, { status: 500 });
  }
}
