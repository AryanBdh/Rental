import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  placeholder: { type: String }
}, { versionKey: false })

export default mongoose.model('Payment', paymentSchema)
