const mongoose = require('mongoose');

const memberPreferenceSchema = new mongoose.Schema(
  {
    tripGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TripGroup',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    availableDateRanges: [
      {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
      },
    ],
    budgetRange: {
      min: { type: Number, required: true, default: 0 },
      max: { type: Number, required: true, default: 1000 },
    },
    destinationVotes: [
      {
        destination: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Destination',
          required: true,
        },
        score: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
      },
    ],
    interestTags: [
      {
        type: String,
        trim: true,
      },
    ],
    mustHaves: [
      {
        type: String,
        trim: true,
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce one preference document per user per trip group
memberPreferenceSchema.index({ tripGroup: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('MemberPreference', memberPreferenceSchema);
