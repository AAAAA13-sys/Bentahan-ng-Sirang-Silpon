import { currentUser } from '@/lib/auth';
import * as market from '@/lib/market';
import { MarketError, sameOrigin } from '@/lib/validation';
export const runtime = 'nodejs';
async function handle(request: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await context.params; const [resource, rawId, operation] = path;
    const method = request.method; const url = new URL(request.url);
    if (method === 'GET' && resource === 'catalog' && path.length === 1) return Response.json(await market.catalog(url.searchParams));
    if (method !== 'GET') sameOrigin(request);
    const actor = await currentUser(request);
    const id = Number(rawId);
    if (method === 'GET' && resource === 'parts' && path.length === 2 && Number.isSafeInteger(id) && id > 0) return Response.json({ listing: await market.getListing(id, actor) });
    if (!actor) throw new MarketError(401, 'Sign in to continue.');
    if (method === 'GET' && resource === 'workspace' && path.length === 1) return Response.json(await market.workspace(actor));
    if (method === 'GET' && resource === 'orders' && path.length === 1) return Response.json({ orders: await market.getUserOrders(actor) });
    if (method === 'GET' && resource === 'orders' && path.length === 2 && Number.isSafeInteger(id) && id > 0) return Response.json({ order: await market.getOrder(actor, id) });
    let input: unknown;
    if (method !== 'GET') { try { input = await request.json(); } catch { input = {}; } }
    if (method === 'POST' && resource === 'cart' && rawId === 'checkout' && path.length === 2) return Response.json(await market.checkoutCart(actor, input));
    if (method === 'POST' && resource === 'listings' && path.length === 1) return Response.json({ listing: await market.createListing(actor, input) }, { status: 201 });
    if (method === 'POST' && resource === 'sellers' && operation === 'verify' && path.length === 3) return Response.json({ user: await market.verifySeller(actor, rawId, input) });

    // Admin Controls API routes
    if (resource === 'admin') {
      if (rawId === 'settings' && method === 'POST') {
        const bps = typeof (input as any)?.escrowFeeBps === 'number'
          ? (input as any).escrowFeeBps
          : Math.round(Number((input as any)?.escrowFeeRate ?? 8) * 100);
        return Response.json({ escrowFeeBps: await market.setPlatformFeeRate(actor, bps) });
      }
      if (rawId === 'listings' && path.length >= 4) {
        const listingId = Number(operation);
        const action = path[3];
        if (action === 'verified-pass' && method === 'POST') {
          return Response.json({ listing: await market.adminToggleVerifiedPass(actor, listingId, input) });
        }
        if (action === 'visibility' && method === 'POST') {
          return Response.json({ listing: await market.adminToggleListingVisibility(actor, listingId, input) });
        }
        if ((action === 'delete' && method === 'POST') || method === 'DELETE') {
          return Response.json({ result: await market.adminDeleteListing(actor, listingId) });
        }
      }
      if (rawId === 'users' && path.length === 3 && method === 'POST') {
        return Response.json({ user: await market.adminUpdateUser(actor, operation, input) });
      }
    }

    if (!Number.isSafeInteger(id) || id < 1) throw new MarketError(404, 'Record not found.');
    if (method === 'PUT' && resource === 'listings' && path.length === 2) return Response.json({ listing: await market.updateListing(actor, id, input) });
    if (method === 'PATCH' && resource === 'listings' && operation === 'visibility' && path.length === 3) return Response.json({ listing: await market.visibility(actor, id, input) });
    if (method === 'PATCH' && resource === 'listings' && operation === 'stock' && path.length === 3) return Response.json({ listing: await market.adjustStock(actor, id, input) });
    if (method === 'POST' && resource === 'parts' && operation === 'reserve' && path.length === 3) return Response.json({ order: await market.reserve(actor, id, input) });
    if (method === 'POST' && resource === 'orders' && path.length === 2) return Response.json({ order: await market.updateOrder(actor, id, input) });
    throw new MarketError(404, 'Endpoint not found.');
  } catch (error) {
    if (error instanceof MarketError) return Response.json({ error: error.message, ...(error.fields ? { fields: error.fields } : {}) }, { status: error.status });
    console.error('Marketplace request failed', error instanceof Error ? error.name : 'UnknownError');
    return Response.json({ error: 'Unable to process this request.' }, { status: 500 });
  }
}
export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
