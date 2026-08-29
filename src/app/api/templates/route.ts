import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { DEFAULT_TEMPLATES } from '@/lib/templates';

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, name, category, target_audience as "targetAudience", text, is_active as "isActive"
      FROM templates
      ORDER BY created_at ASC;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ templates: DEFAULT_TEMPLATES });
    }

    return NextResponse.json({ templates: rows });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { templates, activeTemplateId } = body;

    if (!Array.isArray(templates)) {
      return NextResponse.json({ error: 'Templates debe ser un array' }, { status: 400 });
    }

    // Replace all templates with current state
    await sql`DELETE FROM templates;`;

    for (const t of templates) {
      const isActive = t.id === activeTemplateId;
      await sql`
        INSERT INTO templates (id, name, category, target_audience, text, is_active)
        VALUES (${t.id}, ${t.name}, ${t.category}, ${t.targetAudience}, ${t.text}, ${isActive});
      `;
    }

    return NextResponse.json({ success: true, message: 'Plantillas guardadas en Neon DB' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
