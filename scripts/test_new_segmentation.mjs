import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_wZsrytc5iGo2@ep-wispy-bar-acik7rr2-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

// Strict Negative Disqualifiers (Never B2B unless explicitly high corporate C-Level)
const JUNIOR_AND_ASSISTANT_REGEX = /\b(asistente|practicante|pasante|intern\b|trainee|auxiliar|secretari[ao]|recepcion|operador|soporte|helpdesk)\b/i;

const TECHNICAL_INDIVIDUAL_REGEX = /\b(programmer|programador[ao]?|developer|desarrollador[ao]?|architect|arquitect[ao]|software engineer|data scientist|dba\b|devops|sysadmin|tester|qa\b|engineer|ingenier[ao])\b/i;

const CREATIVE_MEDIA_REGEX = /\b(editor[ao]?|editorial|redactor[ao]?|periodista|reporter[ao]?|diseñador[ao]?|designer|community manager|copywriter|social media|fot[oó]graf[ao]?|audiovisual)\b/i;

const SALES_REP_REGEX = /\b(ejecutivo\s+de\s+(ventas|cuentas?|negocios?)|ejecutiv[ao]\s+comercial|asesor\s+comercial|vendedor[ao]?|promotor[ao]?|teleoperador[ao]?|call center|broker|account executive|sales rep)\b|^ejecutiv[ao]$/i;

const ACADEMIC_STUDENT_REGEX = /\b(docente|profesor[ao]?|catedr[aá]tic[ao]|investigador[ao]?|teacher|estudiante|alumno|bachiller|egresad[ao]|graduad[ao]|postgrado|m[aá]ster|maestr[ií]a)\b/i;

const AGILE_PROJECT_INDIVIDUAL_REGEX = /\b(scrum master|agile coach|kanban coach|product owner|project manager|pmo|analista|analyst|consultor independiente|freelance|independiente)\b/i;

// Positive B2B Matchers
const C_LEVEL_TOP_EXEC_REGEX = /\b(ceo|chief executive officer|director general|directora general|managing director|gerente general|general manager|country manager|presidente|presidenta|president|vicepresidente|vicepresidenta|vp\b|fundador[ao]?|founder|co-?founder|cofundador[ao]?|owner|dueñ[ao]|c-level|coo|cfo|cto|cio|cmo|chro|chief operating officer|chief financial officer|chief technology officer|socio principal|managing partner|decano|decana)\b/i;

const MANAGEMENT_DIRECTOR_REGEX = /\b(gerente|gerenta|sub-?gerente|manager|director[ao]?|head of|head\b|jefe de|jefa de|partner|socio)\b/i;

const HR_TALENT_CULTURE_REGEX = /\b(recursos?\s+humanos?|rrhh|human resources|hr\b|hrbp|talento|talent|people|people & culture|cultura organizacional|clima laboral|desarrollo organizacional|\bdo\b|capacitaci[oó]n|formaci[oó]n corporativa|aprendizaje|learning|l&d|selecci[oó]n|atracci[oó]n del talento|bienestar laboral)\b/i;

export function evaluateSegment(position) {
  if (!position || !position.trim()) {
    return 'B2C'; // Empty or undefined position is B2C
  }

  const pos = position.trim();

  // Guardrail 1: Junior, practicante, asistente, auxiliar -> ALWAYS B2C
  if (JUNIOR_AND_ASSISTANT_REGEX.test(pos)) {
    return 'B2C';
  }

  // Guardrail 2: Pure sales reps or simple "Ejecutivo" -> B2C
  if (SALES_REP_REGEX.test(pos)) {
    return 'B2C';
  }

  // Guardrail 3: Creative, editorial, video, media -> B2C (unless C-Level founder)
  if (CREATIVE_MEDIA_REGEX.test(pos) && !C_LEVEL_TOP_EXEC_REGEX.test(pos)) {
    return 'B2C';
  }

  // Guardrail 4: Academic, teachers, students -> B2C (unless Dean/Decano)
  if (ACADEMIC_STUDENT_REGEX.test(pos) && !C_LEVEL_TOP_EXEC_REGEX.test(pos)) {
    return 'B2C';
  }

  // Rule 1: C-Level, Founders, Presidents, Gerente General -> ALWAYS B2B
  if (C_LEVEL_TOP_EXEC_REGEX.test(pos)) {
    return 'B2B';
  }

  // Rule 2: HR, Talent, Culture, People, DO decision makers
  if (HR_TALENT_CULTURE_REGEX.test(pos)) {
    // Must be a leader, manager, director, head, jefe, VP, HRBP or responsible in HR/Talent
    const isHRDecisionMaker = /\b(gerente|gerenta|director[ao]?|head|jefe|jefa|vp\b|vicepresiden|hrbp|business partner|l[ií]der|responsable|encargad[ao]|sub-?gerente)\b/i.test(pos);
    const isJuniorOrOperational = /\b(asistente|practicante|pasante|intern\b|auxiliar|analista|analyst|coordinador[ao]?|especialista|t[eé]cnic[ao]|generalista|reclutador[ao]?|recruiter)\b/i.test(pos);

    if (isHRDecisionMaker && !isJuniorOrOperational) {
      return 'B2B';
    }
    // If it mentions "Jefe de Selección" or "Gerente de Atracción" it was caught by isHRDecisionMaker
    return 'B2C';
  }

  // Guardrail 5: Technical individual contributors (Programmer, Architect, Developer, Engineer) -> B2C
  if (TECHNICAL_INDIVIDUAL_REGEX.test(pos) && !MANAGEMENT_DIRECTOR_REGEX.test(pos)) {
    return 'B2C';
  }

  // Guardrail 6: Agile, Project Manager, Scrum Master, Analyst -> B2C
  if (AGILE_PROJECT_INDIVIDUAL_REGEX.test(pos) && !MANAGEMENT_DIRECTOR_REGEX.test(pos)) {
    return 'B2C';
  }

  // Rule 3: Corporate Managers, Directors, Heads of Corporate Departments
  if (MANAGEMENT_DIRECTOR_REGEX.test(pos)) {
    // Exclude false friends like "Project Manager", "Product Manager", "Community Manager", "Editor", "Technical Lead"
    if (/\b(project manager|product manager|community manager|lead developer|tech lead|technical lead)\b/i.test(pos) && !C_LEVEL_TOP_EXEC_REGEX.test(pos)) {
      return 'B2C';
    }
    return 'B2B';
  }

  // Default: If not proven to be a corporate decision-maker / C-Level / Director / Gerente -> B2C
  return 'B2C';
}

