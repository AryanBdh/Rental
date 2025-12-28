import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  totalAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
}, {
  versionKey: false,
  timestamps: true,
})

export default mongoose.model('Booking', bookingSchema)
