import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL=(.*)/);
const sql = neon(match[1].trim());

async function check() {
  const r = await sql`
    SELECT 
      id,
      contact_name,
      action_type,
      performed_by,
      created_at,
      TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as raw_str,
      (created_at)::date as raw_date,
      TO_CHAR(created_at AT TIME ZONE 'America/Lima', 'YYYY-MM-DD HH24:MI:SS') as lima_str,
      (created_at AT TIME ZONE 'America/Lima')::date as lima_date
    FROM activity_logs
    ORDER BY created_at DESC
    LIMIT 10;
  `;
  console.table(r);

  const stats = await sql`
    SELECT 
      (created_at)::date as raw_d,
      (created_at AT TIME ZONE 'America/Lima')::date as lima_d,
      COUNT(*) as count
    FROM activity_logs
    GROUP BY (created_at)::date, (created_at AT TIME ZONE 'America/Lima')::date;
  `;
  console.table(stats);
}

check().catch(console.error);
