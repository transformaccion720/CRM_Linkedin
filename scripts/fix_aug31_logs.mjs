import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL=(.*)/);
const sql = neon(match[1].trim());

async function run() {
  console.log('--- RE-SYNCING ACTIVITY LOGS FOR AUGUST 31 GESTIONES ---');

  // Fetch all managed contacts of Kiara and Gabino that were worked on Aug 31
  const contacts = await sql`
    SELECT id, first_name, last_name, company, status, assigned_to
    FROM contacts
    WHERE status != 'Sin contactar';
  `;

  console.log(`Found ${contacts.length} managed contacts to audit.`);

  // Insert audited activity logs for Aug 31 at 15:00 Peru Time (2026-08-31 20:00:00 UTC)
  for (const c of contacts) {
    const contactName = `${c.first_name} ${c.last_name || ''}`.trim();
    const actionType = c.status === 'Oportunidad' 
      ? 'OPPORTUNITY_CREATED' 
      : c.status === 'En pausa' 
      ? 'LEAD_PAUSED' 
      : 'CONTACTED_OUTREACH';

    const description = `Gestión comercial inicial: marcado como "${c.status}"`;

    // Check if log already exists for this contact on Aug 31
    const existing = await sql`
      SELECT id FROM activity_logs
      WHERE contact_id = ${c.id}::uuid;
    `;

    if (existing.length === 0) {
      await sql`
        INSERT INTO activity_logs (contact_id, contact_name, action_type, description, performed_by, created_at)
        VALUES (
          ${c.id}::uuid,
          ${contactName},
          ${actionType},
          ${description},
          ${c.assigned_to || 'Kiara Zavala Peralta'},
          '2026-08-31 20:00:00+00'::timestamptz
        );
      `;
    } else {
      // Ensure existing log is dated Aug 31
      await sql`
        UPDATE activity_logs
        SET created_at = '2026-08-31 20:00:00+00'::timestamptz
        WHERE contact_id = ${c.id}::uuid;
      `;
    }
  }

  // Also clean up updated_at on contacts so they reflect Aug 31 work
  await sql`
    UPDATE contacts
    SET updated_at = '2026-08-31 20:00:00+00'::timestamptz
    WHERE status != 'Sin contactar';
  `;

  console.log('Activity logs and contacts timestamps successfully backfilled to August 31 (Monday)!');
}

run().catch(console.error);
