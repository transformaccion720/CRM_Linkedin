import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || '';
    const viewFilter = searchParams.get('viewFilter') || 'all'; // all, email, noemail, recent, follow_up, star3, shared, active_search
    const year = searchParams.get('year') || '';
    const company = searchParams.get('company') || '';
    const position = searchParams.get('position') || '';
    const tag = searchParams.get('tag') || '';
    const priority = searchParams.get('priority') || '';
    const assignedTo = searchParams.get('assignedTo') || '';
    const source = searchParams.get('source') || '';

    const searchPattern = search ? `%${search.toLowerCase()}%` : null;

    const rows = await sql`
      SELECT 
        c.id, c.first_name, c.last_name, c.linkedin_url, c.email, c.phone, c.company, c.position, c.country,
        TO_CHAR(c.connected_on, 'YYYY-MM-DD') as connected_on,
        c.status, c.notes, c.priority, 
        TO_CHAR(c.follow_up_date, 'YYYY-MM-DD') as follow_up_date,
        c.tags, c.assigned_to, c.source, c.post_url, c.service_needed,
        c.created_at, c.updated_at
      FROM contacts c
      WHERE 
        (${searchPattern}::text IS NULL OR (
          LOWER(c.first_name) LIKE ${searchPattern} OR 
          LOWER(COALESCE(c.last_name, '')) LIKE ${searchPattern} OR 
          LOWER(COALESCE(c.company, '')) LIKE ${searchPattern} OR 
          LOWER(COALESCE(c.position, '')) LIKE ${searchPattern} OR
          LOWER(COALESCE(c.email, '')) LIKE ${searchPattern} OR
          LOWER(COALESCE(c.phone, '')) LIKE ${searchPattern} OR
          LOWER(COALESCE(c.service_needed, '')) LIKE ${searchPattern}
        ))
        AND (${status === '' || status === 'all'}::boolean OR c.status = ${status})
        AND (${company === '' || company === 'all'}::boolean OR c.company = ${company})
        AND (${position === '' || position === 'all'}::boolean OR c.position = ${position})
        AND (${year === '' || year === 'all'}::boolean OR TO_CHAR(c.connected_on, 'YYYY') = ${year})
        AND (${priority === '' || priority === 'all'}::boolean OR c.priority = ${parseInt(priority || '1', 10)})
        AND (${assignedTo === '' || assignedTo === 'all'}::boolean OR c.assigned_to = ${assignedTo})
        AND (${source === '' || source === 'all'}::boolean OR c.source = ${source})
        AND (${tag === '' || tag === 'all'}::boolean OR ${tag} = ANY(c.tags))
        AND (
          ${viewFilter === 'all'}::boolean OR
          (${viewFilter === 'active_search'}::boolean AND c.source = 'BUSQUEDA_ACTIVA') OR
          (${viewFilter === 'email'}::boolean AND c.email IS NOT NULL AND c.email != '') OR
          (${viewFilter === 'noemail'}::boolean AND (c.email IS NULL OR c.email = '')) OR
          (${viewFilter === 'recent'}::boolean AND c.connected_on >= '2025-01-01') OR
          (${viewFilter === 'follow_up'}::boolean AND c.follow_up_date IS NOT NULL AND c.follow_up_date <= CURRENT_DATE + INTERVAL '7 days') OR
          (${viewFilter === 'star3'}::boolean AND c.priority = 3)
        )
      ORDER BY 
        CASE WHEN c.source = 'BUSQUEDA_ACTIVA' THEN 0 ELSE 1 END,
        CASE WHEN c.follow_up_date IS NOT NULL AND c.follow_up_date <= CURRENT_DATE THEN 0 ELSE 1 END,
        c.priority DESC,
        c.connected_on DESC NULLS LAST, 
        c.created_at DESC
      LIMIT 3500;
    `;

    // Dynamic contextual filter options
    const yearsResult = await sql`
      SELECT DISTINCT TO_CHAR(connected_on, 'YYYY') as yr 
      FROM contacts 
      WHERE connected_on IS NOT NULL 
        AND (${assignedTo === '' || assignedTo === 'all'}::boolean OR assigned_to = ${assignedTo})
      ORDER BY yr DESC
    `;
    const years = yearsResult.map((r) => r.yr).filter(Boolean);

    const companiesResult = await sql`
      SELECT company, COUNT(*) as count 
      FROM contacts 
      WHERE company IS NOT NULL AND company != ''
        AND (${assignedTo === '' || assignedTo === 'all'}::boolean OR assigned_to = ${assignedTo})
      GROUP BY company 
      ORDER BY count DESC 
      LIMIT 50
    `;
    const topCompanies = companiesResult.map((r) => r.company);

    const positionsResult = await sql`
      SELECT position, COUNT(*) as count 
      FROM contacts 
      WHERE position IS NOT NULL AND position != ''
        AND (${assignedTo === '' || assignedTo === 'all'}::boolean OR assigned_to = ${assignedTo})
      GROUP BY position 
      ORDER BY count DESC 
      LIMIT 50
    `;
    const topPositions = positionsResult.map((r) => r.position);

    const tagsResult = await sql`
      SELECT DISTINCT unnest(tags) as tag
      FROM contacts
      WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
        AND (${assignedTo === '' || assignedTo === 'all'}::boolean OR assigned_to = ${assignedTo})
      ORDER BY tag ASC;
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
    const { 
      first_name, 
      last_name, 
      linkedin_url, 
      email, 
      phone, 
      company, 
      position, 
      country,
      connected_on, 
      status, 
      notes, 
      priority, 
      follow_up_date, 
      tags, 
      assigned_to,
      source,
      post_url,
      service_needed,
    } = body;

    if (!first_name) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const leadSource = source || 'BUSQUEDA_ACTIVA';

    const result = await sql`
      INSERT INTO contacts (
        first_name, 
        last_name, 
        linkedin_url, 
        email, 
        phone, 
        company, 
        position, 
        country,
        connected_on, 
        status, 
        notes, 
        priority, 
        follow_up_date, 
        tags, 
        assigned_to,
        source,
        post_url,
        service_needed
      )
      VALUES (
        ${first_name}, 
        ${last_name || null}, 
        ${linkedin_url || null}, 
        ${email || null}, 
        ${phone || null}, 
        ${company || null}, 
        ${position || null}, 
        ${country || 'Perú'},
        ${connected_on || null}, 
        ${status || 'Sin contactar'}, 
        ${notes || null},
        ${priority || (leadSource === 'BUSQUEDA_ACTIVA' ? 3 : 1)},
        ${follow_up_date || null},
        ${tags || []},
        ${assigned_to || 'Gabino'},
        ${leadSource},
        ${post_url || null},
        ${service_needed || null}
      )
      RETURNING *
    `;

    return NextResponse.json({ contact: result[0] }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
