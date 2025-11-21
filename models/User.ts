import mongoose, { Schema, Document, Types } from 'mongoose';
import { User } from '@/types/global';
import bcrypt from 'bcryptjs';

interface IUser extends Omit<User, '_id' | 'savedPassengers'>, Document {
  savedPassengers: Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness for non-null values
    },
    password: String,
    firstName: String,
    lastName: String,
    phone: String,
    dateOfBirth: Date,
    passportNumber: String,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    savedPassengers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Passenger',
      },
    ],
    paymentMethods: [],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (err) {
    next(err as Error);
  }
});

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);
