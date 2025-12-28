import Booking from '../model/Booking.js'
import Item from '../model/Item.js'
import TokenVerify from '../middleware/TokenVerify.js'
import bookingBus from '../utils/bookingBus.js'

class BookingController {
  // create booking request
  async store(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      const payload = TokenVerify.verifyToken(token)
      if (!payload) return res.status(401).json({ status: false, message: 'Unauthorized' })

      const renterId = payload.id
      const { itemId, startDate, endDate } = req.body
      if (!itemId || !startDate || !endDate) return res.status(400).json({ status: false, message: 'Missing fields' })

      const item = await Item.findById(itemId)
      if (!item) return res.status(404).json({ status: false, message: 'Item not found' })

      const ownerId = item.owner

      // Prevent owners from booking their own items
      if (String(ownerId) === String(renterId)) {
        return res.status(400).json({ status: false, message: 'Owners cannot book their own items' })
      }

      // prevent creating a booking that overlaps an already confirmed booking
      const sCheck = new Date(startDate)
      const eCheck = new Date(endDate)
      const overlappingConfirmed = await Booking.findOne({
        item: itemId,
        status: 'confirmed',
        $or: [
          { startDate: { $lte: eCheck }, endDate: { $gte: sCheck } },
        ],
      })
      if (overlappingConfirmed) {
        return res.status(400).json({ status: false, message: 'Item already booked for selected dates' })
      }

      // compute days (inclusive)
      const s = new Date(startDate)
      const e = new Date(endDate)
      const oneDay = 24 * 60 * 60 * 1000
      const days = Math.max(1, Math.round((e - s) / oneDay) + 1)

      const totalAmount = (item.price || 0) * days

      const booking = new Booking({
        owner: ownerId,
        renter: renterId,
        item: itemId,
        totalAmount,
        startDate: s,
        endDate: e,
        status: 'confirmed',
      })

      // ensure a unique bookingId to avoid unique-index conflicts
      booking.bookingId = `BK${Date.now()}${Math.floor(Math.random() * 10000)}`

      await booking.save()
      // emit event for real-time updates (owner UI)
      try { bookingBus.emit('bookingCreated', { ownerId: String(ownerId), booking }) } catch (e) { console.error(e) }

      return res.status(201).json({ status: true, message: 'Booking requested', booking })
    } catch (err) {
      console.error('Booking create error', err)
      return res.status(500).json({ status: false, message: 'Failed to create booking' })
    }
  }

  // list bookings for an item
  async forItem(req, res) {
    try {
      const itemId = req.params.id
      const bookings = await Booking.find({ item: itemId }).populate('renter', 'name email').populate('owner', 'name email').populate('item', 'name')
      return res.status(200).json(bookings)
    } catch (err) {
      console.error('Fetch item bookings error', err)
      return res.status(500).json({ status: false, message: 'Failed to fetch bookings' })
    }
  }

  // list bookings for a user (owner or renter)
  async forUser(req, res) {
    try {
      const userId = req.params.id
      const bookings = await Booking.find({ $or: [{ owner: userId }, { renter: userId }] }).populate('renter', 'name email').populate('owner', 'name email').populate('item', 'name')
      return res.status(200).json(bookings)
    } catch (err) {
      console.error('Fetch user bookings error', err)
      return res.status(500).json({ status: false, message: 'Failed to fetch bookings' })
    }
  }

  // owner accepts a booking
  async accept(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      const payload = TokenVerify.verifyToken(token)
      if (!payload) return res.status(401).json({ status: false, message: 'Unauthorized' })

      const userId = payload.id
      const bookingId = req.params.id
      const booking = await Booking.findById(bookingId)
      if (!booking) return res.status(404).json({ status: false, message: 'Booking not found' })

      if (String(booking.owner) !== String(userId)) return res.status(403).json({ status: false, message: 'Not allowed' })

      // prevent accepting if it would overlap an existing confirmed booking
      const s = booking.startDate
      const e = booking.endDate
      const conflict = await Booking.findOne({
        item: booking.item,
        status: 'confirmed',
        _id: { $ne: booking._id },
        $or: [ { startDate: { $lte: e }, endDate: { $gte: s } } ]
      })
      if (conflict) {
        return res.status(400).json({ status: false, message: 'Cannot confirm booking — item already confirmed for overlapping dates' })
      }

      booking.status = 'confirmed'
      await booking.save()

      try { bookingBus.emit('bookingUpdated', { ownerId: String(booking.owner), booking }) } catch (e) { console.error(e) }

      return res.status(200).json({ status: true, message: 'Booking confirmed', booking })
    } catch (err) {
      console.error('Accept booking error', err)
      return res.status(500).json({ status: false, message: 'Failed to accept booking' })
    }
  }

  // owner rejects a booking
  async reject(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      const payload = TokenVerify.verifyToken(token)
      if (!payload) return res.status(401).json({ status: false, message: 'Unauthorized' })

      const userId = payload.id
      const bookingId = req.params.id
      const booking = await Booking.findById(bookingId)
      if (!booking) return res.status(404).json({ status: false, message: 'Booking not found' })

      if (String(booking.owner) !== String(userId)) return res.status(403).json({ status: false, message: 'Not allowed' })

      booking.status = 'cancelled'
      await booking.save()

      try { bookingBus.emit('bookingUpdated', { ownerId: String(booking.owner), booking }) } catch (e) { console.error(e) }

      return res.status(200).json({ status: true, message: 'Booking rejected', booking })
    } catch (err) {
      console.error('Reject booking error', err)
      return res.status(500).json({ status: false, message: 'Failed to reject booking' })
    }
  }

  // renter cancels their booking
  async renterCancel(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      const payload = TokenVerify.verifyToken(token)
      if (!payload) return res.status(401).json({ status: false, message: 'Unauthorized' })

      const userId = payload.id
      const bookingId = req.params.id
      const booking = await Booking.findById(bookingId)
      if (!booking) return res.status(404).json({ status: false, message: 'Booking not found' })

      if (String(booking.renter) !== String(userId)) return res.status(403).json({ status: false, message: 'Not allowed' })

      booking.status = 'cancelled'
      await booking.save()

      try { bookingBus.emit('bookingUpdated', { ownerId: String(booking.owner), booking }) } catch (e) { console.error(e) }

      return res.status(200).json({ status: true, message: 'Booking cancelled', booking })
    } catch (err) {
      console.error('Renter cancel error', err)
      return res.status(500).json({ status: false, message: 'Failed to cancel booking' })
    }
  }
}

export default BookingController
