const express = require('express');
const passport = require('passport');

const router = express.Router();

// Route for initiating Google OAuth
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

// Callback route for Google to redirect to
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/unauthorized' }),
  (req, res) => {
    // Successful authentication, redirect to your desired page
    res.redirect('http://cgm.filiphupka.com');
  },
);

// Unauthorized access route
router.get('/unauthorized', (req, res) => {
  res.send('You are not authorized to access this application.');
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error: ', err);
      return res.status(500).send('Error during logout');
    }
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); // Clear the session cookie
      return res.send('Logged out');
    });
    return null;
  });
});

router.get('/validate-session', (req, res) => {
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

module.exports = router;
