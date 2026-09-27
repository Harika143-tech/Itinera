const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination is required'],
    },
    name: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true,
    },
    costUSD: {
      type: Number,
      required: [true, 'Cost is required'],
      min: 0,
      default: 0,
    },
    durationHours: {
      type: Number,
      default: 2,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Activity', activitySchema);
