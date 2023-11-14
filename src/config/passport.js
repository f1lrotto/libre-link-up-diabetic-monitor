const GoogleStrategy = require('passport-google-oauth20').Strategy;

// eslint-disable-next-line space-before-function-paren, func-names
module.exports = function(passport) {
  passport.use(new GoogleStrategy(
    console.log("Configuring Google strategy for passport"),
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("Google strategy callback executed"); // Add for debugging
      done(null, profile);
    },
  ));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((id, done) => {
    done(null, id);
  });
};
