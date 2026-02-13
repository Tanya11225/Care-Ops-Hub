const http = require('http');
const url = require('url');

// Mock data
const mockData = {
  users: [{ id: "1", email: "admin@careops.com", firstName: "Admin", lastName: "User" }],
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

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // Parse body for POST requests
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    let responseData = { message: 'Care Ops Hub API is running!' };
    
    try {
      if (path === '/' || path === '/api/health') {
        responseData = {
          message: 'Care Ops Hub API is running!',
          status: 'SUCCESS',

          endpoints: [
            '/api/health',
            '/api/auth/login',
            '/api/contacts',
            '/api/services',
            '/api/bookings',
            '/api/forms',
            '/api/inventory',
            '/api/alerts',
            '/api/dashboard/stats'
          ]
        };
      } else if (path === '/api/auth/login') {
        const loginData = JSON.parse(body || '{}');
        const user = mockData.users.find(u => u.email === loginData.email);
        if (user) {
          responseData = user;
        } else {
          responseData = { id: String(mockData.users.length + 1), email: loginData.email, firstName: loginData.email?.split("@")[0] || "User", lastName: "User" };
        }
      } else if (path === '/api/auth/logout') {
        responseData = { message: "Logged out successfully" };
      } else if (path === '/api/auth/me') {
        responseData = mockData.users[0];
      } else if (path === '/api/contacts') {
        responseData = mockData.contacts;
      } else if (path === '/api/services') {
        responseData = mockData.services;
      } else if (path === '/api/bookings') {
        responseData = mockData.bookings.map(booking => ({
          ...booking,
          contact: mockData.contacts.find(c => c.id === booking.contactId),
          service: mockData.services.find(s => s.id === booking.serviceId)
        }));
      } else if (path === '/api/forms') {
        responseData = mockData.forms;
      } else if (path === '/api/inventory') {
        responseData = mockData.inventory;
      } else if (path === '/api/alerts') {
        responseData = mockData.alerts;
      } else if (path === '/api/dashboard/stats') {
        responseData = {
          todayBookings: 1,
          upcomingBookings: 2,
          pendingForms: 0,
          lowStockItems: 1,
          unreadAlerts: 1,
          revenue: 15000
        };
      }
    } catch (error) {
      responseData = { error: 'Internal server error', message: error.message };
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responseData, null, 2));
  });
});

const port = 5000;
server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Care Ops Hub is running on http://localhost:${port}`);
  console.log(`📊 API available at http://localhost:${port}/api/health`);

  console.log(`🔧 Server is ready for requests`);
});
