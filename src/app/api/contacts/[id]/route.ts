import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

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
      performed_by 
    } = body;

    // Get current state before update for audit log
    const prevRows = await sql`SELECT first_name, last_name, status, email, phone, company, position, country, assigned_to, tags, notes FROM contacts WHERE id = ${id} LIMIT 1`;
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
        notes = CASE WHEN ${notes !== undefined} THEN ${notes} ELSE notes END,
        priority = CASE WHEN ${priority !== undefined} THEN ${priority} ELSE priority END,
        follow_up_date = CASE WHEN ${follow_up_date !== undefined} THEN ${follow_up_date} ELSE follow_up_date END,
        tags = ${safeTags}::text[],
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 });
    }

    const updated = result[0];
    const contactFullName = `${updated.first_name} ${updated.last_name || ''}`.trim();
    const actor = performed_by || updated.assigned_to || 'Comercial';

    // Automatic Audit Logging
    try {
      if (status && prev && prev.status !== status) {
        await sql`
          INSERT INTO activity_logs (contact_id, contact_name, action_type, description, performed_by)
          VALUES (${id}, ${contactFullName}, 'STATUS_CHANGE', ${'Cambió estado de "' + prev.status + '" a "' + status + '"'}, ${actor});
        `;
      } else if (phone && prev && prev.phone !== phone) {
        await sql`
          INSERT INTO activity_logs (contact_id, contact_name, action_type, description, performed_by)
          VALUES (${id}, ${contactFullName}, 'PHONE_ADDED', ${'Añadió/actualizó teléfono: ' + phone}, ${actor});
        `;
      } else if (email && prev && prev.email !== email) {
        await sql`
          INSERT INTO activity_logs (contact_id, contact_name, action_type, description, performed_by)
          VALUES (${id}, ${contactFullName}, 'EMAIL_ADDED', ${'Añadió/actualizó email: ' + email}, ${actor});
        `;
      } else if (position && prev && prev.position !== position) {
        await sql`
          INSERT INTO activity_logs (contact_id, contact_name, action_type, description, performed_by)
          VALUES (${id}, ${contactFullName}, 'DATA_UPDATE', ${'Actualizó cargo a: ' + position}, ${actor});
        `;
      } else if (notes !== undefined && prev && prev.notes !== notes && notes.trim() !== '') {
        await sql`
          INSERT INTO activity_logs (contact_id, contact_name, action_type, description, performed_by)
          VALUES (${id}, ${contactFullName}, 'NOTE_ADDED', ${'Registró nuevos acuerdos/notas de conversación'}, ${actor});
        `;
      }
    } catch (auditErr) {
      console.error('Audit log insert failed:', auditErr);
    }

    return NextResponse.json({ contact: result[0] });
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
    await sql`DELETE FROM contacts WHERE id = ${id}`;
    return NextResponse.json({ success: true, message: 'Contacto eliminado' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
