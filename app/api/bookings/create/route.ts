import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      flightData, // Flight snapshot from Amadeus API
      passengers,
      seats,
      addOns,
      totalPrice,
      paymentToken,
      billingDetails,
    } = body;

    // Validate required fields with strict checks
    if (
      !flightData ||
      !flightData.flightNumber ||
      !flightData.airlineCode ||
      !flightData.departureAirport ||
      !flightData.arrivalAirport ||
      !Array.isArray(passengers) || passengers.length === 0 ||
      !Array.isArray(seats) || seats.length === 0 ||
      seats.length !== passengers.length ||
      typeof totalPrice !== 'number' || totalPrice <= 0
    ) {
      return NextResponse.json(
        { error: 'Invalid input: check flight data, passengers, seats (must match count), and totalPrice (must be positive)' },
        { status: 400 }
      );
    }

    // Note: Seat availability is checked in real-time via Amadeus API
    // before the user reaches this point. We trust the frontend validation
    // since flight data is ephemeral and comes from API.

    // Process payment with Stripe if token provided
    let paymentId = `payment_${Date.now()}`;
    let bookingStatus: 'pending' | 'confirmed' = 'pending';

    if (paymentToken) {
      try {
        // Import Stripe
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
          apiVersion: '2025-11-17.clover',
        });

        // Create charge using the token
        const charge = await stripe.charges.create({
          amount: Math.round(totalPrice * 100), // Convert to cents
          currency: 'usd',
          source: paymentToken,
          description: `Flight booking for ${passengers.length} passenger(s)`,
          metadata: {
            flightNumber: flightData.flightNumber,
            userId: session.user.id,
            seats: seats.join(', '),
          },
        });

        if (charge.status === 'succeeded') {
          paymentId = charge.id;
          bookingStatus = 'confirmed';
        } else {
          return NextResponse.json(
            { error: 'Payment failed. Please try again.' },
            { status: 402 }
          );
        }
      } catch (stripeError: any) {
        console.error('Stripe payment error:', stripeError);
        // Note: No need to release seats since we don't track them in database
        // Seat availability is managed by Amadeus API
        return NextResponse.json(
          { error: stripeError.message || 'Payment processing failed' },
          { status: 402 }
        );
      }
    }

    // Generate booking reference
    const bookingReference = `SB${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    // Create passengers first
    const createdPassengers = await Promise.all(
      passengers.map((p: any) =>
        prisma.passenger.create({
          data: {
            firstName: p.firstName,
            lastName: p.lastName,
            dateOfBirth: new Date(p.dateOfBirth),
            passportNumber: p.passportNumber,
            nationality: p.nationality,
            email: p.email,
            phone: p.phone,
          },
        })
      )
    );

    // Create booking with flight snapshot
    const booking = await prisma.booking.create({
      data: {
        bookingReference,
        userId: session.user.id,
        
        // Flight snapshot from Amadeus API
        flightNumber: flightData.flightNumber,
        airlineCode: flightData.airlineCode,
        airlineName: flightData.airlineName,
        
        departureAirport: flightData.departureAirport,
        departureCity: flightData.departureCity,
        departureTime: new Date(flightData.departureTime),
        departureTerminal: flightData.departureTerminal || null,
        
        arrivalAirport: flightData.arrivalAirport,
        arrivalCity: flightData.arrivalCity,
        arrivalTime: new Date(flightData.arrivalTime),
        arrivalTerminal: flightData.arrivalTerminal || null,
        
        aircraft: flightData.aircraft || null,
        duration: flightData.duration || 0,
        
        seats,
        totalPrice,
        currency: flightData.currency || 'USD',
        
        baggage: addOns?.baggage || 0,
        meals: addOns?.meals || null,
        specialRequests: addOns?.specialRequests || null,
        travelInsurance: addOns?.travelInsurance || false,
        
        paymentId,
        status: bookingStatus,
        qrCode: `qr_${bookingReference}`,
        ticketUrl: `/booking/ticket/${bookingReference}`,
        
        passengers: {
          create: createdPassengers.map((passenger: any) => ({
            passengerId: passenger.id,
          })),
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        passengers: {
          include: {
            passenger: true,
          },
        },
      },
    });

    const populatedBooking = booking;

    // Generate ticket and send email asynchronously (don't wait for it)
    if (bookingStatus === 'confirmed') {
      // Import ticket generation functions
      const { generateQRCode } = await import('@/lib/qr-generator');
      const { generateTicketPDF } = await import('@/lib/pdf-ticket-generator');
      const { sendTicketEmail } = await import('@/lib/email-service');
      
      // Generate and send ticket in background
      Promise.resolve().then(async () => {
        try {
          const qrCodeDataUrl = await generateQRCode(bookingReference, booking.id);
          const pdfBuffer = await generateTicketPDF(populatedBooking);
          
          // Update booking with QR code
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              qrCode: qrCodeDataUrl,
              ticketUrl: `/api/tickets/download/${bookingReference}`,
            },
          });
          
          // Send email
          await sendTicketEmail({
            booking: populatedBooking,
            pdfBuffer,
            qrCodeDataUrl,
          });
        } catch (error) {
          console.error('Background ticket generation error:', error);
        }
      });
    }

    return NextResponse.json({
      success: true,
      booking: populatedBooking,
      bookingReference,
      message: 'Booking created successfully',
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}