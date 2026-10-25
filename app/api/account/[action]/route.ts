import { handleAccount } from '../../../../lib/auth';
import { existingAccounts } from '../../../../lib/local-accounts';

export const runtime = 'nodejs';

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  return handleAccount(request, (await context.params).action);
}

export async function GET(_request: Request, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params;
  if (action === 'existing') {
    return Response.json({
      accounts: existingAccounts.map(acc => ({
        id: acc.id,
        email: acc.email,
        name: acc.name,
        role: acc.role,
        location: acc.location,
        sellerVerified: acc.sellerVerified,
        tagline: acc.tagline,
        defaultPassword: 'Password123!',
      })),
    });
  }
  return Response.json({ error: 'Action not supported' }, { status: 404 });
}
