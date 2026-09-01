const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
let dbUrl = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
  }
}
const sql = neon(dbUrl);

async function testSingleMetadata() {
  const assignedTo = 'Gabino';
  const t0 = Date.now();

  const [rows, metadata] = await Promise.all([
    // 1. Contacts
    sql`
      WITH shared_by_url AS (
        SELECT linkedin_url, ARRAY_AGG(DISTINCT assigned_to) as members
        FROM contacts
        WHERE linkedin_url IS NOT NULL AND linkedin_url != '' AND assigned_to IS NOT NULL
        GROUP BY linkedin_url
        HAVING COUNT(DISTINCT assigned_to) > 1
      ),
      shared_by_email AS (
        SELECT LOWER(email) as email_clean, ARRAY_AGG(DISTINCT assigned_to) as members
        FROM contacts
        WHERE email IS NOT NULL AND email != '' AND assigned_to IS NOT NULL
        GROUP BY LOWER(email)
        HAVING COUNT(DISTINCT assigned_to) > 1
      )
      SELECT 
        c.id, c.first_name, c.last_name, c.linkedin_url, c.email, c.phone, c.company, c.position, c.country,
        TO_CHAR(c.connected_on, 'YYYY-MM-DD') as connected_on,
        c.status, c.notes, c.priority, 
        TO_CHAR(c.follow_up_date, 'YYYY-MM-DD') as follow_up_date,
        c.tags, c.assigned_to, c.source, c.post_url, c.service_needed,
        c.created_at, c.updated_at,
        ARRAY_REMOVE(
          ARRAY(
            SELECT DISTINCT x 
            FROM unnest(COALESCE(su.members, ARRAY[]::text[]) || COALESCE(se.members, ARRAY[]::text[])) as x
          ),
          c.assigned_to
        ) as shared_with
      FROM contacts c
      LEFT JOIN shared_by_url su ON c.linkedin_url = su.linkedin_url
      LEFT JOIN shared_by_email se ON LOWER(c.email) = se.email_clean
      WHERE (${assignedTo === '' || assignedTo === 'all'}::boolean OR c.assigned_to = ${assignedTo})
      ORDER BY 
        CASE WHEN c.source = 'BUSQUEDA_ACTIVA' THEN 0 ELSE 1 END,
        CASE WHEN c.follow_up_date IS NOT NULL AND c.follow_up_date <= CURRENT_DATE THEN 0 ELSE 1 END,
        c.priority DESC,
        c.connected_on DESC NULLS LAST, 
        c.created_at DESC
      LIMIT 3500;
    `,
    // 2. All filter options in ONE query
    sql`
      SELECT 
        ARRAY(SELECT DISTINCT TO_CHAR(connected_on, 'YYYY') FROM contacts WHERE connected_on IS NOT NULL AND (${assignedTo === '' || assignedTo === 'all'}::boolean OR assigned_to = ${assignedTo}) ORDER BY 1 DESC) as years,
        ARRAY(SELECT DISTINCT company FROM contacts WHERE company IS NOT NULL AND TRIM(company) != '' AND (${assignedTo === '' || assignedTo === 'all'}::boolean OR assigned_to = ${assignedTo}) ORDER BY 1 ASC) as companies,
        ARRAY(SELECT DISTINCT position FROM contacts WHERE position IS NOT NULL AND TRIM(position) != '' AND (${assignedTo === '' || assignedTo === 'all'}::boolean OR assigned_to = ${assignedTo}) ORDER BY 1 ASC) as positions,
        ARRAY(SELECT DISTINCT unnest(tags) FROM contacts WHERE tags IS NOT NULL AND array_length(tags, 1) > 0 AND (${assignedTo === '' || assignedTo === 'all'}::boolean OR assigned_to = ${assignedTo}) ORDER BY 1 ASC) as tags
    `
  ]);

  console.log(`🚀 BOTH queries completed in: ${Date.now() - t0}ms!`);
  console.log(`Contacts: ${rows.length}, Companies: ${metadata[0]?.companies?.length}, Positions: ${metadata[0]?.positions?.length}`);
}

testSingleMetadata().catch(console.error);
