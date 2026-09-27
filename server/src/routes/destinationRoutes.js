const express = require('express');
const Destination = require('../models/Destination');
const Activity = require('../models/Activity');

const router = express.Router();

// @route   GET /api/destinations
router.get('/', async (req, res) => {
  try {
    const destinations = await Destination.find().sort({ name: 1 });
    res.json({ destinations });
  } catch (err) {
    console.error('Fetch destinations error:', err);
    res.status(500).json({ error: { message: 'Failed to fetch destinations' } });
  }
});

// @route   GET /api/destinations/:id/activities
router.get('/:id/activities', async (req, res) => {
  try {
    const activities = await Activity.find({ destination: req.params.id }).sort({ name: 1 });
    res.json({ activities });
  } catch (err) {
    console.error('Fetch activities error:', err);
    res.status(500).json({ error: { message: 'Failed to fetch activities' } });
  }
});

module.exports = router;
