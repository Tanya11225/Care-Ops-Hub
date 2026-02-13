const Database = require('better-sqlite3');
console.log('Testing database connection...');
try {
  const db = new Database('care-ops-hub.db');
  console.log('Database created successfully');
  db.close();
  console.log('Database closed successfully');
} catch (error) {
  console.error('Database error:', error);
}
