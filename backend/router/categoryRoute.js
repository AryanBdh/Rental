import express from 'express'
import CategoryController from '../controllers/CategoryController.js'
import RouteMiddleware from '../middleware/RouteMiddleware.js'

const router = express.Router()
const auth = new RouteMiddleware()

// Public list
router.get('/', CategoryController.list)
// Create (admin only)
router.post('/', auth.check, CategoryController.create)
// Update (admin only)
router.put('/:id', auth.check, CategoryController.update)
// Delete (admin only)
router.delete('/:id', auth.check, CategoryController.delete)

export default router
