import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberName = searchParams.get('member') || '';

    // Fetch all contacts with follow_up_date set, ordered by date ascending
    const rows = await sql`
      SELECT 
        id, first_name, last_name, company, position, phone, linkedin_url, status, priority,
        TO_CHAR(follow_up_date, 'YYYY-MM-DD') as follow_up_date,
        assigned_to, notes,
        (follow_up_date < CURRENT_DATE) as is_overdue,
        (follow_up_date = CURRENT_DATE) as is_today
      FROM contacts
      WHERE follow_up_date IS NOT NULL
        AND (${memberName === '' || memberName === 'all'}::boolean OR assigned_to = ${memberName})
      ORDER BY follow_up_date ASC, priority DESC
      LIMIT 200;
    `;

    const overdueCount = rows.filter((r) => r.is_overdue).length;
    const todayCount = rows.filter((r) => r.is_today).length;
    const upcomingCount = rows.length - overdueCount - todayCount;

    return NextResponse.json({
      reminders: rows,
      stats: {
        total: rows.length,
        overdue: overdueCount,
        today: todayCount,
        upcoming: upcomingCount,
      }
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
