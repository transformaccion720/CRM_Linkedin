import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL=(.*)/);
const sql = neon(match[1].trim());

async function check() {
  const cCount = await sql`SELECT COUNT(*) as count FROM contacts;`;
  const aCount = await sql`SELECT COUNT(*) as count FROM activity_logs;`;
  const mCount = await sql`SELECT COUNT(*) as count FROM contact_messages;`;
  const tCount = await sql`SELECT COUNT(*) as count FROM team_members;`;

  console.log('Contacts total:', cCount[0].count);
  console.log('Activity logs total:', aCount[0].count);
  console.log('Contact messages total:', mCount[0].count);
  console.log('Team members total:', tCount[0].count);

  const sampleActs = await sql`SELECT * FROM activity_logs LIMIT 5;`;
  console.log('Sample activity logs:', sampleActs);
}

check().catch(console.error);
