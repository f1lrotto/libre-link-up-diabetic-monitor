const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');

require('./src/config/passport'); // Passport configuration
const corsOptions = require('./src/config/corsOptions');
const sessionOptions = require('./src/config/sessionOptions');
const authRoutes = require('./src/routes/authRoutes');
const webRoutes = require('./src/routes/webRoutes');
const { connectMongo } = require('./src/common/mongoConnect');
const { setCronjobs } = require('./src/controller/cron_controller');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
console.log(passport);
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors(corsOptions));

connectMongo();
setCronjobs();

app.use(authRoutes);
app.use('/web-api', webRoutes);

app.listen(port, () => {
  console.info('Server listening');
});


// const express = require('express');
// const cors = require('cors');
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const session = require('express-session');

// const { connectMongo } = require('./src/common/mongoConnect');
// const { setCronjobs } = require('./src/controller/cron_controller');

// const webRouter = require('./src/router/webRouter');
// // const watchRouter = require('./router/watchRouter');

// require('dotenv').config();

// // Create the Express application
// const app = express();
// const port = process.env.PORT || 3000;

// // Set up a whitelist and CORS options
// const corsOptions = {
//   origin: 'http://cgm.filiphupka.com',
//   credentials: true,
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
// };

// app.use(cors(corsOptions));

// // Connect to the database
// console.info('Connecting to MongoDB...');
// connectMongo();


// function checkAuthentication(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   return res.status(401).send('Not authenticated');
// }

// if (process.env.CRON_ENABLED === 'true') {
//   console.info('Setting cronjobs...');
//   setCronjobs();
// } else {
//   console.info('Cronjobs set to: ', process.env.CRON_ENABLED);
// }

// app.use(session({
//   secret: process.env.SECRET, // A secret key used to sign the session ID cookie
//   resave: false, // Forces the session to be saved back to the session store
//   saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store
//   cookie: {
//     secure: false, // Set to true if you are using HTTPS
//     httpOnly: true, // Reduces the risk of client-side script accessing the protected cookie
//     maxAge: 1000 * 60 * 60 * 24 * 7, // Setthecookieto expire after 1 day (value in milliseconds)
//   },
// }));

// // Initialize Passport
// app.use(passport.initialize());
// app.use(passport.session());

// // Configure Passport with the Google strategy
// passport.use(new GoogleStrategy(
//   {
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: 'http://cgm.backend.filiphupka.com/auth/google/callback',
//   },
//   (accessToken, refreshToken, profile, done) => {
//     // Check if the user's email is in the list of allowed emails
//     const userEmail = profile.emails[0].value; // Assuming the first email is the primary one
//     if (process.env.ALLOWED_EMAILS.split(',').includes(userEmail)) {
//       done(null, profile);
//     } else {
//       done(null, false); // User not allowed
//     }
//   },
// ));


// // Serialize and deserialize user instances to and from the session.
// passport.serializeUser((user, done) => {
//   done(null, user);
// });
// passport.deserializeUser((id, done) => {
//   done(null, id);
// });


// app.get(
//   '/auth/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] }),
// );

// app.get(
//   '/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: 'http://cgm.backend.filiphupka.com/unauthorized' }),
//   (req, res) => {
//     // Successful authentication, redirect home.
//     res.redirect('http://cgm.filiphupka.com');
//   },
// );

// app.get('/logout', (req, res) => {
//   req.logout((err) => {
//     if (err) {
//       console.error('Logout error: ', err);
//       return res.status(500).send('Error during logout');
//     }
//     req.session.destroy(); // Destroy the session after logout
//     res.clearCookie('connect.sid'); // Clear the session cookie
//     return res.send('Logged out');
//   });
// });


// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

// app.get('/validate-session', (req, res) => {
//   if (req.isAuthenticated()) {
//     // If the user is authenticated, return some user details
//     // Adjust the returned user details as per your requirements
//     res.json({
//       authenticated: true,
//       user: {
//         id: req.user.id,
//         name: req.user.displayName,
//         email: req.user.emails[0].value,
//       },
//     });
//   } else {
//     // If the user is not authenticated
//     res.json({ authenticated: false });
//   }
// });

// app.get('/unauthorized', (req, res) => {
//   res.send('You are not authorized to access this application.');
// });


// app.use('/web-api', checkAuthentication, webRouter);

// app.listen(port, async () => {
//   console.info(`Server listening at http://localhost:${port}`);
// });
