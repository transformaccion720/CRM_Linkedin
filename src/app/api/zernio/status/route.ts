import { NextRequest, NextResponse } from 'next/server';
import { listZernioAccounts, getZernioApiKey, getZernioAccountIdForUser } from '@/lib/zernio';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user') || 'Gabino';

    const apiKeyConfigured = Boolean(getZernioApiKey());
    const accountIdConfigured = getZernioAccountIdForUser(user);

    if (!apiKeyConfigured) {
      return NextResponse.json({
        configured: false,
        message: 'Falta configurar ZERNIO_API_KEY en .env.local',
        apiKeyConfigured: false,
        accountIdConfigured: Boolean(accountIdConfigured),
        accounts: [],
      });
    }

    const { accounts, error } = await listZernioAccounts();

    return NextResponse.json({
      configured: true,
      apiKeyConfigured: true,
      userRequested: user,
      userAccountId: accountIdConfigured,
      error: error || null,
      accountsFound: accounts.length,
      accounts: accounts.map((a) => ({
        id: a._id,
        platform: a.platform,
        name: a.name || a.username || 'Cuenta LinkedIn',
        status: a.status || 'connected',
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
