import mongoose from 'mongoose'

const itemSchema = new mongoose.Schema({
  itemId: { type: String, unique: true, index: true, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  description: { type: String },
  location: { type: String },
  images: [{ type: String }],
  condition: { type: String, enum: ['new', 'like-new', 'good', 'fair', 'poor'], default: 'good' },
  price: { type: Number, required: true },
  priceUnit: { type: String, enum: ['day','month'], default: 'day' },
  availability: { type: Boolean, default: true },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
}, {
  versionKey: false,
  timestamps: true,
})

itemSchema.methods.toJSON = function() {
  const obj = this.toObject()

  // Normalize images to absolute URLs if needed. Use SERVER_URL env var if available.
  const base = process.env.SERVER_URL ? process.env.SERVER_URL.replace(/\/$/, '') : 'http://localhost:5000'

  if (obj.images && Array.isArray(obj.images) && obj.images.length > 0) {
    obj.images = obj.images.map((image) => {
      if (!image) return image
      if (typeof image !== 'string') return image
      if (image.startsWith('http')) return image
      // ensure leading slash
      const path = image.startsWith('/') ? image : `/${image}`
      return `${base}${path}`
    })
  }

  // mainImage: prefer explicit field, otherwise first image
  if (obj.mainImage) {
    if (typeof obj.mainImage === 'string' && obj.mainImage.startsWith('http')) {
      obj.mainImage = obj.mainImage
    } else if (typeof obj.mainImage === 'string') {
      const path = obj.mainImage.startsWith('/') ? obj.mainImage : `/${obj.mainImage}`
      obj.mainImage = `${base}${path}`
    }
  } else if (obj.images && obj.images.length > 0) {
    obj.mainImage = obj.images[0]
  }

  return obj
}

// Add helper to push an image and save the document
itemSchema.methods.addImage = async function(imagePath) {
  this.images = Array.isArray(this.images) ? this.images : []
  this.images.push(imagePath)
  await this.save()
  return this
}

export default mongoose.model('Item', itemSchema)
