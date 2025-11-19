import mongoose, { Schema, Document } from 'mongoose';
import { Payment } from '@/types/global';

interface IPayment extends Document, Payment {}

const paymentSchema = new Schema<IPayment>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    stripePaymentId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: String,
  },
  {
    timestamps: true,
  }
);

export const PaymentModel =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', paymentSchema);
