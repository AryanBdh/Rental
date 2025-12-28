import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  reviewId: { type: String, unique: true, index: true },
  renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  rating: { type: Number, min: 1, max: 5 },
  description: { type: String },
}, {
  versionKey: false,
  timestamps: true,
})

export default mongoose.model('Review', reviewSchema)
