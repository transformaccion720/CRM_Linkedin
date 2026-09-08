import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberName = searchParams.get('member') || '';
    const segment = searchParams.get('segment') || 'all';
    const statusParam = searchParams.get('status') || 'all';

    // Fetch all contacts with follow_up_date using explicit America/Lima timezone calculation
    const rows = await sql`
      WITH ref_today AS (
        SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date as today_lima
      )
      SELECT 
        c.id, c.first_name, c.last_name, c.company, c.position, c.phone, c.linkedin_url, c.status, c.priority,
        COALESCE(c.business_segment, 'B2B') as business_segment,
        COALESCE(c.deal_value, 0)::numeric as deal_value,
        c.next_step,
        TO_CHAR(c.follow_up_date, 'YYYY-MM-DD') as follow_up_date,
        c.assigned_to, c.notes,
        (c.follow_up_date < t.today_lima) as is_overdue,
        (c.follow_up_date = t.today_lima) as is_today,
        (c.follow_up_date - t.today_lima) as days_diff
      FROM contacts c
      CROSS JOIN ref_today t
      WHERE (c.follow_up_date IS NOT NULL OR c.status IN ('Seguimiento', 'En pausa', 'Conversación iniciada', 'Discovery / reunión', 'Oportunidad calificada', 'Propuesta enviada', 'Negociación'))
        AND (${memberName === '' || memberName === 'all'}::boolean OR c.assigned_to = ${memberName})
        AND (${segment === 'all'}::boolean OR c.business_segment = ${segment})
        AND (${statusParam === 'all'}::boolean OR c.status = ${statusParam})
      ORDER BY 
        CASE WHEN c.follow_up_date IS NULL THEN 1 ELSE 0 END,
        c.follow_up_date ASC, 
        c.priority DESC
      LIMIT 800;
    `;

    // Strictly separate segments without overlapping
    const formattedRows = rows.map((r: any) => {
      const diff = r.days_diff !== null ? (parseInt(r.days_diff, 10) || 0) : null;
      let bucket: 'overdue' | 'today' | 'plus_1_day' | 'plus_3_days' | 'plus_1_week' | 'plus_1_month' | 'future' = 'future';

      if (diff === null) {
        bucket = 'future'; // Seguimiento sin fecha específica aún
      } else if (diff < 0) {
        bucket = 'overdue';
      } else if (diff === 0) {
        bucket = 'today';
      } else if (diff === 1) {
        bucket = 'plus_1_day'; // Estrictamente mañana (1 día)
      } else if (diff >= 2 && diff <= 3) {
        bucket = 'plus_3_days'; // Estrictamente en 2 a 3 días
      } else if (diff >= 4 && diff <= 7) {
        bucket = 'plus_1_week'; // Estrictamente en 4 a 7 días
      } else if (diff >= 8 && diff <= 30) {
        bucket = 'plus_1_month'; // Estrictamente en 8 a 30 días
      } else {
        bucket = 'future'; // Próximo mes o más de 30 días
      }

      return {
        ...r,
        deal_value: Number(r.deal_value) || 0,
        days_diff: diff !== null ? diff : 30,
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
    const b2bCount = formattedRows.filter((r) => r.business_segment === 'B2B').length;
    const b2cCount = formattedRows.filter((r) => r.business_segment === 'B2C').length;

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
        b2bCount,
        b2cCount,
      }
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
