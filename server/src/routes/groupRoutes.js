const express = require('express');
const { body, validationResult } = require('express-validator');
const TripGroup = require('../models/TripGroup');
const MemberPreference = require('../models/MemberPreference');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/groups (User's groups)
router.get('/', protect, async (req, res) => {
  try {
    const groups = await TripGroup.find({
      members: req.user._id,
    })
      .populate('createdBy', 'name email avatarUrl')
      .populate('members', 'name email avatarUrl')
      .populate({
        path: 'finalItinerary',
        populate: { path: 'destination' },
      })
      .sort({ updatedAt: -1 });

    res.json({ groups });
  } catch (err) {
    console.error('Fetch groups error:', err);
    res.status(500).json({ error: { message: 'Failed to fetch trip groups' } });
  }
});

// @route   POST /api/groups (Create a new trip group)
router.post(
  '/',
  protect,
  [body('name').trim().notEmpty().withMessage('Trip group name is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: { message: errors.array()[0].msg, field: errors.array()[0].path },
      });
    }

    try {
      const { name } = req.body;

      const group = new TripGroup({
        name,
        createdBy: req.user._id,
        members: [req.user._id],
        status: 'collecting',
      });

      await group.save();
      await group.populate('createdBy', 'name email avatarUrl');
      await group.populate('members', 'name email avatarUrl');

      res.status(201).json({ group });
    } catch (err) {
      console.error('Create group error:', err);
      res.status(500).json({ error: { message: 'Failed to create trip group' } });
    }
  }
);

// @route   POST /api/groups/:code/join (Join a trip group by invite code)
router.post('/:code/join', protect, async (req, res) => {
  try {
    const code = req.params.code.trim().toUpperCase();
    const group = await TripGroup.findOne({ inviteCode: code })
      .populate('createdBy', 'name email avatarUrl')
      .populate('members', 'name email avatarUrl');

    if (!group) {
      return res.status(404).json({
        error: { message: `No trip group found with invite code "${code}"` },
      });
    }

    if (group.status === 'locked') {
      return res.status(400).json({
        error: { message: 'This trip plan is locked and no longer accepting new members' },
      });
    }

    // Check if user is already a member
    const isMember = group.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      group.members.push(req.user._id);
      await group.save();
      await group.populate('members', 'name email avatarUrl');
    }

    res.json({
      message: isMember ? 'Already a member' : 'Successfully joined trip group',
      group,
    });
  } catch (err) {
    console.error('Join group error:', err);
    res.status(500).json({ error: { message: 'Failed to join trip group' } });
  }
});

// @route   GET /api/groups/:id (Get group details)
router.get('/:id', protect, async (req, res) => {
  try {
    const group = await TripGroup.findById(req.params.id)
      .populate('createdBy', 'name email avatarUrl')
      .populate('members', 'name email avatarUrl')
      .populate({
        path: 'finalItinerary',
        populate: [
          { path: 'destination' },
          { path: 'days.activities' },
        ],
      });

    if (!group) {
      return res.status(404).json({ error: { message: 'Trip group not found' } });
    }

    // Check if user is a member
    const isMember = group.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        error: { message: 'You are not a member of this trip group' },
      });
    }

    res.json({ group });
  } catch (err) {
    console.error('Get group error:', err);
    res.status(500).json({ error: { message: 'Failed to fetch trip group' } });
  }
});

// @route   GET /api/groups/:id/status (Submission status)
router.get('/:id/status', protect, async (req, res) => {
  try {
    const group = await TripGroup.findById(req.params.id).populate('members', 'name email avatarUrl');
    if (!group) {
      return res.status(404).json({ error: { message: 'Trip group not found' } });
    }

    const preferences = await MemberPreference.find({ tripGroup: group._id })
      .populate('user', 'name email avatarUrl');

    const submittedUserIds = new Set(preferences.map((p) => p.user._id.toString()));

    const memberStatus = group.members.map((member) => ({
      _id: member._id,
      name: member.name,
      email: member.email,
      avatarUrl: member.avatarUrl,
      hasSubmitted: submittedUserIds.has(member._id.toString()),
      submittedAt: preferences.find((p) => p.user._id.toString() === member._id.toString())?.submittedAt || null,
    }));

    const submittedCount = memberStatus.filter((m) => m.hasSubmitted).length;
    const totalCount = group.members.length;
    const hasCurrentUserSubmitted = submittedUserIds.has(req.user._id.toString());

    res.json({
      status: group.status,
      submittedCount,
      totalCount,
      allSubmitted: submittedCount === totalCount && totalCount > 0,
      hasCurrentUserSubmitted,
      memberStatus,
    });
  } catch (err) {
    console.error('Get status error:', err);
    res.status(500).json({ error: { message: 'Failed to fetch status' } });
  }
});

module.exports = router;
