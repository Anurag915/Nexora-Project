const request = require('supertest');
const path = require('path');
const { spawn } = require('child_process');

let serverProcess;
const startServer = () => new Promise((resolve, reject) => {
  serverProcess = spawn('node', ['index.js'], { cwd: path.join(__dirname, '..') });
  serverProcess.stdout.on('data', (d) => {
    const s = d.toString();
    if (s.includes('Backend listening')) resolve();
  });
  serverProcess.stderr.on('data', (d) => console.error(d.toString()));
  serverProcess.on('error', reject);
});

const stopServer = () => new Promise((resolve) => {
  if (!serverProcess) return resolve();
  serverProcess.kill();
  serverProcess.on('exit', resolve);
});

describe('API flows', () => {
  beforeAll(async () => {
    jest.setTimeout(10000);
    await startServer();
  });

  afterAll(async () => {
    await stopServer();
  });

  test('GET /api/products returns products', async () => {
    const res = await request('http://localhost:4000').get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(5);
  });

  test('Cart flows: add, get, delete, checkout', async () => {
    const add = await request('http://localhost:4000').post('/api/cart').send({ productId: 'p1', qty: 2 });
    expect([200,201]).toContain(add.status);

    const cart = await request('http://localhost:4000').get('/api/cart');
    expect(cart.status).toBe(200);
    expect(cart.body.items.length).toBeGreaterThanOrEqual(1);
    const itemId = cart.body.items[0].id;

    const del = await request('http://localhost:4000').delete(`/api/cart/${itemId}`);
    expect(del.status).toBe(200);

    await request('http://localhost:4000').post('/api/cart').send({ productId: 'p2', qty: 1 });
    const co = await request('http://localhost:4000').post('/api/checkout').send({ name: 'Test', email: 'a@b.com' });
    expect(co.status).toBe(200);
    expect(co.body.receipt.total).toBeDefined();
  });
});
