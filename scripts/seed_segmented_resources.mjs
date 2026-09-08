import { neon } from '@neondatabase/serverless';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/DATABASE_URL=(.*)/);
const dbUrl = match ? match[1].trim() : '';

const sql = neon(dbUrl);

async function run() {
  console.log('Connecting to Neon DB for resource segmentation...');

  // Check existing resources
  const existing = await sql`SELECT id, title, business_segment FROM commercial_resources;`;
  console.log(`Current resources: ${existing.length}`);

  // Seed / update tailored B2B & B2C resources
  const resourcesToUpsert = [
    // B2B Core Resources
    {
      title: 'Dossier Institucional TA720: Mirada Integral & CORE720',
      description: 'Presentación ejecutiva de TransformAcción 720: modelo integral que articula Personas, Procesos, Datos y Tecnología, y metodología CORE720.',
      category: 'PROPOSAL',
      business_segment: 'B2B',
      external_link: 'https://transformaccion720.com/dossier-institucional-ta720.pdf',
      created_by: 'Gabino',
    },
    {
      title: 'Propuesta Modelo: Consultoría en Eficiencia Operativa y Procesos',
      description: 'Estructura de diagnóstico ágil, rediseño de procesos críticos y acompañamiento en ejecución directa con KPIs de impacto.',
      category: 'PROPOSAL',
      business_segment: 'B2B',
      external_link: 'https://transformaccion720.com/propuesta-consultoria-procesos.pdf',
      created_by: 'Gabino',
    },
    {
      title: 'Catálogo de Soluciones Digitales & Automatización de Procesos',
      description: 'Soluciones a medida para reducción de tiempos manuales, tableros de control en tiempo real y automatizaciones con sentido de negocio.',
      category: 'BROCHURE',
      business_segment: 'B2B',
      external_link: 'https://transformaccion720.com/soluciones-digitales-ta720.pdf',
      created_by: 'Gabino',
    },
    {
      title: 'Brochure: Entrenamiento In-Company para Líderes y Equipos (RRHH)',
      description: 'Entrenamiento corporativo para áreas de Talento, Operaciones y Tecnología con aplicación real en el puesto de trabajo.',
      category: 'BROCHURE',
      business_segment: 'B2B',
      external_link: 'https://transformaccion720.com/entrenamiento-incompany-rrhh.pdf',
      created_by: 'Gabino',
    },
    // B2C Core Resources
    {
      title: 'Brochure Oficial: Programa de Gestión de Proyectos Ágiles 2026',
      description: 'Temario completo del programa abierto: Scrum, Kanban, entrega continua de valor y herramientas prácticas para profesionales.',
      category: 'BROCHURE',
      business_segment: 'B2C',
      external_link: 'https://transformaccion720.com/programa-gestion-agil-2026.pdf',
      created_by: 'Kiara',
    },
    {
      title: 'Guía Informativa: Certificación Scrum Master & IA Aplicada',
      description: 'Requisitos de certificación internacional, simuladores de examen, sesiones en vivo y calendario de la próxima convocatoria.',
      category: 'BROCHURE',
      business_segment: 'B2C',
      external_link: 'https://transformaccion720.com/certificacion-scrum-ia.pdf',
      created_by: 'Kiara',
    },
    {
      title: 'Video Demo: Metodología Práctica y Plataforma de Alumnos TA720',
      description: 'Recorrido en 3 minutos de cómo es la experiencia de aprendizaje y aplicación práctica para alumnos de nuestros programas.',
      category: 'VIDEO',
      business_segment: 'B2C',
      external_link: 'https://youtube.com/watch?v=ta720-demo-alumnos',
      created_by: 'Kiara',
    },
  ];

  for (const r of resourcesToUpsert) {
    const found = await sql`SELECT id FROM commercial_resources WHERE title = ${r.title} LIMIT 1;`;
    if (found.length === 0) {
      await sql`
        INSERT INTO commercial_resources (title, description, category, business_segment, external_link, created_by)
        VALUES (${r.title}, ${r.description}, ${r.category}, ${r.business_segment}, ${r.external_link}, ${r.created_by});
      `;
      console.log(`Inserted: ${r.title} [${r.business_segment}]`);
    } else {
      await sql`
        UPDATE commercial_resources
        SET business_segment = ${r.business_segment}, description = ${r.description}, category = ${r.category}
        WHERE id = ${found[0].id};
      `;
      console.log(`Updated segment: ${r.title} -> ${r.business_segment}`);
    }
  }

  // Also update existing resources without segment
  await sql`UPDATE commercial_resources SET business_segment = 'B2C' WHERE title LIKE '%Alumnos%' OR title LIKE '%Proyectos Ágiles 2026%';`;
  await sql`UPDATE commercial_resources SET business_segment = 'B2B' WHERE title LIKE '%In-Company%' OR title LIKE '%Empresas%';`;

  const counts = await sql`
    SELECT business_segment, COUNT(*) as count 
    FROM commercial_resources 
    GROUP BY business_segment;
  `;
  console.log('Resource counts by segment:');
  console.table(counts);

  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
