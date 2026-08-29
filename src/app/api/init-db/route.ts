import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { DEFAULT_TEMPLATES } from '@/lib/templates';

export async function GET() {
  try {
    // 1. Table contacts
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(120) NOT NULL,
        last_name VARCHAR(120),
        linkedin_url TEXT UNIQUE,
        email VARCHAR(255),
        company VARCHAR(255),
        position VARCHAR(255),
        connected_on DATE,
        status VARCHAR(50) DEFAULT 'Sin contactar',
        notes TEXT,
        priority INTEGER DEFAULT 1,
        follow_up_date DATE,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 2. Table message templates in database
    await sql`
      CREATE TABLE IF NOT EXISTS templates (
        id VARCHAR(80) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        target_audience VARCHAR(120) NOT NULL,
        text TEXT NOT NULL,
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 3. Table general user settings / preferences
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Seed default templates if empty
    const countResult = await sql`SELECT COUNT(*) as count FROM templates`;
    const count = parseInt(countResult[0]?.count || '0', 10);
    if (count === 0) {
      for (let i = 0; i < DEFAULT_TEMPLATES.length; i++) {
        const t = DEFAULT_TEMPLATES[i];
        await sql`
          INSERT INTO templates (id, name, category, target_audience, text, is_active)
          VALUES (${t.id}, ${t.name}, ${t.category}, ${t.targetAudience}, ${t.text}, ${i === 0})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // 4. Ensure optimized indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_position ON contacts(position);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_priority ON contacts(priority);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_follow_up ON contacts(follow_up_date);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_connected_on ON contacts(connected_on DESC NULLS LAST);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);`;

    return NextResponse.json({
      success: true,
      message: 'Base de datos Neon inicializada con tablas contacts, templates y settings.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
