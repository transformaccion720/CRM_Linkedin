import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_wZsrytc5iGo2@ep-wispy-bar-acik7rr2-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

async function main() {
  console.log('--- Analizando posiciones más frecuentes ---');

  const topPositions = await sql`
    SELECT 
      COALESCE(TRIM(position), '(VACIO O NULL)') as pos, 
      count(*)::int as qty
    FROM contacts
    GROUP BY COALESCE(TRIM(position), '(VACIO O NULL)')
    ORDER BY qty DESC
    LIMIT 40;
  `;
  console.table(topPositions);

  const nullOrEmpty = await sql`
    SELECT count(*)::int as count 
    FROM contacts 
    WHERE position IS NULL OR TRIM(position) = '';
  `;
  console.log('Total contactos con posición NULL o vacía:', nullOrEmpty[0].count);
}

main().catch(console.error);
