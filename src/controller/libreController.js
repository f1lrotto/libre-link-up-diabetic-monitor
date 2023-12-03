const moment = require('moment-timezone');

const client = require('../common/libreConnect');
const Reading = require('../models/reading');
const Meal = require('../models/meal');

// SAVING DATA TO MONGODB
const saveLatestReading = async () => {
  const latestReading = await client.getLastReading();
  const mostRecentReading = await Reading.findOne().sort({ timestamp: -1 });

  if (mostRecentReading && latestReading.timestamp === mostRecentReading.timestamp) {
    console.info('Latest reading already saved in the database.');
    return 0;
  }

  await Reading.create(latestReading);
  console.info('Latest reading saved in the database.');
  return 0;
};

const saveBackupData = async () => {
  const readings = await client.getGraphData();
  await Reading.insertMany(readings);
  return 0;
};

const getReadingsXHours = async (hours) => {
  const readings = await Reading.find({
    timestamp: {
      $gte: new Date(new Date() - hours * 60 * 60 * 1000),
    },
  }).sort({ timestamp: 1 });
  return readings;
};

// WEB API Wrappers
const getReadingLatest = async (req, res) => {
  const latestReading = await Reading.findOne().sort({ timestamp: -1 });
  res.send(latestReading);
};

const getReadings6Hours = async (req, res) => {
  const readings = await getReadingsXHours(6);
  res.send(readings);
};

const getReadings12Hours = async (req, res) => {
  const readings = await getReadingsXHours(12);
  res.send(readings);
};

const getReadings24Hours = async (req, res) => {
  const readings = await getReadingsXHours(24);
  res.send(readings);
};

const getReadingsWeek = async (req, res) => {
  const readings = await getReadingsXHours(24 * 7);
  res.send(readings);
};

const getReadingsDay = async (req, res) => {
  let { day } = req.body;
  day = new Date(day);
  const startDate = new Date(day.setUTCHours(0, 0, 0, 0));
  const endDate = new Date(day.setUTCHours(23, 59, 59, 999));
  const readings = await Reading.find({
    timestamp: {
      $gte: startDate,
      $lt: endDate,
    },
  }).sort({ timestamp: 1 });

  res.send(readings);
};

const logMeal = async (req, res) => {
  const { mealType, mealTime, currentGlucose: preMealGlucoseMMOL } = req.body;
  const reading = await Meal.create({ mealType, mealTime: moment(mealTime), preMealGlucoseMMOL });
  res.send(reading);
};

const editMeal = async (req, res) => {
  const { id } = req.params;
  const { meal } = req.body;

  const updatedMeal = await Meal.findByIdAndUpdate(
    {
      id,
    },
    meal,
  );
  res.send(updatedMeal);
};

const deleteMeal = async (req, res) => {
  const { id } = req.params;
  const reading = await Meal.findByIdAndDelete(id);
  res.send(reading);
};

const getMealsThreeMonths = async (req, res) => {
  const meals = await Meal.find({
    mealTime: {
      $gte: new Date(new Date() - 90 * 24 * 60 * 60 * 1000),
    },
  }).sort({ mealTime: -1 });

  // make the meals an object with the date as the key
  const mealsObject = {};
  meals.forEach((meal) => {
    const date = meal.mealTime.toISOString().split('T')[0];
    if (!mealsObject[date]) {
      mealsObject[date] = [];
    }
    mealsObject[date].push(meal);
  });
  res.send(mealsObject);
};

const updateMealPostGlucose = async () => {
  const twoHoursAgo = moment().subtract(1, 'hours').utc();

  const meals = await Meal.find({
    mealTime: { $lte: twoHoursAgo },
    postMealPresent: false,
  });

  meals.forEach(async (meal) => {
    const latestReading = await Reading.findOne().sort({ timestamp: -1 });
    if (latestReading) {
      // eslint-disable-next-line no-underscore-dangle
      await Meal.findByIdAndUpdate(meal._id, {
        postMealGlucoseMMOL: latestReading.glucoseMMOL,
        postMealTime: latestReading.timestamp,
        postMealPresent: true,
      });
    }
  });
};

// STATISTICS

const getAverageGlucoseForSpectificMonth = () => {};

const getAverageGlucoseForPeriodWeeks = (req, res) => {
  const { weeks } = req.body;
  const weeksAgo = new Date(new Date().getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
  const readings = Reading.find(
    {
      timestamp: { $gte: weeksAgo },
    },
  );

  const readingsGroupedHour = readings.reduce(
    (acc, reading) => {
      const hour = new Date(reading.timestamp).getHours();
      if (!acc[hour]) {
        acc[hour] = { sum: 0, count: 0 };
      }
      acc[hour].sum += reading.glucoseMMOL;
      acc[hour].count += 1;
      acc.overallAverage.sum += reading.glucoseMMOL;
      acc.overallAverage.count += 1;

      return acc;
    },
    {
      overallAverage: { sum: 0, count: 0 },
    },
  );

  Object.keys(readingsGroupedHour).forEach((hour) => {
    readingsGroupedHour[hour].res = readingsGroupedHour[hour].sum / readingsGroupedHour[hour].count;
  });

  readingsGroupedHour.overallAverage.res = readingsGroupedHour.overallAverage.sum
    / readingsGroupedHour.overallAverage.count;

  res.send(readingsGroupedHour);
};

const getAverageSpikeAfterMealForSpectificMonth = () => { };

const getAverageSpikeAfterMealForPeriodWeeks = () => {};


// SAFETY JOB

// detect if there were no readings in the last hour saved in the database
// if so, save backup data
const safetyJob = async () => 0;

module.exports = {
  // save
  saveLatestReading,
  saveBackupData,

  // readings
  getReadingLatest,
  getReadings6Hours,
  getReadings12Hours,
  getReadings24Hours,
  getReadingsWeek,
  getReadingsDay,

  // meals
  logMeal,
  editMeal,
  deleteMeal,
  getMealsThreeMonths,
  updateMealPostGlucose,

  // stats
  getAverageGlucoseForPeriodWeeks,
  getAverageGlucoseForSpectificMonth,
  getAverageSpikeAfterMealForPeriodWeeks,
  getAverageSpikeAfterMealForSpectificMonth,

  // safety job
  safetyJob,
};
