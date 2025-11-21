import mongoose from 'mongoose';

const PassengerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  passportNumber: { type: String },
  nationality: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
});

const AddOnSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
});

const BookingAddOnsSchema = new mongoose.Schema({
  baggage: { type: Number, default: 1 },
  meals: { type: String, default: 'standard' },
  specialRequests: { type: String, default: '' },
  travelInsurance: { type: Boolean, default: false },
  selectedAddOns: [AddOnSchema],
});

const BookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true,
  },
  passengers: [PassengerSchema],
  seats: [{
    type: String,
    required: true,
  }],
  addOns: {
    type: BookingAddOnsSchema,
    default: {},
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'cancelled'],
    default: 'pending',
  },
  qrCode: {
    type: String,
    required: true,
  },
  ticketUrl: {
    type: String,
    required: true,
  },
  checkedInAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
BookingSchema.index({ user: 1, createdAt: -1 });
BookingSchema.index({ flight: 1 });
BookingSchema.index({ status: 1 });

export const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);