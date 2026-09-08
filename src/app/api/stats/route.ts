import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Consolidated queries executed in parallel for instant sub-100ms response
    const [
      scalarsResult,
      statusResult,
      memberStatsResult,
      topCompanies,
      topCountries,
      byYear,
      topPositions,
      recentContacts,
      activityTrends,
    ] = await Promise.all([
      // 1. All global scalar metrics in ONE single fast table scan
      sql`
        SELECT 
          COUNT(*)::int as total,
          COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END)::int as with_email,
          COUNT(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 END)::int as with_phone,
          COUNT(DISTINCT CASE WHEN company IS NOT NULL AND company != '' THEN company END)::int as companies_count,
          COUNT(CASE WHEN connected_on >= '2025-01-01' THEN 1 END)::int as recent_count,
          COUNT(CASE WHEN follow_up_date IS NOT NULL AND follow_up_date <= CURRENT_DATE + INTERVAL '7 days' THEN 1 END)::int as pending_follow_ups,
          COUNT(CASE WHEN source = 'BUSQUEDA_ACTIVA' THEN 1 END)::int as active_search_count,
          COUNT(CASE WHEN business_segment = 'B2B' THEN 1 END)::int as b2b_count,
          COUNT(CASE WHEN business_segment = 'B2C' THEN 1 END)::int as b2c_count,
          COUNT(CASE WHEN business_segment = 'B2B' AND follow_up_date IS NOT NULL AND follow_up_date <= CURRENT_DATE + INTERVAL '7 days' THEN 1 END)::int as b2b_follow_ups,
          COUNT(CASE WHEN business_segment = 'B2C' AND follow_up_date IS NOT NULL AND follow_up_date <= CURRENT_DATE + INTERVAL '7 days' THEN 1 END)::int as b2c_follow_ups,
          COALESCE(SUM(deal_value), 0)::numeric as total_deal_value,
          COALESCE(SUM(CASE WHEN business_segment = 'B2B' THEN deal_value ELSE 0 END), 0)::numeric as b2b_deal_value,
          COALESCE(SUM(CASE WHEN business_segment = 'B2C' THEN deal_value ELSE 0 END), 0)::numeric as b2c_deal_value
        FROM contacts;
      `,
      // 2. Status breakdown (global + segmented)
      sql`SELECT COALESCE(business_segment, 'B2B') as business_segment, status, COUNT(*)::int as count FROM contacts GROUP BY business_segment, status`,
      // 3. Member stats breakdown
      sql`
        SELECT 
          COALESCE(assigned_to, 'Sin asignar') as member_name,
          COUNT(*)::int as total,
          COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END)::int as with_email,
          COUNT(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 END)::int as with_phone,
          COUNT(CASE WHEN status = 'En contacto' THEN 1 END)::int as in_contact,
          COUNT(CASE WHEN status = 'Oportunidad' THEN 1 END)::int as opportunity,
          COUNT(CASE WHEN status = 'Cliente' THEN 1 END)::int as client,
          COUNT(CASE WHEN status IN ('Seguimiento', 'En pausa') THEN 1 END)::int as paused
        FROM contacts
        GROUP BY assigned_to
        ORDER BY total DESC;
      `,
      // 4. Top companies
      sql`
        SELECT company, COUNT(*)::int as count 
        FROM contacts 
        WHERE company IS NOT NULL AND company != ''
        GROUP BY company 
        ORDER BY count DESC 
        LIMIT 6
      `,
      // 5. Top countries
      sql`
        SELECT COALESCE(country, 'No especificado') as country, COUNT(*)::int as count 
        FROM contacts 
        GROUP BY country 
        ORDER BY count DESC 
        LIMIT 5
      `,
      // 6. Growth by year
      sql`
        SELECT TO_CHAR(connected_on, 'YYYY') as yr, COUNT(*)::int as count 
        FROM contacts 
        WHERE connected_on IS NOT NULL 
        GROUP BY yr 
        ORDER BY yr DESC 
        LIMIT 8
      `,
      // 7. Top positions
      sql`
        SELECT position, COUNT(*)::int as count 
        FROM contacts 
        WHERE position IS NOT NULL AND position != ''
        GROUP BY position 
        ORDER BY count DESC 
        LIMIT 6
      `,
      // 8. Recent contacts preview
      sql`
        SELECT id, first_name, last_name, TO_CHAR(connected_on, 'YYYY-MM-DD') as connected_on
        FROM contacts 
        ORDER BY connected_on DESC NULLS LAST, created_at DESC 
        LIMIT 5
      `,
      // 9. 7-Day activity trend in America/Lima
      sql`
        SELECT 
          TO_CHAR((created_at AT TIME ZONE 'America/Lima')::date, 'YYYY-MM-DD') as day_str,
          COUNT(*)::int as count
        FROM activity_logs
        WHERE (created_at AT TIME ZONE 'America/Lima')::date >= ((CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date - INTERVAL '6 days')
        GROUP BY (created_at AT TIME ZONE 'America/Lima')::date
        ORDER BY day_str ASC;
      `,
    ]);

    const s = scalarsResult[0] || {};
    const total = s.total || 0;
    const withEmail = s.with_email || 0;
    const withPhone = s.with_phone || 0;
    const companiesCount = s.companies_count || 0;
    const recentCount = s.recent_count || 0;
    const pendingFollowUps = s.pending_follow_ups || 0;
    const activeSearchCount = s.active_search_count || 0;

    const b2bCount = s.b2b_count || 0;
    const b2cCount = s.b2c_count || 0;
    const b2bFollowUps = s.b2b_follow_ups || 0;
    const b2cFollowUps = s.b2c_follow_ups || 0;
    const totalDealValue = Number(s.total_deal_value) || 0;
    const b2bDealValue = Number(s.b2b_deal_value) || 0;
    const b2cDealValue = Number(s.b2c_deal_value) || 0;

    const byStatus: Record<string, number> = {};
    const b2bByStatus: Record<string, number> = {};
    const b2cByStatus: Record<string, number> = {};

    statusResult.forEach((r) => {
      const cnt = parseInt(r.count, 10);
      byStatus[r.status] = (byStatus[r.status] || 0) + cnt;
      if (r.business_segment === 'B2B') {
        b2bByStatus[r.status] = cnt;
      } else if (r.business_segment === 'B2C') {
        b2cByStatus[r.status] = cnt;
      }
    });

    const byMember = memberStatsResult.map((r) => ({
      member_name: r.member_name,
      total: r.total,
      withEmail: r.with_email,
      withPhone: r.with_phone,
      inContact: r.in_contact,
      opportunity: r.opportunity,
      client: r.client,
      paused: r.paused,
    }));

    return NextResponse.json({
      total,
      withEmail,
      noEmail: total - withEmail,
      withPhone,
      companiesCount,
      recentCount,
      pendingFollowUps,
      activeSearchCount,
      b2bCount,
      b2cCount,
      b2bFollowUps,
      b2cFollowUps,
      totalDealValue,
      b2bDealValue,
      b2cDealValue,
      byStatus,
      b2bByStatus,
      b2cByStatus,
      byMember,
      topCompanies,
      topCountries,
      byYear,
      topPositions,
      recentContacts,
      activityTrends,
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
