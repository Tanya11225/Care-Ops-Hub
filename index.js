import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import path from 'path';
import { createServer } from 'http';
import { WebSocketServer as Server } from 'ws';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);
const wss = new Server({ server });
const port = process.env.PORT || 5000;

// Mock database with realistic data
const mockDB = {
  users: [
    { id: "1", email: "admin@careops.com", firstName: "Admin", lastName: "User", role: "admin" },
    { id: "2", email: "staff@careops.com", firstName: "Staff", lastName: "Member", role: "staff" }
  ],
  contacts: [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", phone: "555-0101", status: "active", createdAt: new Date(), address: "123 Main St, City, State" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", phone: "555-0102", status: "new", createdAt: new Date(), address: "456 Oak Ave, City, State" },
    { id: 3, name: "Carol Davis", email: "carol@example.com", phone: "555-0103", status: "active", createdAt: new Date(), address: "789 Pine Rd, City, State" },
    { id: 4, name: "David Wilson", email: "david@example.com", phone: "555-0104", status: "inactive", createdAt: new Date(), address: "321 Elm St, City, State" }
  ],
  services: [
    { id: 1, name: "Initial Consultation", description: "30 minute introductory consultation", duration: 30, price: 0, category: "consultation", isActive: true },
    { id: 2, name: "Standard Cleaning", description: "Regular home cleaning service", duration: 120, price: 15000, category: "cleaning", isActive: true },
    { id: 3, name: "Deep Cleaning", description: "Thorough deep cleaning service", duration: 240, price: 30000, category: "cleaning", isActive: true },
    { id: 4, "name": "Window Cleaning", "description": "Professional window cleaning", "duration": 60, "price": 8000, "category": "cleaning", "isActive": true },
    { id: 5, "name": "Carpet Cleaning", "description": "Deep carpet cleaning service", "duration": 90, "price": 12000, "category": "cleaning", "isActive": true },
    { id: 6, "name": "Move-in/Move-out", "description": "Complete move cleaning package", "duration": 300, "price": 45000, "category": "cleaning", "isActive": true }
  ],
  bookings: [
    { id: 1, contactId: 1, serviceId: 2, startTime: new Date(Date.now() + 86400000), endTime: new Date(Date.now() + 86400000 + 7200000), status: "confirmed", notes: "Gate code: 1234", price: 15000 },
    { id: 2, contactId: 2, serviceId: 3, startTime: new Date(Date.now() + 172800000), endTime: new Date(Date.now() + 172800000 + 14400000), status: "pending", notes: "Bring extra supplies", price: 30000 },
    { id: 3, contactId: 3, serviceId: 4, startTime: new Date(Date.now() + 259200000), endTime: new Date(Date.now() + 259200000 + 3600000), status: "confirmed", notes: "Customer prefers morning", price: 8000 }
  ],
  forms: [
    { id: 1, title: "Customer Feedback", description: "Post-service feedback form", fields: ["rating", "comments", "recommendations"], isActive: true },
    { id: 2, title: "Service Request", description: "New service request form", fields: ["serviceType", "address", "timeline", "budget"], isActive: true },
    { id: 3, title: "Complaint Report", description: "Customer complaint form", fields: ["issue", "severity", "resolution"], isActive: true }
  ],
  inventory: [
    { id: 1, name: "Cleaning Solution A", quantity: 10, lowStockThreshold: 5, sku: "SOL-A", category: "chemicals", unitPrice: 1500 },
    { id: 2, name: "Microfiber Cloths", quantity: 50, lowStockThreshold: 10, sku: "CLOTH-M", category: "supplies", unitPrice: 200 },
    { id: 3, name: "Vacuum Bags", quantity: 3, lowStockThreshold: 5, sku: "VAC-B", category: "supplies", unitPrice: 800 },
    { id: 4, name: "Glass Cleaner", quantity: 8, lowStockThreshold: 3, sku: "GLASS-C", category: "chemicals", unitPrice: 1200 },
    { id: 5, name: "Trash Bags", quantity: 25, lowStockThreshold: 10, sku: "TRASH-L", category: "supplies", unitPrice: 150 },
    { id: 6, name: "Disinfectant Spray", quantity: 15, lowStockThreshold: 5, sku: "DIS-S", category: "chemicals", unitPrice: 1800 }
  ],
  alerts: [
    { id: 1, type: "low_stock", message: "Low stock warning: Vacuum Bags is down to 3", relatedId: 3, isRead: false, createdAt: new Date() },
    { id: 2, type: "booking", message: "New booking request from Bob Smith", relatedId: 2, isRead: false, createdAt: new Date() },
    { id: 3, type: "system", message: "Scheduled maintenance reminder", relatedId: null, isRead: true, createdAt: new Date(Date.now() - 86400000) },
    { id: 4, type: "contact", message: "New contact added: Carol Davis", relatedId: 3, isRead: false, createdAt: new Date() }
  ],
  conversations: [
    { id: 1, contactId: 1, title: "Service Inquiry", status: "active", createdAt: new Date(), updatedAt: new Date() },
    { id: 2, contactId: 2, title: "Booking Questions", status: "active", createdAt: new Date(), updatedAt: new Date() }
  ],
  messages: [
    { id: 1, conversationId: 1, content: "Hi, I'm interested in your cleaning services", sender: "user", createdAt: new Date() },
    { id: 2, conversationId: 1, content: "Hello! We'd be happy to help. What type of cleaning are you looking for?", sender: "agent", createdAt: new Date() },
    { id: 3, conversationId: 2, content: "Do you offer weekend cleaning?", sender: "user", createdAt: new Date() }
  ]
};

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'care-ops-hub-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to false for HTTP
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
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
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
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

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('message', (message) => {
    console.log('Received WebSocket message:', message.toString());
    
    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) { // 1 = WebSocket.OPEN
        client.send(message.toString());
      }
    });
  });
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Authentication routes
app.post('/api/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: 'Authentication failed' });
    
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      res.json(user);
    });
  })(req, res, next);
});

