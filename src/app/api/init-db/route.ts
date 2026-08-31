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
        email VARCHAR(255) UNIQUE,
        role VARCHAR(100) DEFAULT 'Comercial',
        color VARCHAR(50) DEFAULT '#00a870',
        password VARCHAR(255) DEFAULT '123456',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`ALTER TABLE team_members ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT '123456';`;

    // 2. Table contacts
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
        country VARCHAR(100) DEFAULT 'Perú',
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

    await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`;
    await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Perú';`;
    await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(120) DEFAULT 'Gabino';`;

    // Unique index on (linkedin_url, assigned_to)
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_linkedin_assigned 
      ON contacts (linkedin_url, assigned_to) 
      WHERE linkedin_url IS NOT NULL AND linkedin_url != '';
    `;

    // 3. Table activity_logs
    await sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
        contact_name VARCHAR(255) NOT NULL,
        action_type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        performed_by VARCHAR(120) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activity_logs(created_at DESC);`;

    // 4. Table message templates
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

    // 5. Table settings
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_position ON contacts(position);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_country ON contacts(country);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_assigned_to ON contacts(assigned_to);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_connected_on ON contacts(connected_on DESC NULLS LAST);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);`;

    return NextResponse.json({
      success: true,
      message: 'Base de datos Neon inicializada con soporte de país y optimizaciones.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
