import { BusinessSegment } from './types';

/**
 * Reglas de clasificación automática según requerimientos del negocio:
 * 1. Perfiles de Recursos Humanos, Desarrollo Organizacional, Talento, Capacitación, People, RRHH -> SIEMPRE B2B.
 * 2. Perfiles directivos / decisores corporativos (Gerente, Director, C-Level, VP, Head, Fundador, Socio, Jefe) -> B2B.
 * 3. Perfiles individuales profesionales (Analista, Coordinador, Especialista, Ingeniero, Scrum Master, PM, etc.) -> B2C.
 * 4. Default -> B2B.
 */

const HR_TALENT_REGEX = /(recurso|humano|rrhh|hr\b|human resources|talento|talent|desarrollo organizacional|people\b|capacita|formaci|aprendizaje)/i;

const EXECUTIVE_REGEX = /(gerente|director|vp\b|vicepresiden|head\b|c-level|ceo\b|coo\b|cto\b|cfo\b|fundador|founder|socio|partner|jefe|chief|lead\b|subgerente|decano)/i;

const INDIVIDUAL_B2C_REGEX = /(analista|asistente|practicante|especialista|coordinador|ingeniero|engineer|developer|desarrollador|consultor|scrum master|project manager|product owner|agile coach|docente|profesor|estudiante|estudio|postgrado|junior|intern)/i;

export function detectBusinessSegment(position?: string | null): BusinessSegment {
  if (!position || !position.trim()) {
    return 'B2B'; // Por defecto B2B
  }

  const clean = position.trim();

  // Regla A prioritaria: RRHH / Talento / DO es SIEMPRE B2B
  if (HR_TALENT_REGEX.test(clean)) {
    return 'B2B';
  }

  // Regla B: Cargos directivos o decisores
  if (EXECUTIVE_REGEX.test(clean)) {
    return 'B2B';
  }

  // Regla C: Profesionales individuales buscando formación / certificación
  if (INDIVIDUAL_B2C_REGEX.test(clean)) {
    return 'B2C';
  }

  return 'B2B';
}
