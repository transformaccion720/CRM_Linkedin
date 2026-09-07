import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_wZsrytc5iGo2@ep-wispy-bar-acik7rr2-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

// Strict Negative Disqualifiers: If they match these roles, NEVER B2B
const JUNIOR_AND_ASSISTANT_REGEX = /\b(asistente|practicante|pasante|intern\b|trainee|auxiliar|secretari[ao]|recepcion|operador|soporte|helpdesk)\b/i;
const TECHNICAL_INDIVIDUAL_REGEX = /\b(programmer|programador[ao]?|developer|desarrollador[ao]?|architect|arquitect[ao]|software engineer|data scientist|dba\b|devops|sysadmin|tester|qa\b|engineer|ingenier[ao])\b/i;
const CREATIVE_MEDIA_REGEX = /\b(editor[ao]?|editorial|redactor[ao]?|periodista|reporter[ao]?|diseñador[ao]?|designer|community manager|copywriter|social media|fot[oó]graf[ao]?|audiovisual)\b/i;
const SALES_REP_REGEX = /\b(ejecutivo\s+de\s+(ventas|cuentas?|negocios?)|ejecutiv[ao]\s+comercial|asesor\s+comercial|vendedor[ao]?|promotor[ao]?|teleoperador[ao]?|call center|broker|account executive|sales rep)\b|^ejecutiv[ao]$/i;
const ACADEMIC_STUDENT_REGEX = /\b(docente|profesor[ao]?|catedr[aá]tic[ao]|investigador[ao]?|teacher|estudiante|alumno|bachiller|egresad[ao]|graduad[ao]|postgrado|m[aá]ster|maestr[ií]a)\b/i;
const AGILE_PROJECT_INDIVIDUAL_REGEX = /\b(scrum master|agile coach|kanban coach|product owner|project manager|pmo|analista|analyst|consultor independiente|freelance|independiente)\b/i;

// Positive B2B Matchers
const C_LEVEL_TOP_EXEC_REGEX = /\b(ceo|chief executive officer|director general|directora general|managing director|gerente general|general manager|country manager|agm|presidente|presidenta|president|vicepresidente|vicepresidenta|vp\b|evp|svp|fundador[ao]?|founder|co-?founder|cofundador[ao]?|owner|dueñ[ao]|c-level|coo|cfo|cto|cio|cmo|chro|chief operating officer|chief financial officer|chief technology officer|socio principal|managing partner|decano|decana)\b/i;
const MANAGEMENT_DIRECTOR_REGEX = /\b(gerente|gerenta|sub-?gerente|manager|director[ao]?|head of|head\b|jefe de|jefa de|partner|socio)\b/i;
const HR_TALENT_CULTURE_REGEX = /\b(recursos?\s+humanos?|rrhh|human resources|hr\b|hrbp|talento|talent|people|people & culture|cultura organizacional|clima laboral|desarrollo organizacional|\bdo\b|capacitaci[oó]n|formaci[oó]n corporativa|aprendizaje|learning|l&d|selecci[oó]n|atracci[oó]n del talento|bienestar laboral)\b/i;

