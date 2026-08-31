import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search')?.trim() || '';
    const id = searchParams.get('id');

    // If ID requested, return full record including file_url data (for download)
    if (id) {
      const single = await sql`
        SELECT id, title, description, category, file_url, file_name, file_size, external_link, created_by,
               TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as created_at
        FROM commercial_resources
        WHERE id = ${id}::uuid LIMIT 1;
      `;
      if (single.length === 0) {
        return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ resource: single[0] });
    }

    const searchPattern = search ? `%${search.toLowerCase()}%` : null;

    // For list, omit huge file_url payload to keep response ultra fast, return has_file boolean
    const rows = await sql`
      SELECT 
        id, title, description, category, file_name, file_size, external_link, created_by,
        (file_url IS NOT NULL AND file_url != '') as has_file,
        CASE WHEN file_url IS NOT NULL AND file_url != '' THEN file_url ELSE external_link END as preview_link,
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as created_at
      FROM commercial_resources
      WHERE 
        (${category === '' || category === 'all'}::boolean OR category = ${category})
        AND (${searchPattern}::text IS NULL OR (
          LOWER(title) LIKE ${searchPattern} OR 
          LOWER(COALESCE(description, '')) LIKE ${searchPattern} OR
          LOWER(created_by) LIKE ${searchPattern}
        ))
      ORDER BY created_at DESC;
    `;

    return NextResponse.json({ resources: rows }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, file_url, file_name, file_size, external_link, created_by } = body;

    if (!title || !category) {
      return NextResponse.json({ error: 'El título y la categoría son obligatorios' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO commercial_resources (
        title, description, category, file_url, file_name, file_size, external_link, created_by
      )
      VALUES (
        ${title},
        ${description || null},
        ${category},
        ${file_url || null},
        ${file_name || null},
        ${file_size || null},
        ${external_link || null},
        ${created_by || 'Gabino'}
      )
      RETURNING id, title, description, category, file_name, file_size, external_link, created_by, created_at;
    `;

    return NextResponse.json({ resource: result[0] }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    await sql`DELETE FROM commercial_resources WHERE id = ${id}::uuid;`;
    return NextResponse.json({ success: true, message: 'Recurso eliminado' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
