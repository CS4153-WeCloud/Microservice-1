const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Extract user information from Google profile
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || '';
      const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';
      
      if (!email) {
        return done(new Error('No email found in Google profile'), null);
      }

      // Check if user already exists
      let user = await User.findByEmail(email);

      if (user) {
        // Update Google ID if not set
        if (!user.googleId && profile.id) {
          await User.update(user.id, { googleId: profile.id });
          user = await User.findById(user.id);
        }
        return done(null, user);
      } else {
        // Create new user from Google profile
        const newUser = await User.create({
          email: email,
          firstName: firstName,
          lastName: lastName,
          googleId: profile.id,
          status: 'active',
          role: 'student' // Default role, can be updated later
        });
        return done(null, newUser);
      }
    } catch (error) {
      return done(error, null);
    }
  }
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

