import mongoose, { Schema, Document } from 'mongoose';
import { Passenger } from '@/types/global';

interface IPassenger extends Omit<Passenger, '_id'>, Document {}

const passengerSchema = new Schema<IPassenger>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    passportNumber: String,
    nationality: String,
    email: String,
    phone: String,
  },
  {
    timestamps: true,
  }
);

export const PassengerModel =
  mongoose.models.Passenger || mongoose.model<IPassenger>('Passenger', passengerSchema);
