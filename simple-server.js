const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const path = require('path');

const app = express();
const port = 5000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session setup
app.use(session({
  secret: 'care-ops-hub-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Simple auth strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
  },
  (email, password, done) => {
    // Simple demo authentication
    if (email && password) {
      return done(null, { id: '1', email: email, firstName: 'Demo' });
    }
    return done(null, false);
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, { id: id, email: 'demo@example.com', firstName: 'Demo' }));

// Routes
app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
  res.json(req.user);
});

app.post('/api/auth/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Care Ops Hub API is running' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist/public')));
} else {
  // In development, let Vite handle the frontend
  app.get('*', (req, res) => {
    res.json({ message: 'Development server - frontend should be served by Vite' });
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});
