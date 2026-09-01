import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL=(.*)/);
const sql = neon(match[1].trim());

async function run() {
  console.log('--- REPOPULATING IMMUTABLE AUDIT LOGS FOR AUG 31 ---');

  const contacts = await sql`
    SELECT id, first_name, last_name, company, status, assigned_to
    FROM contacts
    WHERE status != 'Sin contactar';
  `;

  console.log(`Auditing ${contacts.length} managed contacts...`);

  // Clear and insert exact logs with immutable timestamp for Aug 31
  await sql`DELETE FROM activity_logs;`;

  for (const c of contacts) {
    const contactName = `${c.first_name} ${c.last_name || ''}`.trim();
    const actionType = c.status === 'Oportunidad' 
      ? 'OPPORTUNITY_CREATED' 
      : c.status === 'En pausa' 
      ? 'LEAD_PAUSED' 
      : 'CONTACTED_OUTREACH';

    const description = `Gestión comercial inicial: marcado como "${c.status}"`;

    await sql`
      INSERT INTO activity_logs (contact_id, contact_name, action_type, description, performed_by, created_at)
      VALUES (
        ${c.id}::uuid,
        ${contactName},
        ${actionType},
        ${description},
        ${c.assigned_to || 'Kiara Zavala Peralta'},
        '2026-08-31 15:00:00-05'::timestamptz
      );
    `;
  }

  const check = await sql`
    SELECT 
      TO_CHAR((created_at AT TIME ZONE 'America/Lima')::date, 'YYYY-MM-DD') as day_lima,
      performed_by,
      COUNT(*) as count
    FROM activity_logs
    GROUP BY (created_at AT TIME ZONE 'America/Lima')::date, performed_by;
  `;
  console.table(check);
}

run().catch(console.error);
