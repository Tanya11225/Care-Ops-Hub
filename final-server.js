console.log('Starting Care Ops Hub server...');

const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Request received:', req.method, req.url);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === '/' || req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Care Ops Hub API is running!',
      status: 'SUCCESS',

      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Care Ops Hub endpoint',
      url: req.url,
      method: req.method
    }));
  }
});

const port = 5000;
server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Care Ops Hub is running on http://localhost:${port}`);

  console.log(`🔧 Server is ready for requests`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
