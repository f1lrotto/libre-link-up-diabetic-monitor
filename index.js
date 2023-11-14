const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectMongo } = require('./src/common/mongoConnect');
const { setCronjobs } = require('./src/controller/cron_controller');

const webRouter = require('./src/router/webRouter');
// const watchRouter = require('./router/watchRouter');

const app = express();
const port = process.env.PORT || 3000;

console.info('Connecting to MongoDB...');
connectMongo();

if (process.env.CRON_ENABLED === 'true') {
  console.info('Setting cronjobs...');
  setCronjobs();
} else {
  console.info('Cronjobs set to: ', process.env.CRON_ENABLED);
}

app.use(cors());

// Middleware to check for bearer token on all routes
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }
  const token = authHeader.split(' ')[1];
  if (token !== process.env.BEARER_TOKEN) {
    return res.status(401).json({ error: 'Invalid bearer token' });
  }
  return next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/web-api', webRouter);

app.listen(port, async () => {
  console.info(`Server listening at http://localhost:${port}`);
});
