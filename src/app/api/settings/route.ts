import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const rows = await sql`
      SELECT value FROM settings WHERE key = 'prospecting_apis' LIMIT 1;
    `;

    const todayDate = new Date().toISOString().split('T')[0];

    if (rows.length === 0 || !rows[0]?.value) {
      return NextResponse.json({
        google_places_api_key: '',
        openrouter_api_key: '',
        openrouter_model: 'google/gemini-2.5-flash',
        daily_search_limit: 30,
        searches_today: 0,
        has_google_key: false,
        has_openrouter_key: false,
      });
    }

    const val = rows[0].value as any;
    const gKey = val.google_places_api_key || '';
    const oKey = val.openrouter_api_key || '';
    const searchesToday = val.today_date === todayDate ? (val.searches_today || 0) : 0;
    const dailyLimit = typeof val.daily_search_limit === 'number' ? val.daily_search_limit : 30;

    return NextResponse.json({
      google_places_api_key: gKey ? `${gKey.substring(0, 8)}...${gKey.substring(gKey.length - 4)}` : '',
      openrouter_api_key: oKey ? `${oKey.substring(0, 8)}...${oKey.substring(oKey.length - 4)}` : '',
      openrouter_model: val.openrouter_model || 'google/gemini-2.5-flash',
      daily_search_limit: dailyLimit,
      searches_today: searchesToday,
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
    const { google_places_api_key, openrouter_api_key, openrouter_model, daily_search_limit } = body;

    const todayDate = new Date().toISOString().split('T')[0];

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
    const finalLimit = typeof daily_search_limit === 'number' && daily_search_limit > 0 
      ? daily_search_limit 
      : (typeof existingVal.daily_search_limit === 'number' ? existingVal.daily_search_limit : 30);

    const searchesToday = existingVal.today_date === todayDate ? (existingVal.searches_today || 0) : 0;

    const newValue = {
      ...existingVal,
      google_places_api_key: finalGoogleKey,
      openrouter_api_key: finalOpenRouterKey,
      openrouter_model: finalModel,
      daily_search_limit: finalLimit,
      today_date: todayDate,
      searches_today: searchesToday,
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
      daily_search_limit: finalLimit,
      searches_today: searchesToday,
    });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
