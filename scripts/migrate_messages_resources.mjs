import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL=(.*)/);
const dbUrl = match ? match[1].trim() : '';

const sql = neon(dbUrl);

async function run() {
  console.log('Connecting to Neon...');
  
  // Table contact_messages
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

  // Table commercial_resources
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

  console.log('Database initialized successfully with messages and resources tables!');
}

run().catch(console.error);
