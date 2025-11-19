import Stripe from "stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { PaymentModel } from "@/models/Payment";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20",
});

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { amount, currency, bookingId } = await request.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency || "usd",
      metadata: { bookingId },
    });

    const payment = await PaymentModel.create({
      booking: bookingId,
      amount,
      currency,
      stripePaymentId: paymentIntent.id,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      payment,
    });
  } catch (error) {
    console.error("[Stripe Payment Error]", error);
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}
