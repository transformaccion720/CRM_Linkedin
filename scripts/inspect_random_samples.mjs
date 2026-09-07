import { neon } from '@neondatabase/serverless';

const dbUrl = 'postgresql://neondb_owner:npg_wZsrytc5iGo2@ep-wispy-bar-acik7rr2-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(dbUrl);

// Strict Negative Disqualifiers
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

export function evaluateSegment(position) {
  if (!position || !position.trim()) {
    return 'B2C';
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
    const isHRDecisionMaker = /\b(gerente|gerenta|director[ao]?|head|jefe|jefa|vp\b|vicepresiden|hrbp|business partner|l[ií]der|responsable|encargad[ao]|sub-?gerente)\b/i.test(pos);
    const isJuniorOrOperational = /\b(asistente|practicante|pasante|intern\b|auxiliar|analista|analyst|coordinador[ao]?|especialista|t[eé]cnic[ao]|generalista|reclutador[ao]?|recruiter)\b/i.test(pos);

    if (isHRDecisionMaker && !isJuniorOrOperational) {
      return 'B2B';
    }
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
    if (/\b(project manager|product manager|community manager|lead developer|tech lead|technical lead)\b/i.test(pos) && !C_LEVEL_TOP_EXEC_REGEX.test(pos)) {
      return 'B2C';
    }
    return 'B2B';
  }

  // Default: B2C
  return 'B2C';
}

async function inspectSamples() {
  const allContacts = await sql`SELECT id, first_name, last_name, position, company FROM contacts ORDER BY random() LIMIT 500;`;
  
  const b2bList = [];

  for (const c of allContacts) {
    const seg = evaluateSegment(c.position);
    if (seg === 'B2B' && b2bList.length < 25) {
      b2bList.push({ Nombre: `${c.first_name} ${c.last_name || ''}`.trim(), Cargo: c.position, Empresa: c.company });
    }
  }

  console.log('--- 25 PERFILES CLASIFICADOS COMO B2B (DECISORES REALES) ---');
  console.table(b2bList);
}

inspectSamples().catch(console.error);
