const ZERNIO_BASE_URL = 'https://zernio.com/api/v1';

export function getZernioApiKey(): string | null {
  return process.env.ZERNIO_API_KEY || null;
}

export function getZernioAccountIdForUser(userName?: string | null): string | null {
  const normalized = (userName || '').toLowerCase().trim();
  if (normalized.includes('kiara')) {
    return process.env.ZERNIO_ACCOUNT_ID_KIARA || null;
  }
  // Default to Gabino
  return process.env.ZERNIO_ACCOUNT_ID_GABINO || null;
}

export interface ZernioAccount {
  _id: string;
  platform: string;
  name?: string;
  username?: string;
  status?: string;
  profileId?: string;
}

export interface ZernioConversation {
  _id: string;
  accountId: string;
  platform: string;
  recipientName?: string;
  recipientId?: string;
  recipientAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

export interface ZernioMessage {
  _id: string;
  conversationId: string;
  senderName?: string;
  senderId?: string;
  isFromMe: boolean;
  text: string;
  createdAt: string;
}

// 1. Check connected accounts
export async function listZernioAccounts(): Promise<{ accounts: ZernioAccount[]; error?: string }> {
  const apiKey = getZernioApiKey();
  if (!apiKey) {
    return { accounts: [], error: 'ZERNIO_API_KEY no configurada' };
  }

  try {
    const res = await fetch(`${ZERNIO_BASE_URL}/accounts`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { accounts: [], error: err.message || `Error ${res.status} al consultar Zernio` };
    }

    const data = await res.json();
    return { accounts: data.accounts || [] };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { accounts: [], error: msg };
  }
}

// 2. List conversations for an account
export async function listZernioConversations(accountId: string): Promise<{ conversations: ZernioConversation[]; error?: string }> {
  const apiKey = getZernioApiKey();
  if (!apiKey) return { conversations: [], error: 'ZERNIO_API_KEY no configurada' };

  try {
    const res = await fetch(`${ZERNIO_BASE_URL}/inbox/conversations?accountId=${accountId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { conversations: [], error: err.message || `Error ${res.status}` };
    }

    const data = await res.json();
    return { conversations: data.conversations || [] };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { conversations: [], error: msg };
  }
}

// 3. Send message to a conversation
export async function sendZernioMessage(conversationId: string, accountId: string, messageText: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const apiKey = getZernioApiKey();
  if (!apiKey) return { success: false, error: 'ZERNIO_API_KEY no configurada' };

  try {
    const res = await fetch(`${ZERNIO_BASE_URL}/inbox/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId,
        message: messageText,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.message || `Error ${res.status} al enviar mensaje` };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}
