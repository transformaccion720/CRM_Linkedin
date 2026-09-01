import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || '';
    const viewFilter = searchParams.get('viewFilter') || 'all';
    const year = searchParams.get('year') || '';
    const company = searchParams.get('company') || '';
    const position = searchParams.get('position') || '';
    const tag = searchParams.get('tag') || '';
    const priority = searchParams.get('priority') || '';
    const assignedTo = searchParams.get('assignedTo') || '';
    const source = searchParams.get('source') || '';

    const searchPattern = search ? `%${search.toLowerCase()}%` : null;

    // Run main query and filter option queries IN PARALLEL
    const [rows, yearsResult, companiesResult, positionsResult, tagsResult] = await Promise.all([
      // Main contacts query — shared_with computed via LEFT JOIN aggregate instead of correlated subquery
      sql`
        SELECT 
          c.id, c.first_name, c.last_name, c.linkedin_url, c.email, c.phone, c.company, c.position, c.country,
          TO_CHAR(c.connected_on, 'YYYY-MM-DD') as connected_on,
          c.status, c.notes, c.priority, 
          TO_CHAR(c.follow_up_date, 'YYYY-MM-DD') as follow_up_date,
          c.tags, c.assigned_to, c.source, c.post_url, c.service_needed,
          c.created_at, c.updated_at,
          COALESCE(sw.shared_names, ARRAY[]::text[]) as shared_with
        FROM contacts c
        LEFT JOIN LATERAL (
          SELECT ARRAY_AGG(DISTINCT c2.assigned_to) as shared_names
          FROM contacts c2
          WHERE c2.id != c.id
            AND c2.assigned_to IS NOT NULL
            AND c2.assigned_to != c.assigned_to
            AND (
              (c.linkedin_url IS NOT NULL AND c.linkedin_url != '' AND c2.linkedin_url = c.linkedin_url)
              OR (
                LOWER(TRIM(c2.first_name)) = LOWER(TRIM(c.first_name))
                AND LOWER(TRIM(COALESCE(c2.last_name, ''))) = LOWER(TRIM(COALESCE(c.last_name, '')))
                AND (
                  (c.email IS NOT NULL AND c.email != '' AND LOWER(c2.email) = LOWER(c.email))
                  OR (c.company IS NOT NULL AND c.company != '' AND LOWER(c2.company) = LOWER(c.company))
                )
              )
            )
        ) sw ON true
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
      `,

      // Filter: years
      sql`
        SELECT DISTINCT TO_CHAR(connected_on, 'YYYY') as yr 
        FROM contacts 
        WHERE connected_on IS NOT NULL 
          AND (${assignedTo === '' || assignedTo === 'all'}::boolean OR assigned_to = ${assignedTo})
        ORDER BY yr DESC
      `,

      // Filter: companies
      sql`
        SELECT DISTINCT company
        FROM contacts 
        WHERE company IS NOT NULL AND TRIM(company) != ''
          AND (${assignedTo === '' || assignedTo === 'all'}::boolean OR assigned_to = ${assignedTo})
        ORDER BY company ASC
      `,

      // Filter: positions
      sql`
        SELECT DISTINCT position
        FROM contacts 
        WHERE position IS NOT NULL AND TRIM(position) != ''
          AND (${assignedTo === '' || assignedTo === 'all'}::boolean OR assigned_to = ${assignedTo})
        ORDER BY position ASC
      `,

      // Filter: tags
      sql`
        SELECT DISTINCT unnest(tags) as tag
        FROM contacts
        WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
          AND (${assignedTo === '' || assignedTo === 'all'}::boolean OR assigned_to = ${assignedTo})
        ORDER BY tag ASC;
      `,
    ]);

    return NextResponse.json(
      {
        contacts: rows,
        filterOptions: {
          years: yearsResult.map((r) => r.yr).filter(Boolean),
          companies: companiesResult.map((r) => r.company).filter(Boolean),
          positions: positionsResult.map((r) => r.position).filter(Boolean),
          tags: tagsResult.map((r) => r.tag).filter(Boolean),
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
