export interface MessageTemplate {
  id: string;
  name: string;
  category: 'Lanzamiento Ágil' | 'Consultoría' | 'Soluciones Digitales' | 'Entrenamiento' | 'General';
  targetAudience: 'Venta Directa / Profesional' | 'Líderes / Gerentes (Equipos)' | 'C-Level / Decisor';
  text: string;
}

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  // 1. Lanzamiento: Gestión de Proyectos Ágiles (Venta Directa)
  {
    id: 'agile-direct',
    name: 'Gestión Ágil: Venta Directa Profesional',
    category: 'Lanzamiento Ágil',
    targetAudience: 'Venta Directa / Profesional',
    text: 'Hola {nombre}, un gusto saludarte. Vi tu rol como {cargo} en {empresa} y quería comentarte que acabamos de abrir inscripciones para nuestro programa especializado en Gestión de Proyectos Ágiles, enfocado en entrega de valor y agilidad aplicada. ¿Te gustaría que te comparta el temario y los beneficios?',
  },
  // 2. Lanzamiento: Gestión de Proyectos Ágiles (Para Equipos / Líderes)
  {
    id: 'agile-teams',
    name: 'Gestión Ágil: In-Company para Equipos',
    category: 'Lanzamiento Ágil',
    targetAudience: 'Líderes / Gerentes (Equipos)',
    text: 'Hola {nombre}, espero que estés teniendo una excelente semana. Como {cargo} en {empresa}, sé el reto que representa alinear equipos y acelerar entregas. Estamos lanzando un entrenamiento in-company en Gestión Ágil diseñado para elevar la productividad y autonomía de tus equipos. ¿Te interesaría revisar una propuesta breve de 15 min?',
  },
  // 3. Consultoría en Transformación Empresarial
  {
    id: 'consulting-transform',
    name: 'Consultoría: Transformación y Eficiencia',
    category: 'Consultoría',
    targetAudience: 'C-Level / Decisor',
    text: 'Hola {nombre}, un placer conectar. Vengo siguiendo el crecimiento de {empresa}. Ayudamos a organizaciones a optimizar procesos críticos y estructurar modelos operativos escalables mediante consultoría de transformación empresarial. Quedo a tu disposición si te gustaría explorar sinergias.',
  },
  // 4. Soluciones Digitales y Automatización
  {
    id: 'digital-solutions',
    name: 'Soluciones Digitales y Automatización',
    category: 'Soluciones Digitales',
    targetAudience: 'Líderes / Gerentes (Equipos)',
    text: 'Hola {nombre}, ¿cómo estás? En {empresa}, ¿han explorado este año nuevas iniciativas en soluciones digitales o automatización de flujos? Desarrollamos tecnología a medida para reducir tiempos operativos. Con gusto podemos agendar un café virtual de 10 min.',
  },
  // 5. Entrenamiento Corporativo
  {
    id: 'training-corporate',
    name: 'Entrenamiento y Up-skilling Corporativo',
    category: 'Entrenamiento',
    targetAudience: 'Líderes / Gerentes (Equipos)',
    text: 'Hola {nombre}, un gusto saludarte. Diseñamos programas prácticos de entrenamiento corporativo para equipos en agilidad, innovación y liderazgo operativo. Si en {empresa} están buscando potenciar las capacidades de sus líderes, me encantaría compartirte nuestros casos de éxito.',
  },
];
