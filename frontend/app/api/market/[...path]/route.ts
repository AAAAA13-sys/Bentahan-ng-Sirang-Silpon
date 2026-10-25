import { currentUser } from '@/lib/auth';
import * as market from '@/lib/market';
import { MarketError, sameOrigin } from '@/lib/validation';
export const runtime = 'nodejs';
async function handle(request: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await context.params; const [resource, rawId, operation] = path;
    const method = request.method; const url = new URL(request.url);
    if (method !== 'GET') sameOrigin(request);
    const actor = await currentUser(request);
    if (method === 'GET' && resource === 'catalog' && path.length === 1) return Response.json(await market.catalog(url.searchParams));
    const id = Number(rawId);
    if (method === 'GET' && resource === 'parts' && path.length === 2 && Number.isSafeInteger(id) && id > 0) return Response.json({ listing: await market.getListing(id, actor) });
    if (!actor) throw new MarketError(401, 'Sign in to continue.');
    if (method === 'GET' && resource === 'workspace' && path.length === 1) return Response.json(await market.workspace(actor));
    if (method === 'GET' && resource === 'orders' && path.length === 2 && Number.isSafeInteger(id) && id > 0) return Response.json({ order: await market.getOrder(actor, id) });
    let input: unknown;
    if (method !== 'GET') { try { input = await request.json(); } catch { throw new MarketError(422, 'A valid JSON body is required.'); } }
    if (method === 'POST' && resource === 'listings' && path.length === 1) return Response.json({ listing: await market.createListing(actor, input) }, { status: 201 });
    if (method === 'POST' && resource === 'sellers' && operation === 'verify' && path.length === 3) return Response.json({ user: await market.verifySeller(actor, rawId, input) });
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
export { handle as GET, handle as POST, handle as PUT, handle as PATCH };
