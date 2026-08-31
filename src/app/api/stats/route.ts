import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // 1. Total and email stats
    const totalResult = await sql`SELECT COUNT(*) as total FROM contacts`;
    const total = parseInt(totalResult[0]?.total || '0', 10);

    const emailResult = await sql`SELECT COUNT(*) as with_email FROM contacts WHERE email IS NOT NULL AND email != ''`;
    const withEmail = parseInt(emailResult[0]?.with_email || '0', 10);

    const phoneResult = await sql`SELECT COUNT(*) as with_phone FROM contacts WHERE phone IS NOT NULL AND phone != ''`;
    const withPhone = parseInt(phoneResult[0]?.with_phone || '0', 10);

    const companiesResult = await sql`SELECT COUNT(DISTINCT company) as companies_count FROM contacts WHERE company IS NOT NULL AND company != ''`;
    const companiesCount = parseInt(companiesResult[0]?.companies_count || '0', 10);

    const recentResult = await sql`SELECT COUNT(*) as recent FROM contacts WHERE connected_on >= '2025-01-01'`;
    const recentCount = parseInt(recentResult[0]?.recent || '0', 10);

    const followUpsResult = await sql`SELECT COUNT(*) as count FROM contacts WHERE follow_up_date IS NOT NULL AND follow_up_date <= CURRENT_DATE + INTERVAL '7 days'`;
    const pendingFollowUps = parseInt(followUpsResult[0]?.count || '0', 10);

    // 2. Breakdown by status
    const statusResult = await sql`
      SELECT status, COUNT(*) as count 
      FROM contacts 
      GROUP BY status
    `;
    const byStatus: Record<string, number> = {};
    statusResult.forEach((r) => {
      byStatus[r.status] = parseInt(r.count, 10);
    });

    // 3. Breakdown by Team Member (Performance KPIs per member)
    const memberStatsResult = await sql`
      SELECT 
        COALESCE(assigned_to, 'Sin asignar') as member_name,
        COUNT(*)::int as total,
        COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END)::int as with_email,
        COUNT(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 END)::int as with_phone,
        COUNT(CASE WHEN status = 'En contacto' THEN 1 END)::int as in_contact,
        COUNT(CASE WHEN status = 'Oportunidad' THEN 1 END)::int as opportunity,
        COUNT(CASE WHEN status = 'Cliente' THEN 1 END)::int as client,
        COUNT(CASE WHEN status = 'En pausa' THEN 1 END)::int as paused
      FROM contacts
      GROUP BY assigned_to
      ORDER BY total DESC;
    `;

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

    // 4. Top companies
    const topCompanies = await sql`
      SELECT company, COUNT(*) as count 
      FROM contacts 
      WHERE company IS NOT NULL AND company != '' 
      GROUP BY company 
      ORDER BY count DESC 
      LIMIT 6
    `;

    // 5. By year
    const byYear = await sql`
      SELECT TO_CHAR(connected_on, 'YYYY') as yr, COUNT(*) as count 
      FROM contacts 
      WHERE connected_on IS NOT NULL 
      GROUP BY yr 
      ORDER BY yr DESC 
      LIMIT 8
    `;

    // 6. Top positions
    const topPositions = await sql`
      SELECT position, COUNT(*) as count 
      FROM contacts 
      WHERE position IS NOT NULL AND position != '' 
      GROUP BY position 
      ORDER BY count DESC 
      LIMIT 6
    `;

    return NextResponse.json(
      {
        stats: {
          total,
          withEmail,
          noEmail: total - withEmail,
          withPhone,
          companiesCount,
          recentCount,
          pendingFollowUps,
          byStatus,
          byMember,
          topCompanies,
          byYear,
          topPositions,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
