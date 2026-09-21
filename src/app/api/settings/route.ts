import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const rows = await sql`
      SELECT value FROM settings WHERE key = 'prospecting_apis' LIMIT 1;
    `;

    if (rows.length === 0 || !rows[0]?.value) {
      return NextResponse.json({
        google_places_api_key: '',
        openrouter_api_key: '',
        openrouter_model: 'google/gemini-2.5-flash',
        has_google_key: false,
        has_openrouter_key: false,
      });
    }

    const val = rows[0].value as any;
    const gKey = val.google_places_api_key || '';
    const oKey = val.openrouter_api_key || '';

    return NextResponse.json({
      google_places_api_key: gKey ? `${gKey.substring(0, 8)}...${gKey.substring(gKey.length - 4)}` : '',
      openrouter_api_key: oKey ? `${oKey.substring(0, 8)}...${oKey.substring(oKey.length - 4)}` : '',
      openrouter_model: val.openrouter_model || 'google/gemini-2.5-flash',
      has_google_key: Boolean(gKey && gKey.length > 10),
      has_openrouter_key: Boolean(oKey && oKey.length > 10),
    });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { google_places_api_key, openrouter_api_key, openrouter_model } = body;

    // Fetch existing settings to prevent overwriting with masked strings
    const existing = await sql`
      SELECT value FROM settings WHERE key = 'prospecting_apis' LIMIT 1;
    `;
    const existingVal = existing.length > 0 ? (existing[0].value as any) : {};

    let finalGoogleKey = existingVal.google_places_api_key || '';
    if (google_places_api_key && !google_places_api_key.includes('...')) {
      finalGoogleKey = google_places_api_key.trim();
    }

    let finalOpenRouterKey = existingVal.openrouter_api_key || '';
    if (openrouter_api_key && !openrouter_api_key.includes('...')) {
      finalOpenRouterKey = openrouter_api_key.trim();
    }

    const finalModel = openrouter_model?.trim() || existingVal.openrouter_model || 'google/gemini-2.5-flash';

    const newValue = {
      google_places_api_key: finalGoogleKey,
      openrouter_api_key: finalOpenRouterKey,
      openrouter_model: finalModel,
      updated_at: new Date().toISOString(),
    };

    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('prospecting_apis', ${JSON.stringify(newValue)}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = ${JSON.stringify(newValue)}::jsonb, updated_at = NOW();
    `;

    return NextResponse.json({
      success: true,
      has_google_key: Boolean(finalGoogleKey && finalGoogleKey.length > 10),
      has_openrouter_key: Boolean(finalOpenRouterKey && finalOpenRouterKey.length > 10),
      openrouter_model: finalModel,
    });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
