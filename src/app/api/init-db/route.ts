import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

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

    // 4. Table contact_messages (Bandeja de Entrada & Hilos de Conversación)
    await sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
        contact_name VARCHAR(255) NOT NULL,
        contact_company VARCHAR(255),
        contact_position VARCHAR(255),
        contact_linkedin_url TEXT,
        sender_name VARCHAR(120) NOT NULL,
        direction VARCHAR(20) DEFAULT 'OUTBOUND',
        channel VARCHAR(30) DEFAULT 'LINKEDIN',
        message_text TEXT NOT NULL,
        template_name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_contact_messages_contact_id ON contact_messages(contact_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contact_messages_sender ON contact_messages(sender_name);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);`;

    // 5. Table commercial_resources (Directorio de Archivos, PDFs, Videos, Flyers)
    await sql`
      CREATE TABLE IF NOT EXISTS commercial_resources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        file_url TEXT,
        file_name VARCHAR(255),
        file_size VARCHAR(50),
        external_link TEXT,
        created_by VARCHAR(120) DEFAULT 'Gabino',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_commercial_resources_category ON commercial_resources(category);`;

    // 6. Table message templates
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

    // 7. Table settings
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Seed default commercial resources if empty
    const resCount = await sql`SELECT COUNT(*) as count FROM commercial_resources;`;
    if (parseInt(resCount[0]?.count || '0', 10) === 0) {
      await sql`
        INSERT INTO commercial_resources (title, description, category, external_link, created_by)
        VALUES 
          ('Brochure Corporativo: Gestión de Proyectos Ágiles 2026', 'Temario oficial, certificaciones Scrum Master & PM Essentials y beneficios del programa.', 'BROCHURE', 'https://transformaccion720.com/brochure-agil.pdf', 'Gabino'),
          ('Video Demo: TransformAccion 720° para Empresas', 'Explicación de 2 minutos sobre cómo escalamos la productividad y cultura ágil.', 'VIDEO', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Gabino'),
          ('Flyer: Entrenamiento In-Company para Equipos', 'Resumen gráfico de módulos y modalidades presencial/online.', 'FLYER', 'https://transformaccion720.com/flyer-incompany.png', 'Gabino');
      `;
    }

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
      message: 'Base de datos Neon inicializada con tablas de mensajes y directorio de recursos.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
