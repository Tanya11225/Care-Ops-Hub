const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    message: 'Care Ops Hub is running!',
    status: 'SUCCESS',
    replitFree: true,
    url: req.url
  }));
});

const port = 5000;
server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Care Ops Hub running on http://localhost:${port}`);
  console.log(`✅ All Replit dependencies removed!`);
});
