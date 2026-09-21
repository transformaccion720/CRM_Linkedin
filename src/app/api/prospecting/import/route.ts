import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { ExploredBusiness } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      business, 
      assigned_to = 'Gabino', 
      deal_value = 500,
      initial_status = 'Prospecto identificado',
      custom_notes = '' 
    } = body as {
      business: ExploredBusiness;
      assigned_to?: string;
      deal_value?: number;
      initial_status?: string;
      custom_notes?: string;
    };

    if (!business || !business.name) {
      return NextResponse.json({ error: 'Datos del negocio incompletos.' }, { status: 400 });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const notesContent = custom_notes 
      ? custom_notes 
      : `📍 Negocio explorado en Google Maps (${business.city}). Reseñas: ${business.reviews_count || 0} (⭐ ${business.rating || 0}). Estado Web: ${business.website ? business.website : 'Sin sitio web oficial'}.`;

    const tags = [
      'B2B Exploratorio',
      'Google Maps',
      business.city || 'Perú',
      business.category || 'Servicios Web'
    ];

    const priority = (business.reviews_count || 0) >= 20 ? 2 : 1;

    // Check if already exists by google_place_id or exact company name
    const existing = await sql`
      SELECT id FROM contacts 
      WHERE google_place_id = ${business.place_id} 
         OR (company = ${business.name} AND b2b_subsegment = 'EXPLORATORIO')
      LIMIT 1;
    `;

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        already_exists: true,
        contact_id: existing[0].id,
        message: 'Este negocio ya se encuentra registrado en el CRM.',
      });
    }

    const rows = await sql`
      INSERT INTO contacts (
        first_name,
        last_name,
        company,
        position,
        phone,
        email,
        country,
        business_segment,
        b2b_subsegment,
        source,
        status,
        deal_value,
        priority,
        follow_up_date,
        tags,
        assigned_to,
        notes,
        google_place_id,
        google_rating,
        google_reviews_count,
        google_maps_url,
        website_status
      ) VALUES (
        ${business.name},
        '(Por identificar)',
        ${business.name},
        'Titular / Gerencia',
        ${business.phone || business.whatsapp_number || null},
        ${business.email || null},
        'Perú',
        'B2B',
        'EXPLORATORIO',
        'GOOGLE_MAPS',
        ${initial_status},
        ${deal_value},
        ${priority},
        ${todayStr}::date,
        ${tags}::text[],
        ${assigned_to},
        ${notesContent},
        ${business.place_id},
        ${business.rating || 0},
        ${business.reviews_count || 0},
        ${business.google_maps_url || null},
        ${business.website_status || 'NONE'}
      )
      RETURNING id, first_name, company;
    `;

    const newContact = rows[0];

    // Log in activity logs
    await sql`
      INSERT INTO activity_logs (
        contact_id,
        contact_name,
        action_type,
        description,
        performed_by
      ) VALUES (
        ${newContact.id},
        ${newContact.company},
        'DATA_UPDATE',
        ${`Importado desde Cazador B2B Exploratorio en ${business.city} (Sin sitio web oficial). Asignado a ${assigned_to}.`},
        ${assigned_to}
      );
    `;

    return NextResponse.json({
      success: true,
      contact_id: newContact.id,
      message: `${business.name} importado exitosamente a la cartera B2B Exploratorio.`,
    });
  } catch (error: any) {
    console.error('Error importing explored business to CRM:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
