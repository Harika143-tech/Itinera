const express = require('express');
const Package = require('../models/Package');
const Hotel = require('../models/Hotel');
const Activity = require('../models/Activity');
const Itinerary = require('../models/Itinerary');
const { protect } = require('../middleware/auth');
const {
  computeItineraryPrice,
  swapHotel,
  toggleActivity,
  validateItinerary,
} = require('../pricing/priceEngine');

const router = express.Router();

// @route   POST /api/itineraries (Create draft from Package defaults)
router.post('/', protect, async (req, res) => {
  try {
    const { packageId } = req.body;
    const pkg = await Package.findById(packageId)
      .populate('destination')
      .populate('defaultHotel')
      .populate('defaultActivities');

    if (!pkg) {
      return res.status(404).json({ error: { message: 'Package not found' } });
    }

    // Build day-by-day defaults
    const nights = pkg.defaultNights || 5;
    const defaultActivities = pkg.defaultActivities || [];
    const days = [];

    for (let dayNum = 1; dayNum <= nights; dayNum++) {
      // Evenly distribute or assign activities across days
      const dayActs = [];
      const actForDay = defaultActivities[(dayNum - 1) % Math.max(1, defaultActivities.length)];
      if (actForDay && dayNum <= defaultActivities.length) {
        dayActs.push(actForDay);
      }

      days.push({
        dayNumber: dayNum,
        city: pkg.destination?.name || 'City Center',
        hotel: pkg.defaultHotel,
        activities: dayActs,
      });
    }

    const initialPricing = computeItineraryPrice({ days });

    const itinerary = new Itinerary({
      user: req.user._id,
      package: pkg._id,
      destination: pkg.destination?._id,
      days: days.map((d) => ({
        dayNumber: d.dayNumber,
        city: d.city,
        hotel: d.hotel._id,
        activities: d.activities.map((a) => a._id),
      })),
      totalPriceUSD: initialPricing.total,
      priceBreakdown: initialPricing,
      status: 'draft',
    });

    await itinerary.save();
    await itinerary.populate('destination package days.hotel days.activities');

    res.status(201).json({
      message: 'Itinerary created from package',
      itinerary,
    });
  } catch (err) {
    console.error('Create itinerary error:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to create itinerary' } });
  }
});

// @route   GET /api/itineraries/mine
router.get('/mine', protect, async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ user: req.user._id })
      .populate('destination package days.hotel days.activities')
      .sort({ updatedAt: -1 });

    res.json({ itineraries });
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch itineraries' } });
  }
});

// @route   GET /api/itineraries/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id)
      .populate('destination package days.hotel days.activities');

    if (!itinerary) {
      return res.status(404).json({ error: { message: 'Itinerary not found' } });
    }

    // Verify ownership
    if (itinerary.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: { message: 'Access denied' } });
    }

    // Also fetch all available hotels and activities for this destination so the editor can show them
    const destId = itinerary.destination?._id || itinerary.package?.destination;
    const availableHotels = await Hotel.find({ destination: destId }).sort({ starRating: -1, nightlyRateUSD: 1 });
    const availableActivities = await Activity.find({ destination: destId }).sort({ name: 1 });

    res.json({
      itinerary,
      availableHotels,
      availableActivities,
    });
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch itinerary' } });
  }
});

// @route   PATCH /api/itineraries/:id/hotel (Swap hotel on a specific day)
router.patch('/:id/hotel', protect, async (req, res) => {
  try {
    const { dayNumber, hotelId } = req.body;
    const itinerary = await Itinerary.findById(req.params.id)
      .populate('days.hotel days.activities');

    if (!itinerary) {
      return res.status(404).json({ error: { message: 'Itinerary not found' } });
    }

    if (itinerary.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: { message: 'Access denied' } });
    }

    const newHotel = await Hotel.findById(hotelId);
    if (!newHotel) {
      return res.status(404).json({ error: { message: 'Hotel not found' } });
    }

    // Validate hotel belongs to this destination
    if (newHotel.destination.toString() !== itinerary.destination.toString()) {
      return res.status(400).json({
        error: { message: 'Hotel does not belong to this package destination' },
      });
    }

    // Perform swap & server-side recompute
    swapHotel(itinerary, Number(dayNumber), newHotel);

    // Save changes to DB
    await itinerary.save();
    await itinerary.populate('destination package days.hotel days.activities');

    res.json({
      message: `Hotel swapped on Day ${dayNumber}`,
      itinerary,
      priceBreakdown: itinerary.priceBreakdown,
      totalPriceUSD: itinerary.totalPriceUSD,
    });
  } catch (err) {
    console.error('Hotel swap error:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to swap hotel' } });
  }
});

// @route   PATCH /api/itineraries/:id/activity (Toggle activity on a specific day)
router.patch('/:id/activity', protect, async (req, res) => {
  try {
    const { dayNumber, activityId } = req.body;
    const itinerary = await Itinerary.findById(req.params.id)
      .populate('days.hotel days.activities');

    if (!itinerary) {
      return res.status(404).json({ error: { message: 'Itinerary not found' } });
    }

    if (itinerary.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: { message: 'Access denied' } });
    }

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ error: { message: 'Activity not found' } });
    }

    // Validate activity belongs to this destination
    if (activity.destination.toString() !== itinerary.destination.toString()) {
      return res.status(400).json({
        error: { message: 'Activity does not belong to this package destination' },
      });
    }

    // Perform toggle & server-side recompute
    toggleActivity(itinerary, Number(dayNumber), activity);

    await itinerary.save();
    await itinerary.populate('destination package days.hotel days.activities');

    res.json({
      message: `Activity toggled on Day ${dayNumber}`,
      itinerary,
      priceBreakdown: itinerary.priceBreakdown,
      totalPriceUSD: itinerary.totalPriceUSD,
    });
  } catch (err) {
    console.error('Activity toggle error:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to toggle activity' } });
  }
});

// @route   POST /api/itineraries/:id/save (Mark status as saved)
router.post('/:id/save', protect, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id)
      .populate('destination package days.hotel days.activities');

    if (!itinerary) {
      return res.status(404).json({ error: { message: 'Itinerary not found' } });
    }

    if (itinerary.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: { message: 'Access denied' } });
    }

    itinerary.status = 'saved';
    await itinerary.save();

    res.json({
      message: 'Itinerary saved successfully to your account',
      itinerary,
    });
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to save itinerary' } });
  }
});

module.exports = router;
