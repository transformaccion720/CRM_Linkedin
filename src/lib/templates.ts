export type TemplateCategory =
  | 'Consultoría'
  | 'Soluciones Digitales'
  | 'Entrenamiento Corporativo'
  | 'Entrenamiento'
  | 'Certificaciones Abiertas'
  | 'Programa de Agilidad'
  | 'Upskilling Profesional'
  | 'Entrenamiento / Certificación'
  | 'Lanzamiento Ágil'
  | 'General';

export type TemplateTargetAudience =
  | 'Venta Directa / Profesional'
  | 'Líderes / Gerentes (Equipos)'
  | 'C-Level / Decisor'
  | 'RRHH / Desarrollo Organizacional'
  | 'Operaciones / Procesos';

export type TemplateValueAngle =
  | 'Institucional'
  | 'Negocio'
  | 'Ejecución'
  | 'Capacitación'
  | 'Cambio'
  | 'Agilidad'
  | 'Tecnología/IA';

export interface MessageTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  targetAudience: TemplateTargetAudience;
  businessSegment: 'B2B' | 'B2C' | 'ALL';
  valueAngle?: TemplateValueAngle;
  differentiator?: string;
  text: string;
  isActive?: boolean;
}

// TA720 5 Core Differentiators
export const TA720_DIFFERENTIATORS = [
  {
    id: 'mirada_integral',
    name: 'Mirada Integral',
    tagline: 'Personas + Procesos + Datos + Tecnología',
    snippet: 'En TransformAcción 720 trabajamos con una mirada integral articulando personas, procesos, datos y tecnología para que las mejoras sean sostenibles.',
  },
  {
    id: 'ejecucion_vs_teoria',
    name: 'Ejecución antes que teoría',
    tagline: 'Implementación real, no solo presentaciones',
    snippet: 'Priorizamos la ejecución antes que la teoría: no nos quedamos en diagnósticos teóricos, acompañamos a tus equipos en la implementación real.',
  },
  {
    id: 'core720',
    name: 'CORE720',
    tagline: 'Sistema propio de aceleración y gobierno',
    snippet: 'Aplicamos nuestro sistema propio CORE720, una metodología probada para estructurar la transformación y acelerar resultados de negocio.',
  },
  {
    id: 'experiencia_corporativa',
    name: 'Experiencia Corporativa',
    tagline: 'Visión multidisciplinaria y trayectoria real',
    snippet: 'Combinamos experiencia corporativa directa en primeras líneas con una visión multidisciplinaria para resolver cuellos de botella reales.',
  },
  {
    id: 'flexibilidad',
    name: 'Flexibilidad',
    tagline: 'Adaptados al contexto real de la empresa',
    snippet: 'Nos adaptamos con total flexibilidad al contexto y madurez de tu organización, sin recetas rígidas ni dogmas.',
  },
];

// Value Angles / Mensajes Clave según el cliente
export const TA720_VALUE_ANGLES: { id: TemplateValueAngle; label: string; focus: string; icon: string }[] = [
  { id: 'Institucional', label: 'Institucional', focus: 'Transformación y modernización integral', icon: '🏛️' },
  { id: 'Negocio', label: 'Negocio', focus: 'Rentabilidad, eficiencia y resultados medibles', icon: '📈' },
  { id: 'Ejecución', label: 'Ejecución', focus: 'Métodos, acompañamiento y reducción de fricciones', icon: '⚙️' },
  { id: 'Capacitación', label: 'Capacitación / RRHH', focus: 'Cierre de brechas de competencias y aplicación real', icon: '🎓' },
  { id: 'Cambio', label: 'Gestión del Cambio', focus: 'Adopción real de nuevas prácticas y liderazgo activo', icon: '👥' },
  { id: 'Agilidad', label: 'Agilidad Práctica', focus: 'Agilidad sin dogmas adaptada a la operación', icon: '🏃' },
  { id: 'Tecnología/IA', label: 'Tecnología & IA', focus: 'Automatización con sentido de negocio y valor', icon: '🤖' },
];

