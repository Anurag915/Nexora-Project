const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) return console.error('Failed to open DB', err);
  console.log('Connected to SQLite database at', DB_PATH);
});

function init() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId TEXT NOT NULL,
      qty INTEGER NOT NULL,
      addedAt INTEGER DEFAULT (strftime('%s','now'))
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total REAL NOT NULL,
      payload TEXT,
      createdAt INTEGER DEFAULT (strftime('%s','now'))
    )`);

    // seed products if empty
    db.get('SELECT COUNT(1) as c FROM products', (err, row) => {
      if (err) return console.error(err);
      if (row && row.c === 0) {
        const products = [
          { id: 'p1', name: 'Vibe Tee', price: 19.99, description: 'Comfort tee' },
          { id: 'p2', name: 'Vibe Hoodie', price: 39.99, description: 'Warm hoodie' },
          { id: 'p3', name: 'Slip-On Sneakers', price: 49.99, description: 'Easy wear' },
          { id: 'p4', name: 'Vibe Cap', price: 12.5, description: 'Adjustable cap' },
          { id: 'p5', name: 'Wireless Earbuds', price: 59.99, description: 'For great sound' },
          { id: 'p6', name: 'Water Bottle', price: 9.99, description: 'Stay hydrated' },
          { id: 'p7', name: 'Socks Pack', price: 7.5, description: '3 pack' },
          { id: 'p8', name: 'Limited Sticker', price: 2.0, description: 'Show your vibe' }
        ];

        const stmt = db.prepare('INSERT INTO products (id,name,price,description) VALUES (?,?,?,?)');
        for (const p of products) stmt.run(p.id, p.name, p.price, p.description);
        stmt.finalize();
        console.log('Seeded products');
      }
    });
  });
}

module.exports = { db, init };
