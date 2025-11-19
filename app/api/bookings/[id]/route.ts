import { connectToDatabase } from "@/lib/mongodb";
import { BookingModel } from "@/models/Booking";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const booking = await BookingModel.findById(params.id)
      .populate("flight")
      .populate("passengers")
      .populate("user");

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("[Get Booking Error]", error);
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}
