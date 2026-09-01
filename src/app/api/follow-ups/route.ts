import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberName = searchParams.get('member') || '';

    // Fetch all contacts with follow_up_date using explicit America/Lima timezone calculation
    const rows = await sql`
      WITH ref_today AS (
        SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date as today_lima
      )
      SELECT 
        c.id, c.first_name, c.last_name, c.company, c.position, c.phone, c.linkedin_url, c.status, c.priority,
        TO_CHAR(c.follow_up_date, 'YYYY-MM-DD') as follow_up_date,
        c.assigned_to, c.notes,
        (c.follow_up_date < t.today_lima) as is_overdue,
        (c.follow_up_date = t.today_lima) as is_today,
        (c.follow_up_date - t.today_lima) as days_diff
      FROM contacts c
      CROSS JOIN ref_today t
      WHERE c.follow_up_date IS NOT NULL
        AND (${memberName === '' || memberName === 'all'}::boolean OR c.assigned_to = ${memberName})
      ORDER BY c.follow_up_date ASC, c.priority DESC
      LIMIT 300;
    `;

    // Classify into exact segmented time buckets
    const formattedRows = rows.map((r: any) => {
      const diff = parseInt(r.days_diff, 10) || 0;
      let bucket: 'overdue' | 'today' | 'plus_1_day' | 'plus_3_days' | 'plus_1_week' | 'plus_1_month' | 'future' = 'future';

      if (diff < 0) {
        bucket = 'overdue';
      } else if (diff === 0) {
        bucket = 'today';
      } else if (diff === 1) {
        bucket = 'plus_1_day';
      } else if (diff <= 3) {
        bucket = 'plus_3_days';
      } else if (diff <= 7) {
        bucket = 'plus_1_week';
      } else if (diff <= 30) {
        bucket = 'plus_1_month';
      } else {
        bucket = 'future';
      }

      return {
        ...r,
        days_diff: diff,
        time_bucket: bucket,
      };
    });

    const overdueCount = formattedRows.filter((r) => r.time_bucket === 'overdue').length;
    const todayCount = formattedRows.filter((r) => r.time_bucket === 'today').length;
    const plus1DayCount = formattedRows.filter((r) => r.time_bucket === 'plus_1_day').length;
    const plus3DaysCount = formattedRows.filter((r) => r.time_bucket === 'plus_3_days').length;
    const plus1WeekCount = formattedRows.filter((r) => r.time_bucket === 'plus_1_week').length;
    const plus1MonthCount = formattedRows.filter((r) => r.time_bucket === 'plus_1_month').length;
    const futureCount = formattedRows.filter((r) => r.time_bucket === 'future').length;

    return NextResponse.json({
      reminders: formattedRows,
      stats: {
        total: formattedRows.length,
        overdue: overdueCount,
        today: todayCount,
        plus_1_day: plus1DayCount,
        plus_3_days: plus3DaysCount,
        plus_1_week: plus1WeekCount,
        plus_1_month: plus1MonthCount,
        future: futureCount,
        upcoming: formattedRows.length - overdueCount - todayCount,
      }
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
