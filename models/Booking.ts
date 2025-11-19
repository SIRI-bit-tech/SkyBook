import mongoose, { Schema, Document, Types } from 'mongoose';
import { Booking } from '@/types/global';

interface IBooking extends Omit<Booking, '_id' | 'user' | 'flight' | 'passengers' | 'paymentId'>, Document {
  user: Types.ObjectId;
  flight: Types.ObjectId;
  passengers: Types.ObjectId[];
  paymentId?: Types.ObjectId;
  baggage?: number;
  meals?: 'none' | 'standard' | 'vegetarian' | 'vegan' | 'halal' | 'kosher';
  specialRequests?: string;
  travelInsurance?: boolean;
  insurancePrice?: number;
  addOns?: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  baseFare?: number;
  taxes?: number;
  addOnTotal?: number;
}

const bookingSchema = new Schema<IBooking>(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    flight: {
      type: Schema.Types.ObjectId,
      ref: 'Flight',
      required: true,
    },
    passengers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Passenger',
      },
    ],
    seats: [String],
    totalPrice: Number,
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked-in', 'cancelled'],
      default: 'pending',
    },
    qrCode: String,
    ticketUrl: String,
    checkedInAt: Date,
    baggage: {
      type: Number,
      default: 1,
      description: 'Number of baggage allowance'
    },
    meals: {
      type: String,
      enum: ['none', 'standard', 'vegetarian', 'vegan', 'halal', 'kosher'],
      default: 'none'
    },
    specialRequests: {
      type: String,
      maxLength: 500
    },
    travelInsurance: {
      type: Boolean,
      default: false
    },
    insurancePrice: {
      type: Number,
      default: 0
    },
    addOns: [{
      name: String,
      price: Number,
      quantity: Number
    }],
    baseFare: Number,
    taxes: Number,
    addOnTotal: Number,
  },
  {
    timestamps: true,
  }
);

export const BookingModel =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);
