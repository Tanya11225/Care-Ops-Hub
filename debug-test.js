console.log('Starting debug test...');

try {
  const express = require('express');
  console.log('Express loaded successfully');
  
  const app = express();
  console.log('Express app created');
  
  app.get('/', (req, res) => {
    res.send('Debug test working!');
  });
  
  const port = 5000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Debug server running on port ${port}`);
  });
  
} catch (error) {
  console.error('Error:', error);
}