app.post('/api/auth/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/auth');
  });
});

app.get('/api/auth/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.get('/api/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// API Routes with full CRUD operations
app.get('/api/contacts', (req, res) => {
  const { search, status } = req.query;
  let contacts = mockDB.contacts;
  
  if (search) {
    contacts = contacts.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (status) {
    contacts = contacts.filter(c => c.status === status);
  }
  
  res.json(contacts);
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

app.put('/api/contacts/:id', (req, res) => {
  const index = mockDB.contacts.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Contact not found' });
  
  mockDB.contacts[index] = { ...mockDB.contacts[index], ...req.body };
  res.json(mockDB.contacts[index]);
});

app.delete('/api/contacts/:id', (req, res) => {
  const index = mockDB.contacts.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Contact not found' });
  
  mockDB.contacts.splice(index, 1);
  res.status(204).send();
});

app.get('/api/services', (req, res) => {
  const { category, isActive } = req.query;
  let services = mockDB.services;
  
  if (category) {
    services = services.filter(s => s.category === category);
  }
  
  if (isActive !== undefined) {
    services = services.filter(s => s.isActive === (isActive === 'true'));
  }
  
  res.json(services);
});

app.post('/api/services', (req, res) => {
  const newService = {
    id: mockDB.services.length + 1,
    ...req.body
  };
  mockDB.services.push(newService);
  res.status(201).json(newService);
});

app.put('/api/services/:id', (req, res) => {
  const index = mockDB.services.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Service not found' });
  
  mockDB.services[index] = { ...mockDB.services[index], ...req.body };
  res.json(mockDB.services[index]);
});

app.delete('/api/services/:id', (req, res) => {
  const index = mockDB.services.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Service not found' });
  
  mockDB.services.splice(index, 1);
  res.status(204).send();
});

app.get('/api/bookings', (req, res) => {
  const { status, startDate, endDate } = req.query;
  let bookings = mockDB.bookings.map(booking => ({
    ...booking,
    contact: mockDB.contacts.find(c => c.id === booking.contactId),
    service: mockDB.services.find(s => s.id === booking.serviceId)
  }));
  
  if (status) {
    bookings = bookings.filter(b => b.status === status);
  }
  
  if (startDate && endDate) {
    bookings = bookings.filter(b => {
      const bookingDate = new Date(b.startTime);
      return bookingDate >= new Date(startDate) && bookingDate <= new Date(endDate);
    });
  }
  
  res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
  const newBooking = {
    id: mockDB.bookings.length + 1,
    ...req.body,
    startTime: new Date(req.body.startTime),
    endTime: new Date(req.body.endTime),
    status: 'pending'
  };
  mockDB.bookings.push(newBooking);
  res.status(201).json(newBooking);
});

app.put('/api/bookings/:id', (req, res) => {
  const index = mockDB.bookings.findIndex(b => b.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Booking not found' });
  
  mockDB.bookings[index] = { ...mockDB.bookings[index], ...req.body };
  res.json(mockDB.bookings[index]);
});

app.delete('/api/bookings/:id', (req, res) => {
  const index = mockDB.bookings.findIndex(b => b.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Booking not found' });
  
  mockDB.bookings.splice(index, 1);
  res.status(204).send();
});

app.get('/api/forms', (req, res) => {
  const { isActive } = req.query;
  let forms = mockDB.forms;
  
  if (isActive !== undefined) {
    forms = forms.filter(f => f.isActive === (isActive === 'true'));
  }
  
  res.json(forms);
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
  const { category, lowStock } = req.query;
  let inventory = mockDB.inventory;
  
  if (category) {
    inventory = inventory.filter(i => i.category === category);
  }
  
  if (lowStock === 'true') {
    inventory = inventory.filter(i => i.quantity <= i.lowStockThreshold);
  }
  
  res.json(inventory);
});

app.post('/api/inventory', (req, res) => {
  const newItem = {
    id: mockDB.inventory.length + 1,
    ...req.body
  };
  mockDB.inventory.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/inventory/:id', (req, res) => {
  const index = mockDB.inventory.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Inventory item not found' });
  
  mockDB.inventory[index] = { ...mockDB.inventory[index], ...req.body };
  res.json(mockDB.inventory[index]);
});

app.delete('/api/inventory/:id', (req, res) => {
  const index = mockDB.inventory.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Inventory item not found' });
  
  mockDB.inventory.splice(index, 1);
  res.status(204).send();
});

app.get('/api/alerts', (req, res) => {
  const { isRead, type } = req.query;
  let alerts = mockDB.alerts;
  
  if (isRead !== undefined) {
    alerts = alerts.filter(a => a.isRead === (isRead === 'true'));
  }
  
  if (type) {
    alerts = alerts.filter(a => a.type === type);
  }
  
  res.json(alerts);
});

app.patch('/api/alerts/:id/read', (req, res) => {
  const alert = mockDB.alerts.find(a => a.id === parseInt(req.params.id));
  if (!alert) return res.status(404).json({ message: 'Alert not found' });
  
  alert.isRead = true;
  res.json(alert);
});

app.delete('/api/alerts/:id', (req, res) => {
  const index = mockDB.alerts.findIndex(a => a.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Alert not found' });
  
  mockDB.alerts.splice(index, 1);
  res.status(204).send();
});

app.get('/api/conversations', (req, res) => {
  const conversations = mockDB.conversations.map(conv => ({
    ...conv,
    contact: mockDB.contacts.find(c => c.id === conv.contactId),
    lastMessage: mockDB.messages.filter(m => m.conversationId === conv.id).slice(-1)[0]
  }));
  res.json(conversations);
});

app.get('/api/conversations/:id/messages', (req, res) => {
  const messages = mockDB.messages.filter(m => m.conversationId === parseInt(req.params.id));
  res.json(messages);
});

app.post('/api/conversations/:id/messages', (req, res) => {
  const newMessage = {
    id: mockDB.messages.length + 1,
    conversationId: parseInt(req.params.id),
    ...req.body,
    createdAt: new Date()
  };
  mockDB.messages.push(newMessage);
  res.status(201).json(newMessage);
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
    confirmedBookings: mockDB.bookings.filter(b => b.status === 'confirmed').length,
    totalRevenue: mockDB.bookings.reduce((sum, b) => sum + (b.price || 0), 0),
    lowStockItems: mockDB.inventory.filter(i => i.quantity <= i.lowStockThreshold).length,
    unreadAlerts: mockDB.alerts.filter(a => !a.isRead).length,
    totalServices: mockDB.services.length,
    activeServices: mockDB.services.filter(s => s.isActive).length,
    totalForms: mockDB.forms.length,
    activeForms: mockDB.forms.filter(f => f.isActive).length,
    recentBookings: mockDB.bookings.slice(-5).map(b => ({
      ...b,
      contact: mockDB.contacts.find(c => c.id === b.contactId),
      service: mockDB.services.find(s => s.id === b.serviceId)
    })),
    topServices: mockDB.services.map(s => ({
      ...s,
      bookingCount: mockDB.bookings.filter(b => b.serviceId === s.id).length
    })).sort((a, b) => b.bookingCount - a.bookingCount).slice(0, 5)
  };
  res.json(stats);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Care Ops Hub API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'client/dist')));

// Handle frontend routing - catch all routes not matching /api/
app.get(/^\/?.*/, (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Care Ops Hub is running on http://localhost:${port}`);
  console.log(`📊 API available at http://localhost:${port}/api/health`);
  console.log(`🔧 Server is ready for requests`);
  console.log(`🌐 Frontend served from /client/dist`);
  console.log(`📝 WebSocket server running on ws://localhost:${port}`);
});
