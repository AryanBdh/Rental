import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  // auto-generate a unique categoryId to avoid duplicate-null index errors
  categoryId: { type: String, unique: true, index: true, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true, unique: true },
  description: { type: String },
}, {
  versionKey: false,
  timestamps: true,
})

export default mongoose.model('Category', categorySchema)
