'use client';

import React, { useState } from 'react';
import { ContactStats } from '@/lib/types';
import { 
  Users, Mail, Building2, Calendar, Target, Award, Clock, ArrowUpRight, 
  Phone, CheckCircle2, TrendingUp, UserCheck, Shield, Globe, AlertCircle, 
  Sparkles, HelpCircle, Briefcase, GraduationCap, ChevronRight, Check
} from 'lucide-react';

interface ExecutiveDashboardProps {
  stats: ContactStats | null;
}

export default function ExecutiveDashboard({ stats }: ExecutiveDashboardProps) {
  const [segmentView, setSegmentView] = useState<'all' | 'B2B' | 'B2C'>('all');

  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-xs text-theme-txt2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00a870] animate-ping" />
          <span>Cargando métricas consolidadas...</span>
        </div>
      </div>
    );
  }

  const total = stats.total || 0;
  const b2bTotal = stats.b2bCount || 0;
  const b2cTotal = stats.b2cCount || 0;

  const withEmail = stats.withEmail || 0;
  const withPhone = stats.withPhone || 0;
  const companiesCount = stats.companiesCount || 0;

  // Global counts
  const inContact = stats.byStatus['En contacto'] || stats.byStatus['Contactado'] || 0;
  const opportunity = stats.byStatus['Oportunidad'] || 0;
  const client = stats.byStatus['Cliente'] || stats.byStatus['Calificado'] || 0;
  const paused = stats.byStatus['Seguimiento'] || stats.byStatus['En pausa'] || 0;
  const uncontacted = stats.byStatus['Sin contactar'] || (total - inContact - opportunity - client - paused);

  // B2B Segment specific status counts
  const b2bInContact = stats.b2bByStatus?.['En contacto'] || 0;
  const b2bOpportunity = stats.b2bByStatus?.['Oportunidad'] || 0;
  const b2bClient = stats.b2bByStatus?.['Cliente'] || 0;
  const b2bFollowUp = stats.b2bByStatus?.['Seguimiento'] || stats.b2bByStatus?.['En pausa'] || 0;
  const b2bUncontacted = stats.b2bByStatus?.['Sin contactar'] || (b2bTotal - b2bInContact - b2bOpportunity - b2bClient - b2bFollowUp);
  const b2bConversionRate = b2bTotal > 0 ? ((b2bClient / b2bTotal) * 100).toFixed(1) : '0';

  // B2C Segment specific status counts
  const b2cInContact = stats.b2cByStatus?.['En contacto'] || 0;
  const b2cOpportunity = stats.b2cByStatus?.['Oportunidad'] || 0;
  const b2cClient = stats.b2cByStatus?.['Cliente'] || 0;
  const b2cFollowUp = stats.b2cByStatus?.['Seguimiento'] || stats.b2cByStatus?.['En pausa'] || 0;
  const b2cUncontacted = stats.b2cByStatus?.['Sin contactar'] || (b2cTotal - b2cInContact - b2cOpportunity - b2cClient - b2cFollowUp);
  const b2cConversionRate = b2cTotal > 0 ? ((b2cClient / b2cTotal) * 100).toFixed(1) : '0';

  const emailPct = total > 0 ? Math.round((withEmail / total) * 100) : 0;
  const phonePct = total > 0 ? Math.round((withPhone / total) * 100) : 0;
  const conversionRate = total > 0 ? ((client / total) * 100).toFixed(1) : '0';

  // Active view numbers based on segmentView filter
  const activeTotal = segmentView === 'B2B' ? b2bTotal : segmentView === 'B2C' ? b2cTotal : total;
  const activeInContact = segmentView === 'B2B' ? b2bInContact : segmentView === 'B2C' ? b2cInContact : inContact;
  const activeOpportunity = segmentView === 'B2B' ? b2bOpportunity : segmentView === 'B2C' ? b2cOpportunity : opportunity;
  const activeClient = segmentView === 'B2B' ? b2bClient : segmentView === 'B2C' ? b2cClient : client;
  const activeFollowUp = segmentView === 'B2B' ? b2bFollowUp : segmentView === 'B2C' ? b2cFollowUp : paused;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-theme-bg">
      {/* Header with Segment Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-theme-sur p-5 rounded-2xl border border-theme-bor">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00a870] font-bold bg-[#00a870]/10 px-2 py-0.5 rounded">
              KPIs & PERFORMANCE EJECUTIVO
            </span>
            <span className="text-[10px] font-mono text-theme-txt3">Actualizado en tiempo real</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-theme-txt">
            Panel de Control Estratégico y Desempeño Comercial
          </h2>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Visibilidad compartida entre Corporativo B2B (Gabino) y Alumnos/Programas B2C (Kiara)
          </p>
        </div>

        {/* View Switcher: All vs B2B vs B2C */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-theme-sur2 border border-theme-bor p-1 rounded-xl">
            <button
              onClick={() => setSegmentView('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                segmentView === 'all'
                  ? 'bg-theme-sur text-theme-txt shadow-xs'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
            >
              <span>🌐 Consolidado</span>
            </button>
            <button
              onClick={() => setSegmentView('B2B')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                segmentView === 'B2B'
                  ? 'bg-[#2979ff] text-white shadow-xs'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
            >
              <span>🏢 B2B Gabino</span>
            </button>
            <button
              onClick={() => setSegmentView('B2C')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                segmentView === 'B2C'
                  ? 'bg-[#00a870] text-white shadow-xs'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
            >
              <span>👤 B2C Kiara</span>
            </button>
          </div>
        </div>
      </div>

      {/* MUTUAL SUPPORT & TEAM HEALTH ALERT BOARD */}
      <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#00a870]/15 text-[#00a870]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
                <span>Tablero de Apoyo Mutuo y Visibilidad de Equipo</span>
                <span className="text-[10px] font-mono text-[#00a870] font-semibold bg-[#00a870]/10 px-2 py-0.5 rounded">
                  Cooperación CEO & COO
                </span>
              </h3>
              <p className="text-xs text-theme-txt2">
                Detección proactiva de cuellos de botella para brindar soporte inmediato entre líneas de negocio
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Support Card: B2B Corporativo (Gabino) */}
          <div className="bg-theme-sur2/70 border border-theme-bor hover:border-[#2979ff]/40 rounded-xl p-4 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2979ff]/15 text-[#2979ff] font-bold text-xs flex items-center justify-center">
                  🏢
                </div>
                <div>
                  <h4 className="font-bold text-xs text-theme-txt flex items-center gap-1.5">
                    <span>Foco B2B Corporativo & RRHH</span>
                    <span className="text-[10px] text-theme-txt3 font-mono font-normal">(Gabino)</span>
                  </h4>
                  <span className="text-[10.5px] text-theme-txt3 font-mono">{b2bTotal.toLocaleString()} leads en base corporativa</span>
                </div>
              </div>

              <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-[#2979ff]/10 text-[#2979ff] border border-[#2979ff]/20">
                {b2bOpportunity} en propuesta
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10.5px] font-mono pt-1">
              <div className="p-2 rounded-lg bg-theme-sur border border-theme-bor">
                <span className="text-theme-txt3 block text-[9px] uppercase">En Diálogo</span>
                <span className="font-bold text-[#2979ff] text-sm">{b2bInContact}</span>
              </div>
              <div className="p-2 rounded-lg bg-theme-sur border border-theme-bor">
                <span className="text-theme-txt3 block text-[9px] uppercase">Oportunidad</span>
                <span className="font-bold text-[#ff6d3b] text-sm">{b2bOpportunity}</span>
              </div>
              <div className="p-2 rounded-lg bg-theme-sur border border-theme-bor">
                <span className="text-theme-txt3 block text-[9px] uppercase">Seguimiento</span>
                <span className="font-bold text-[#f59e0b] text-sm">{b2bFollowUp}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-theme-sur border border-theme-bor/80 text-xs flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-[#2979ff] shrink-0 mt-0.5" />
              <p className="text-[11px] text-theme-txt2">
                {b2bFollowUp > 5 ? (
                  <span>
                    <strong className="text-theme-txt">Alerta de Apoyo:</strong> Hay {b2bFollowUp} cuentas corporativas en seguimiento. Kiara puede apoyar con llamadas de confirmación o envío de temarios in-company.
                  </span>
                ) : (
                  <span>
                    <strong className="text-[#00a870]">Flujo Óptimo:</strong> Pipeline corporativo balanceado con {b2bOpportunity} propuestas activas de consultoría y entrenamiento.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Support Card: B2C Alumnos & Certificaciones (Kiara) */}
          <div className="bg-theme-sur2/70 border border-theme-bor hover:border-[#00a870]/40 rounded-xl p-4 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00a870]/15 text-[#00a870] font-bold text-xs flex items-center justify-center">
                  👤
                </div>
                <div>
                  <h4 className="font-bold text-xs text-theme-txt flex items-center gap-1.5">
                    <span>Foco B2C Alumnos & Certificaciones</span>
                    <span className="text-[10px] text-theme-txt3 font-mono font-normal">(Kiara)</span>
                  </h4>
                  <span className="text-[10.5px] text-theme-txt3 font-mono">{b2cTotal.toLocaleString()} profesionales en pipeline</span>
                </div>
              </div>

              <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-[#00a870]/10 text-[#00a870] border border-[#00a870]/20">
                {b2cOpportunity} por matricular
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10.5px] font-mono pt-1">
              <div className="p-2 rounded-lg bg-theme-sur border border-theme-bor">
                <span className="text-theme-txt3 block text-[9px] uppercase">En Diálogo</span>
                <span className="font-bold text-[#2979ff] text-sm">{b2cInContact}</span>
              </div>
              <div className="p-2 rounded-lg bg-theme-sur border border-theme-bor">
                <span className="text-theme-txt3 block text-[9px] uppercase">Pide Temario</span>
                <span className="font-bold text-[#ff6d3b] text-sm">{b2cOpportunity}</span>
              </div>
              <div className="p-2 rounded-lg bg-theme-sur border border-theme-bor">
                <span className="text-theme-txt3 block text-[9px] uppercase">Seguimiento</span>
                <span className="font-bold text-[#f59e0b] text-sm">{b2cFollowUp}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-theme-sur border border-theme-bor/80 text-xs flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-[#00a870] shrink-0 mt-0.5" />
              <p className="text-[11px] text-theme-txt2">
                {b2cFollowUp > 5 ? (
                  <span>
                    <strong className="text-theme-txt">Alerta de Apoyo:</strong> {b2cFollowUp} alumnos esperan seguimiento de beca/pronto pago. Gabino puede apoyar con mensajes directos en horas pico de prospección.
                  </span>
                ) : (
                  <span>
                    <strong className="text-[#00a870]">Cohorte al Día:</strong> Atención ágil de consultas y temarios de Agilidad con {b2cInContact} conversaciones activas.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Highlights Grid (Adaptive to Segment Filter) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-theme-sur border border-theme-bor p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-theme-txt2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">
              {segmentView === 'B2B' ? 'Cuentas B2B' : segmentView === 'B2C' ? 'Alumnos B2C' : 'Base Filtrada'}
            </span>
            <div className="p-2 rounded-lg bg-[#00a870]/15 text-[#00a870]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-theme-txt font-mono">{activeTotal.toLocaleString()}</div>
          <div className="text-[11px] text-theme-txt3 mt-1 font-mono">
            {segmentView === 'all' ? `${b2bTotal} B2B · ${b2cTotal} B2C` : `100% segmento ${segmentView}`}
          </div>
        </div>

        <div className="bg-theme-sur border border-theme-bor p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-theme-txt2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">En Conversación</span>
            <div className="p-2 rounded-lg bg-[#2979ff]/15 text-[#2979ff]">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-[#2979ff] font-mono">{activeInContact.toLocaleString()}</div>
          <div className="text-[11px] text-theme-txt3 mt-1 font-mono">Conversaciones calientes</div>
        </div>

        <div className="bg-theme-sur border border-theme-bor p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-theme-txt2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">
              {segmentView === 'B2C' ? 'Piden Temario / Beca' : 'Oportunidades'}
            </span>
            <div className="p-2 rounded-lg bg-[#ff6d3b]/15 text-[#ff6d3b]">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-[#ff6d3b] font-mono">{activeOpportunity.toLocaleString()}</div>
          <div className="text-[11px] text-theme-txt3 mt-1 font-mono">Etapa final antes de cierre</div>
        </div>

        <div className="bg-theme-sur border border-theme-bor p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-theme-txt2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">
              {segmentView === 'B2C' ? 'Alumnos Matriculados' : 'Clientes Ganados'}
            </span>
            <div className="p-2 rounded-lg bg-[#00a870]/15 text-[#00a870]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-[#00a870] font-mono">{activeClient.toLocaleString()}</div>
          <div className="text-[11px] text-theme-txt3 mt-1 font-mono">Cierres comerciales exitosos</div>
        </div>
      </div>

      {/* DUAL FUNNELS: B2B CORPORATIVO vs B2C ALUMNOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* FUNNEL B2B (CORPORATIVO / GABINO) */}
        {(segmentView === 'all' || segmentView === 'B2B') && (
          <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#2979ff] font-bold uppercase bg-[#2979ff]/10 px-2 py-0.5 rounded">
                  Línea B2B · Gabino (CEO)
                </span>
                <h3 className="font-bold text-sm text-theme-txt mt-1 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#2979ff]" />
                  <span>Embudo de Venta Corporativa & RRHH</span>
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-theme-txt2">
                {b2bTotal.toLocaleString()} leads
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-theme-txt2">1. Cuentas Corporativas Sin Contactar</span>
                  <span className="font-mono font-bold text-theme-txt">{b2bUncontacted.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-theme-sur2 rounded-full overflow-hidden">
                  <div className="h-full bg-[#7d8fa8]" style={{ width: `${b2bTotal > 0 ? (b2bUncontacted / b2bTotal) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-theme-txt2">2. En Diálogo / Diagnóstico Inicial</span>
                  <span className="font-mono font-bold text-[#2979ff]">{b2bInContact.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-theme-sur2 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2979ff]" style={{ width: `${b2bTotal > 0 ? (b2bInContact / b2bTotal) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-theme-txt2">3. Propuesta Económica Presentada</span>
                  <span className="font-mono font-bold text-[#ff6d3b]">{b2bOpportunity.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-theme-sur2 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff6d3b]" style={{ width: `${b2bTotal > 0 ? (b2bOpportunity / b2bTotal) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-theme-txt2">4. Contrato Corporativo Cerrado</span>
                  <span className="font-mono font-bold text-[#00a870]">{b2bClient.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-theme-sur2 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00a870]" style={{ width: `${b2bTotal > 0 ? (b2bClient / b2bTotal) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            <div className="p-3 bg-theme-sur2 rounded-xl border border-theme-bor text-[11px] text-theme-txt2 font-mono flex items-center justify-between">
              <span>🎯 Ciclo promedio B2B: ~15 a 30 días</span>
              <span className="font-bold text-[#2979ff]">{b2bConversionRate}% conversión</span>
            </div>
          </div>
        )}

        {/* FUNNEL B2C (ALUMNOS / KIARA) */}
        {(segmentView === 'all' || segmentView === 'B2C') && (
          <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#00a870] font-bold uppercase bg-[#00a870]/10 px-2 py-0.5 rounded">
                  Línea B2C · Kiara (COO)
                </span>
                <h3 className="font-bold text-sm text-theme-txt mt-1 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#00a870]" />
                  <span>Embudo de Alumnos & Certificaciones</span>
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-theme-txt2">
                {b2cTotal.toLocaleString()} leads
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-theme-txt2">1. Profesionales Por Contactar</span>
                  <span className="font-mono font-bold text-theme-txt">{b2cUncontacted.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-theme-sur2 rounded-full overflow-hidden">
                  <div className="h-full bg-[#7d8fa8]" style={{ width: `${b2cTotal > 0 ? (b2cUncontacted / b2cTotal) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-theme-txt2">2. En Conversación / Información</span>
                  <span className="font-mono font-bold text-[#2979ff]">{b2cInContact.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-theme-sur2 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2979ff]" style={{ width: `${b2cTotal > 0 ? (b2cInContact / b2cTotal) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-theme-txt2">3. Pide Temario / Beca / Fechas</span>
                  <span className="font-mono font-bold text-[#ff6d3b]">{b2cOpportunity.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-theme-sur2 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff6d3b]" style={{ width: `${b2cTotal > 0 ? (b2cOpportunity / b2cTotal) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-theme-txt2">4. Alumno Matriculado / Pagado</span>
                  <span className="font-mono font-bold text-[#00a870]">{b2cClient.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-theme-sur2 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00a870]" style={{ width: `${b2cTotal > 0 ? (b2cClient / b2cTotal) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            <div className="p-3 bg-theme-sur2 rounded-xl border border-theme-bor text-[11px] text-theme-txt2 font-mono flex items-center justify-between">
              <span>⚡ Ciclo ágil B2C: ~3 a 7 días</span>
              <span className="font-bold text-[#00a870]">{b2cConversionRate}% conversión</span>
            </div>
          </div>
        )}
      </div>

      {/* Breakdown by Commercial Team Member */}
      {stats.byMember && stats.byMember.length > 0 && (
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#00a870]" />
                <span>Rendimiento por Líder / Miembro del Equipo</span>
              </h3>
              <p className="text-xs text-theme-txt2 mt-0.5">
                Seguimiento de bases asignadas, enriquecimiento de datos y avance en el embudo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {stats.byMember.map((m) => {
              const mTotal = m.total || 0;
              const mEmailPct = mTotal > 0 ? Math.round((m.withEmail / mTotal) * 100) : 0;
              const mPhonePct = mTotal > 0 ? Math.round((m.withPhone / mTotal) * 100) : 0;
              const mSuccess = mTotal > 0 ? (((m.opportunity + m.client) / mTotal) * 100).toFixed(1) : '0';

              return (
                <div
                  key={m.member_name}
                  className="bg-theme-sur2/70 border border-theme-bor hover:border-theme-bor2 rounded-xl p-4 transition-all shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#00a870]/15 text-[#00a870] font-bold text-xs flex items-center justify-center">
                        {m.member_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-theme-txt">{m.member_name}</h4>
                        <span className="text-[10px] text-theme-txt3 font-mono">
                          {m.member_name.toLowerCase().includes('gabino') ? 'Líder B2B Corporativo' : m.member_name.toLowerCase().includes('kiara') ? 'Líder B2C Alumnos' : 'Comercial asignado'}
                        </span>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-extrabold text-[#00a870] bg-[#00a870]/10 px-2 py-0.5 rounded border border-[#00a870]/20">
                      {mTotal.toLocaleString()} leads
                    </span>
                  </div>

                  {/* Funnel mini-bar for this member */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-theme-txt2">
                      <span>Progreso del Funnel:</span>
                      <span className="text-[#ff6d3b] font-bold">{mSuccess}% avanzado</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-mono pt-1">
                      <div className="p-1 rounded bg-theme-sur border border-theme-bor">
                        <span className="text-theme-txt3 block text-[8.5px]">CONTACT</span>
                        <span className="font-bold text-[#2979ff]">{m.inContact}</span>
                      </div>
                      <div className="p-1 rounded bg-theme-sur border border-theme-bor">
                        <span className="text-theme-txt3 block text-[8.5px]">OPORT</span>
                        <span className="font-bold text-[#ff6d3b]">{m.opportunity}</span>
                      </div>
                      <div className="p-1 rounded bg-theme-sur border border-theme-bor">
                        <span className="text-theme-txt3 block text-[8.5px]">CIERRE</span>
                        <span className="font-bold text-[#00a870]">{m.client}</span>
                      </div>
                      <div className="p-1 rounded bg-theme-sur border border-theme-bor">
                        <span className="text-theme-txt3 block text-[8.5px]">SEGUI</span>
                        <span className="font-bold text-[#f59e0b]">{m.paused}</span>
                      </div>
                    </div>
                  </div>

                  {/* Enriched data pills */}
                  <div className="flex items-center justify-between text-[10.5px] font-mono text-theme-txt3 pt-2 border-t border-theme-bor">
                    <span>📧 {m.withEmail} emails ({mEmailPct}%)</span>
                    <span>📱 {m.withPhone} tels ({mPhonePct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid: Geographic Distribution (Countries) + Top Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Geographic Distribution: Top Countries */}
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-3.5">
          <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#f59e0b]" />
            <span>Distribución por País</span>
          </h3>

          <div className="space-y-2 pt-1">
            {stats.topCountries && stats.topCountries.length > 0 ? (
              stats.topCountries.map((c) => {
                const count = parseInt(c.count, 10);
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                return (
                  <div key={c.country} className="p-2 rounded-lg bg-theme-sur2 border border-theme-bor space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-theme-txt font-semibold flex items-center gap-1.5 truncate max-w-[200px]">
                        <span>🌎</span>
                        <span>{c.country}</span>
                      </span>
                      <span className="font-mono font-bold text-[#f59e0b]">
                        {count.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-theme-sur rounded-full overflow-hidden">
                      <div className="h-full bg-[#f59e0b]" style={{ width: `${Math.max(pct, 2)}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-theme-txt2">
                Sin datos de país registrados
              </div>
            )}
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-3.5">
          <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#2979ff]" />
            <span>Top Empresas Corporativas con Mayor Red</span>
          </h3>

          <div className="space-y-2 pt-1">
            {stats.topCompanies && stats.topCompanies.map((c) => (
              <div key={c.company} className="flex items-center justify-between p-2.5 rounded-lg bg-theme-sur2 border border-theme-bor text-xs">
                <span className="text-theme-txt font-medium truncate max-w-[240px]">{c.company}</span>
                <span className="font-mono font-bold text-[#00a870] px-2.5 py-0.5 bg-theme-sur rounded border border-theme-bor">
                  {c.count} leads
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
