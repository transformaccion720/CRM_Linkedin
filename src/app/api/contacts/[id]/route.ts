import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rows = await sql`
      WITH shared_by_url AS (
        SELECT linkedin_url, ARRAY_AGG(DISTINCT assigned_to) as members
        FROM contacts
        WHERE linkedin_url IS NOT NULL AND linkedin_url != '' AND assigned_to IS NOT NULL
        GROUP BY linkedin_url
        HAVING COUNT(DISTINCT assigned_to) > 1
      ),
      shared_by_email AS (
        SELECT LOWER(email) as email_clean, ARRAY_AGG(DISTINCT assigned_to) as members
        FROM contacts
        WHERE email IS NOT NULL AND email != '' AND assigned_to IS NOT NULL
        GROUP BY LOWER(email)
        HAVING COUNT(DISTINCT assigned_to) > 1
      )
      SELECT 
        c.id, c.first_name, c.last_name, c.linkedin_url, c.email, c.phone, c.company, c.position, c.country,
        TO_CHAR(c.connected_on, 'YYYY-MM-DD') as connected_on,
        c.status, c.notes, c.priority, 
        TO_CHAR(c.follow_up_date, 'YYYY-MM-DD') as follow_up_date,
        c.tags, c.assigned_to, c.source, c.post_url, c.service_needed,
        c.created_at, c.updated_at,
        ARRAY_REMOVE(
          ARRAY(
            SELECT DISTINCT x 
            FROM unnest(COALESCE(su.members, ARRAY[]::text[]) || COALESCE(se.members, ARRAY[]::text[])) as x
          ),
          c.assigned_to
        ) as shared_with
      FROM contacts c
      LEFT JOIN shared_by_url su ON c.linkedin_url = su.linkedin_url
      LEFT JOIN shared_by_email se ON LOWER(c.email) = se.email_clean
      WHERE c.id = ${id}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ contact: rows[0] }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { 
      status, 
      notes, 
      priority, 
      follow_up_date, 
      tags, 
      first_name,
      last_name,
      company,
      position,
      country,
      email,
      phone, 
      assigned_to,
      source,
      post_url,
      service_needed,
      performed_by 
    } = body;

    // Get current state before update for audit log
    const prevRows = await sql`SELECT first_name, last_name, status, email, phone, company, position, country, assigned_to, tags, notes, source, post_url, service_needed FROM contacts WHERE id = ${id} LIMIT 1`;
    const prev = prevRows[0];

    // Ensure tags is handled safely as an array
    const safeTags: string[] = Array.isArray(tags) ? tags : (prev?.tags || []);

    const result = await sql`
      UPDATE contacts
      SET
        status = COALESCE(${status}, status),
        first_name = CASE WHEN ${first_name !== undefined} THEN ${first_name} ELSE first_name END,
        last_name = CASE WHEN ${last_name !== undefined} THEN ${last_name} ELSE last_name END,
        company = CASE WHEN ${company !== undefined} THEN ${company} ELSE company END,
        position = CASE WHEN ${position !== undefined} THEN ${position} ELSE position END,
        country = CASE WHEN ${country !== undefined} THEN ${country} ELSE country END,
        email = CASE WHEN ${email !== undefined} THEN ${email} ELSE email END,
        phone = CASE WHEN ${phone !== undefined} THEN ${phone} ELSE phone END,
        assigned_to = CASE WHEN ${assigned_to !== undefined} THEN ${assigned_to} ELSE assigned_to END,
        source = CASE WHEN ${source !== undefined} THEN ${source} ELSE source END,
        post_url = CASE WHEN ${post_url !== undefined} THEN ${post_url} ELSE post_url END,
        service_needed = CASE WHEN ${service_needed !== undefined} THEN ${service_needed} ELSE service_needed END,
        notes = CASE WHEN ${notes !== undefined} THEN ${notes} ELSE notes END,
        priority = CASE WHEN ${priority !== undefined} THEN ${priority} ELSE priority END,
        follow_up_date = CASE WHEN ${follow_up_date !== undefined} THEN ${follow_up_date} ELSE follow_up_date END,
        tags = ${safeTags}::text[],
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING 
        id, first_name, last_name, linkedin_url, email, phone, company, position, country,
        TO_CHAR(connected_on, 'YYYY-MM-DD') as connected_on,
        status, notes, priority,
        TO_CHAR(follow_up_date, 'YYYY-MM-DD') as follow_up_date,
        tags, assigned_to, source, post_url, service_needed,
        created_at, updated_at;
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 });
    }

    const updated = result[0];

    // Register Activity / Audit Logs
    try {
      const contactFullName = `${updated.first_name} ${updated.last_name || ''}`.trim();
      const userActor = performed_by || 'Gabino';

      if (status && status !== prev?.status) {
        let actionType = 'STATUS_CHANGE';
        if (status === 'En contacto') actionType = 'CONTACTED_OUTREACH';
        if (status === 'Oportunidad') actionType = 'OPPORTUNITY_CREATED';
        if (status === 'Cliente') actionType = 'CLIENT_WON';
        if (status === 'En pausa') actionType = 'LEAD_PAUSED';

        await sql`
          INSERT INTO activity_logs (contact_id, contact_name, action_type, description, performed_by)
          VALUES (${id}::uuid, ${contactFullName}, ${actionType}, ${'Cambió estado a: ' + status}, ${userActor});
        `;
      }

      if (phone && phone !== prev?.phone) {
        await sql`
          INSERT INTO activity_logs (contact_id, contact_name, action_type, description, performed_by)
          VALUES (${id}::uuid, ${contactFullName}, 'PHONE_ADDED', ${'Añadió teléfono: ' + phone}, ${userActor});
        `;
      }
    } catch (auditErr) {
      console.error('Error writing audit log:', auditErr);
    }

    return NextResponse.json({ contact: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await sql`DELETE FROM contacts WHERE id = ${id};`;
    return NextResponse.json({ success: true, message: 'Contacto eliminado' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
