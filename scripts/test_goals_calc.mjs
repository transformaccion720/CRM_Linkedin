import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL=(.*)/);
const sql = neon(match[1].trim());

async function check() {
  const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const dateRangeRows = await sql`
    WITH ref_date AS (
      SELECT ((CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date + (0 * INTERVAL '7 days'))::date as curr_d,
             (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date as today_d
    )
    SELECT 
      TO_CHAR(DATE_TRUNC('week', curr_d), 'YYYY-MM-DD') as start_date,
      TO_CHAR(DATE_TRUNC('week', curr_d) + INTERVAL '6 days', 'YYYY-MM-DD') as end_date,
      TO_CHAR(today_d, 'YYYY-MM-DD') as today_date
    FROM ref_date;
  `;
  const { start_date, end_date, today_date } = dateRangeRows[0];

  const acts = await sql`
    SELECT 
      TO_CHAR((created_at AT TIME ZONE 'America/Lima')::date, 'YYYY-MM-DD') as act_date,
      performed_by,
      COUNT(DISTINCT contact_id)::int as count
    FROM activity_logs
    WHERE (created_at AT TIME ZONE 'America/Lima')::date >= ${start_date}::date
      AND (created_at AT TIME ZONE 'America/Lima')::date <= ${end_date}::date
    GROUP BY (created_at AT TIME ZONE 'America/Lima')::date, performed_by
    ORDER BY act_date ASC;
  `;

  console.log('Today in Lima:', today_date);
  console.log('Activity breakdown per day in current week:');
  console.table(acts);
}

check().catch(console.error);
