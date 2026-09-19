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
    const pipelineGroup = searchParams.get('pipelineGroup') || 'all';

    // Fetch all contacts with follow_up_date using explicit America/Lima timezone calculation
    const rows = await sql`
      WITH ref_today AS (
        SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date as today_lima
      )
      SELECT 
        c.id, c.first_name, c.last_name, c.company, c.position, c.country, c.phone, c.linkedin_url, c.status, c.priority,
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
      WHERE c.follow_up_date IS NOT NULL
        AND (${memberName === '' || memberName === 'all'}::boolean OR c.assigned_to = ${memberName})
        AND (${segment === 'all'}::boolean OR c.business_segment = ${segment})
        AND (${statusParam === 'all'}::boolean OR c.status = ${statusParam})
        AND (
          ${pipelineGroup === 'all'}::boolean OR
          (${pipelineGroup === 'contacted'}::boolean AND c.status IN ('Contactado', 'Sin contactar', 'Prospecto identificado')) OR
          (${pipelineGroup === 'in_conversation'}::boolean AND c.status IN ('Conversación iniciada', 'En contacto', 'Seguimiento')) OR
          (${pipelineGroup === 'meeting'}::boolean AND c.status IN ('Discovery / reunión')) OR
          (${pipelineGroup === 'opportunity_won'}::boolean AND c.status IN ('Oportunidad calificada', 'Propuesta enviada', 'Negociación', 'Oportunidad', 'Ganada', 'Cliente'))
        )
      ORDER BY 
        c.follow_up_date ASC, 
        c.priority DESC,
        c.created_at DESC
      LIMIT 1500;
    `;

    // Categorize time buckets and granular overdue intervals (day / week breakdown)
    const formattedRows = rows.map((r: any) => {
      const diff = r.days_diff !== null ? (parseInt(r.days_diff, 10) || 0) : null;
      let bucket: 'overdue' | 'today' | 'plus_1_day' | 'plus_3_days' | 'plus_1_week' | 'plus_1_month' | 'future' = 'future';
      let overdueSubBucket: 'overdue_week_plus' | 'overdue_this_week' | 'overdue_yesterday' | 'today' | 'tomorrow' | 'this_week' | 'future' = 'future';

      if (diff === null) {
        bucket = 'future';
        overdueSubBucket = 'future';
      } else if (diff < 0) {
        bucket = 'overdue';
        if (diff <= -7) {
          overdueSubBucket = 'overdue_week_plus'; // Más de 1 semana de atraso
        } else if (diff <= -2) {
          overdueSubBucket = 'overdue_this_week'; // 2 a 6 días atrás (esta semana)
        } else {
          overdueSubBucket = 'overdue_yesterday'; // Vencido ayer (-1 día)
        }
      } else if (diff === 0) {
        bucket = 'today';
        overdueSubBucket = 'today';
      } else if (diff === 1) {
        bucket = 'plus_1_day';
        overdueSubBucket = 'tomorrow';
      } else if (diff >= 2 && diff <= 3) {
        bucket = 'plus_3_days';
        overdueSubBucket = 'this_week';
      } else if (diff >= 4 && diff <= 7) {
        bucket = 'plus_1_week';
        overdueSubBucket = 'this_week';
      } else if (diff >= 8 && diff <= 30) {
        bucket = 'plus_1_month';
        overdueSubBucket = 'future';
      } else {
        bucket = 'future';
        overdueSubBucket = 'future';
      }

      return {
        ...r,
        deal_value: Number(r.deal_value) || 0,
        days_diff: diff !== null ? diff : 30,
        time_bucket: bucket,
        overdue_sub_bucket: overdueSubBucket,
      };
    });

    const overdueCount = formattedRows.filter((r) => r.time_bucket === 'overdue').length;
    const overdueWeekPlusCount = formattedRows.filter((r) => r.overdue_sub_bucket === 'overdue_week_plus').length;
    const overdueThisWeekCount = formattedRows.filter((r) => r.overdue_sub_bucket === 'overdue_this_week').length;
    const overdueYesterdayCount = formattedRows.filter((r) => r.overdue_sub_bucket === 'overdue_yesterday').length;
    
    const todayCount = formattedRows.filter((r) => r.time_bucket === 'today').length;
    const tomorrowCount = formattedRows.filter((r) => r.time_bucket === 'plus_1_day').length;
    const thisWeekCount = formattedRows.filter((r) => r.overdue_sub_bucket === 'this_week').length;
    const plus1MonthCount = formattedRows.filter((r) => r.time_bucket === 'plus_1_month').length;
    const futureCount = formattedRows.filter((r) => r.time_bucket === 'future').length;

    const b2bCount = formattedRows.filter((r) => r.business_segment === 'B2B').length;
    const b2cCount = formattedRows.filter((r) => r.business_segment === 'B2C').length;

    // Stage counts for strategic attack filters
    const contactedCount = formattedRows.filter((r) => ['Contactado', 'Sin contactar', 'Prospecto identificado'].includes(r.status)).length;
    const inConversationCount = formattedRows.filter((r) => ['Conversación iniciada', 'En contacto', 'Seguimiento'].includes(r.status)).length;
    const meetingCount = formattedRows.filter((r) => ['Discovery / reunión'].includes(r.status)).length;
    const opportunityWonCount = formattedRows.filter((r) => ['Oportunidad calificada', 'Propuesta enviada', 'Negociación', 'Oportunidad', 'Ganada', 'Cliente'].includes(r.status)).length;

    return NextResponse.json({
      reminders: formattedRows,
      stats: {
        total: formattedRows.length,
        overdue: overdueCount,
        overdue_week_plus: overdueWeekPlusCount,
        overdue_this_week: overdueThisWeekCount,
        overdue_yesterday: overdueYesterdayCount,
        today: todayCount,
        tomorrow: tomorrowCount,
        this_week: thisWeekCount,
        plus_1_month: plus1MonthCount,
        future: futureCount,
        upcoming: formattedRows.length - overdueCount - todayCount,
        b2bCount,
        b2cCount,
        contactedCount,
        inConversationCount,
        meetingCount,
        opportunityWonCount,
      }
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
