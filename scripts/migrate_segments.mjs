import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_wZsrytc5iGo2@ep-wispy-bar-acik7rr2-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

async function run() {
  console.log('1. Adding business_segment column to contacts if not exists...');
  await sql`
    ALTER TABLE contacts 
    ADD COLUMN IF NOT EXISTS business_segment VARCHAR(10) DEFAULT 'B2B';
  `;

  console.log('2. Running retroactive classification on existing contacts...');
  // Classification rules:
  // Rule A (explicit user instruction): HR, Talento, DO, Capacitación, People, RRHH -> ALWAYS B2B
  // Rule B: Executive/Decision makers (Gerente, Director, VP, Head, CEO, COO, Fundador, Jefe) -> B2B
  // Rule C: Individual roles (Analista, Asistente, Practicante, Especialista, Ingeniero, Scrum Master, Project Manager) -> B2C
  
  // First, set all to B2B by default
  await sql`
    UPDATE contacts 
    SET business_segment = 'B2B' 
    WHERE business_segment IS NULL;
  `;

  // Then classify as B2C for individual professionals who are NOT in HR/Talent and NOT in Management
  const b2cUpdate = await sql`
    UPDATE contacts
    SET business_segment = 'B2C'
    WHERE 
      business_segment = 'B2B'
      AND position IS NOT NULL 
      AND TRIM(position) != ''
      -- Not HR / Talent / DO / People / Capacitacion
      AND LOWER(position) NOT SIMILAR TO '%(recurso|humano|rrhh|hr|talento|talent|desarrollo organizacional|people|capacita|formaci)%'
      -- Not Executive / Decision makers
      AND LOWER(position) NOT SIMILAR TO '%(gerente|director|vp|vicepresiden|head|c-level|ceo|coo|cto|cfo|fundador|founder|socio|partner|jefe|chief|lead|subgerente|decano)%'
      -- Matches individual contributor / student profiles
      AND LOWER(position) SIMILAR TO '%(analista|asistente|practicante|especialista|coordinador|ingeniero|engineer|developer|desarrollador|consultor|scrum master|project manager|product owner|agile coach|docente|profesor|estudiante|estudio|postgrado|junior|intern)%'
    RETURNING id;
  `;
  console.log(`Classified ${b2cUpdate.length} contacts as B2C.`);

  // Double check that ALL HR/Talent/DO profiles are strictly B2B
  const hrEnforce = await sql`
    UPDATE contacts
    SET business_segment = 'B2B'
    WHERE 
      LOWER(COALESCE(position, '')) SIMILAR TO '%(recurso|humano|rrhh|hr|talento|talent|desarrollo organizacional|people|capacita|formaci)%'
    RETURNING id;
  `;
  console.log(`Enforced B2B on ${hrEnforce.length} HR/Talent contacts.`);

  // Check counts
  const counts = await sql`
    SELECT business_segment, COUNT(*)::int as count 
    FROM contacts 
    GROUP BY business_segment;
  `;
  console.log('Current segment distribution:', counts);

  // Check HR sample
  const hrSample = await sql`
    SELECT first_name, last_name, position, company, business_segment 
    FROM contacts 
    WHERE LOWER(COALESCE(position, '')) LIKE '%humano%' OR LOWER(COALESCE(position, '')) LIKE '%talento%' OR LOWER(COALESCE(position, '')) LIKE '%rrhh%'
    LIMIT 5;
  `;
  console.log('HR Sample verification:', hrSample);
}

run().catch(console.error);
