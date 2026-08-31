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
      email,
      phone, 
      assigned_to 
    } = body;

    const result = await sql`
      UPDATE contacts
      SET
        status = COALESCE(${status}, status),
        first_name = CASE WHEN ${first_name !== undefined} THEN ${first_name} ELSE first_name END,
        last_name = CASE WHEN ${last_name !== undefined} THEN ${last_name} ELSE last_name END,
        company = CASE WHEN ${company !== undefined} THEN ${company} ELSE company END,
        position = CASE WHEN ${position !== undefined} THEN ${position} ELSE position END,
        email = CASE WHEN ${email !== undefined} THEN ${email} ELSE email END,
        phone = CASE WHEN ${phone !== undefined} THEN ${phone} ELSE phone END,
        assigned_to = CASE WHEN ${assigned_to !== undefined} THEN ${assigned_to} ELSE assigned_to END,
        notes = CASE WHEN ${notes !== undefined} THEN ${notes} ELSE notes END,
        priority = CASE WHEN ${priority !== undefined} THEN ${priority} ELSE priority END,
        follow_up_date = CASE WHEN ${follow_up_date !== undefined} THEN ${follow_up_date} ELSE follow_up_date END,
        tags = CASE WHEN ${tags !== undefined} THEN ${tags} ELSE tags END,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 });
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
