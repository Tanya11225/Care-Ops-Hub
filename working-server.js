console.log('Starting Care Ops Hub server...');

const express = require('express');
const { createServer } = require('http');
const path = require('path');

const app = express();
const httpServer = createServer(app);

// Mock data storage
const mockData = {
  users: [
    { id: "1", email: "admin@careops.com", firstName: "Admin", lastName: "User" }
  ],
  contacts: [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", phone: "555-0101", status: "active" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", phone: "555-0102", status: "new" }
  ],
  services: [
    { id: 1, name: "Initial Consultation", description: "30 min intro call", duration: 30, price: 0 },
    { id: 2, name: "Standard Cleaning", description: "Regular home cleaning", duration: 120, price: 15000 },
    { id: 3, name: "Deep Cleaning", description: "Thorough deep clean", duration: 240, price: 30000 }
  ],
  bookings: [
    { id: 1, contactId: 1, serviceId: 2, startTime: new Date(Date.now() + 86400000), endTime: new Date(Date.now() + 86400000 + 7200000), status: "confirmed", notes: "Gate code: 1234" }
  ],
  forms: [],
  inventory: [
    { id: 1, name: "Cleaning Solution A", quantity: 10, lowStockThreshold: 5, sku: "SOL-A" },
    { id: 2, name: "Microfiber Cloths", quantity: 50, lowStockThreshold: 10, sku: "CLOTH-M" },
    { id: 3, name: "Vacuum Bags", quantity: 3, lowStockThreshold: 5, sku: "VAC-B" }
  ],
  alerts: [
    { id: 1, type: "low_stock", message: "Low stock warning: Vacuum Bags is down to 3", relatedId: 3, isRead: false }
  ]
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS
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

// Auth routes
app.post("/api/auth/login", (req, res) => {
  console.log('Login request:', req.body);
  const { email, password } = req.body;
  const user = mockData.users.find(u => u.email === email);
  if (user) {
    res.json(user);
  } else {
    // Create new user if not found
    const newUser = { id: String(mockData.users.length + 1), email, firstName: email.split("@")[0], lastName: "User" };
    mockData.users.push(newUser);
    res.json(newUser);
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

app.get("/api/auth/me", (req, res) => {
  res.json(mockData.users[0]); // Return first user for demo
});

// API Routes
app.get("/api/contacts", (req, res) => {
  res.json(mockData.contacts);
});

app.get("/api/services", (req, res) => {
  res.json(mockData.services);
});

app.get("/api/bookings", (req, res) => {
  const bookingsWithRelations = mockData.bookings.map(booking => ({
    ...booking,
    contact: mockData.contacts.find(c => c.id === booking.contactId),
    service: mockData.services.find(s => s.id === booking.serviceId)
  }));
  res.json(bookingsWithRelations);
});

app.get("/api/forms", (req, res) => {
  res.json(mockData.forms);
});

app.get("/api/inventory", (req, res) => {
  res.json(mockData.inventory);
});

app.get("/api/alerts", (req, res) => {
  res.json(mockData.alerts);
});

app.get("/api/dashboard/stats", (req, res) => {
  const stats = {
    todayBookings: 1,
    upcomingBookings: 2,
    pendingForms: 0,
    lowStockItems: 1,
    unreadAlerts: 1,
    revenue: 15000
  };
  res.json(stats);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Care Ops Hub API is running" });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Care Ops Hub API is running", 
    status: "SUCCESS - All Replit references removed!",
    replitFree: true,
    endpoints: [
      "/api/health",
      "/api/auth/login",
      "/api/contacts",
      "/api/services",
      "/api/bookings",
      "/api/forms",
      "/api/inventory",
      "/api/alerts",
      "/api/dashboard/stats"
    ]
  });
});

// Start server
const port = process.env.PORT || 5000;
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Care Ops Hub is running on http://localhost:${port}`);
  console.log(`📊 API available at http://localhost:${port}/api/health`);
  console.log(`✅ All Replit dependencies have been removed!`);
  console.log(`🔧 Server is ready for requests`);
});
