const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
let dbUrl = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
  }
}

if (!dbUrl) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const sql = neon(dbUrl);

async function main() {
  console.log('Connecting to Neon DB to create performance indexes...');
  const t0 = Date.now();
  
  await sql`CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contacts_position ON contacts(position);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contacts_country ON contacts(country);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contacts_linkedin_url ON contacts(linkedin_url);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contacts_assigned_to ON contacts(assigned_to);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contacts_priority ON contacts(priority);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contacts_follow_up ON contacts(follow_up_date);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contacts_connected_on ON contacts(connected_on DESC NULLS LAST);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contacts_tags_gin ON contacts USING GIN(tags);`;
  
  console.log('✅ All indexes created/verified in', Date.now() - t0, 'ms');
  
  const testT0 = Date.now();
  const res = await sql`
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
      c.id, c.first_name, c.last_name, c.company, c.position, c.assigned_to,
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
    LIMIT 3500;
  `;
  console.log(`🚀 CTE Query for ${res.length} contacts executed in: ${Date.now() - testT0} ms!`);
}

main().catch(console.error);
