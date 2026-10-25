import express, { type Request as ExpRequest, type Response as ExpResponse, type NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { sql } from 'drizzle-orm';
import { getDb, initializeDatabase } from '../lib/db.js';
import { currentUser, handleAccount } from '../lib/auth.js';
import * as market from '../lib/market.js';
import { MarketError, sameOrigin } from '../lib/validation.js';
import { seedLocalAccounts } from '../lib/local-accounts.js';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Enable JSON body parsing and Cookie parser
app.use(express.json());
app.use(cookieParser());

// CORS configuration supporting credentials from React clients
const allowedOrigins = [
  'http://127.0.0.1:8090',
  'http://localhost:8090',
  'http://127.0.0.1:3000',
  'http://localhost:3000',
  'http://127.0.0.1:8092',
  'http://localhost:8092'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in local/development mode
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie']
}));

// Helper to convert Express request to standard Web API Request
export function toWebRequest(req: ExpRequest): Request {
  const protocol = req.protocol || 'http';
  const host = req.get('host') || `127.0.0.1:${PORT}`;
  const url = `${protocol}://${host}${req.originalUrl}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }
  const init: RequestInit = {
    method: req.method,
    headers,
  };
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }
  return new Request(url, init);
}

// Helper to pipe standard Web API Response back to Express
export async function sendWebResponse(webRes: Response, res: ExpResponse) {
  res.status(webRes.status);
  webRes.headers.forEach((val, key) => {
    res.setHeader(key, val);
  });
  const text = await webRes.text();
  try {
    const json = JSON.parse(text);
    res.json(json);
  } catch {
    res.send(text);
  }
}

// Health Check
app.get('/api/health', async (_req: ExpRequest, res: ExpResponse) => {
  try {
    const db = await getDb();
    await db.execute(sql`select 1`);
    res.json({ application: 'silicon-trading', stack: 'PERN', database: 'connected' });
  } catch (error) {
    res.status(503).json({ application: 'silicon-trading', stack: 'PERN', database: 'unavailable' });
  }
});

// Current User Session
app.get('/api/session', async (req: ExpRequest, res: ExpResponse, next: NextFunction) => {
  try {
    const webReq = toWebRequest(req);
    const user = await currentUser(webReq);
    res.setHeader('Cache-Control', 'no-store');
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// Account operations (login, register, logout)
app.post('/api/account/:action', async (req: ExpRequest, res: ExpResponse, next: NextFunction) => {
  try {
    const webReq = toWebRequest(req);
    const action = String(req.params.action);
    const webRes = await handleAccount(webReq, action);
    await sendWebResponse(webRes, res);
  } catch (err) {
    next(err);
  }
});

// Marketplace Catalog
app.get('/api/market/catalog', async (req: ExpRequest, res: ExpResponse, next: NextFunction) => {
  try {
    const url = new URL(req.originalUrl, `http://127.0.0.1:${PORT}`);
    const result = await market.catalog(url.searchParams);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Marketplace Part Detail
app.get('/api/market/parts/:id', async (req: ExpRequest, res: ExpResponse, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) throw new MarketError(404, 'Record not found.');
    const webReq = toWebRequest(req);
    const actor = await currentUser(webReq);
    const listing = await market.getListing(id, actor);
    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

// User Workspace
app.get('/api/market/workspace', async (req: ExpRequest, res: ExpResponse, next: NextFunction) => {
  try {
    const webReq = toWebRequest(req);
    const actor = await currentUser(webReq);
    if (!actor) throw new MarketError(401, 'Sign in to continue.');
    const result = await market.workspace(actor);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Create Listing (Seller)
app.post('/api/market/listings', async (req: ExpRequest, res: ExpResponse, next: NextFunction) => {
  try {
    const webReq = toWebRequest(req);
    sameOrigin(webReq);
    const actor = await currentUser(webReq);
    if (!actor) throw new MarketError(401, 'Sign in to continue.');
    const listing = await market.createListing(actor, req.body);
    res.status(201).json({ listing });
  } catch (err) {
    next(err);
  }
});

// Update Listing (Seller)
app.put('/api/market/listings/:id', async (req: ExpRequest, res: ExpResponse, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) throw new MarketError(404, 'Record not found.');
    const webReq = toWebRequest(req);
    sameOrigin(webReq);
    const actor = await currentUser(webReq);
    if (!actor) throw new MarketError(401, 'Sign in to continue.');
    const listing = await market.updateListing(actor, id, req.body);
    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

// Toggle Listing Visibility (Seller)
app.patch('/api/market/listings/:id/visibility', async (req: ExpRequest, res: ExpResponse, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) throw new MarketError(404, 'Record not found.');
    const webReq = toWebRequest(req);
    sameOrigin(webReq);
    const actor = await currentUser(webReq);
    if (!actor) throw new MarketError(401, 'Sign in to continue.');
    const listing = await market.visibility(actor, id, req.body);
    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

// Adjust Listing Stock (Seller)
app.patch('/api/market/listings/:id/stock', async (req: ExpRequest, res: ExpResponse, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) throw new MarketError(404, 'Record not found.');
    const webReq = toWebRequest(req);
    sameOrigin(webReq);
    const actor = await currentUser(webReq);
    if (!actor) throw new MarketError(401, 'Sign in to continue.');
    const listing = await market.adjustStock(actor, id, req.body);
    res.json({ listing });
  } catch (err) {
    next(err);
  }
});

// Reserve Part (Buyer)
app.post('/api/market/parts/:id/reserve', async (req: ExpRequest, res: ExpResponse, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) throw new MarketError(404, 'Record not found.');
    const webReq = toWebRequest(req);
    sameOrigin(webReq);
    const actor = await currentUser(webReq);
    if (!actor) throw new MarketError(401, 'Sign in to continue.');
    const order = await market.reserve(actor, id, req.body);
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

// Get Order Details
app.get('/api/market/orders/:id', async (req: ExpRequest, res: ExpResponse, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) throw new MarketError(404, 'Record not found.');
    const webReq = toWebRequest(req);
    const actor = await currentUser(webReq);
    if (!actor) throw new MarketError(401, 'Sign in to continue.');
    const order = await market.getOrder(actor, id);
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

// Update Order (Ship, Receive, Complete, Dispute, Cancel)
app.post('/api/market/orders/:id', async (req: ExpRequest, res: ExpResponse, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) throw new MarketError(404, 'Record not found.');
    const webReq = toWebRequest(req);
    sameOrigin(webReq);
    const actor = await currentUser(webReq);
    if (!actor) throw new MarketError(401, 'Sign in to continue.');
    const order = await market.updateOrder(actor, id, req.body);
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

// Verify Seller (Admin)
app.post('/api/market/sellers/:id/verify', async (req: ExpRequest, res: ExpResponse, next: NextFunction) => {
  try {
    const webReq = toWebRequest(req);
    sameOrigin(webReq);
    const actor = await currentUser(webReq);
    if (!actor) throw new MarketError(401, 'Sign in to continue.');
    const user = await market.verifySeller(actor, String(req.params.id), req.body);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// Universal Centralized Error Handler
app.use((err: unknown, _req: ExpRequest, res: ExpResponse, _next: NextFunction) => {
  if (err instanceof MarketError) {
    res.status(err.status).json({
      error: err.message,
      ...(err.fields ? { fields: err.fields } : {})
    });
    return;
  }
  console.error('Express request failed:', err instanceof Error ? err.stack : err);
  res.status(500).json({ error: 'Unable to process this request.' });
});

// Initialize DB and start listening if run directly
async function startServer() {
  await initializeDatabase();
  await seedLocalAccounts();
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`[PERN Backend] Express server running on http://127.0.0.1:${PORT}`);
  });
}

const isDirectRun = process.argv[1] ? (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js')) : false;

if (isDirectRun && process.env.NODE_ENV !== 'test') {
  startServer().catch(err => {
    console.error('Failed to start backend server:', err);
    process.exit(1);
  });
}

export default app;
