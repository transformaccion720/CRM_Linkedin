import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_wZsrytc5iGo2@ep-wispy-bar-acik7rr2-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

async function main() {
  console.log('--- Analizando posiciones actuales en contacts ---');

  // 1. Total counts
  const totals = await sql`
    SELECT business_segment, count(*)::int as count
    FROM contacts
    GROUP BY business_segment;
  `;
  console.log('Distribución actual:', totals);

  // 2. Ejemplos de perfiles mencionados por el usuario
  const specificUsers = await sql`
    SELECT id, first_name, last_name, position, company, business_segment
    FROM contacts
    WHERE 
      LOWER(position) LIKE '%editor%'
      OR LOWER(first_name) LIKE '%jose%' AND (LOWER(last_name) LIKE '%is%' OR LOWER(last_name) LIKE '%iguay%')
      OR LOWER(last_name) LIKE '%morocho%'
      OR LOWER(first_name) LIKE '%leonard%' AND LOWER(last_name) LIKE '%cajate%'
    LIMIT 10;
  `;
  console.log('\nPerfiles específicos mencionados por el usuario:');
  console.table(specificUsers);

  // 3. Ver otros perfiles dudosos marcados como B2B
  const sampleDoubtful = await sql`
    SELECT first_name, last_name, position, business_segment
    FROM contacts
    WHERE business_segment = 'B2B'
      AND (
        LOWER(position) LIKE '%editor%'
        OR LOWER(position) LIKE '%programmer%'
        OR LOWER(position) LIKE '%architect%'
        OR LOWER(position) LIKE '%ejecutivo%'
        OR LOWER(position) LIKE '%analista%'
        OR LOWER(position) LIKE '%desarrollador%'
        OR LOWER(position) LIKE '%developer%'
        OR LOWER(position) LIKE '%practicante%'
        OR LOWER(position) LIKE '%asistente%'
        OR LOWER(position) LIKE '%docente%'
        OR position IS NULL
        OR TRIM(position) = ''
      )
    LIMIT 15;
  `;
  console.log('\nMuestra de perfiles dudosos en B2B actual:');
  console.table(sampleDoubtful);
}

main().catch(console.error);
