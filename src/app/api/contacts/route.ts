import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || '';
    const viewFilter = searchParams.get('viewFilter') || 'all'; // all, email, noemail, recent, follow_up, star3
    const year = searchParams.get('year') || '';
    const company = searchParams.get('company') || '';
    const position = searchParams.get('position') || '';
    const tag = searchParams.get('tag') || '';
    const priority = searchParams.get('priority') || '';

    const searchPattern = search ? `%${search.toLowerCase()}%` : null;

    const rows = await sql`
      SELECT id, first_name, last_name, linkedin_url, email, company, position, 
             TO_CHAR(connected_on, 'YYYY-MM-DD') as connected_on,
             status, notes, priority, 
             TO_CHAR(follow_up_date, 'YYYY-MM-DD') as follow_up_date,
             tags, created_at, updated_at
      FROM contacts
      WHERE 
        (${searchPattern}::text IS NULL OR (
          LOWER(first_name) LIKE ${searchPattern} OR 
          LOWER(COALESCE(last_name, '')) LIKE ${searchPattern} OR 
          LOWER(COALESCE(company, '')) LIKE ${searchPattern} OR 
          LOWER(COALESCE(position, '')) LIKE ${searchPattern} OR
          LOWER(COALESCE(email, '')) LIKE ${searchPattern}
        ))
        AND (${status === '' || status === 'all'}::boolean OR status = ${status})
        AND (${company === '' || company === 'all'}::boolean OR company = ${company})
        AND (${position === '' || position === 'all'}::boolean OR position = ${position})
        AND (${year === '' || year === 'all'}::boolean OR TO_CHAR(connected_on, 'YYYY') = ${year})
        AND (${priority === '' || priority === 'all'}::boolean OR priority = ${parseInt(priority || '1', 10)})
        AND (${tag === '' || tag === 'all'}::boolean OR ${tag} = ANY(tags))
        AND (
          ${viewFilter === 'all'}::boolean OR
          (${viewFilter === 'email'}::boolean AND email IS NOT NULL AND email != '') OR
          (${viewFilter === 'noemail'}::boolean AND (email IS NULL OR email = '')) OR
          (${viewFilter === 'recent'}::boolean AND connected_on >= '2025-01-01') OR
          (${viewFilter === 'follow_up'}::boolean AND follow_up_date IS NOT NULL AND follow_up_date <= CURRENT_DATE + INTERVAL '7 days') OR
          (${viewFilter === 'star3'}::boolean AND priority = 3)
        )
      ORDER BY 
        CASE WHEN follow_up_date IS NOT NULL AND follow_up_date <= CURRENT_DATE THEN 0 ELSE 1 END,
        priority DESC,
        connected_on DESC NULLS LAST, 
        created_at DESC
      LIMIT 3500;
    `;

    // Distinct years for filter dropdown
    const yearsResult = await sql`
      SELECT DISTINCT TO_CHAR(connected_on, 'YYYY') as yr 
      FROM contacts 
      WHERE connected_on IS NOT NULL 
      ORDER BY yr DESC
    `;
    const years = yearsResult.map((r) => r.yr).filter(Boolean);

    // Top companies
    const companiesResult = await sql`
      SELECT company, COUNT(*) as count 
      FROM contacts 
      WHERE company IS NOT NULL AND company != '' 
      GROUP BY company 
      ORDER BY count DESC 
      LIMIT 60
    `;
    const topCompanies = companiesResult.map((r) => r.company);

    // Top positions
    const positionsResult = await sql`
      SELECT position, COUNT(*) as count 
      FROM contacts 
      WHERE position IS NOT NULL AND position != '' 
      GROUP BY position 
      ORDER BY count DESC 
      LIMIT 60
    `;
    const topPositions = positionsResult.map((r) => r.position);

    // Distinct tags
    const tagsResult = await sql`
      SELECT DISTINCT UNNEST(tags) as tag 
      FROM contacts 
      WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
      ORDER BY tag ASC
    `;
    const distinctTags = tagsResult.map((r) => r.tag).filter(Boolean);

    return NextResponse.json(
      {
        contacts: rows,
        filterOptions: {
          years,
          companies: topCompanies,
          positions: topPositions,
          tags: distinctTags,
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { first_name, last_name, linkedin_url, email, company, position, connected_on, status, notes, priority, follow_up_date, tags } = body;

    const result = await sql`
      INSERT INTO contacts (first_name, last_name, linkedin_url, email, company, position, connected_on, status, notes, priority, follow_up_date, tags)
      VALUES (
        ${first_name}, 
        ${last_name || null}, 
        ${linkedin_url || null}, 
        ${email || null}, 
        ${company || null}, 
        ${position || null}, 
        ${connected_on || null}, 
        ${status || 'Sin contactar'}, 
        ${notes || null},
        ${priority || 1},
        ${follow_up_date || null},
        ${tags || []}
      )
      RETURNING *
    `;

    return NextResponse.json({ contact: result[0] }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
