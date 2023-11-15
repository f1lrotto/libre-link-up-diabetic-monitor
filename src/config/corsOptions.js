const corsOptions = {
  origin: [process.env.CORS_ORIGIN || 'http://cgm.filiphupka.com', 'http://localhost:3001'],
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

module.exports = corsOptions;
