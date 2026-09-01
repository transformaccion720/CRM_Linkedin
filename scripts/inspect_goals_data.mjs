import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL=(.*)/);
const sql = neon(match[1].trim());

async function run() {
  console.log('--- TIMEZONE & DATE CHECK ---');
  const now = await sql`
    SELECT 
      CURRENT_TIMESTAMP as db_utc,
      CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima' as db_lima,
      (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date as lima_date,
      TO_CHAR(DATE_TRUNC('week', (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date), 'YYYY-MM-DD') as week_monday
  `;
  console.log('Now:', now[0]);

  console.log('\n--- ACTIVITY LOGS GROUPED BY DATE (America/Lima) ---');
  const actByDate = await sql`
    SELECT 
      TO_CHAR((created_at AT TIME ZONE 'America/Lima')::date, 'YYYY-MM-DD') as lima_day,
      action_type,
      performed_by,
      COUNT(*) as count
    FROM activity_logs
    GROUP BY (created_at AT TIME ZONE 'America/Lima')::date, action_type, performed_by
    ORDER BY lima_day DESC, count DESC;
  `;
  console.table(actByDate);

  console.log('\n--- CONTACTS SUMMARY BY STATUS & ASSIGNED ---');
  const contactsSummary = await sql`
    SELECT 
      assigned_to,
      status,
      COUNT(*) as total_contacts,
      COUNT(CASE WHEN (updated_at AT TIME ZONE 'America/Lima')::date = '2026-08-31'::date THEN 1 END) as updated_aug31,
      COUNT(CASE WHEN (updated_at AT TIME ZONE 'America/Lima')::date = '2026-09-01'::date THEN 1 END) as updated_sep01,
      COUNT(CASE WHEN (created_at AT TIME ZONE 'America/Lima')::date = '2026-08-31'::date THEN 1 END) as created_aug31,
      COUNT(CASE WHEN (created_at AT TIME ZONE 'America/Lima')::date = '2026-09-01'::date THEN 1 END) as created_sep01
    FROM contacts
    WHERE status != 'Sin contactar'
    GROUP BY assigned_to, status;
  `;
  console.table(contactsSummary);
}

run().catch(console.error);
