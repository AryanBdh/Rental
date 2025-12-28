import Category from '../model/Category.js'

class CategoryController {
  static async list(req, res) {
    try {
      const cats = await Category.find().sort({ name: 1 })
      return res.json(cats)
    } catch (err) {
      console.error('Category list error', err)
      return res.status(500).json({ message: 'Failed to list categories' })
    }
  }

  static async create(req, res) {
    try {
      const user = req.user || {}
      const role = (user.role && String(user.role).toLowerCase()) || (user.roles && user.roles[0])
      const isAdmin = user.isAdmin === true || (typeof role === 'string' && role === 'admin')
      if (!isAdmin) return res.status(403).json({ message: 'Forbidden' })

      const { name, description } = req.body
      if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' })

      const exists = await Category.findOne({ name: name.trim() })
      if (exists) return res.status(400).json({ message: 'Category already exists' })

      const cat = new Category({ name: name.trim(), description: description || '' })
      await cat.save()
      return res.status(201).json(cat)
    } catch (err) {
      console.error('Create category error', err)
      return res.status(500).json({ message: 'Failed to create category' })
    }
  }

  static async delete(req, res) {
    try {
      const user = req.user || {}
      const role = (user.role && String(user.role).toLowerCase()) || (user.roles && user.roles[0])
      const isAdmin = user.isAdmin === true || (typeof role === 'string' && role === 'admin')
      if (!isAdmin) return res.status(403).json({ message: 'Forbidden' })

      const id = req.params.id
      if (!id) return res.status(400).json({ message: 'Category id required' })

      let cat = await Category.findByIdAndDelete(id)
      if (!cat) {
        cat = await Category.findOneAndDelete({ categoryId: id })
      }

      if (!cat) return res.status(404).json({ message: 'Category not found' })

      return res.json({ message: 'Category deleted', category: cat })
    } catch (err) {
      console.error('Delete category error', err)
      return res.status(500).json({ message: 'Failed to delete category' })
    }
  }

  static async update(req, res) {
    try {
      const user = req.user || {}
      const role = (user.role && String(user.role).toLowerCase()) || (user.roles && user.roles[0])
      const isAdmin = user.isAdmin === true || (typeof role === 'string' && role === 'admin')
      if (!isAdmin) return res.status(403).json({ message: 'Forbidden' })

      const id = req.params.id
      if (!id) return res.status(400).json({ message: 'Category id required' })

      const { name, description } = req.body
      if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' })

      // find existing category
      let cat = await Category.findById(id)
      if (!cat) cat = await Category.findOne({ categoryId: id })
      if (!cat) return res.status(404).json({ message: 'Category not found' })

      const exists = await Category.findOne({ name: name.trim(), _id: { $ne: cat._id } })
      if (exists) return res.status(400).json({ message: 'Another category with this name already exists' })

      cat.name = name.trim()
      cat.description = description || ''
      await cat.save()
      return res.json(cat)
    } catch (err) {
      console.error('Update category error', err)
      return res.status(500).json({ message: 'Failed to update category' })
    }
  }
}

export default CategoryController
