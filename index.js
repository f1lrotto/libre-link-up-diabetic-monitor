const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');

require('dotenv').config();
require('./src/config/passport')(passport);
const corsOptions = require('./src/config/corsOptions');
const sessionOptions = require('./src/config/sessionOptions');
const authRoutes = require('./src/routes/authRoutes');
const webRoutes = require('./src/routes/webRoutes');
const checkAuthentication = require('./src/middleware/authMiddleware');
const { connectMongo } = require('./src/common/mongoConnect');
const { setCronjobs } = require('./src/controller/cron_controller');


const app = express();
const port = process.env.PORT || 3000;
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors(corsOptions));

connectMongo();
setCronjobs(process.env.CRON_ENABLED);

app.use(authRoutes);
app.use('/web-api', checkAuthentication, webRoutes);

app.listen(port, () => {
  console.info('Server listening');
});
