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

    // Run contacts query and consolidated filter metadata in parallel (only 2 round trips)
    const [rows, metaResult] = await Promise.all([
      // 1. High-performance contacts query with pre-aggregated CTEs for instant shared contacts detection
      sql`
        WITH shared_by_url AS (
          SELECT linkedin_url, ARRAY_AGG(DISTINCT assigned_to) as members
          FROM contacts
          WHERE linkedin_url IS NOT NULL AND linkedin_url != '' AND assigned_to IS NOT NULL
          GROUP BY linkedin_url
          HAVING COUNT(DISTINCT assigned_to) > 1
        ),
        shared_by_email AS (
          SELECT LOWER(email) as email_clean, ARRAY_AGG(DISTINCT assigned_to) as members
          FROM contacts
          WHERE email IS NOT NULL AND email != '' AND assigned_to IS NOT NULL
          GROUP BY LOWER(email)
          HAVING COUNT(DISTINCT assigned_to) > 1
        )
        SELECT 
          c.id, c.first_name, c.last_name, c.linkedin_url, c.email, c.phone, c.company, c.position, c.country,
          TO_CHAR(c.connected_on, 'YYYY-MM-DD') as connected_on,
          c.status, c.notes, c.priority, 
          TO_CHAR(c.follow_up_date, 'YYYY-MM-DD') as follow_up_date,
          c.tags, c.assigned_to, c.source, c.post_url, c.service_needed,
          c.created_at, c.updated_at,
          ARRAY_REMOVE(
            ARRAY(
              SELECT DISTINCT x 
              FROM unnest(COALESCE(su.members, ARRAY[]::text[]) || COALESCE(se.members, ARRAY[]::text[])) as x
            ),
            c.assigned_to
          ) as shared_with
        FROM contacts c
        LEFT JOIN shared_by_url su ON c.linkedin_url = su.linkedin_url
        LEFT JOIN shared_by_email se ON LOWER(c.email) = se.email_clean
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
          CASE WHEN c.follow_up_date IS NOT NULL THEN 0 ELSE 1 END,
          c.priority DESC,
          c.connected_on DESC NULLS LAST, 
          c.created_at DESC
        LIMIT 8000;
      `,
      // 2. Filter options consolidated in ONE query
      sql`
        SELECT 
          ARRAY(SELECT DISTINCT TO_CHAR(connected_on, 'YYYY') FROM contacts WHERE connected_on IS NOT NULL AND (${assignedTo === '' || assignedTo === 'all'}::boolean OR assigned_to = ${assignedTo}) ORDER BY 1 DESC) as years,
          ARRAY(SELECT DISTINCT company FROM contacts WHERE company IS NOT NULL AND TRIM(company) != '' AND (${assignedTo === '' || assignedTo === 'all'}::boolean OR assigned_to = ${assignedTo}) ORDER BY 1 ASC) as companies,
          ARRAY(SELECT DISTINCT position FROM contacts WHERE position IS NOT NULL AND TRIM(position) != '' AND (${assignedTo === '' || assignedTo === 'all'}::boolean OR assigned_to = ${assignedTo}) ORDER BY 1 ASC) as positions,
          ARRAY(SELECT DISTINCT unnest(tags) FROM contacts WHERE tags IS NOT NULL AND array_length(tags, 1) > 0 AND (${assignedTo === '' || assignedTo === 'all'}::boolean OR assigned_to = ${assignedTo}) ORDER BY 1 ASC) as tags
      `
    ]);

    const meta = metaResult[0] || {};

    return NextResponse.json(
      {
        contacts: rows,
        filterOptions: {
          years: (meta.years || []).filter(Boolean),
          companies: (meta.companies || []).filter(Boolean),
          positions: (meta.positions || []).filter(Boolean),
          tags: (meta.tags || []).filter(Boolean),
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
