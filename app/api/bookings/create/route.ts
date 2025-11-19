import { connectToDatabase } from "@/lib/mongodb";
import { BookingModel } from "@/models/Booking";
import { FlightModel } from "@/models/Flight";
import { PaymentModel } from "@/models/Payment";
import { PassengerModel } from "@/models/Passenger";
import { generateBookingReference } from "@/config/constants";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { userId, flightId, passengers, seats, totalPrice, paymentId } = await request.json();

    // Verify flight exists
    const flight = await FlightModel.findById(flightId);
    if (!flight) {
      return NextResponse.json({ error: "Flight not found" }, { status: 404 });
    }

    // Check seat availability
    const unavailableSeats = seats.filter((seat: string) =>
      flight.seatMap.reserved.includes(seat)
    );

    if (unavailableSeats.length > 0) {
      return NextResponse.json(
        { error: `Seats ${unavailableSeats.join(", ")} are not available` },
        { status: 400 }
      );
    }

    // Create passengers
    const passengerIds = await Promise.all(
      passengers.map((p: any) => PassengerModel.create(p).then((doc) => doc._id))
    );

    // Create booking
    const bookingReference = generateBookingReference();
    const booking = await BookingModel.create({
      bookingReference,
      user: userId,
      flight: flightId,
      passengers: passengerIds,
      seats,
      totalPrice,
      paymentId,
      status: "confirmed",
    });

    // Update flight seat map
    flight.seatMap.reserved.push(...seats);
    flight.availableSeats -= seats.length;
    await flight.save();

    return NextResponse.json({
      success: true,
      booking,
      bookingReference,
    });
  } catch (error) {
    console.error("[Create Booking Error]", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
