const LibreClient = require('../services/libreClient');

const client = new LibreClient(process.env.LIBRE_EMAIL, process.env.LIBRE_PASSWORD);

module.exports = client;