function detectBusinessSegment(position) {
  if (!position || !position.trim()) {
    return 'B2C';
  }

  const pos = position.trim();

  if (JUNIOR_AND_ASSISTANT_REGEX.test(pos)) return 'B2C';
  if (SALES_REP_REGEX.test(pos)) return 'B2C';
  if (CREATIVE_MEDIA_REGEX.test(pos) && !C_LEVEL_TOP_EXEC_REGEX.test(pos)) return 'B2C';
  if (ACADEMIC_STUDENT_REGEX.test(pos) && !C_LEVEL_TOP_EXEC_REGEX.test(pos)) return 'B2C';

  if (C_LEVEL_TOP_EXEC_REGEX.test(pos)) return 'B2B';

  if (HR_TALENT_CULTURE_REGEX.test(pos)) {
    const isHRDecisionMaker = /\b(gerente|gerenta|director[ao]?|head|jefe|jefa|vp\b|vicepresiden|hrbp|business partner|l[ií]der|responsable|encargad[ao]|sub-?gerente)\b/i.test(pos);
    const isJuniorOrOperational = /\b(asistente|practicante|pasante|intern\b|auxiliar|analista|analyst|coordinador[ao]?|especialista|t[eé]cnic[ao]|generalista|reclutador[ao]?|recruiter)\b/i.test(pos);

    if (isHRDecisionMaker && !isJuniorOrOperational) return 'B2B';
    return 'B2C';
  }

  if (TECHNICAL_INDIVIDUAL_REGEX.test(pos) && !MANAGEMENT_DIRECTOR_REGEX.test(pos)) return 'B2C';
  if (AGILE_PROJECT_INDIVIDUAL_REGEX.test(pos) && !MANAGEMENT_DIRECTOR_REGEX.test(pos)) return 'B2C';

  if (MANAGEMENT_DIRECTOR_REGEX.test(pos)) {
    if (/\b(project manager|product manager|community manager|lead developer|tech lead|technical lead)\b/i.test(pos) && !C_LEVEL_TOP_EXEC_REGEX.test(pos)) {
      return 'B2C';
    }
    return 'B2B';
  }

  return 'B2C';
}

async function runMigration() {
  console.log('--- Iniciando Re-segmentación Estricta B2B vs B2C en Neon DB ---');

  // 1. Obtener todos los contactos con sus posiciones
  const contacts = await sql`
    SELECT id, first_name, last_name, position, company, business_segment 
    FROM contacts;
  `;
  console.log(`Total de contactos recuperados: ${contacts.length}`);

  const toB2B = [];
  const toB2C = [];

  for (const c of contacts) {
    const calculated = detectBusinessSegment(c.position);
    if (calculated !== c.business_segment) {
      if (calculated === 'B2B') {
        toB2B.push(c.id);
      } else {
        toB2C.push(c.id);
      }
    }
  }

  console.log(`Contactos que cambiarán a B2C (Limpieza de no decisores): ${toB2C.length}`);
  console.log(`Contactos que cambiarán a B2B: ${toB2B.length}`);

  // Update to B2C in chunks of 500
  const CHUNK_SIZE = 500;
  for (let i = 0; i < toB2C.length; i += CHUNK_SIZE) {
    const chunk = toB2C.slice(i, i + CHUNK_SIZE);
    await sql`
      UPDATE contacts
      SET business_segment = 'B2C'
      WHERE id = ANY(${chunk});
    `;
    console.log(`Actualizados ${Math.min(i + CHUNK_SIZE, toB2C.length)}/${toB2C.length} a B2C...`);
  }

  // Update to B2B in chunks of 500
  for (let i = 0; i < toB2B.length; i += CHUNK_SIZE) {
    const chunk = toB2B.slice(i, i + CHUNK_SIZE);
    await sql`
      UPDATE contacts
      SET business_segment = 'B2B'
      WHERE id = ANY(${chunk});
    `;
    console.log(`Actualizados ${Math.min(i + CHUNK_SIZE, toB2B.length)}/${toB2B.length} a B2B...`);
  }

  // 2. Verificar los nuevos totales
  const finalCounts = await sql`
    SELECT business_segment, count(*)::int as total
    FROM contacts
    GROUP BY business_segment;
  `;
  console.log('\n--- Nuevos Totales por Segmento en Neon DB ---');
  console.table(finalCounts);

  // 3. Verificar específicamente los casos mencionados por el usuario
  const specificCases = await sql`
    SELECT id, first_name, last_name, position, company, business_segment
    FROM contacts
    WHERE 
      (LOWER(first_name) LIKE '%jose%' AND LOWER(last_name) LIKE '%isuhuaylas%')
      OR LOWER(last_name) LIKE '%morocho%'
      OR (LOWER(first_name) LIKE '%leonard%' AND LOWER(last_name) LIKE '%cajate%')
      OR LOWER(position) LIKE '%editor%'
    LIMIT 10;
  `;
  console.log('\n--- Verificación de los perfiles específicos del usuario ---');
  console.table(specificCases);
}

runMigration().catch(console.error);
