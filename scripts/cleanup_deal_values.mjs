import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL=(.*)/);
const sql = neon(match[1].trim());

async function run() {
  await sql`UPDATE contacts SET deal_value = 0, next_step = NULL WHERE id = '8c3d9a10-c013-4d5d-8098-dc4effe0cd62';`;
  const rows = await sql`SELECT id, first_name, last_name, deal_value, next_step, business_segment FROM contacts WHERE deal_value > 0;`;
  console.log('Contacts with deal_value > 0 after cleanup:', rows.length);
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
