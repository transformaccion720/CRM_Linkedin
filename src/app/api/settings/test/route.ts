import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { google_places_api_key, openrouter_api_key } = body;

    // If keys not passed or masked, retrieve from Neon DB
    if (!google_places_api_key || google_places_api_key.includes('...') || !openrouter_api_key || openrouter_api_key.includes('...')) {
      const rows = await sql`
        SELECT value FROM settings WHERE key = 'prospecting_apis' LIMIT 1;
      `;
      if (rows.length > 0 && rows[0]?.value) {
        const val = rows[0].value as any;
        if (!google_places_api_key || google_places_api_key.includes('...')) {
          google_places_api_key = val.google_places_api_key || '';
        }
        if (!openrouter_api_key || openrouter_api_key.includes('...')) {
          openrouter_api_key = val.openrouter_api_key || '';
        }
      }
    }

    const results = {
      google_ok: false,
      google_message: '',
      openrouter_ok: false,
      openrouter_message: '',
    };

    // 1. Test Google Places API Key
    if (google_places_api_key) {
      try {
        const gRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=empresa+lima+peru&key=${encodeURIComponent(google_places_api_key)}`
        );
        const gData = await gRes.json();
        if (gData.status === 'OK' || gData.status === 'ZERO_RESULTS') {
          results.google_ok = true;
          results.google_message = 'Conexión exitosa con Google Places API. Clave activa y válida.';
        } else if (gData.status === 'REQUEST_DENIED') {
          results.google_ok = false;
          results.google_message = `Acceso denegado: ${gData.error_message || 'Verifica que Places API esté habilitada en Google Cloud.'}`;
        } else {
          results.google_ok = false;
          results.google_message = `Google respondió: ${gData.status} - ${gData.error_message || ''}`;
        }
      } catch (err: any) {
        results.google_ok = false;
        results.google_message = `Error de red al conectar con Google: ${err.message}`;
      }
    } else {
      results.google_message = 'No se ha configurado la clave de Google Places.';
    }

    // 2. Test OpenRouter API Key
    if (openrouter_api_key) {
      try {
        const oRes = await fetch('https://openrouter.ai/api/v1/auth/key', {
          headers: {
            Authorization: `Bearer ${openrouter_api_key.trim()}`,
          },
        });
        if (oRes.ok) {
          const oData = await oRes.json();
          results.openrouter_ok = true;
          const limit = oData.data?.limit ? `$${oData.data.limit}` : '';
          const usage = oData.data?.usage ? `$${oData.data.usage}` : '';
          results.openrouter_message = `Conexión exitosa con OpenRouter. Saldo disponible detectado.`;
        } else {
          const errData = await oRes.json().catch(() => ({}));
          results.openrouter_ok = false;
          results.openrouter_message = `Clave OpenRouter inválida o no autorizada (${oRes.status}).`;
        }
      } catch (err: any) {
        results.openrouter_ok = false;
        results.openrouter_message = `Error de red al conectar con OpenRouter: ${err.message}`;
      }
    } else {
      results.openrouter_message = 'No se ha configurado la clave de OpenRouter.';
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error testing API connections:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
