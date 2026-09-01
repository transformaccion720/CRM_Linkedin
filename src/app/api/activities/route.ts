import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '40', 10);

    // Fetch from dedicated notifications table; if empty, fallback to recent activity logs without mutating them
    const notifs = await sql`
      SELECT id, title as contact_name, type as action_type, message as description, performed_by, contact_id,
             TO_CHAR(created_at AT TIME ZONE 'America/Lima', 'YYYY-MM-DD HH24:MI:SS') as created_at
      FROM notifications
      ORDER BY created_at DESC
      LIMIT ${limit};
    `;

    if (notifs.length > 0) {
      return NextResponse.json({ activities: notifs }, {
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      });
    }

    // Fallback: show recent activity logs
    const activities = await sql`
      SELECT id, contact_id, contact_name, action_type, description, performed_by,
             TO_CHAR(created_at AT TIME ZONE 'America/Lima', 'YYYY-MM-DD HH24:MI:SS') as created_at
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT ${limit};
    `;

    return NextResponse.json({ activities }, {
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
    const { contact_id, contact_name, action_type, description, performed_by } = body;

    if (!contact_name || !description) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Insert into notifications (which the user can clear) AND activity_logs (which powers sprint metrics)
    const notifResult = await sql`
      INSERT INTO notifications (title, message, type, contact_id, performed_by)
      VALUES (${contact_name}, ${description}, ${action_type || 'INFO'}, ${contact_id || null}, ${performed_by || 'Gabino'})
      RETURNING *;
    `;

    await sql`
      INSERT INTO activity_logs (contact_id, contact_name, action_type, description, performed_by)
      VALUES (${contact_id || null}, ${contact_name}, ${action_type || 'DATA_UPDATE'}, ${description}, ${performed_by || 'Gabino'});
    `;

    return NextResponse.json({ activity: notifResult[0] }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all');

    // Deleting notifications ONLY deletes from notifications table, leaving sprint activity_logs untouched!
    if (all === 'true') {
      await sql`DELETE FROM notifications;`;
      return NextResponse.json({ success: true, message: 'Todas las notificaciones eliminadas de la bandeja' });
    }

    if (id) {
      await sql`DELETE FROM notifications WHERE id = ${id}::uuid;`;
      return NextResponse.json({ success: true, message: 'Notificación eliminada de la bandeja' });
    }

    return NextResponse.json({ error: 'Parámetro inválido' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
