console.log('Starting Care Ops Hub...');

const http = require('http');

const port = 5000;

const server = http.createServer((req, res) => {
  console.log('Request:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Mock data
  const mockData = {
    users: [{ id: "1", email: "admin@careops.com", firstName: "Admin", lastName: "User" }],
    contacts: [
      { id: 1, name: "Alice Johnson", email: "alice@example.com", phone: "555-0101", status: "active" },
      { id: 2, name: "Bob Smith", email: "bob@example.com", phone: "555-0102", status: "new" }
    ],
    services: [
      { id: 1, name: "Initial Consultation", description: "30 min intro call", duration: 30, price: 0 },
      { id: 2, name: "Standard Cleaning", description: "Regular home cleaning", duration: 120, price: 15000 }
    ],
    bookings: [
      { id: 1, contactId: 1, serviceId: 2, status: "confirmed", notes: "Gate code: 1234" }
    ]
  };
  
  let response = { message: 'Care Ops Hub API is running!' };
  
  // Route handling
  if (req.url === '/' || req.url === '/api/health') {
    response = {
      message: 'Care Ops Hub API is running!',
      status: 'SUCCESS',

      timestamp: new Date().toISOString(),
      endpoints: ['/api/health', '/api/auth/login', '/api/contacts', '/api/services', '/api/bookings']
    };
  } else if (req.url === '/api/auth/login') {
    response = { id: "1", email: "admin@careops.com", firstName: "Admin", lastName: "User" };
  } else if (req.url === '/api/contacts') {
    response = mockData.contacts;
  } else if (req.url === '/api/services') {
    response = mockData.services;
  } else if (req.url === '/api/bookings') {
    response = mockData.bookings;
  } else if (req.url === '/api/dashboard/stats') {
    response = {
      totalContacts: mockData.contacts.length,
      activeContacts: mockData.contacts.filter(c => c.status === 'active').length,
      totalBookings: mockData.bookings.length,
      totalRevenue: 15000,
      unreadAlerts: 1
    };
  }
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(response, null, 2));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Care Ops Hub is running on http://localhost:${port}`);

  console.log(`🔧 Server is ready for requests`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

console.log('Server setup complete, about to start...');
