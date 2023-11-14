module.exports = {
  secret: process.env.SECRET, // A secret key used to sign the session ID cookie
  resave: false, // Forces the session to be saved back to the session store
  saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store
  cookie: {
    secure: false, // Set to true if you are using HTTPS
    httpOnly: true, // Reduces the risk of client-side script accessing the protected cookie
    maxAge: 1000 * 60 * 60 * 24 * 7, // Set the cookie to expire after 1 day (value in milliseconds)
  },
};
