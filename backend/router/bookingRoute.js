import express from 'express'
import BookingController from '../controllers/BookingController.js'
import RouteMiddleware from '../middleware/RouteMiddleware.js'

const router = express.Router()
const ctrl = new BookingController()
const auth = new RouteMiddleware()

// create booking (protected)
router.post('/', auth.check, (req, res) => ctrl.store(req, res))

// bookings for an item
router.get('/item/:id', (req, res) => ctrl.forItem(req, res))

// bookings for a user
router.get('/user/:id', (req, res) => ctrl.forUser(req, res))

// owner accepts booking
router.patch('/:id/accept', auth.check, (req, res) => ctrl.accept(req, res))
// owner rejects booking
router.patch('/:id/reject', auth.check, (req, res) => ctrl.reject(req, res))
// renter cancels booking
router.patch('/:id/cancel', auth.check, (req, res) => ctrl.renterCancel(req, res))

// Server-Sent Events stream for owner to receive booking events in real-time
import bookingBus from '../utils/bookingBus.js'

router.get('/stream/:userId', (req, res) => {
	const { userId } = req.params
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		Connection: 'keep-alive',
	})

	const onCreated = (payload) => {
		if (payload && payload.ownerId === String(userId)) {
			res.write(`event: bookingCreated\n`)
			res.write(`data: ${JSON.stringify(payload.booking)}\n\n`)
		}
	}
	const onUpdated = (payload) => {
		if (payload && payload.ownerId === String(userId)) {
			res.write(`event: bookingUpdated\n`)
			res.write(`data: ${JSON.stringify(payload.booking)}\n\n`)
		}
	}

	bookingBus.on('bookingCreated', onCreated)
	bookingBus.on('bookingUpdated', onUpdated)

	req.on('close', () => {
		bookingBus.off('bookingCreated', onCreated)
		bookingBus.off('bookingUpdated', onUpdated)
	})
})

export default router
