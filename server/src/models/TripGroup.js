const mongoose = require('mongoose');

const tripGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inviteCode: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['collecting', 'finalizing', 'locked'],
      default: 'collecting',
    },
    finalItinerary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Itinerary',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique invite code if not present
tripGroupSchema.pre('validate', function (next) {
  if (!this.inviteCode) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'TRIP-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.inviteCode = code;
  }
  next();
});

module.exports = mongoose.model('TripGroup', tripGroupSchema);
