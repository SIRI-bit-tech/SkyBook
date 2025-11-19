import { connectToDatabase } from "@/lib/mongodb";
import { AirlineModel } from "@/models/Airline";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const airlines = await AirlineModel.find({ isActive: true }).sort({ isFeatured: -1, name: 1 });

    return NextResponse.json({
      success: true,
      airlines,
      count: airlines.length,
    });
  } catch (error) {
    console.error("[Get Airlines Error]", error);
    return NextResponse.json({ error: "Failed to fetch airlines" }, { status: 500 });
  }
}
