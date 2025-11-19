import { connectToDatabase } from "@/lib/mongodb";
import { FlightModel } from "@/models/Flight";
import { AirlineModel } from "@/models/Airline";

export interface FlightFilter {
  departure: string;
  arrival: string;
  departureDate: string;
  passengers: number;
  airlines?: string[];
  maxPrice?: number;
  stops?: number;
  departureTimeRange?: { start: string; end: string };
}

export async function fetchRealTimeFlights(filters: FlightFilter) {
  try {
    await connectToDatabase();

    const {
      departure,
      arrival,
      departureDate,
      airlines,
      maxPrice,
      stops,
      departureTimeRange,
    } = filters;

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

    // Filter by airlines if specified
    if (airlines && airlines.length > 0) {
      query.airlineCode = { $in: airlines };
    }

    // Filter by max price
    if (maxPrice) {
      query["price.economy"] = { $lte: maxPrice };
    }

    // Filter by stops
    if (stops !== undefined && stops !== null) {
      query.stops = stops;
    }

    // Filter by departure time range
    if (departureTimeRange) {
      const [startHour, startMin] = departureTimeRange.start.split(":").map(Number);
      const [endHour, endMin] = departureTimeRange.end.split(":").map(Number);

      const startTime = new Date(departureDate);
      startTime.setHours(startHour, startMin, 0, 0);

      const endTime = new Date(departureDate);
      endTime.setHours(endHour, endMin, 59, 999);

      query["departure.time"] = {
        $gte: startTime,
        $lte: endTime,
      };
    }

    const flights = await FlightModel.find(query)
      .populate("airline")
      .populate("departure.airport")
      .populate("arrival.airport")
      .sort({ "departure.time": 1, "price.economy": 1 })
      .lean();

    return {
      success: true,
      flights: flights || [],
      count: flights?.length || 0,
    };
  } catch (error) {
    console.error("[Real-time Flight Fetch Error]", error);
    throw new Error("Failed to fetch real-time flights");
  }
}

// Get available airlines for a route
export async function getAirlinesForRoute(departure: string, arrival: string) {
  try {
    await connectToDatabase();

    const departureCode = departure.split("(")[0].trim().toUpperCase();
    const arrivalCode = arrival.split("(")[0].trim().toUpperCase();

    const airlines = await FlightModel.distinct("airlineCode", {
      "departure.code": departureCode,
      "arrival.code": arrivalCode,
      status: "scheduled",
    });

    const airlineDetails = await AirlineModel.find({
      code: { $in: airlines },
    }).lean();

    return airlineDetails || [];
  } catch (error) {
    console.error("[Get Airlines Error]", error);
    return [];
  }
}

// Subscribe to real-time flight updates
export async function subscribeToFlightUpdates(
  departure: string,
  arrival: string,
  departureDate: string,
  callback: (flights: any[]) => void
) {
  // This would integrate with WebSocket or Server-Sent Events for real-time updates
  const interval = setInterval(async () => {
    try {
      const result = await fetchRealTimeFlights({
        departure,
        arrival,
        departureDate,
        passengers: 1,
      });
      callback(result.flights);
    } catch (error) {
      console.error("[Subscribe Error]", error);
    }
  }, 5000); // Update every 5 seconds

  return () => clearInterval(interval);
}
