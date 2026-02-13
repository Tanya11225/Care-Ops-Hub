console.log('Starting server...');

const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Care Ops Hub is running!');
});

const port = 5000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});