export const TEMPLATE_CATEGORIES: { id: TemplateCategory | 'ALL'; label: string; icon: string; segment: 'B2B' | 'B2C' | 'ALL' }[] = [
  { id: 'ALL', label: 'Todas las Plantillas', icon: '📋', segment: 'ALL' },
  // B2B Core Lines
  { id: 'Consultoría', label: 'Consultoría de Procesos & Negocio', icon: '💼', segment: 'B2B' },
  { id: 'Soluciones Digitales', label: 'Soluciones Digitales & IA', icon: '⚡', segment: 'B2B' },
  { id: 'Entrenamiento Corporativo', label: 'Entrenamiento In-Company (RRHH)', icon: '🏢', segment: 'B2B' },
  // B2C Core Lines
  { id: 'Programa de Agilidad', label: 'Programa de Agilidad Abierto', icon: '🚀', segment: 'B2C' },
  { id: 'Certificaciones Abiertas', label: 'Certificaciones Internacionales', icon: '🎓', segment: 'B2C' },
  { id: 'Upskilling Profesional', label: 'Upskilling Profesional', icon: '🎯', segment: 'B2C' },
];

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  // ==================== B2B: LÍNEA 1 - CONSULTORÍA ====================
  {
    id: 'b2b-consulting-core720',
    name: 'B2B Consultoría: Sistema CORE720 y Eficiencia',
    category: 'Consultoría',
    businessSegment: 'B2B',
    targetAudience: 'C-Level / Decisor',
    valueAngle: 'Negocio',
    differentiator: 'CORE720 como sistema propio',
    text: 'Hola {nombre}, un gusto saludarte. Como {cargo} en {empresa}, sé que el foco principal está en rentabilidad y optimización operativa. En TransformAcción 720 acompañamos a organizaciones a estructurar modelos operativos escalables mediante nuestro sistema propio CORE720, integrando procesos, datos y personas con impacto directo en resultados. ¿Tendrías 15 min esta semana para un café virtual y explorar posibles sinergias?',
  },
  {
    id: 'b2b-consulting-mirada-integral',
    name: 'B2B Consultoría: Mirada Integral Personas + Procesos',
    category: 'Consultoría',
    businessSegment: 'B2B',
    targetAudience: 'Operaciones / Procesos',
    valueAngle: 'Ejecución',
    differentiator: 'Mirada integral (personas + procesos + datos + tecnología)',
    text: 'Hola {nombre}, un placer conectar. Vengo siguiendo los retos de optimización en {empresa}. Ayudamos a líderes en tu rol a destrabar fricciones operativas con una mirada integral: alineamos personas, rediseñamos procesos y habilitamos datos para que la eficiencia sea real y no solo en papel. ¿Te gustaría que te comparta un caso práctico de cómo lo implementamos en tu sector?',
  },

  // ==================== B2B: LÍNEA 2 - SOLUCIONES DIGITALES ====================
  {
    id: 'b2b-digital-automation',
    name: 'B2B Soluciones: Automatización con Sentido de Negocio',
    category: 'Soluciones Digitales',
    businessSegment: 'B2B',
    targetAudience: 'Líderes / Gerentes (Equipos)',
    valueAngle: 'Tecnología/IA',
    differentiator: 'Ejecución antes que teoría',
    text: 'Hola {nombre}, ¿cómo estás? En {empresa}, ¿tienen este año iniciativas para automatizar flujos repetitivos o integrar IA en la operación? Desarrollamos soluciones digitales a medida con foco en ejecución: automatización práctica que reduce horas hombre y errores operativos desde el primer mes. Con gusto te muestro una demo rápida de 10 min.',
  },

  // ==================== B2B: LÍNEA 3 - ENTRENAMIENTO CORPORATIVO (RRHH) ====================
  {
    id: 'b2b-training-rrhh-gap',
    name: 'B2B Entrenamiento: RRHH / Cierre de Brechas de Talento',
    category: 'Entrenamiento Corporativo',
    businessSegment: 'B2B',
    targetAudience: 'RRHH / Desarrollo Organizacional',
    valueAngle: 'Capacitación',
    differentiator: 'Experiencia corporativa + visión multidisciplinaria',
    text: 'Hola {nombre}, un saludo cordial. Veo tu liderazgo en gestión de talento en {empresa}. Diseñamos entrenamientos corporativos in-company en agilidad, liderazgo operativo y nuevas capacidades digitales. Nuestro diferencial es la aplicación real en el puesto de trabajo: los colaboradores resuelven retos reales de la empresa durante el programa. ¿Te interesaría revisar un brochure con temarios adaptables a su plan anual?',
  },
  {
    id: 'b2b-cadence-followup-value',
    name: 'B2B Cadencia: Día 7 Seguimiento con Aporte de Valor',
    category: 'Consultoría',
    businessSegment: 'B2B',
    targetAudience: 'C-Level / Decisor',
    valueAngle: 'Ejecución',
    differentiator: 'Flexibilidad adaptada al contexto',
    text: 'Hola {nombre}, te comparto este breve insight sobre cuellos de botella comunes en la ejecución ágil y cómo resolverlos sin burocracia. Pensé en {empresa} y los retos que mencionaste. Si te parece bien, conversemos 10 min la próxima semana sobre cómo adaptaríamos este enfoque a sus prioridades actuales.',
  },

  // ==================== B2C: LÍNEA 1 - PROGRAMA DE AGILIDAD ====================
  {
    id: 'b2c-agile-direct-program',
    name: 'B2C Programa: Gestión de Proyectos Ágiles (Venta Directa)',
    category: 'Programa de Agilidad',
    businessSegment: 'B2C',
    targetAudience: 'Venta Directa / Profesional',
    valueAngle: 'Agilidad',
    differentiator: 'Ejecución antes que teoría',
    text: 'Hola {nombre}, un gusto saludarte. Vi tu trayectoria como {cargo} en {empresa} y quería comentarte que abrimos cupos para nuestro programa especializado en Gestión de Proyectos Ágiles. Está 100% enfocado en entrega de valor real, marcos ágiles aplicados y herramientas prácticas para liderar proyectos con agilidad. ¿Te gustaría que te envíe el temario y los beneficios especiales de esta edición?',
  },

  // ==================== B2C: LÍNEA 2 - CERTIFICACIONES ABIERTAS ====================
  {
    id: 'b2c-certification-scrum-ia',
    name: 'B2C Certificación: Scrum Master & IA Aplicada',
    category: 'Certificaciones Abiertas',
    businessSegment: 'B2C',
    targetAudience: 'Venta Directa / Profesional',
    valueAngle: 'Tecnología/IA',
    differentiator: 'Mirada integral (personas + procesos + datos + tecnología)',
    text: 'Hola {nombre}, ¿cómo estás? Te contacto porque muchos profesionales con tu perfil de {cargo} están buscando dar el salto al siguiente nivel con certificación internacional. Acabamos de abrir una convocatoria con beca por pronto pago para la certificación en Scrum Master e Inteligencia Artificial para gestión. ¿Te gustaría revisar las fechas y temario detallado?',
  },

  // ==================== B2C: LÍNEA 3 - UPSKILLING PROFESIONAL ====================
  {
    id: 'b2c-upskilling-leadership',
    name: 'B2C Upskilling: Liderazgo y Transformación Personal',
    category: 'Upskilling Profesional',
    businessSegment: 'B2C',
    targetAudience: 'Venta Directa / Profesional',
    valueAngle: 'Cambio',
    differentiator: 'Experiencia corporativa + visión multidisciplinaria',
    text: 'Hola {nombre}, un placer conectar. Como {cargo}, la capacidad de gestionar equipos ágiles y acelerar iniciativas digitales es clave en el mercado actual. En TransformAcción 720 brindamos mentoría y acompañamiento práctico para que consolides tu perfil de líder de proyectos. ¿Te interesaría agendar una breve llamada informativa de 10 minutos?',
  },
];
