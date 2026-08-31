import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { DEFAULT_TEMPLATES } from '@/lib/templates';

export async function GET() {
  try {
    // 1. Table team_members
    await sql`
      CREATE TABLE IF NOT EXISTS team_members (
        id VARCHAR(80) PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(255),
        role VARCHAR(100) DEFAULT 'Comercial',
        color VARCHAR(50) DEFAULT '#00a870',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Seed default admin member Gabino if empty
    const teamCountRes = await sql`SELECT COUNT(*) as count FROM team_members`;
    const teamCount = parseInt(teamCountRes[0]?.count || '0', 10);
    if (teamCount === 0) {
      await sql`
        INSERT INTO team_members (id, name, email, role, color)
        VALUES ('gabino', 'Gabino', 'transformaccion720@gmail.com', 'Director Comercial', '#00a870')
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    // 2. Table contacts (Remove UNIQUE constraint on linkedin_url so multiple members can import their own list, but add composite index)
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(120) NOT NULL,
        last_name VARCHAR(120),
        linkedin_url TEXT,
        email VARCHAR(255),
        phone VARCHAR(50),
        company VARCHAR(255),
        position VARCHAR(255),
        connected_on DATE,
        status VARCHAR(50) DEFAULT 'Sin contactar',
        notes TEXT,
        priority INTEGER DEFAULT 1,
        follow_up_date DATE,
        tags TEXT[] DEFAULT '{}',
        assigned_to VARCHAR(120) DEFAULT 'Gabino',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Ensure columns exist if table was created previously
    await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`;
    await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(120) DEFAULT 'Gabino';`;

    // Drop unique constraint on linkedin_url if present so each user can have their base
    try {
      await sql`ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_linkedin_url_key;`;
    } catch {
      // ignore
    }

    // 3. Table message templates in database
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

    // 4. Table general user settings / preferences
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

    // 5. Optimized Indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_position ON contacts(position);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_linkedin ON contacts(linkedin_url);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_priority ON contacts(priority);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_follow_up ON contacts(follow_up_date);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_assigned_to ON contacts(assigned_to);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_connected_on ON contacts(connected_on DESC NULLS LAST);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);`;

    return NextResponse.json({
      success: true,
      message: 'Base de datos Neon inicializada con team_members, contacts, templates y settings.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
