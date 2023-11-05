const cron = require('node-cron');

const libreController = require('./libreController');

const setCronjobs = () => {
  cron.schedule('*/1 * * * *', () => {
    console.info('Running cronjob to save latest reading...');
    libreController.saveLatestReading();
  });
  cron.schedule('0 * * * *', () => {
    console.info('Running cronjob to save backup data...');
    libreController.safetyJob();
  });

  console.info('Cronjobs set.');
};

module.exports = {
  setCronjobs,
};

