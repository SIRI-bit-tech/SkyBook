import { amadeusClient } from '@/lib/amadeus-client';
import { skyscannerClient } from '@/lib/skyscanner-client';
import { connectToDatabase } from '@/lib/mongodb';
import { FlightModel } from '@/models/Flight';
import { AirportModel } from '@/models/Airport';
import { AirlineModel } from '@/models/Airline';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const {
      departureCity,
      arrivalCity,
      departureDate,
      returnDate,
      passengers = 1,
      cabinClass = 'economy',
      tripType = 'oneway',
    } = await request.json();

    const flights = [];

    // Try external APIs first
    try {
      const departureCode = departureCity.toUpperCase();
      const arrivalCode = arrivalCity.toUpperCase();

      // Amadeus API search
      const amadeusFlights = await amadeusClient.searchFlights(
        departureCode,
        arrivalCode,
        departureDate,
        passengers,
        0,
        0,
        returnDate && tripType !== 'oneway' ? returnDate : undefined
      );

      if (amadeusFlights && amadeusFlights.length > 0) {
        flights.push(
          ...amadeusFlights.map((flight: any) => ({
            source: 'amadeus',
            ...flight,
          }))
        );
      }

      // Skyscanner price comparison
      const skyscannerPrices = await skyscannerClient.searchPrices(
        departureCode,
        arrivalCode,
        departureDate,
        returnDate && tripType !== 'oneway' ? returnDate : undefined,
        passengers
      );

      if (skyscannerPrices && skyscannerPrices.length > 0) {
        flights.push(
          ...skyscannerPrices.map((price: any) => ({
            source: 'skyscanner',
            ...price,
          }))
        );
      }
    } catch (externalError) {
      console.warn('External API search failed, falling back to database:', externalError);
    }

    // Fallback to database search
    if (flights.length === 0) {
      await connectToDatabase();

      const departureAirport = await AirportModel.findOne({
        $or: [
          { code: departureCity.toUpperCase() },
          { city: new RegExp(departureCity, 'i') },
        ],
      });

      const arrivalAirport = await AirportModel.findOne({
        $or: [
          { code: arrivalCity.toUpperCase() },
          { city: new RegExp(arrivalCity, 'i') },
        ],
      });

      if (departureAirport && arrivalAirport) {
        const startDate = new Date(departureDate);
        const endDate = new Date(departureDate);
        endDate.setDate(endDate.getDate() + 1);

        const query: any = {
          'departure.airport': departureAirport._id,
          'arrival.airport': arrivalAirport._id,
          'departure.time': { $gte: startDate, $lt: endDate },
          status: 'scheduled',
        };

        const dbFlights = await FlightModel.find(query)
          .populate('airline')
          .populate('departure.airport')
          .populate('arrival.airport')
          .sort({ 'departure.time': 1 });

        flights.push(
          ...dbFlights.map((flight: any) => ({
            source: 'database',
            ...flight.toObject(),
          }))
        );
      }
    }

    // Remove duplicates and sort
    const uniqueFlights = Array.from(
      new Map(
        flights.map((flight: any) => [
          `${flight.flightNumber || flight.id}-${flight.price?.total || flight.minPrice}`,
          flight,
        ])
      ).values()
    );

    return NextResponse.json({
      success: true,
      flights: uniqueFlights.sort((a: any, b: any) => {
        const priceA = parseFloat(a.price?.total || a.minPrice || 0);
        const priceB = parseFloat(b.price?.total || b.minPrice || 0);
        return priceA - priceB;
      }),
      count: uniqueFlights.length,
      sources: [...new Set(flights.map((f: any) => f.source))],
    });
  } catch (error) {
    console.error('External flight search error:', error);
    return NextResponse.json(
      { error: 'Failed to search flights from external sources' },
      { status: 500 }
    );
  }
}
