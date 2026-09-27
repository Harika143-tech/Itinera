const mongoose = require('mongoose');

const itineraryDaySchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    default: '',
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
  },
  activities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
    },
  ],
});

const itinerarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
    },
    days: [itineraryDaySchema],
    totalPriceUSD: {
      type: Number,
      required: true,
      default: 0,
    },
    priceBreakdown: {
      hotelTotal: { type: Number, default: 0 },
      activitiesTotal: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['draft', 'saved', 'quote_requested', 'confirmed'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Itinerary', itinerarySchema);
