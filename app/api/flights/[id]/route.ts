import { connectToDatabase } from "@/lib/mongodb";
import { FlightModel } from "@/models/Flight";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const flight = await FlightModel.findById(params.id)
      .populate("airline")
      .populate("departure.airport")
      .populate("arrival.airport");

    if (!flight) {
      return NextResponse.json({ error: "Flight not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, flight });
  } catch (error) {
    console.error("[Get Flight Error]", error);
    return NextResponse.json({ error: "Failed to fetch flight" }, { status: 500 });
  }
}
