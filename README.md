# Vibe Commerce — Mock E‑Com Cart

This repository contains a small full-stack mock e-commerce shopping cart for the Vibe Commerce screening. It implements product listing, cart management, and mock checkout (no real payments). The backend uses Node/Express + SQLite for persistence; the frontend is a small React app loaded via CDN (no build required).

<!-- ![Project Screenshot](frontend/assets/Screenshot%202025-10-30%20091633.png) -->
![Project Screenshot 1](frontend/assets/Screenshot%202025-10-30%20213711.png)
![Project Screenshot 2](frontend/assets/Screenshot%202025-10-30%20213728.png)
![Project Screenshot 3](frontend/assets/Screenshot%202025-10-30%20213733.png)

Repository layout

- /backend — Express server, SQLite DB, tests
- /frontend — static React app (served by backend)

Features

- REST API endpoints:
  - GET /api/products — list of products
  - POST /api/cart — add {productId, qty}
  - DELETE /api/cart/:id — remove item
  - GET /api/cart — current cart and total
  - POST /api/checkout — mock checkout (reads DB cart or accepts cartItems)
- Frontend: products grid, cart view, checkout form, receipt modal
- SQLite persistence (db.sqlite), basic error handling
- Tests: backend integration tests with Jest + Supertest

Quick start (local)

Prerequisites: Node.js 16+ and npm.

1. Install dependencies for backend

   cd "D:\\Internship Assignment\\backend"
   npm install

2. Start the server

   npm start

The server serves the frontend at http://localhost:4000 (open in your browser).

Running tests

From `backend` run:

  npm test

Notes & choices

- The frontend is intentionally delivered without a build step to keep the project lightweight — it uses React/ReactDOM + Babel from CDN.
- SQLite is used for persistence so you can run the app without configuring external DBs. The DB file is `backend/db.sqlite`.
- Bonus ideas implemented/possible: import sample products from Fake Store API (not enabled by default — can be added), persist mock user information in receipts.

Files changed/created

- `backend/index.js` — main server & REST API
- `backend/db.js` — SQLite initialization & seeding
- `frontend/index.html`, `frontend/app.js`, `frontend/app.css` — frontend UI
- `backend/tests/api.test.js` — basic API integration tests

Next steps (optional)

- Add a small build for the frontend (Vite) and split frontend into a real React project
- Add more validation and E2E tests (Cypress)
- Add a simple GitHub Actions workflow to run tests on push
