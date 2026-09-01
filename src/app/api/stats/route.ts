import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Run ALL stats queries in parallel for maximum speed
    const [
      totalResult,
      emailResult,
      phoneResult,
      companiesResult,
      recentResult,
      followUpsResult,
      activeSearchResult,
      statusResult,
      memberStatsResult,
      topCompanies,
      topCountries,
      byYear,
      topPositions,
      recentContacts,
    ] = await Promise.all([
      sql`SELECT COUNT(*) as total FROM contacts`,
      sql`SELECT COUNT(*) as with_email FROM contacts WHERE email IS NOT NULL AND email != ''`,
      sql`SELECT COUNT(*) as with_phone FROM contacts WHERE phone IS NOT NULL AND phone != ''`,
      sql`SELECT COUNT(DISTINCT company) as companies_count FROM contacts WHERE company IS NOT NULL AND company != ''`,
      sql`SELECT COUNT(*) as recent FROM contacts WHERE connected_on >= '2025-01-01'`,
      sql`SELECT COUNT(*) as count FROM contacts WHERE follow_up_date IS NOT NULL AND follow_up_date <= CURRENT_DATE + INTERVAL '7 days'`,
      sql`SELECT COUNT(*) as count FROM contacts WHERE source = 'BUSQUEDA_ACTIVA'`,
      sql`SELECT status, COUNT(*) as count FROM contacts GROUP BY status`,
      sql`
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
      `,
      sql`
        SELECT company, COUNT(*) as count 
        FROM contacts 
        WHERE company IS NOT NULL AND company != ''
        GROUP BY company 
        ORDER BY count DESC 
        LIMIT 6
      `,
      sql`
        SELECT COALESCE(country, 'No especificado') as country, COUNT(*) as count 
        FROM contacts 
        GROUP BY country 
        ORDER BY count DESC 
        LIMIT 5
      `,
      sql`
        SELECT TO_CHAR(connected_on, 'YYYY') as yr, COUNT(*) as count 
        FROM contacts 
        WHERE connected_on IS NOT NULL 
        GROUP BY yr 
        ORDER BY yr DESC 
        LIMIT 8
      `,
      sql`
        SELECT position, COUNT(*) as count 
        FROM contacts 
        WHERE position IS NOT NULL AND position != ''
        GROUP BY position 
        ORDER BY count DESC 
        LIMIT 6
      `,
      sql`
        SELECT id, first_name, last_name, TO_CHAR(connected_on, 'YYYY-MM-DD') as connected_on
        FROM contacts 
        ORDER BY connected_on DESC NULLS LAST, created_at DESC 
        LIMIT 5
      `,
    ]);

    const total = parseInt(totalResult[0]?.total || '0', 10);
    const withEmail = parseInt(emailResult[0]?.with_email || '0', 10);
    const withPhone = parseInt(phoneResult[0]?.with_phone || '0', 10);
    const companiesCount = parseInt(companiesResult[0]?.companies_count || '0', 10);
    const recentCount = parseInt(recentResult[0]?.recent || '0', 10);
    const pendingFollowUps = parseInt(followUpsResult[0]?.count || '0', 10);
    const activeSearchCount = parseInt(activeSearchResult[0]?.count || '0', 10);

    const byStatus: Record<string, number> = {};
    statusResult.forEach((r) => {
      byStatus[r.status] = parseInt(r.count, 10);
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
      byStatus,
      byMember,
      topCompanies,
      topCountries,
      byYear,
      topPositions,
      recentContacts,
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
