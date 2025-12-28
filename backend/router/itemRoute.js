import express from 'express'
import ItemController from '../controllers/ItemController.js'
import RouteMiddleware from '../middleware/RouteMiddleware.js'
import multer from 'multer'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()
const ctrl = new ItemController()
const auth = new RouteMiddleware()

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '..', 'public', 'uploads', 'items'))
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname).toLowerCase()
		const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`
		cb(null, name)
	}
})

const fileFilter = (req, file, cb) => {
	const allowed = ['image/jpeg', 'image/png', 'image/webp']
	if (allowed.includes(file.mimetype)) cb(null, true)
	else cb(new Error('Invalid file type'), false)
}

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter })

router.get('/', ctrl.index)
router.get('/:id', ctrl.show)

router.post('/', auth.check, upload.array('images'), (req, res) => ctrl.store(req, res))

router.post('/:id/upload-image', auth.check, upload.single('image'), (req, res) => ctrl.uploadImage(req, res))
router.patch('/:id', auth.check, (req, res) => ctrl.update(req, res))
router.delete('/:id', auth.check, (req, res) => ctrl.destroy(req, res))

export default router
