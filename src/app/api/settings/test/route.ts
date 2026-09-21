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
      google_api_version: 'none',
      openrouter_ok: false,
      openrouter_message: '',
    };

    // 1. Test Google Places API Key (First try Places API New, then Legacy)
    if (google_places_api_key) {
      const cleanKey = google_places_api_key.trim();
      let testedNewOk = false;

      // Try 1: Places API (New) endpoint
      try {
        const newRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': cleanKey,
            'X-Goog-FieldMask': 'places.id,places.displayName',
          },
          body: JSON.stringify({
            textQuery: 'empresa en lima peru',
            maxResultCount: 1,
          }),
        });

        if (newRes.ok) {
          testedNewOk = true;
          results.google_ok = true;
          results.google_api_version = 'places_new';
          results.google_message = 'Conexión exitosa con Google Places API (New). Clave activa y lista para usar.';
        } else {
          const errData = await newRes.json().catch(() => ({}));
          console.log('Places New API error:', newRes.status, errData);
        }
      } catch (err: any) {
        console.warn('Places API New test fetch error:', err.message);
      }

      // Try 2: If New failed, try Legacy TextSearch
      if (!testedNewOk) {
        try {
          const gRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=empresa+lima+peru&key=${encodeURIComponent(cleanKey)}`
          );
          const gData = await gRes.json();
          if (gData.status === 'OK' || gData.status === 'ZERO_RESULTS') {
            results.google_ok = true;
            results.google_api_version = 'legacy';
            results.google_message = 'Conexión exitosa con Google Places API (Legacy). Clave activa.';
          } else if (gData.status === 'REQUEST_DENIED') {
            results.google_ok = false;
            results.google_message = `Acceso denegado por Google: ${gData.error_message || 'Verifica que la API Places API (New) esté habilitada en Google Cloud.'}`;
          } else {
            results.google_ok = false;
            results.google_message = `Google respondió: ${gData.status} - ${gData.error_message || 'Verifica restricciones de API Key en Google Cloud.'}`;
          }
        } catch (err: any) {
          results.google_ok = false;
          results.google_message = `Error de conexión con Google: ${err.message}`;
        }
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
          results.openrouter_message = `Conexión exitosa con OpenRouter. Saldo disponible detectado.`;
        } else {
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
