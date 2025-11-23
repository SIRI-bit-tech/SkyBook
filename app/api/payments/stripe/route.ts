import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover",
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, bookingId } = await request.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency || "usd",
      metadata: { bookingId },
    });

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        currency: currency || "USD",
        stripePaymentId: paymentIntent.id,
        status: "pending",
      },
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
