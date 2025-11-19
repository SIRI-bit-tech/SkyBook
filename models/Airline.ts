import mongoose, { Schema, Document } from 'mongoose';
import { Airline } from '@/types/global';

interface IAirline extends Document, Airline {}

const airlineSchema = new Schema<IAirline>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    logo: {
      type: String,
      required: true,
    },
    country: String,
    description: String,
    website: String,
    popularRoutes: [String],
    fleetSize: Number,
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const AirlineModel =
  mongoose.models.Airline || mongoose.model<IAirline>('Airline', airlineSchema);
