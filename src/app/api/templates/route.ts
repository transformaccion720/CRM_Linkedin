import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { DEFAULT_TEMPLATES, MessageTemplate } from '@/lib/templates';

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

    // Sanitize templates and guarantee non-null values
    const sanitized = templates.map((t: Partial<MessageTemplate>, idx: number) => {
      const id = String(t.id || `template-${Date.now()}-${idx}`);
      const name = String(t.name || `Plantilla ${idx + 1}`).trim();
      const category = String(t.category || 'General').trim();
      const targetAudience = String(t.targetAudience || 'Venta Directa / Profesional').trim();
      const text = String(t.text || '').trim();
      const isActive = activeTemplateId ? id === activeTemplateId : Boolean(t.isActive);
      return { id, name, category, targetAudience, text, isActive };
    });

    // Execute DELETE and batch INSERTS in a single atomic Neon transaction
    const queries = [
      sql`DELETE FROM templates;`,
      ...sanitized.map((t) =>
        sql`
          INSERT INTO templates (id, name, category, target_audience, text, is_active, updated_at)
          VALUES (${t.id}, ${t.name}, ${t.category}, ${t.targetAudience}, ${t.text}, ${t.isActive}, NOW());
        `
      ),
    ];

    await sql.transaction(queries);

    return NextResponse.json({ 
      success: true, 
      count: sanitized.length,
      message: `${sanitized.length} plantillas guardadas atómicamente en Neon DB` 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error saving templates in Neon DB:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
