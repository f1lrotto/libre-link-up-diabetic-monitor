const express = require('express');

const router = express.Router();

const libreController = require('../controller/libreController');

// GET routes
router.get('/latest', libreController.getReadingLatest);
router.get('/last-hours-6', libreController.getReadings6Hours);
router.get('/last-hours-12', libreController.getReadings12Hours);
router.get('/last-hours-24', libreController.getReadings24Hours);
router.get('/last-week', libreController.getReadingsWeek);
router.post('/log-meal', libreController.logMeal);
router.delete('/delete-meal/:id', libreController.deleteMeal);
router.get('/meals-three-months', libreController.getMealsThreeMonths);

module.exports = router;
