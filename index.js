const express = require('express');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

require('dotenv').config();


const { connectMongo } = require('./src/common/mongoConnect');
const { setCronjobs } = require('./src/controller/cron_controller');

const webRouter = require('./src/router/webRouter');
// const watchRouter = require('./router/watchRouter');

// Configure session middleware

const app = express();
const port = process.env.PORT || 3000;

console.info('Connecting to MongoDB...');
connectMongo();

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).send('Not authenticated');
}

if (process.env.CRON_ENABLED === 'true') {
  console.info('Setting cronjobs...');
  setCronjobs();
} else {
  console.info('Cronjobs set to: ', process.env.CRON_ENABLED);
}

app.use(session({
  secret: process.env.SECRET, // A secret key used to sign the session ID cookie
  resave: false, // Forces the session to be saved back to the session store
  saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store
  cookie: {
    secure: false, // Set to true if you are using HTTPS
    httpOnly: true, // Reduces the risk of client-side script accessing the protected cookie
    maxAge: 1000 * 60 * 60 * 24 * 7, // Set the cookie to expire after 1 day (value in milliseconds)
  },
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport with the Google strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  },
  (accessToken, refreshToken, profile, done) => {
    // This function will be called when the user has authenticated with Google.
    // You can use the `profile` object to create or update a user in your database.
    // The `done` function should be called with the user object when you're done.
    done(null, profile);
  },
));

// Serialize and deserialize user instances to and from the session.
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((id, done) => {
  done(null, id);
});


app.use(cors());

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'cgm.filiphupka.com' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('cgm.filiphupka.com');
  },
);


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/validate-session', (req, res) => {
  if (req.isAuthenticated()) {
    // If the user is authenticated, return some user details
    // Adjust the returned user details as per your requirements
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        name: req.user.displayName,
        email: req.user.emails[0].value,
      },
    });
  } else {
    // If the user is not authenticated
    res.json({ authenticated: false });
  }
});

// Middleware to check for bearer token on all routes
// app.use((req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).json({ error: 'Missing bearer token' });
//   }
//   const token = authHeader.split(' ')[1];
//   if (token !== process.env.BEARER_TOKEN) {
//     return res.status(401).json({ error: 'Invalid bearer token' });
//   }
//   return next();
// });

app.use('/web-api', isAuthenticated, webRouter);

app.listen(port, async () => {
  console.info(`Server listening at http://localhost:${port}`);
});
