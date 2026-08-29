import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const totalResult = await sql`SELECT COUNT(*) as count FROM contacts`;
    const total = parseInt(totalResult[0]?.count || '0', 10);

    const emailResult = await sql`SELECT COUNT(*) as count FROM contacts WHERE email IS NOT NULL AND email != ''`;
    const withEmail = parseInt(emailResult[0]?.count || '0', 10);

    const noEmail = total - withEmail;

    const companiesResult = await sql`SELECT COUNT(DISTINCT company) as count FROM contacts WHERE company IS NOT NULL AND company != ''`;
    const companiesCount = parseInt(companiesResult[0]?.count || '0', 10);

    const recentResult = await sql`
      SELECT COUNT(*) as count 
      FROM contacts 
      WHERE connected_on >= '2025-01-01'
    `;
    const recentCount = parseInt(recentResult[0]?.count || '0', 10);

    // Follow-ups pending / due today or next 7 days
    const followUpResult = await sql`
      SELECT COUNT(*) as count 
      FROM contacts 
      WHERE follow_up_date IS NOT NULL AND follow_up_date <= CURRENT_DATE + INTERVAL '7 days'
    `;
    const pendingFollowUps = parseInt(followUpResult[0]?.count || '0', 10);

    // Status aggregation
    const statusResults = await sql`
      SELECT status, COUNT(*) as count 
      FROM contacts 
      GROUP BY status
    `;

    const byStatus: Record<string, number> = {
      'new': 0,
      'contacted': 0,
      'qualified': 0,
      'lost': 0,
      'unassigned': 0,
    };

    for (const r of statusResults) {
      const st = (r.status || '').toLowerCase().trim();
      const count = parseInt(r.count, 10);
      if (st === 'new' || st === 'nuevo' || st === 'lead nuevo') byStatus.new += count;
      else if (st === 'contacted' || st === 'contactado' || st === 'en contacto') byStatus.contacted += count;
      else if (st === 'qualified' || st === 'calificado' || st === 'oportunidad' || st === 'cliente') byStatus.qualified += count;
      else if (st === 'lost' || st === 'descartado') byStatus.lost += count;
      else byStatus.unassigned += count;
    }

    // Top 10 Companies
    const topCompanies = await sql`
      SELECT company, COUNT(*) as count 
      FROM contacts 
      WHERE company IS NOT NULL AND company != '' 
      GROUP BY company 
      ORDER BY count DESC 
      LIMIT 10
    `;

    // Connections by Year
    const byYear = await sql`
      SELECT TO_CHAR(connected_on, 'YYYY') as yr, COUNT(*) as count 
      FROM contacts 
      WHERE connected_on IS NOT NULL 
      GROUP BY yr 
      ORDER BY yr ASC
    `;

    // Top Positions
    const topPositions = await sql`
      SELECT position, COUNT(*) as count 
      FROM contacts 
      WHERE position IS NOT NULL AND position != '' 
      GROUP BY position 
      ORDER BY count DESC 
      LIMIT 8
    `;

    // Most Recent Contacts
    const recentContacts = await sql`
      SELECT id, first_name, last_name, TO_CHAR(connected_on, 'YYYY-MM-DD') as connected_on 
      FROM contacts 
      ORDER BY connected_on DESC NULLS LAST, created_at DESC 
      LIMIT 8
    `;

    return NextResponse.json({
      stats: {
        total,
        withEmail,
        noEmail,
        companiesCount,
        recentCount,
        pendingFollowUps,
        byStatus,
        topCompanies,
        byYear,
        topPositions,
        recentContacts,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
