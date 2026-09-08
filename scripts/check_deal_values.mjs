import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL=(.*)/);
const sql = neon(match[1].trim());

async function run() {
  const rows = await sql`SELECT id, first_name, last_name, deal_value, next_step, business_segment, status FROM contacts WHERE deal_value > 0;`;
  console.log('Contacts with deal_value > 0:', JSON.stringify(rows, null, 2));
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
