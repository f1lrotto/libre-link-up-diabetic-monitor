const express = require('express');

const router = express.Router();

const libreController = require('../controller/libreController');

// GET routes
router.get('/latest', libreController.getReadingLatestWeb);
router.get('/last-hours-12', libreController.getReadings12HoursWeb);
router.get('/last-hours-24', libreController.getReadings24HoursWeb);
router.get('/last-week', libreController.getReadingsWeekWeb);

module.exports = router;
