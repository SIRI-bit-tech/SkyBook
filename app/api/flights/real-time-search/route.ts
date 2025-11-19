import { connectToDatabase } from "@/lib/mongodb";
import { FlightModel } from "@/models/Flight";
import { AirlineModel } from "@/models/Airline";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { departure, arrival, departureDate, passengers, airlines, maxPrice, maxStops } = await request.json();

    const departureCode = departure.split("(")[0].trim().toUpperCase();
    const arrivalCode = arrival.split("(")[0].trim().toUpperCase();

    const startDate = new Date(departureDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(departureDate);
    endDate.setHours(23, 59, 59, 999);

    let query: any = {
      "departure.code": departureCode,
      "arrival.code": arrivalCode,
      "departure.time": { $gte: startDate, $lte: endDate },
      status: "scheduled",
    };

    if (airlines && airlines.length > 0) {
      query.airlineCode = { $in: airlines };
    }

    if (maxPrice) {
      query["price.economy"] = { $lte: maxPrice };
    }

    if (maxStops !== null && maxStops !== undefined) {
      query.stops = { $lte: maxStops };
    }

    const flights = await FlightModel.find(query)
      .populate("airline")
      .populate("departure.airport")
      .populate("arrival.airport")
      .sort({ "departure.time": 1, "price.economy": 1 })
      .lean();

    // Get airlines available on this route
    const availableAirlines = await AirlineModel.find({
      _id: { $in: flights.map((f: any) => f.airline?._id).filter(Boolean) },
    });

    return NextResponse.json({
      success: true,
      flights: flights || [],
      airlines: availableAirlines || [],
      count: flights?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Real-time Flight Search Error]", error);
    return NextResponse.json({ error: "Failed to search flights" }, { status: 500 });
  }
}
