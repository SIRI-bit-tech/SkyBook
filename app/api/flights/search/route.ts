import { connectToDatabase } from "@/lib/mongodb";
import { FlightModel } from "@/models/Flight";
import { AirlineModel } from "@/models/Airline";
import { AirportModel } from "@/models/Airport";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { departureCity, arrivalCity, departureDate, passengers, cabinClass, airlines } = await request.json();

    const departureAirport = await AirportModel.findOne({
      $or: [{ code: departureCity.toUpperCase() }, { city: departureCity }],
    });

    const arrivalAirport = await AirportModel.findOne({
      $or: [{ code: arrivalCity.toUpperCase() }, { city: arrivalCity }],
    });

    if (!departureAirport || !arrivalAirport) {
      return NextResponse.json({ error: "Airport not found" }, { status: 404 });
    }

    const startDate = new Date(departureDate);
    const endDate = new Date(departureDate);
    endDate.setDate(endDate.getDate() + 1);

    let query: any = {
      "departure.airport": departureAirport._id,
      "arrival.airport": arrivalAirport._id,
      "departure.time": { $gte: startDate, $lt: endDate },
      status: "scheduled",
    };

    if (airlines && airlines.length > 0) {
      query.airline = { $in: airlines };
    }

    const flights = await FlightModel.find(query)
      .populate("airline")
      .populate("departure.airport")
      .populate("arrival.airport")
      .sort({ "departure.time": 1 });

    return NextResponse.json({
      success: true,
      flights,
      count: flights.length,
    });
  } catch (error) {
    console.error("[Flight Search Error]", error);
    return NextResponse.json({ error: "Failed to search flights" }, { status: 500 });
  }
}
