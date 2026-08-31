import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { listZernioAccounts, getZernioApiKey, getZernioAccountIdForUser } from '@/lib/zernio';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberName = searchParams.get('member') || 'Gabino';

    const apiKey = getZernioApiKey();
    if (!apiKey) {
      return NextResponse.json({
        configured: false,
        member: memberName,
        error: 'ZERNIO_API_KEY no configurada en las variables de entorno',
        account: null,
      });
    }

    const accountId = getZernioAccountIdForUser(memberName);

    // Get live status of connected accounts from Zernio
    const { accounts, error } = await listZernioAccounts();
    const currentAccount = accounts.find((a) => a._id === accountId) || (accounts.length > 0 ? accounts[0] : null);

    return NextResponse.json({
      configured: true,
      member: memberName,
      hasAccountId: Boolean(accountId),
      accountId: accountId || currentAccount?._id || null,
      account: currentAccount
        ? {
            id: currentAccount._id,
            platform: currentAccount.platform,
            name: currentAccount.name || (currentAccount as any).displayName || 'LinkedIn Conectado',
            status: currentAccount.status || (currentAccount as any).platformStatus || 'active',
            profileUrl: (currentAccount as any).profileUrl || null,
            profilePicture: (currentAccount as any).profilePicture || null,
            followersCount: (currentAccount as any).followersCount || 0,
          }
        : null,
      allAccounts: accounts.map((a) => ({
        id: a._id,
        platform: a.platform,
        name: a.name || (a as any).displayName || 'LinkedIn',
      })),
      error: error || null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
