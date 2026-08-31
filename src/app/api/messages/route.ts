import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberName = searchParams.get('member') || '';
    const contactId = searchParams.get('contactId') || '';
    const search = searchParams.get('search')?.trim() || '';

    const searchPattern = search ? `%${search.toLowerCase()}%` : null;

    const rows = await sql`
      SELECT 
        m.id, m.contact_id, m.contact_name, m.contact_company, m.contact_position, m.contact_linkedin_url,
        m.sender_name, m.direction, m.channel, m.message_text, m.template_name,
        TO_CHAR(m.created_at, 'YYYY-MM-DD HH24:MI') as created_at,
        c.status as contact_status, c.assigned_to as contact_assigned_to
      FROM contact_messages m
      LEFT JOIN contacts c ON c.id = m.contact_id
      WHERE 
        (${memberName === '' || memberName === 'all'}::boolean OR m.sender_name = ${memberName} OR c.assigned_to = ${memberName})
        AND (${contactId === ''}::boolean OR m.contact_id = ${contactId}::uuid)
        AND (${searchPattern}::text IS NULL OR (
          LOWER(m.contact_name) LIKE ${searchPattern} OR 
          LOWER(COALESCE(m.contact_company, '')) LIKE ${searchPattern} OR
          LOWER(m.message_text) LIKE ${searchPattern}
        ))
      ORDER BY m.created_at DESC
      LIMIT 300;
    `;

    return NextResponse.json({ messages: rows }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      contact_id, 
      contact_name, 
      contact_company, 
      contact_position, 
      contact_linkedin_url, 
      sender_name, 
      direction, 
      channel, 
      message_text, 
      template_name 
    } = body;

    if (!contact_id || !message_text) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO contact_messages (
        contact_id, 
        contact_name, 
        contact_company, 
        contact_position, 
        contact_linkedin_url, 
        sender_name, 
        direction, 
        channel, 
        message_text, 
        template_name
      )
      VALUES (
        ${contact_id}::uuid,
        ${contact_name},
        ${contact_company || null},
        ${contact_position || null},
        ${contact_linkedin_url || null},
        ${sender_name || 'Comercial'},
        ${direction || 'OUTBOUND'},
        ${channel || 'LINKEDIN'},
        ${message_text},
        ${template_name || null}
      )
      RETURNING *;
    `;

    // Also register audit activity
    try {
      const isOutbound = (direction || 'OUTBOUND') === 'OUTBOUND';
      const actionType = isOutbound ? 'CONTACTED_OUTREACH' : 'NOTE_ADDED';
      const desc = isOutbound 
        ? `Envió mensaje por ${channel || 'LinkedIn'}: "${message_text.slice(0, 80)}..."` 
        : `Registró respuesta recibida: "${message_text.slice(0, 80)}..."`;

      await sql`
        INSERT INTO activity_logs (contact_id, contact_name, action_type, description, performed_by)
        VALUES (${contact_id}::uuid, ${contact_name}, ${actionType}, ${desc}, ${sender_name || 'Comercial'});
      `;
    } catch (e) {
      console.error('Audit log failed:', e);
    }

    return NextResponse.json({ message: result[0] }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
