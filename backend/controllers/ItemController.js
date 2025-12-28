import Item from "../model/Item.js";
import TokenVerify from "../middleware/TokenVerify.js";

class ItemController {
  // list all items (public)
  async index(req, res) {
    try {
      // allow filtering by owner id via query param (?owner=<id>)
      const q = {}
      const ownerId = req.query.owner || req.query.user || null
      if (ownerId) q.owner = ownerId
      const items = await Item.find(q).populate('owner', 'name email').populate('category', 'name')
      return res.status(200).json(items);
    } catch (err) {
      console.error('Failed to list items', err);
      return res.status(500).json({ status: false, message: 'Failed to list items' });
    }
  }

  // create item (requires auth)
  async store(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const payload = TokenVerify.verifyToken(token);
      if (!payload) return res.status(401).json({ status: false, message: 'Unauthorized' });

      const ownerId = payload.id;

      // Support both JSON body and multipart/form-data (files handling not implemented here)
      const body = req.body || {}
      const data = {
        name: body.name,
        description: body.description,
        price: Number(body.price) || 0,
        priceUnit: body.priceUnit || 'day',
        category: body.category || undefined,
        condition: body.condition || 'good',
        location: body.location || undefined,
        owner: ownerId,
      };

      // Basic validation
      if (!data.name || String(data.name).trim() === '') {
        return res.status(400).json({ status: false, message: 'Name is required' })
      }
      if (!body.price || Number.isNaN(Number(body.price)) || Number(body.price) <= 0) {
        return res.status(400).json({ status: false, message: 'Valid price is required' })
      }

      // images: if sent as JSON array in body
      if (req.body.images && Array.isArray(req.body.images)) {
        data.images = req.body.images;
      }

      // Create item first
      const item = new Item(data);
      await item.save();

      // If files were uploaded (multipart/form-data), append them to images
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const host = req.get('host')
        const protocol = req.protocol
        for (const f of req.files) {
          const filePath = `${protocol}://${host}/uploads/items/${f.filename}`
          // use model helper to ensure normalization
          if (typeof item.addImage === 'function') {
            await item.addImage(filePath)
          } else {
            item.images = Array.isArray(item.images) ? item.images : []
            item.images.push(filePath)
            await item.save()
          }
        }
      }

      return res.status(201).json({ status: true, message: 'Item created', item })
    } catch (err) {
      console.error('Failed to create item', err);
      return res.status(500).json({ status: false, message: 'Failed to create item', error: err.message });
    }
  }

  // show item
  async show(req, res) {
    try {
      const item = await Item.findById(req.params.id).populate('owner', 'name email phone image').populate('category', 'name');
      if (!item) return res.status(404).json({ status: false, message: 'Item not found' });
      return res.status(200).json(item);
    } catch (err) {
      return res.status(500).json({ status: false, message: 'Failed to fetch item' });
    }
  }

  // upload a single image for an item and append it to images array
  async uploadImage(req, res) {
    try {
      const itemId = req.params.id
      if (!req.file) return res.status(400).json({ status: false, message: 'No file uploaded' })

      // Build the public absolute URL to the uploaded file so frontend can use it directly
      const host = req.get('host')
      const protocol = req.protocol
      const filePath = `${protocol}://${host}/uploads/items/${req.file.filename}`

      const item = await Item.findById(itemId)
      if (!item) return res.status(404).json({ status: false, message: 'Item not found' })

      // Allow updating simple fields from the form first
      if (req.body) {
        if (typeof req.body.name === 'string' && req.body.name.trim() !== '') item.name = req.body.name.trim()
        if (typeof req.body.description === 'string') item.description = req.body.description
        if (req.body.price !== undefined && req.body.price !== null && req.body.price !== '') {
          const p = Number(req.body.price)
          if (!Number.isNaN(p)) item.price = p
        }
        if (typeof req.body.priceUnit === 'string') item.priceUnit = req.body.priceUnit
        if (typeof req.body.condition === 'string') item.condition = req.body.condition
        if (typeof req.body.category === 'string' && req.body.category.trim() !== '') item.category = req.body.category
        if (typeof req.body.location === 'string') item.location = req.body.location
      }

      // Use model helper to add the image and save
      if (typeof item.addImage === 'function') {
        const updated = await item.addImage(filePath)
        return res.status(200).json({ status: true, message: 'Image uploaded and item updated', filePath, item: updated })
      }

      // Fallback: push and save
      item.images = Array.isArray(item.images) ? item.images : []
      item.images.push(filePath)
      await item.save()
      return res.status(200).json({ status: true, message: 'Image uploaded and item updated', filePath, item })
    } catch (err) {
      console.error('Upload image error', err)
      return res.status(500).json({ status: false, message: 'Failed to upload image' })
    }
  }

  // update item fields (owner only)
  async update(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      const payload = TokenVerify.verifyToken(token)
      if (!payload) return res.status(401).json({ status: false, message: 'Unauthorized' })

      const userId = payload.id
      const itemId = req.params.id
      const item = await Item.findById(itemId)
      if (!item) return res.status(404).json({ status: false, message: 'Item not found' })
      if (String(item.owner) !== String(userId)) return res.status(403).json({ status: false, message: 'Not allowed' })

      const up = req.body || {}
      if (typeof up.name === 'string' && up.name.trim() !== '') item.name = up.name.trim()
      if (typeof up.description === 'string') item.description = up.description
      if (up.price !== undefined && up.price !== null && up.price !== '') {
        const p = Number(up.price)
        if (!Number.isNaN(p)) item.price = p
      }
      if (typeof up.priceUnit === 'string') item.priceUnit = up.priceUnit
      if (typeof up.condition === 'string') item.condition = up.condition
      if (typeof up.category === 'string' && up.category.trim() !== '') item.category = up.category
      if (typeof up.location === 'string') item.location = up.location
      // allow replacing the images array entirely
      if (up.images && Array.isArray(up.images)) {
        item.images = up.images.map((i) => (typeof i === 'string' ? i : String(i)))
      }

      await item.save()
      return res.status(200).json({ status: true, message: 'Item updated', item })
    } catch (err) {
      console.error('Update item error', err)
      return res.status(500).json({ status: false, message: 'Failed to update item' })
    }
  }

  // delete item (owner only)
  async destroy(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      const payload = TokenVerify.verifyToken(token)
      if (!payload) return res.status(401).json({ status: false, message: 'Unauthorized' })

      const userId = payload.id
      const itemId = req.params.id
      const item = await Item.findById(itemId)
      if (!item) return res.status(404).json({ status: false, message: 'Item not found' })
      if (String(item.owner) !== String(userId)) return res.status(403).json({ status: false, message: 'Not allowed' })

      await Item.deleteOne({ _id: itemId })
      return res.status(200).json({ status: true, message: 'Item deleted' })
    } catch (err) {
      console.error('Delete item error', err)
      return res.status(500).json({ status: false, message: 'Failed to delete item' })
    }
  }
}

export default ItemController;
