import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL=(.*)/);
const sql = neon(match[1].trim());

async function run() {
  console.log('Adding source, post_url, service_needed columns to contacts...');
  await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'BASE_IMPORTADA';`;
  await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS post_url TEXT;`;
  await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS service_needed TEXT;`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);`;
  console.log('Columns added successfully to Neon DB!');
}

run().catch(console.error);
