import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '40', 10);

    // 1. Check if notifications table has rows; if 0, auto-seed with recent activity_logs
    const countRes = await sql`SELECT count(*)::int as total FROM notifications;`;
    const totalInNotifs = countRes[0]?.total || 0;

    if (totalInNotifs === 0) {
      await sql`
        INSERT INTO notifications (title, message, type, contact_id, performed_by, is_read, created_at)
        SELECT 
          COALESCE(contact_name, 'Prospecto') as title, 
          COALESCE(description, 'Gestión comercial') as message, 
          COALESCE(action_type, 'INFO') as type, 
          contact_id, 
          COALESCE(performed_by, 'Equipo') as performed_by, 
          false as is_read, 
          created_at
        FROM activity_logs
        ORDER BY created_at DESC
        LIMIT 20;
      `;
    }

    // 2. Fetch notifications
    const notifs = await sql`
      SELECT 
        id, 
        title as contact_name, 
        type as action_type, 
        message as description, 
        performed_by, 
        contact_id, 
        COALESCE(is_read, false) as is_read,
        TO_CHAR(created_at AT TIME ZONE 'America/Lima', 'YYYY-MM-DD HH24:MI:SS') as created_at
      FROM notifications
      ORDER BY created_at DESC
      LIMIT ${limit};
    `;

    // 3. Unread count
    const unreadRes = await sql`
      SELECT COUNT(*)::int as unread_count 
      FROM notifications 
      WHERE is_read = false OR is_read IS NULL;
    `;
    const unreadCount = unreadRes[0]?.unread_count || 0;

    return NextResponse.json({ 
      activities: notifs,
      unread_count: unreadCount,
    }, {
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

    // Insert into notifications (which the user can clear/mark read)
    const notifResult = await sql`
      INSERT INTO notifications (title, message, type, contact_id, performed_by, is_read)
      VALUES (${contact_name}, ${description}, ${action_type || 'INFO'}, ${contact_id || null}, ${performed_by || 'Gabino'}, false)
      RETURNING *;
    `;

    // Also insert into permanent activity_logs (powers sprint goals and metrics)
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

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all');

    if (all === 'true') {
      await sql`UPDATE notifications SET is_read = true;`;
      return NextResponse.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
    }

    if (id) {
      await sql`UPDATE notifications SET is_read = true WHERE id = ${id}::uuid;`;
      return NextResponse.json({ success: true, message: 'Notificación marcada como leída' });
    }

    return NextResponse.json({ error: 'Parámetro inválido' }, { status: 400 });
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

    if (all === 'true') {
      await sql`DELETE FROM notifications;`;
      return NextResponse.json({ success: true, message: 'Bandeja de notificaciones vaciada' });
    }

    if (id) {
      await sql`DELETE FROM notifications WHERE id = ${id}::uuid;`;
      return NextResponse.json({ success: true, message: 'Notificación eliminada' });
    }

    return NextResponse.json({ error: 'Parámetro inválido' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