async function testSimulation() {
  console.log('--- Probando algoritmo en la base de datos real ---');
  const allContacts = await sql`SELECT id, first_name, last_name, position, company, business_segment FROM contacts;`;
  
  let b2bCount = 0;
  let b2cCount = 0;
  let changesToB2C = [];
  let confirmedB2B = [];

  for (const c of allContacts) {
    const newSeg = evaluateSegment(c.position);
    if (newSeg === 'B2B') {
      b2bCount++;
      if (confirmedB2B.length < 10) confirmedB2B.push(c);
    } else {
      b2cCount++;
      if (c.business_segment === 'B2B' && changesToB2C.length < 15) {
        changesToB2C.push(c);
      }
    }
  }

  console.log(`\nResultados de la nueva segmentación:`);
  console.log(`Total Contactos: ${allContacts.length}`);
  console.log(`B2B (Decisores Corporativos Reales): ${b2bCount} (${((b2bCount / allContacts.length) * 100).toFixed(1)}%)`);
  console.log(`B2C (Profesionales, Alumnos, Técnicos): ${b2cCount} (${((b2cCount / allContacts.length) * 100).toFixed(1)}%)`);

  console.log('\nMuestra de perfiles que pasarán de B2B a B2C (Limpieza de falsos positivos):');
  console.table(changesToB2C.map(c => ({
    Nombre: `${c.first_name} ${c.last_name || ''}`,
    Cargo: c.position,
    Empresa: c.company,
    Antes: c.business_segment,
    Ahora: 'B2C'
  })));

  console.log('\nMuestra de perfiles confirmados como B2B estricto (Decisores de peso):');
  console.table(confirmedB2B.map(c => ({
    Nombre: `${c.first_name} ${c.last_name || ''}`,
    Cargo: c.position,
    Empresa: c.company,
    Segmento: 'B2B'
  })));

  // Test the exact users the client mentioned:
  const testSpecifics = [
    { name: 'Jose Isuhuaylas', pos: 'Ejecutivo' },
    { name: 'Miguel Morocho Ramos', pos: '.NET Analyst Programmer' },
    { name: 'Leonard Rosman Cajate', pos: 'IT Solutions Architect' },
    { name: 'Xiomara Vega Goicochea', pos: 'Asistente de Recursos Humanos' },
    { name: 'Carlos Gomez', pos: 'Gerente General' },
    { name: 'Ana Torres', pos: 'CEO & Founder' },
    { name: 'Marcos Silva', pos: 'Director de Recursos Humanos' },
    { name: 'Sofia Ruiz', pos: 'Head of People & Culture' },
    { name: 'Clara Mendez', pos: 'Gerente de Talento y Cultura' },
    { name: 'Roberto Diaz', pos: 'Vicepresidente de Operaciones' },
    { name: 'Daniel Prado', pos: 'Presidente Ejecutivo' },
    { name: 'Hugo Ramos', pos: 'Jefe de Atracción del Talento y Selección' },
    { name: 'Lucia Sanchez', pos: 'HR Business Partner Senior' },
    { name: 'Pedro Alva', pos: 'Scrum Master Senior' },
    { name: 'Rosa Flores', pos: 'Docente universitario' },
    { name: 'Jose Perez', pos: 'Editor de video' },
    { name: 'Mario Rossi', pos: 'Ejecutivo de cuentas' },
    { name: 'Karina Luna', pos: 'Analista de Compensaciones' },
    { name: 'Gabriel Soto', pos: 'Coordinador de Capacitación' },
  ];

  console.log('\nPruebas unitarias en casos clave:');
  for (const item of testSpecifics) {
    console.log(`[${evaluateSegment(item.pos)}] <- ${item.name} (${item.pos})`);
  }
}

testSimulation().catch(console.error);
