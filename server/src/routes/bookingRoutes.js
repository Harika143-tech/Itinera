const express = require('express');
const { body, validationResult } = require('express-validator');
const BookingRequest = require('../models/BookingRequest');
const Itinerary = require('../models/Itinerary');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/bookings (Submit booking/quote request)
router.post(
  '/',
  protect,
  [
    body('itineraryId').notEmpty().withMessage('Itinerary ID is required'),
    body('travelDates.start').notEmpty().withMessage('Travel start date is required'),
    body('travelDates.end').notEmpty().withMessage('Travel end date is required'),
    body('travelerCount').isInt({ min: 1 }).withMessage('Traveler count must be at least 1'),
    body('contactPhone').trim().notEmpty().withMessage('Contact phone number is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: { message: errors.array()[0].msg, field: errors.array()[0].path },
      });
    }

    try {
      const { itineraryId, travelDates, travelerCount, contactPhone, notes } = req.body;

      const itinerary = await Itinerary.findById(itineraryId)
        .populate('destination package days.hotel days.activities');

      if (!itinerary) {
        return res.status(404).json({ error: { message: 'Itinerary not found' } });
      }

      if (itinerary.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ error: { message: 'Access denied' } });
      }

      const booking = new BookingRequest({
        itinerary: itinerary._id,
        user: req.user._id,
        travelDates: {
          start: new Date(travelDates.start),
          end: new Date(travelDates.end),
        },
        travelerCount: Number(travelerCount),
        contactPhone,
        notes: notes || '',
        status: 'pending',
      });

      await booking.save();

      // Update itinerary status
      itinerary.status = 'quote_requested';
      await itinerary.save();

      await booking.populate('itinerary user');

      res.status(201).json({
        message: 'Booking & quote request submitted successfully',
        booking,
      });
    } catch (err) {
      console.error('Booking request error:', err);
      res.status(500).json({ error: { message: err.message || 'Failed to submit booking' } });
    }
  }
);

// @route   GET /api/bookings/mine (User's booking requests)
router.get('/mine', protect, async (req, res) => {
  try {
    const bookings = await BookingRequest.find({ user: req.user._id })
      .populate({
        path: 'itinerary',
        populate: ['destination', 'package', 'days.hotel', 'days.activities'],
      })
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch bookings' } });
  }
});

// @route   GET /api/bookings (Admin: all bookings)
router.get('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const bookings = await BookingRequest.find()
      .populate('user', 'name email')
      .populate({
        path: 'itinerary',
        populate: ['destination', 'package'],
      })
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch bookings' } });
  }
});

// @route   PATCH /api/bookings/:id/status (Admin: update status)
router.patch('/:id/status', protect, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'contacted', 'closed'].includes(status)) {
      return res.status(400).json({ error: { message: 'Invalid status' } });
    }

    const booking = await BookingRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user itinerary');

    res.json({ message: 'Booking status updated', booking });
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to update booking status' } });
  }
});

module.exports = router;
