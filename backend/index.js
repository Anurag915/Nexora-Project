const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { db, init } = require('./db');

init();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

// Serve frontend static files if present
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

// GET /api/products
app.get('/api/products', (req, res) => {
  db.all('SELECT id, name, price, description FROM products', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/cart - { productId, qty }
app.post('/api/cart', (req, res) => {
  const { productId, qty } = req.body;
  if (!productId || !qty || qty < 1) return res.status(400).json({ error: 'productId and qty>=1 required' });

  // check existing cart item
  db.get('SELECT id, qty FROM cart WHERE productId = ?', [productId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      const newQty = row.qty + Number(qty);
      db.run('UPDATE cart SET qty = ? WHERE id = ?', [newQty, row.id], function (uerr) {
        if (uerr) return res.status(500).json({ error: uerr.message });
        res.json({ id: row.id, productId, qty: newQty });
      });
    } else {
      db.run('INSERT INTO cart (productId, qty) VALUES (?,?)', [productId, qty], function (ierr) {
        if (ierr) return res.status(500).json({ error: ierr.message });
        res.status(201).json({ id: this.lastID, productId, qty });
      });
    }
  });
});

// DELETE /api/cart/:id
app.delete('/api/cart/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM cart WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  });
});

// GET /api/cart - returns items with product info and total
app.get('/api/cart', (req, res) => {
  const sql = `SELECT c.id, c.productId, c.qty, p.name, p.price FROM cart c JOIN products p ON p.id = c.productId`;
  db.all(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    let total = 0;
    const items = rows.map(r => {
      const subtotal = Number((r.price * r.qty).toFixed(2));
      total += subtotal;
      return { id: r.id, productId: r.productId, name: r.name, price: r.price, qty: r.qty, subtotal };
    });
    total = Number(total.toFixed(2));
    res.json({ items, total });
  });
});

// POST /api/checkout - { cartItems?, name?, email? } -> receipt
app.post('/api/checkout', (req, res) => {
  const { cartItems, name, email } = req.body;

  function makeReceipt(items) {
    let total = 0;
    const it = items.map(i => {
      const subtotal = Number((i.price * i.qty).toFixed(2));
      total += subtotal;
      return { productId: i.productId, name: i.name, price: i.price, qty: i.qty, subtotal };
    });
    total = Number(total.toFixed(2));
    const receipt = { id: null, total, items: it, name: name || null, email: email || null, timestamp: new Date().toISOString() };
    const payload = JSON.stringify(receipt);
    db.run('INSERT INTO receipts (total,payload) VALUES (?,?)', [total, payload], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      receipt.id = this.lastID;
      // clear cart
      db.run('DELETE FROM cart', (derr) => {
        if (derr) console.error('Failed to clear cart', derr);
        res.json({ receipt });
      });
    });
  }

  if (cartItems && Array.isArray(cartItems)) {
    // assume items provided with price & qty
    makeReceipt(cartItems);
  } else {
    // read current cart from DB
    const sql = `SELECT c.productId, c.qty, p.name, p.price FROM cart c JOIN products p ON p.id = c.productId`;
    db.all(sql, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!rows || rows.length === 0) return res.status(400).json({ error: 'Cart is empty' });
      makeReceipt(rows.map(r => ({ productId: r.productId, name: r.name, price: r.price, qty: r.qty })));
    });
  }
});

// Health
app.get('/api/health', (req, res) => res.json({ uptime: process.uptime() }));

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
