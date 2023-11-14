const express = require('express');
const cors = require('cors');

const router = express.Router();

// Set up a whitelist and CORS options
const corsOptions = {
  origin: 'http://cgm.filiphupka.com',
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

router.use(cors(corsOptions));

module.exports = router;
