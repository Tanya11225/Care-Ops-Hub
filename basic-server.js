console.log('Starting basic server...');

const http = require('http');

const port = 5000;

const server = http.createServer((req, res) => {
  console.log('Request:', req.method, req.url);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Care Ops Hub is running!');
});

console.log('About to start server on port', port);

server.listen(port, () => {
  console.log('Server started successfully!');
  console.log('Running at http://localhost:' + port);
});

server.on('error', (e) => {
  console.error('Server error:', e);
});

console.log('Server setup complete');
