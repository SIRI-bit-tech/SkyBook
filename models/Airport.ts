import mongoose, { Schema, Document } from 'mongoose';
import { Airport } from '@/types/global';

interface IAirport extends Document, Airport {}

const airportSchema = new Schema<IAirport>(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    city: String,
    country: String,
    timezone: String,
  },
  {
    timestamps: true,
  }
);

export const AirportModel =
  mongoose.models.Airport || mongoose.model<IAirport>('Airport', airportSchema);
