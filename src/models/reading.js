const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema(
  {
    glucoseMMOL: {
      type: Number,
      required: true,
    },
    glucoseMG: {
      type: Number,
      required: true,
    },
    isLow: {
      type: Boolean,
      required: true,
    },
    isHigh: {
      type: Boolean,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    trendNumber: {
      type: Number,
      default: null,
    },
    trend: {
      type: String,
      default: null,
    },
  },
  {
    versionKey: false,
  },
);

const Reading = mongoose.model('Reading', readingSchema);

module.exports = Reading;
