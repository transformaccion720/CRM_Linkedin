import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_wZsrytc5iGo2@ep-wispy-bar-acik7rr2-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

async function run() {
  console.log('1. Agregando columnas deal_value y next_step a contacts si no existen...');
  await sql`
    ALTER TABLE contacts 
    ADD COLUMN IF NOT EXISTS deal_value NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS next_step TEXT;
  `;

  console.log('2. Agregando columna business_segment a commercial_resources si no existe...');
  await sql`
    ALTER TABLE commercial_resources 
    ADD COLUMN IF NOT EXISTS business_segment VARCHAR(10) DEFAULT 'ALL';
  `;

  console.log('3. Homologando estados a las nuevas etapas del Pipeline B2B y B2C...');
  
  // B2B Stage Homologation
  await sql`
    UPDATE contacts
    SET status = 'Prospecto identificado'
    WHERE business_segment = 'B2B' AND (status = 'Sin contactar' OR status IS NULL);
  `;
  await sql`
    UPDATE contacts
    SET status = 'Contactado'
    WHERE business_segment = 'B2B' AND status = 'En contacto';
  `;
  await sql`
    UPDATE contacts
    SET status = 'Conversación iniciada'
    WHERE business_segment = 'B2B' AND status = 'Seguimiento';
  `;
  await sql`
    UPDATE contacts
    SET status = 'Oportunidad calificada'
    WHERE business_segment = 'B2B' AND status = 'Oportunidad';
  `;
  await sql`
    UPDATE contacts
    SET status = 'Ganada'
    WHERE business_segment = 'B2B' AND status = 'Cliente';
  `;
  await sql`
    UPDATE contacts
    SET status = 'Pausada'
    WHERE business_segment = 'B2B' AND status = 'En pausa';
  `;
  await sql`
    UPDATE contacts
    SET status = 'Perdida'
    WHERE business_segment = 'B2B' AND status = 'Descartado';
  `;

  // B2C Stage Homologation
  await sql`
    UPDATE contacts
    SET status = 'Prospecto identificado'
    WHERE business_segment = 'B2C' AND (status = 'Sin contactar' OR status IS NULL);
  `;
  await sql`
    UPDATE contacts
    SET status = 'Contactado'
    WHERE business_segment = 'B2C' AND status = 'En contacto';
  `;
  await sql`
    UPDATE contacts
    SET status = 'Conversación iniciada'
    WHERE business_segment = 'B2C' AND status = 'Seguimiento';
  `;
  await sql`
    UPDATE contacts
    SET status = 'Pide temario / Beca'
    WHERE business_segment = 'B2C' AND status = 'Oportunidad';
  `;
  await sql`
    UPDATE contacts
    SET status = 'Matriculado / Ganado'
    WHERE business_segment = 'B2C' AND status = 'Cliente';
  `;
  await sql`
    UPDATE contacts
    SET status = 'Pausada'
    WHERE business_segment = 'B2C' AND status = 'En pausa';
  `;
  await sql`
    UPDATE contacts
    SET status = 'Perdida'
    WHERE business_segment = 'B2C' AND status = 'Descartado';
  `;

  console.log('4. Verificando conteos por etapa en B2B:');
  const b2bCounts = await sql`
    SELECT status, count(*)::int as total
    FROM contacts
    WHERE business_segment = 'B2B'
    GROUP BY status
    ORDER BY total DESC;
  `;
  console.table(b2bCounts);

  console.log('5. Verificando conteos por etapa en B2C:');
  const b2cCounts = await sql`
    SELECT status, count(*)::int as total
    FROM contacts
    WHERE business_segment = 'B2C'
    GROUP BY status
    ORDER BY total DESC;
  `;
  console.table(b2cCounts);
}

run().catch(console.error);
