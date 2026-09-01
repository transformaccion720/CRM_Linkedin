import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL=(.*)/);
const sql = neon(match[1].trim());

async function run() {
  console.log('Inspecting updated_at values for Kiara contacts...');
  const rows = await sql`
    SELECT 
      id, first_name, last_name, status,
      TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_utc,
      TO_CHAR(updated_at AT TIME ZONE 'America/Lima', 'YYYY-MM-DD HH24:MI:SS') as updated_lima,
      TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_utc,
      TO_CHAR(created_at AT TIME ZONE 'America/Lima', 'YYYY-MM-DD HH24:MI:SS') as created_lima
    FROM contacts
    WHERE assigned_to = 'Kiara Zavala Peralta' AND status != 'Sin contactar'
    ORDER BY updated_at DESC
    LIMIT 10;
  `;
  console.table(rows);
}

run().catch(console.error);
