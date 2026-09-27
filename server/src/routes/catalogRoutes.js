const express = require('express');
const Destination = require('../models/Destination');
const Hotel = require('../models/Hotel');
const Activity = require('../models/Activity');
const Package = require('../models/Package');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// ================= DESTINATIONS =================
router.get('/destinations', async (req, res) => {
  try {
    const destinations = await Destination.find().sort({ name: 1 });
    res.json({ destinations });
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch destinations' } });
  }
});

router.get('/destinations/:id', async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ error: { message: 'Destination not found' } });
    }
    res.json({ destination });
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch destination' } });
  }
});

router.post('/destinations', protect, requireRole('admin'), async (req, res) => {
  try {
    const { name, country, description, tags, heroNote, climate, bestSeason } = req.body;
    const destination = await Destination.create({
      name,
      country,
      description,
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((t) => t.trim()),
      heroNote,
      climate,
      bestSeason,
    });
    res.status(201).json({ destination });
  } catch (err) {
    res.status(500).json({ error: { message: err.message || 'Failed to create destination' } });
  }
});

// ================= HOTELS =================
router.get('/hotels', async (req, res) => {
  try {
    const filter = {};
    if (req.query.destination) {
      filter.destination = req.query.destination;
    }
    const hotels = await Hotel.find(filter).populate('destination').sort({ starRating: -1, nightlyRateUSD: 1 });
    res.json({ hotels });
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch hotels' } });
  }
});

router.post('/hotels', protect, requireRole('admin'), async (req, res) => {
  try {
    const { destination, name, starRating, nightlyRateUSD, description, roomType, amenities } = req.body;
    const hotel = await Hotel.create({
      destination,
      name,
      starRating: Number(starRating),
      nightlyRateUSD: Number(nightlyRateUSD),
      description,
      roomType,
      amenities: Array.isArray(amenities) ? amenities : (amenities || '').split(',').map((a) => a.trim()),
    });
    res.status(201).json({ hotel });
  } catch (err) {
    res.status(500).json({ error: { message: err.message || 'Failed to create hotel' } });
  }
});

// ================= ACTIVITIES =================
router.get('/activities', async (req, res) => {
  try {
    const filter = {};
    if (req.query.destination) {
      filter.destination = req.query.destination;
    }
    const activities = await Activity.find(filter).populate('destination').sort({ name: 1 });
    res.json({ activities });
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch activities' } });
  }
});

router.post('/activities', protect, requireRole('admin'), async (req, res) => {
  try {
    const { destination, name, costUSD, durationHours, tags, description } = req.body;
    const activity = await Activity.create({
      destination,
      name,
      costUSD: Number(costUSD),
      durationHours: Number(durationHours || 2),
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((t) => t.trim()),
      description,
    });
    res.status(201).json({ activity });
  } catch (err) {
    res.status(500).json({ error: { message: err.message || 'Failed to create activity' } });
  }
});

// ================= PACKAGES (SEARCH & CATALOG) =================
// Supports query params: destination, minBudget, maxBudget, minStars, minNights, maxNights
router.get('/packages', async (req, res) => {
  try {
    const { destination, minBudget, maxBudget, minStars, minNights, maxNights } = req.query;
    const filter = {};

    if (destination && destination !== 'all') {
      filter.destination = destination;
    }

    if (minBudget || maxBudget) {
      filter.basePriceUSD = {};
      if (minBudget) filter.basePriceUSD.$gte = Number(minBudget);
      if (maxBudget) filter.basePriceUSD.$lte = Number(maxBudget);
    }

    if (minNights || maxNights) {
      filter.defaultNights = {};
      if (minNights) filter.defaultNights.$gte = Number(minNights);
      if (maxNights) filter.defaultNights.$lte = Number(maxNights);
    }

    let packages = await Package.find(filter)
      .populate('destination')
      .populate('defaultHotel')
      .populate('defaultActivities')
      .sort({ ratingAvg: -1, basePriceUSD: 1 });

    // Filter by min hotel star rating if requested
    if (minStars) {
      const starNum = Number(minStars);
      packages = packages.filter((pkg) => (pkg.defaultHotel?.starRating || 0) >= starNum);
    }

    res.json({ packages, count: packages.length });
  } catch (err) {
    console.error('Fetch packages error:', err);
    res.status(500).json({ error: { message: 'Failed to fetch packages' } });
  }
});

router.get('/packages/:id', async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id)
      .populate('destination')
      .populate('defaultHotel')
      .populate('defaultActivities');

    if (!pkg) {
      return res.status(404).json({ error: { message: 'Package not found' } });
    }

    // Also fetch all available alternative hotels and activities for this package's destination
    const destinationHotels = await Hotel.find({ destination: pkg.destination._id }).sort({ starRating: -1 });
    const destinationActivities = await Activity.find({ destination: pkg.destination._id }).sort({ name: 1 });

    res.json({
      package: pkg,
      destinationHotels,
      destinationActivities,
    });
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch package details' } });
  }
});

router.post('/packages', protect, requireRole('admin'), async (req, res) => {
  try {
    const { destination, title, defaultNights, defaultHotel, defaultActivities, basePriceUSD, highlights } = req.body;

    const pkg = await Package.create({
      destination,
      title,
      defaultNights: Number(defaultNights || 5),
      defaultHotel,
      defaultActivities: defaultActivities || [],
      basePriceUSD: Number(basePriceUSD),
      highlights: Array.isArray(highlights) ? highlights : (highlights || '').split(',').map((h) => h.trim()),
      createdBy: req.user._id,
    });

    await pkg.populate('destination defaultHotel defaultActivities');
    res.status(201).json({ package: pkg });
  } catch (err) {
    res.status(500).json({ error: { message: err.message || 'Failed to create package' } });
  }
});

module.exports = router;
