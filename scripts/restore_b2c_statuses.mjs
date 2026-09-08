import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_wZsrytc5iGo2@ep-wispy-bar-acik7rr2-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

async function restoreB2C() {
  console.log('Restaurando estados B2C a sus valores originales...');

  await sql`
    UPDATE contacts
    SET status = 'Sin contactar'
    WHERE business_segment = 'B2C' AND status = 'Prospecto identificado';
  `;

  await sql`
    UPDATE contacts
    SET status = 'Seguimiento'
    WHERE business_segment = 'B2C' AND status = 'Conversación iniciada';
  `;

  await sql`
    UPDATE contacts
    SET status = 'Oportunidad'
    WHERE business_segment = 'B2C' AND status = 'Pide temario / Beca';
  `;

  await sql`
    UPDATE contacts
    SET status = 'Cliente'
    WHERE business_segment = 'B2C' AND status = 'Matriculado / Ganado';
  `;

  await sql`
    UPDATE contacts
    SET status = 'Descartado'
    WHERE business_segment = 'B2C' AND status = 'Perdida';
  `;

  await sql`
    UPDATE contacts
    SET status = 'En pausa'
    WHERE business_segment = 'B2C' AND status = 'Pausada';
  `;

  const b2cCounts = await sql`
    SELECT status, count(*)::int as total
    FROM contacts
    WHERE business_segment = 'B2C'
    GROUP BY status
    ORDER BY total DESC;
  `;
  console.log('Estados B2C restaurados:');
  console.table(b2cCounts);

  const b2bCounts = await sql`
    SELECT status, count(*)::int as total
    FROM contacts
    WHERE business_segment = 'B2B'
    GROUP BY status
    ORDER BY total DESC;
  `;
  console.log('Estados B2B actuales (10 etapas):');
  console.table(b2bCounts);
}

restoreB2C().catch(console.error);
