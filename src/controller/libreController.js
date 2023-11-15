const client = require('../common/libreConnect');
const Reading = require('../models/reading');

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

// GETTING DATA FROM MONGODB
const getReadingLatest = async () => {
  const latestReading = await Reading.findOne().sort({ timestamp: -1 });
  return latestReading;
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
const getReadingLatestWeb = async (req, res) => {
  const latestReading = await getReadingLatest();
  res.send(latestReading);
};

const getReadings6HoursWeb = async (req, res) => {
  const readings = await getReadingsXHours(6);
  res.send(readings);
};

const getReadings12HoursWeb = async (req, res) => {
  const readings = await getReadingsXHours(12);
  res.send(readings);
};

const getReadings24HoursWeb = async (req, res) => {
  const readings = await getReadingsXHours(24);
  res.send(readings);
};

const getReadingsWeekWeb = async (req, res) => {
  const readings = await getReadingsXHours(24 * 7);
  res.send(readings);
};


// SAFETY JOB

// detect if there were no readings in the last hour saved in the database
// if so, save backup data
const safetyJob = async () => {
  const latestReading = await getReadingLatest();
  const oneHourAgo = new Date(new Date() - 60 * 60 * 1000);

  if (latestReading.timestamp < oneHourAgo) {
    console.info('No readings in the last hour. Saving backup data...');
    await saveBackupData();
  }
  return 0;
};

module.exports = {
  // save
  saveLatestReading,
  saveBackupData,

  // get
  getReadingLatest,
  getReadings12Hours: () => getReadingsXHours(12),
  getReadings24Hours: () => getReadingsXHours(24),
  getReadingsWeek: () => getReadingsXHours(24 * 7),

  // web
  getReadingLatestWeb,
  getReadings6HoursWeb,
  getReadings12HoursWeb,
  getReadings24HoursWeb,
  getReadingsWeekWeb,

  // safety job
  safetyJob,
};
