const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination is required'],
    },
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
    },
    starRating: {
      type: Number,
      required: [true, 'Star rating is required'],
      min: 1,
      max: 5,
    },
    nightlyRateUSD: {
      type: Number,
      required: [true, 'Nightly rate is required'],
      min: 0,
    },
    description: {
      type: String,
      default: '',
    },
    roomType: {
      type: String,
      default: 'Deluxe Ocean/City View',
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Hotel', hotelSchema);
