const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Mock database
const mockDB = {
  users: [
    { id: "1", email: "admin@careops.com", firstName: "Admin", lastName: "User", role: "admin" },
    { id: "2", email: "staff@careops.com", firstName: "Staff", lastName: "Member", role: "staff" }
  ],
  contacts: [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", phone: "555-0101", status: "active", createdAt: new Date() },
    { id: 2, name: "Bob Smith", email: "bob@example.com", phone: "555-0102", status: "new", createdAt: new Date() },
    { id: 3, name: "Carol Davis", email: "carol@example.com", phone: "555-0103", status: "active", createdAt: new Date() }
  ],
  services: [
    { id: 1, name: "Initial Consultation", description: "30 minute introductory consultation", duration: 30, price: 0, category: "consultation" },
    { id: 2, name: "Standard Cleaning", description: "Regular home cleaning service", duration: 120, price: 15000, category: "cleaning" },
    { id: 3, name: "Deep Cleaning", description: "Thorough deep cleaning service", duration: 240, price: 30000, category: "cleaning" },
    { id: 4, name: "Window Cleaning", description: "Professional window cleaning", duration: 60, price: 8000, category: "cleaning" }
  ],
  bookings: [
    { id: 1, contactId: 1, serviceId: 2, startTime: new Date(Date.now() + 86400000), endTime: new Date(Date.now() + 86400000 + 7200000), status: "confirmed", notes: "Gate code: 1234", price: 15000 },
    { id: 2, contactId: 2, serviceId: 3, startTime: new Date(Date.now() + 172800000), endTime: new Date(Date.now() + 172800000 + 14400000), status: "pending", notes: "Bring extra supplies", price: 30000 }
  ],
  forms: [
    { id: 1, title: "Customer Feedback", description: "Post-service feedback form", fields: ["rating", "comments", "recommendations"], isActive: true },
    { id: 2, title: "Service Request", description: "New service request form", fields: ["serviceType", "address", "timeline", "budget"], isActive: true }
  ],
  inventory: [
    { id: 1, name: "Cleaning Solution A", quantity: 10, lowStockThreshold: 5, sku: "SOL-A", category: "chemicals", unitPrice: 1500 },
    { id: 2, name: "Microfiber Cloths", quantity: 50, lowStockThreshold: 10, sku: "CLOTH-M", category: "supplies", unitPrice: 200 },
    { id: 3, name: "Vacuum Bags", quantity: 3, lowStockThreshold: 5, sku: "VAC-B", category: "supplies", unitPrice: 800 },
    { id: 4, name: "Glass Cleaner", quantity: 8, lowStockThreshold: 3, sku: "GLASS-C", category: "chemicals", unitPrice: 1200 }
  ],
  alerts: [
    { id: 1, type: "low_stock", message: "Low stock warning: Vacuum Bags is down to 3", relatedId: 3, isRead: false, createdAt: new Date() },
    { id: 2, type: "booking", message: "New booking request from Bob Smith", relatedId: 2, isRead: false, createdAt: new Date() },
    { id: 3, type: "system", message: "Scheduled maintenance reminder", relatedId: null, isRead: true, createdAt: new Date(Date.now() - 86400000) }
  ]
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'care-ops-hub-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to false for HTTP
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  (email, password, done) => {
    // Simple authentication - accept any email with any password for demo
    const user = mockDB.users.find(u => u.email === email);
    if (user) {
      return done(null, user);
    } else {
      // Create new user if not found
      const newUser = {
        id: String(mockDB.users.length + 1),
        email: email,
        firstName: email.split("@")[0],
        lastName: "User",
        role: "user"
      };
      mockDB.users.push(newUser);
      return done(null, newUser);
    }
  }
));

// Serialize/deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = mockDB.users.find(u => u.id === id);
  done(null, user || null);
});

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Authentication routes
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

// API Routes
app.get('/api/contacts', (req, res) => {
  res.json(mockDB.contacts);
});

