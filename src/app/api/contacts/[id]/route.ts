import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, notes, priority, follow_up_date, tags } = body;

    const result = await sql`
      UPDATE contacts
      SET
        status = COALESCE(${status}, status),
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
