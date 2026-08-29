import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST() {
  try {
    // 1. Create main table if not exists
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
      )
    `;

    // 2. Add columns individually
    await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1`;
    await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS follow_up_date DATE`;
    await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'`;

    // 3. Create indexes individually
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_position ON contacts(position)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_priority ON contacts(priority)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_follow_up ON contacts(follow_up_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_connected_on ON contacts(connected_on)`;

    return NextResponse.json({ success: true, message: 'Base de datos Neon inicializada y migrada con éxito.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
