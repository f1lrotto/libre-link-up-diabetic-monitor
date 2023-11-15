const corsOptions = {
  origin: [process.env.CORS_ORIGIN || 'http://cgm.filiphupka.com', 'http://localhost:3000'],
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

module.exports = corsOptions;
