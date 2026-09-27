const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination is required'],
    },
    title: {
      type: String,
      required: [true, 'Package title is required'],
      trim: true,
    },
    defaultNights: {
      type: Number,
      required: [true, 'Number of nights is required'],
      min: 1,
      default: 5,
    },
    defaultHotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Default hotel is required'],
    },
    defaultActivities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity',
      },
    ],
    basePriceUSD: {
      type: Number,
      required: true,
      min: 0,
    },
    ratingAvg: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 24,
    },
    highlights: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Package', packageSchema);
