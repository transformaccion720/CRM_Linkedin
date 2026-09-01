import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL=(.*)/);
const sql = neon(match[1].trim());

async function check() {
  const r = await sql`
    SELECT 
      CURRENT_DATE as db_current_date,
      (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date as lima_date,
      TO_CHAR(DATE_TRUNC('week', (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date), 'YYYY-MM-DD') as monday_lima
  `;
  console.log('Result:', r);

  const acts = await sql`
    SELECT 
      TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as act_utc,
      TO_CHAR(created_at AT TIME ZONE 'America/Lima', 'YYYY-MM-DD HH24:MI:SS') as act_lima,
      action_type, performed_by
    FROM activity_logs
    ORDER BY created_at DESC
    LIMIT 5;
  `;
  console.log('Latest activity logs in Lima timezone:', acts);
}

check();