app.get('/api/contacts/:id', (req, res) => {
  const contact = mockDB.contacts.find(c => c.id === parseInt(req.params.id));
  if (!contact) return res.status(404).json({ message: 'Contact not found' });
  res.json(contact);
});

app.post('/api/contacts', (req, res) => {
  const newContact = {
    id: mockDB.contacts.length + 1,
    ...req.body,
    createdAt: new Date()
  };
  mockDB.contacts.push(newContact);
  res.status(201).json(newContact);
});

app.get('/api/services', (req, res) => {
  res.json(mockDB.services);
});

app.post('/api/services', (req, res) => {
  const newService = {
    id: mockDB.services.length + 1,
    ...req.body
  };
  mockDB.services.push(newService);
  res.status(201).json(newService);
});

app.get('/api/bookings', (req, res) => {
  const bookingsWithRelations = mockDB.bookings.map(booking => ({
    ...booking,
    contact: mockDB.contacts.find(c => c.id === booking.contactId),
    service: mockDB.services.find(s => s.id === booking.serviceId)
  }));
  res.json(bookingsWithRelations);
});

app.post('/api/bookings', (req, res) => {
  const newBooking = {
    id: mockDB.bookings.length + 1,
    ...req.body,
    startTime: new Date(req.body.startTime),
    endTime: new Date(req.body.endTime)
  };
  mockDB.bookings.push(newBooking);
  res.status(201).json(newBooking);
});

app.get('/api/forms', (req, res) => {
  res.json(mockDB.forms);
});

app.post('/api/forms', (req, res) => {
  const newForm = {
    id: mockDB.forms.length + 1,
    ...req.body
  };
  mockDB.forms.push(newForm);
  res.status(201).json(newForm);
});

app.get('/api/inventory', (req, res) => {
  res.json(mockDB.inventory);
});

app.post('/api/inventory', (req, res) => {
  const newItem = {
    id: mockDB.inventory.length + 1,
    ...req.body
  };
  mockDB.inventory.push(newItem);
  res.status(201).json(newItem);
});

app.get('/api/alerts', (req, res) => {
  res.json(mockDB.alerts);
});

app.patch('/api/alerts/:id/read', (req, res) => {
  const alert = mockDB.alerts.find(a => a.id === parseInt(req.params.id));
  if (alert) {
    alert.isRead = true;
  }
  res.json(alert);
});

app.get('/api/dashboard/stats', (req, res) => {
  const stats = {
    totalContacts: mockDB.contacts.length,
    activeContacts: mockDB.contacts.filter(c => c.status === 'active').length,
    totalBookings: mockDB.bookings.length,
    todayBookings: mockDB.bookings.filter(b => {
      const today = new Date();
      const bookingDate = new Date(b.startTime);
      return bookingDate.toDateString() === today.toDateString();
    }).length,
    pendingBookings: mockDB.bookings.filter(b => b.status === 'pending').length,
    totalRevenue: mockDB.bookings.reduce((sum, b) => sum + (b.price || 0), 0),
    lowStockItems: mockDB.inventory.filter(i => i.quantity <= i.lowStockThreshold).length,
    unreadAlerts: mockDB.alerts.filter(a => !a.isRead).length,
    totalServices: mockDB.services.length
  };
  res.json(stats);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Care Ops Hub API is running',
    timestamp: new Date().toISOString(),
    replitFree: true
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Care Ops Hub API is running',
    status: 'SUCCESS',
    replitFree: true,
    endpoints: [
      '/api/health',
      '/api/auth/login',
      '/api/auth/logout',
      '/api/auth/me',
      '/api/contacts',
      '/api/services',
      '/api/bookings',
      '/api/forms',
      '/api/inventory',
      '/api/alerts',
      '/api/dashboard/stats'
    ]
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist/public')));
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Care Ops Hub is running on http://localhost:${port}`);
  console.log(`📊 API available at http://localhost:${port}/api/health`);
  console.log(`✅ All Replit dependencies have been removed!`);
  console.log(`🔧 Server is ready for requests`);
  console.log(`📝 Available endpoints: /api/health, /api/contacts, /api/services, /api/bookings, etc.`);
});
