const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema(
  {
    mealTime: {
      type: Date,
      required: true,
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
      required: true,
    },
    preMealGlucoseMMOL: {
      type: Number,
      required: true,
    },
    postMealPresent: {
      type: Boolean,
      required: true,
      default: false,
    },
    postMealGlucoseMMOL: Number,
    postMealTime: Date,
  },
  {
    versionKey: false,
  },
);

const Meal = mongoose.model('Meal', mealSchema);

module.exports = Meal;
