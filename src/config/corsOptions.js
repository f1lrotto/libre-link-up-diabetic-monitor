const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://cgm.filiphupka.com',
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

module.exports = corsOptions;
