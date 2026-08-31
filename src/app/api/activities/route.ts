import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    const activities = await sql`
      SELECT id, contact_id, contact_name, action_type, description, performed_by,
             TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT ${limit};
    `;

    return NextResponse.json({ activities }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contact_id, contact_name, action_type, description, performed_by } = body;

    if (!contact_name || !description) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO activity_logs (contact_id, contact_name, action_type, description, performed_by)
      VALUES (${contact_id || null}, ${contact_name}, ${action_type || 'DATA_UPDATE'}, ${description}, ${performed_by || 'Gabino'})
      RETURNING *;
    `;

    return NextResponse.json({ activity: result[0] }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
