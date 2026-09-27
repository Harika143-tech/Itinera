const express = require('express');
const { body, validationResult } = require('express-validator');
const MemberPreference = require('../models/MemberPreference');
const TripGroup = require('../models/TripGroup');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// @route   GET /api/groups/:id/preferences/mine (Current user's preference)
router.get('/mine', protect, async (req, res) => {
  try {
    const preference = await MemberPreference.findOne({
      tripGroup: req.params.id,
      user: req.user._id,
    }).populate('destinationVotes.destination');

    res.json({ preference });
  } catch (err) {
    console.error('Fetch my preference error:', err);
    res.status(500).json({ error: { message: 'Failed to fetch preference' } });
  }
});

// @route   GET /api/groups/:id/preferences (All group preferences)
router.get('/', protect, async (req, res) => {
  try {
    const group = await TripGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: { message: 'Trip group not found' } });
    }

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ error: { message: 'Not authorized for this group' } });
    }

    const preferences = await MemberPreference.find({ tripGroup: group._id })
      .populate('user', 'name email avatarUrl')
      .populate('destinationVotes.destination');

    res.json({ preferences });
  } catch (err) {
    console.error('Fetch group preferences error:', err);
    res.status(500).json({ error: { message: 'Failed to fetch preferences' } });
  }
});

// @route   POST /api/groups/:id/preferences (Submit or update preference)
router.post(
  '/',
  protect,
  [
    body('availableDateRanges')
      .isArray({ min: 1 })
      .withMessage('At least one available date range is required'),
    body('budgetRange.min')
      .isNumeric()
      .withMessage('Minimum budget must be a number'),
    body('budgetRange.max')
      .isNumeric()
      .withMessage('Maximum budget must be a number'),
    body('interestTags')
      .isArray()
      .withMessage('Interest tags must be an array'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: { message: errors.array()[0].msg, field: errors.array()[0].path },
      });
    }

    try {
      const group = await TripGroup.findById(req.params.id);
      if (!group) {
        return res.status(404).json({ error: { message: 'Trip group not found' } });
      }

      if (group.status === 'locked') {
        return res.status(400).json({
          error: { message: 'This trip is locked and preferences cannot be changed' },
        });
      }

      // Automatically ensure user is in group members
      const isMember = group.members.some(
        (m) => m.toString() === req.user._id.toString()
      );
      if (!isMember) {
        group.members.push(req.user._id);
        await group.save();
      }

      const {
        availableDateRanges,
        budgetRange,
        destinationVotes = [],
        interestTags = [],
        mustHaves = [],
      } = req.body;

      // Validate budgetRange min <= max
      if (Number(budgetRange.min) > Number(budgetRange.max)) {
        return res.status(400).json({
          error: { message: 'Minimum budget cannot be greater than maximum budget' },
        });
      }

      // Upsert preference
      const preference = await MemberPreference.findOneAndUpdate(
        {
          tripGroup: group._id,
          user: req.user._id,
        },
        {
          tripGroup: group._id,
          user: req.user._id,
          availableDateRanges,
          budgetRange,
          destinationVotes,
          interestTags,
          mustHaves,
          submittedAt: new Date(),
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      ).populate('user', 'name email avatarUrl');

      // Check if all members have submitted, update status to 'finalizing'
      const allPrefs = await MemberPreference.find({ tripGroup: group._id });
      if (allPrefs.length >= group.members.length && group.status === 'collecting') {
        group.status = 'finalizing';
        await group.save();
      }

      res.status(200).json({
        message: 'Preferences submitted successfully',
        preference,
      });
    } catch (err) {
      console.error('Submit preference error:', err);
      res.status(500).json({ error: { message: 'Failed to submit preferences' } });
    }
  }
);

module.exports = router;
