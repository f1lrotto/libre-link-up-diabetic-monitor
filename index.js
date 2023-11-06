const express = require('express');
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

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/web-api', webRouter);

app.listen(port, async () => {
  console.info(`Server listening at http://localhost:${port}`);
});
