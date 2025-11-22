import { amadeusClient } from '@/lib/amadeus-client';
import { skyscannerClient } from '@/lib/skyscanner-client';
import { prisma } from '@/lib/db';
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

    // No database fallback - all flight data comes from external APIs
    // If external APIs fail, return empty results with error message
    if (flights.length === 0) {
      return NextResponse.json({
        success: false,
        flights: [],
        count: 0,
        message: 'No flights found. External flight APIs may be unavailable.',
        sources: [],
      });
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
