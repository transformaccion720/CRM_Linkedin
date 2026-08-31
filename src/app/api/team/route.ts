import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const members = await sql`
      SELECT tm.id, tm.name, tm.email, tm.role, tm.color, tm.created_at,
             COUNT(c.id)::int as contact_count
      FROM team_members tm
      LEFT JOIN contacts c ON c.assigned_to = tm.name OR c.assigned_to = tm.id
      GROUP BY tm.id, tm.name, tm.email, tm.role, tm.color, tm.created_at
      ORDER BY tm.created_at ASC;
    `;

    return NextResponse.json({ members });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role, color } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const cleanName = name.trim();
    const id = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const result = await sql`
      INSERT INTO team_members (id, name, email, role, color)
      VALUES (${id}, ${cleanName}, ${email?.trim() || null}, ${role?.trim() || 'Comercial'}, ${color || '#00a870'})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        color = EXCLUDED.color
      RETURNING *;
    `;

    return NextResponse.json({ member: result[0] }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    if (id === 'gabino') {
      return NextResponse.json({ error: 'No se puede eliminar al usuario principal' }, { status: 400 });
    }

    await sql`DELETE FROM team_members WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
