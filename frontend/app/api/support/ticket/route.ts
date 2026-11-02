import { currentUser } from '@/lib/auth';
import { MarketError, sameOrigin } from '@/lib/validation';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const body = await request.json().catch(() => ({}));
    const { subject, message, orderId, email, phone } = body || {};
    if (!subject || !message) throw new MarketError(422, 'Subject and message are required.');
    const ticketId = 'TKT-' + Math.floor(100000 + Math.random() * 900000);
    return Response.json({
      ok: true,
      ticketId,
      status: 'received',
      message: 'Your inquiry has been logged with our Pasig City Support desk. We respond within 1 business day.'
    });
  } catch (err) {
    if (err instanceof MarketError) return Response.json({ error: err.message, ...(err.fields ? { fields: err.fields } : {}) }, { status: err.status });
    return Response.json({ error: 'Unable to process support request.' }, { status: 500 });
  }
}

