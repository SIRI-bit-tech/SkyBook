import mongoose, { Schema, Document } from 'mongoose';
import { Flight } from '@/types/global';

interface IFlight extends Document, Flight {}

const flightSchema = new Schema<IFlight>(
  {
    flightNumber: {
      type: String,
      required: true,
      unique: true,
    },
    airline: {
      type: Schema.Types.ObjectId,
      ref: 'Airline',
      required: true,
    },
    departure: {
      airport: {
        type: Schema.Types.ObjectId,
        ref: 'Airport',
        required: true,
      },
      time: {
        type: Date,
        required: true,
      },
      terminal: String,
    },
    arrival: {
      airport: {
        type: Schema.Types.ObjectId,
        ref: 'Airport',
        required: true,
      },
      time: {
        type: Date,
        required: true,
      },
      terminal: String,
    },
    aircraft: String,
    seatMap: {
      rows: Number,
      columns: [String],
      reserved: [String],
    },
    availableSeats: Number,
    price: {
      economy: Number,
      business: Number,
      firstClass: Number,
    },
    status: {
      type: String,
      enum: ['scheduled', 'delayed', 'cancelled', 'completed'],
      default: 'scheduled',
    },
    duration: Number,
  },
  {
    timestamps: true,
  }
);

export const FlightModel =
  mongoose.models.Flight || mongoose.model<IFlight>('Flight', flightSchema);
