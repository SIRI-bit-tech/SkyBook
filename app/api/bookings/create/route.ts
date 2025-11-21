import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Booking } from '@/models/Booking';
import { FlightModel } from '@/models/Flight';
import { getSession } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get user session
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      flightId,
      passengers,
      seats,
      addOns,
      totalPrice,
      paymentToken,
      billingDetails,
    } = body;

    // Validate required fields with strict checks
    if (
      !flightId ||
      !Array.isArray(passengers) || passengers.length === 0 ||
      !Array.isArray(seats) || seats.length === 0 ||
      seats.length !== passengers.length ||
      typeof totalPrice !== 'number' || totalPrice <= 0
    ) {
      return NextResponse.json(
        { error: 'Invalid input: check passengers, seats (must match count), and totalPrice (must be positive)' },
        { status: 400 }
      );
    }

    // Verify flight exists first
    const flight = await FlightModel.findById(flightId);
    if (!flight) {
      return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
    }

    // Atomic update: check availability and reserve seats in one operation
    // This prevents race conditions by ensuring seats are only reserved if they're available
    const result = await FlightModel.updateOne(
      {
        _id: flightId,
        'seatMap.reserved': { $nin: seats }, // None of the requested seats are already reserved
        availableSeats: { $gte: seats.length }, // Enough seats available
      },
      {
        $push: { 'seatMap.reserved': { $each: seats } },
        $inc: { availableSeats: -seats.length },
      }
    );

    // If no document was modified, seats are no longer available
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Selected seats are no longer available' },
        { status: 409 }
      );
    }

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
            flightId,
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
        // Release the reserved seats if payment fails
        await FlightModel.updateOne(
          { _id: flightId },
          {
            $pull: { 'seatMap.reserved': { $in: seats } },
            $inc: { availableSeats: seats.length },
          }
        );
        return NextResponse.json(
          { error: stripeError.message || 'Payment processing failed' },
          { status: 402 }
        );
      }
    }

    // Generate booking reference
    const bookingReference = `SB${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    // Create booking
    const booking = new Booking({
      bookingReference,
      user: session.user.id,
      flight: flightId,
      passengers: passengers.map((p: any) => ({
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: new Date(p.dateOfBirth),
        passportNumber: p.passportNumber,
        nationality: p.nationality,
        email: p.email,
        phone: p.phone,
      })),
      seats,
      addOns: addOns || {},
      totalPrice,
      paymentId,
      status: bookingStatus,
      qrCode: `qr_${bookingReference}`,
      ticketUrl: `/booking/ticket/${bookingReference}`,
    });

    await booking.save();

    // Populate booking with flight and user data for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('flight')
      .populate('user', 'firstName lastName email');

    // Generate ticket and send email asynchronously (don't wait for it)
    if (bookingStatus === 'confirmed') {
      // Import ticket generation functions
      const { generateQRCode } = await import('@/lib/qr-generator');
      const { generateTicketPDF } = await import('@/lib/pdf-ticket-generator');
      const { sendTicketEmail } = await import('@/lib/email-service');
      
      // Generate and send ticket in background
      Promise.resolve().then(async () => {
        try {
          const qrCodeDataUrl = await generateQRCode(bookingReference, booking._id.toString());
          const pdfBuffer = await generateTicketPDF(populatedBooking);
          
          // Update booking with QR code
          await Booking.findByIdAndUpdate(booking._id, {
            qrCode: qrCodeDataUrl,
            ticketUrl: `/api/tickets/download/${bookingReference}`,
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