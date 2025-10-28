const { useState, useEffect } = React;

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  async function fetchProducts() {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (e) {
      console.error(e);
      alert('Failed to load products');
    } finally { setLoading(false); }
  }

  async function fetchCart() {
    try {
      const res = await axios.get('/api/cart');
      setCart(res.data);
    } catch (e) { console.error(e); }
  }

  async function addToCart(productId) {
    await axios.post('/api/cart', { productId, qty: 1 });
    fetchCart();
  }

  async function removeItem(id) {
    await axios.delete('/api/cart/' + id);
    fetchCart();
  }

  function openCheckout() { setShowCheckout(true); }

  async function submitCheckout(data) {
    try {
      const res = await axios.post('/api/checkout', data);
      setReceipt(res.data.receipt);
      setShowCheckout(false);
      fetchCart();
    } catch (e) { console.error(e); alert('Checkout failed'); }
  }

  return (
    <div className="container">
      <header className="mb-4 d-flex justify-content-between align-items-center">
        <h2>Vibe Commerce — Mock Store</h2>
        <div className="small-muted">Responsive demo • No real payments</div>
      </header>

      <main>
        <section className="mb-4">
          <h4>Products</h4>
          {loading ? <div>Loading...</div> : (
            <div className="products-grid">
              {products.map(p => (
                <div key={p.id} className="card">
                  <div style={{height:80}} className="mb-2 bg-light" />
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div><strong>{p.name}</strong></div>
                      <div className="small-muted">{p.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="price">${p.price.toFixed(2)}</div>
                      <button className="btn btn-sm btn-primary mt-2" onClick={() => addToCart(p.id)}>Add</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h4>Cart</h4>
          {cart.items.length === 0 ? <div className="card p-3">Cart is empty</div> : (
            <div className="card p-3">
              {cart.items.map(it => (
                <div key={it.id} className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <div><strong>{it.name}</strong></div>
                    <div className="small-muted">${it.price.toFixed(2)} × {it.qty} = ${it.subtotal.toFixed(2)}</div>
                  </div>
                  <div>
                    <button className="btn btn-sm btn-outline-danger mr-2" onClick={() => removeItem(it.id)}>Remove</button>
                  </div>
                </div>
              ))}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <strong>Total</strong>
                <div className="h5">${cart.total.toFixed(2)}</div>
              </div>
              <div className="mt-3 text-right">
                <button className="btn btn-success" onClick={openCheckout}>Checkout</button>
              </div>
            </div>
          )}
        </section>
      </main>

      {showCheckout && <CheckoutModal onClose={() => setShowCheckout(false)} onSubmit={submitCheckout} total={cart.total} />}

      {receipt && <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}

      <div className="cart" onClick={fetchCart} title="Refresh cart">
        Cart • ${cart.total.toFixed(2)}
      </div>
    </div>
  );
}

function CheckoutModal({ onClose, onSubmit, total }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h5>Checkout</h5>
        <div className="small-muted mb-2">Total: ${total.toFixed(2)}</div>
        <div className="form-group">
          <label>Name</label>
          <input className="form-control" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="d-flex justify-content-end">
          <button className="btn btn-secondary mr-2" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSubmit({ name, email })}>Pay (mock)</button>
        </div>
      </div>
    </div>
  );
}

function ReceiptModal({ receipt, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h5>Receipt</h5>
        <div className="small-muted">Order #{receipt.id} — {new Date(receipt.timestamp).toLocaleString()}</div>
        <ul className="mt-2">
          {receipt.items.map((it, i) => (
            <li key={i}>{it.name} × {it.qty} — ${it.subtotal.toFixed(2)}</li>
          ))}
        </ul>
        <div className="d-flex justify-content-between mt-3">
          <strong>Total</strong>
          <div className="h5">${receipt.total.toFixed(2)}</div>
        </div>
        <div className="text-right mt-3">
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
