'use client';

import React, { useState } from 'react';
import { ContactStats } from '@/lib/types';
import { 
  Users, Mail, Building2, Calendar, Target, Award, Clock, ArrowUpRight, 
  Phone, CheckCircle2, TrendingUp, UserCheck, Shield, Globe, AlertCircle, 
  Sparkles, Briefcase, GraduationCap, DollarSign, ChevronRight, BarChart3,
  PieChart, Activity, Layers, ArrowRight
} from 'lucide-react';

interface ExecutiveDashboardProps {
  stats: ContactStats | null;
}

export default function ExecutiveDashboard({ stats }: ExecutiveDashboardProps) {
  const [segmentView, setSegmentView] = useState<'all' | 'B2B' | 'B2C'>('all');
  const [activeChartTab, setActiveChartTab] = useState<'pipeline' | 'funnel' | 'activity'>('pipeline');

  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-xs text-theme-txt2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00a870] animate-ping" />
          <span>Cargando analíticas y métricas ejecutivas...</span>
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

  // Pipeline stages for B2B (10 Core Stages)
  const b2bStages = [
    { name: 'Prospecto identificado', color: '#7d8fa8' },
    { name: 'Contactado', color: '#2979ff' },
    { name: 'Conversación iniciada', color: '#00d2ff' },
    { name: 'Discovery / reunión', color: '#ffb300' },
    { name: 'Oportunidad calificada', color: '#ff6d3b' },
    { name: 'Propuesta enviada', color: '#a855f7' },
    { name: 'Negociación', color: '#ec4899' },
    { name: 'Ganada', color: '#00e5a0' },
    { name: 'Perdida', color: '#ef4444' },
    { name: 'Pausada', color: '#94a3b8' },
  ];

  // Pipeline stages for B2C (Alumnos)
  const b2cStages = [
    { name: 'Sin contactar', color: '#7d8fa8' },
    { name: 'En contacto', color: '#2979ff' },
    { name: 'Seguimiento', color: '#f59e0b' },
    { name: 'Oportunidad', color: '#ff6d3b' },
    { name: 'Cliente', color: '#00a870' },
    { name: 'En pausa', color: '#94a3b8' },
  ];

  // Stage counts
  const b2bByStatus = stats.b2bByStatus || {};
  const b2cByStatus = stats.b2cByStatus || {};
  const byStatus = stats.byStatus || {};

  // Financial values
  const totalDealValue = stats.totalDealValue || 0;
  const b2bDealValue = stats.b2bDealValue || 0;
  const b2cDealValue = stats.b2cDealValue || 0;

  // Key Funnel Metrics
  const b2bInContact = b2bByStatus['Contactado'] || b2bByStatus['En contacto'] || b2bByStatus['Conversación iniciada'] || 0;
  const b2bOpportunity = (b2bByStatus['Discovery / reunión'] || 0) + (b2bByStatus['Oportunidad calificada'] || 0) + (b2bByStatus['Propuesta enviada'] || 0) + (b2bByStatus['Negociación'] || 0) + (b2bByStatus['Oportunidad'] || 0);
  const b2bClient = b2bByStatus['Ganada'] || b2bByStatus['Cliente'] || 0;
  const b2bFollowUp = b2bByStatus['Seguimiento'] || b2bByStatus['Pausada'] || b2bByStatus['En pausa'] || 0;
  const b2bUncontacted = b2bByStatus['Prospecto identificado'] || b2bByStatus['Sin contactar'] || Math.max(0, b2bTotal - b2bInContact - b2bOpportunity - b2bClient - b2bFollowUp);
  const b2bConversionRate = b2bTotal > 0 ? ((b2bClient / b2bTotal) * 100).toFixed(1) : '0';

  const b2cInContact = b2cByStatus['En contacto'] || 0;
  const b2cOpportunity = b2cByStatus['Oportunidad'] || 0;
  const b2cClient = b2cByStatus['Cliente'] || 0;
  const b2cFollowUp = b2cByStatus['Seguimiento'] || b2cByStatus['En pausa'] || 0;
  const b2cUncontacted = b2cByStatus['Sin contactar'] || Math.max(0, b2cTotal - b2cInContact - b2cOpportunity - b2cClient - b2cFollowUp);
  const b2cConversionRate = b2cTotal > 0 ? ((b2cClient / b2cTotal) * 100).toFixed(1) : '0';

  // Global counts
  const inContact = segmentView === 'B2B' ? b2bInContact : segmentView === 'B2C' ? b2cInContact : (b2bInContact + b2cInContact);
  const opportunity = segmentView === 'B2B' ? b2bOpportunity : segmentView === 'B2C' ? b2cOpportunity : (b2bOpportunity + b2cOpportunity);
  const client = segmentView === 'B2B' ? b2bClient : segmentView === 'B2C' ? b2cClient : (b2bClient + b2cClient);
  const activeTotal = segmentView === 'B2B' ? b2bTotal : segmentView === 'B2C' ? b2cTotal : total;
  const activeDealValue = segmentView === 'B2B' ? b2bDealValue : segmentView === 'B2C' ? b2cDealValue : totalDealValue;

  // Proportions for Donut Chart
  const b2bPct = total > 0 ? Math.round((b2bTotal / total) * 100) : 50;
  const b2cPct = 100 - b2bPct;
  const emailPct = total > 0 ? Math.round((withEmail / total) * 100) : 0;
  const phonePct = total > 0 ? Math.round((withPhone / total) * 100) : 0;

  // Circumference for Donut Chart (r = 40) => C = 2 * PI * 40 = 251.3
  const circumference = 251.3;
  const b2bStrokeDash = (b2bPct / 100) * circumference;
  const b2cStrokeDash = (b2cPct / 100) * circumference;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-theme-bg">
      {/* Header with Segment Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-theme-sur p-5 rounded-2xl border border-theme-bor shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00a870] font-bold bg-[#00a870]/10 px-2 py-0.5 rounded flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#00a870]" />
              <span>KPIs & Business Intelligence</span>
            </span>
            <span className="text-[10px] font-mono text-theme-txt3 bg-theme-sur2 px-2 py-0.5 rounded border border-theme-bor">
              Actualizado en tiempo real
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              segmentView === 'B2B'
                ? 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30'
                : segmentView === 'B2C'
                ? 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30'
                : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
            }`}>
              {segmentView === 'B2B' ? '🏢 Foco B2B Corporativo' : segmentView === 'B2C' ? '👤 Foco B2C Alumnos' : '🌐 Vista Consolidada'}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-theme-txt">
            Panel de Control Estratégico y Analítica Visual
          </h2>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Métricas diferenciadas para B2B Corporativo (Gabino), B2C Alumnos (Kiara) y vista consolidada integral
          </p>
        </div>

        {/* View Switcher: All vs B2B vs B2C */}
        <div className="flex items-center bg-theme-sur2 border border-theme-bor p-1 rounded-xl shadow-2xs">
          <button
            onClick={() => setSegmentView('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              segmentView === 'all'
                ? 'bg-theme-sur text-theme-txt shadow-xs border border-theme-bor'
                : 'text-theme-txt2 hover:text-theme-txt'
            }`}
          >
            <span>🌐</span>
            <span>Consolidado</span>
          </button>
          <button
            onClick={() => setSegmentView('B2B')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              segmentView === 'B2B'
                ? 'bg-[#2979ff] text-white shadow-xs font-extrabold'
                : 'text-theme-txt2 hover:text-theme-txt'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>B2B Gabino</span>
          </button>
          <button
            onClick={() => setSegmentView('B2C')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              segmentView === 'B2C'
                ? 'bg-[#00a870] text-white shadow-xs font-extrabold'
                : 'text-theme-txt2 hover:text-theme-txt'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>B2C Kiara</span>
          </button>
        </div>
      </div>

      {/* Global Executive Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Leads Card */}
        <div className="bg-theme-sur border border-theme-bor p-4.5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-theme-txt2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">
              {segmentView === 'B2B' ? 'Cuentas B2B' : segmentView === 'B2C' ? 'Alumnos B2C' : 'Base Comercial'}
            </span>
            <div className="p-2 rounded-xl bg-[#00a870]/15 text-[#00a870]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-theme-txt font-mono">
            {activeTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-theme-txt3 font-mono flex items-center justify-between">
            <span>{segmentView === 'all' ? `${b2bTotal} B2B · ${b2cTotal} B2C` : `100% segmento ${segmentView}`}</span>
            <span className="text-[#00a870] font-bold">Activo</span>
          </div>
        </div>

        {/* In Conversation Card */}
        <div className="bg-theme-sur border border-theme-bor p-4.5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-theme-txt2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">En Conversación</span>
            <div className="p-2 rounded-xl bg-[#2979ff]/15 text-[#2979ff]">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#2979ff] font-mono">
            {inContact.toLocaleString()}
          </div>
          <div className="text-[11px] text-theme-txt3 font-mono flex items-center justify-between">
            <span>Diálogos y discovery</span>
            <span className="text-[#2979ff] font-bold">
              {activeTotal > 0 ? Math.round((inContact / activeTotal) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Opportunities Card */}
        <div className="bg-theme-sur border border-theme-bor p-4.5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-theme-txt2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">
              {segmentView === 'B2C' ? 'Piden Temario / Beca' : 'Oportunidades'}
            </span>
            <div className="p-2 rounded-xl bg-[#ff6d3b]/15 text-[#ff6d3b]">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#ff6d3b] font-mono">
            {opportunity.toLocaleString()}
          </div>
          <div className="text-[11px] text-theme-txt3 font-mono flex items-center justify-between">
            <span>Propuestas y evaluación</span>
            <span className="text-[#ff6d3b] font-bold">
              {activeTotal > 0 ? Math.round((opportunity / activeTotal) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Revenue & Closures Card */}
        <div className="bg-theme-sur border border-theme-bor p-4.5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-theme-txt2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">
              {segmentView === 'B2C' ? 'Matriculados' : 'Pipeline Económico'}
            </span>
            <div className="p-2 rounded-xl bg-[#00e5a0]/15 text-[#00e5a0]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#00e5a0] font-mono">
            {segmentView === 'B2C' 
              ? `${client.toLocaleString()} alumnos` 
              : `$${activeDealValue.toLocaleString()} USD`}
          </div>
          <div className="text-[11px] text-theme-txt3 font-mono flex items-center justify-between">
            <span>
              {segmentView === 'B2C' 
                ? `${b2cConversionRate}% conversión` 
                : `${client} ganados • ${b2bConversionRate}% conv.`}
            </span>
            <span className="text-[#00e5a0] font-bold">Cierres</span>
          </div>
        </div>
      </div>

      {/* VISUAL CHARTS SECTION (Interactive Tabs: Pipeline Bar Chart, Conversion Funnel, Data Quality) */}
      <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-5">
        {/* Charts Sub-header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme-bor">
          <div>
            <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#2979ff]" />
              <span>
                {activeChartTab === 'pipeline' 
                  ? `Distribución de Etapas del Pipeline (${segmentView === 'B2B' ? 'B2B Corporativo - 10 Etapas' : segmentView === 'B2C' ? 'B2C Alumnos' : 'Consolidado Integral'})` 
                  : activeChartTab === 'funnel'
                  ? 'Embudo Escalonado de Conversión'
                  : 'Tendencia de Actividad & Contactabilidad'}
              </span>
            </h3>
            <p className="text-xs text-theme-txt2 mt-0.5">
              Análisis visual con barras proporcionales, tasas de caída y distribución de volumen
            </p>
          </div>

          <div className="flex items-center bg-theme-sur2 border border-theme-bor p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveChartTab('pipeline')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeChartTab === 'pipeline'
                  ? 'bg-theme-sur text-[#2979ff] shadow-xs border border-theme-bor'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
            >
              Etapas del Pipeline
            </button>
            <button
              onClick={() => setActiveChartTab('funnel')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeChartTab === 'funnel'
                  ? 'bg-theme-sur text-[#ff6d3b] shadow-xs border border-theme-bor'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
            >
              Embudo de Conversión
            </button>
            <button
              onClick={() => setActiveChartTab('activity')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeChartTab === 'activity'
                  ? 'bg-theme-sur text-[#00a870] shadow-xs border border-theme-bor'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
            >
              Segmentación & Calidad
            </button>
          </div>
        </div>

        {/* CHART TAB 1: Pipeline Stages Breakdown Bar Chart */}
        {activeChartTab === 'pipeline' && (
          <div className="space-y-4">
            {segmentView === 'B2B' ? (
              /* B2B 10 STAGES HORIZONTAL BAR CHART */
              <div className="space-y-3">
                {b2bStages.map((st) => {
                  const count = b2bByStatus[st.name] || 0;
                  const pct = b2bTotal > 0 ? ((count / b2bTotal) * 100).toFixed(1) : '0';

                  return (
                    <div key={st.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-theme-txt flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                          <span>{st.name}</span>
                        </span>
                        <span className="font-mono text-theme-txt2">
                          <b className="text-theme-txt font-bold">{count}</b> leads ({pct}%)
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-theme-sur2 rounded-full overflow-hidden border border-theme-bor/60">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.max(parseFloat(pct), count > 0 ? 3 : 0)}%`,
                            backgroundColor: st.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : segmentView === 'B2C' ? (
              /* B2C STAGES HORIZONTAL BAR CHART */
              <div className="space-y-3">
                {b2cStages.map((st) => {
                  const count = b2cByStatus[st.name] || 0;
                  const pct = b2cTotal > 0 ? ((count / b2cTotal) * 100).toFixed(1) : '0';

                  return (
                    <div key={st.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-theme-txt flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                          <span>{st.name}</span>
                        </span>
                        <span className="font-mono text-theme-txt2">
                          <b className="text-theme-txt font-bold">{count}</b> alumnos ({pct}%)
                        </span>
                      </div>

                      <div className="w-full h-2.5 bg-theme-sur2 rounded-full overflow-hidden border border-theme-bor/60">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.max(parseFloat(pct), count > 0 ? 3 : 0)}%`,
                            backgroundColor: st.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* CONSOLIDATED COMPARATIVE SIDE-BY-SIDE CHART */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left: B2B Highlights */}
                <div className="p-4 rounded-xl bg-theme-sur2/60 border border-[#2979ff]/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-theme-bor pb-2">
                    <span className="text-xs font-bold text-[#2979ff] flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      <span>🏢 Pipeline B2B Corporativo ({b2bTotal} leads)</span>
                    </span>
                    <span className="text-[10px] font-mono text-theme-txt3">{b2bConversionRate}% conv.</span>
                  </div>

                  <div className="space-y-2">
                    {b2bStages.slice(0, 7).map((st) => {
                      const count = b2bByStatus[st.name] || 0;
                      const pct = b2bTotal > 0 ? Math.round((count / b2bTotal) * 100) : 0;
                      return (
                        <div key={st.name} className="text-xs space-y-0.5">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-theme-txt2 truncate max-w-[180px]">{st.name}</span>
                            <span className="font-bold text-theme-txt">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-theme-sur rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%`, backgroundColor: st.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: B2C Highlights */}
                <div className="p-4 rounded-xl bg-theme-sur2/60 border border-[#00a870]/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-theme-bor pb-2">
                    <span className="text-xs font-bold text-[#00a870] flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>👤 Pipeline B2C Alumnos ({b2cTotal} leads)</span>
                    </span>
                    <span className="text-[10px] font-mono text-theme-txt3">{b2cConversionRate}% conv.</span>
                  </div>

                  <div className="space-y-2">
                    {b2cStages.map((st) => {
                      const count = b2cByStatus[st.name] || 0;
                      const pct = b2cTotal > 0 ? Math.round((count / b2cTotal) * 100) : 0;
                      return (
                        <div key={st.name} className="text-xs space-y-0.5">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-theme-txt2 truncate max-w-[180px]">{st.name}</span>
                            <span className="font-bold text-theme-txt">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-theme-sur rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%`, backgroundColor: st.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CHART TAB 2: Conversion Funnel Visual Chart */}
        {activeChartTab === 'funnel' && (
          <div className="space-y-4">
            {segmentView === 'all' ? (
              /* DUAL SIDE-BY-SIDE FUNNELS FOR CONSOLIDATED VIEW */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                {/* Left Funnel: B2B Corporativo */}
                <div className="p-5 rounded-2xl bg-theme-sur2/40 border border-[#2979ff]/30 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-theme-bor pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#2979ff]/15 text-[#2979ff]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-theme-txt flex items-center gap-1.5">
                          <span>Embudo B2B Corporativo</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#2979ff]/15 text-[#2979ff] border border-[#2979ff]/30">Gabino</span>
                        </h4>
                        <span className="text-[11px] text-theme-txt3 font-mono">Empresas, RRHH y Decisores</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#2979ff] block">{b2bConversionRate}% conv.</span>
                      <span className="text-[10px] font-mono text-theme-txt3">{b2bTotal} en base</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* B2B Tier 1 */}
                    <div className="p-3 bg-[#7d8fa8]/15 border border-[#7d8fa8]/30 rounded-xl flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#7d8fa8] text-white flex items-center justify-center font-mono font-bold text-[11px]">1</span>
                        <div>
                          <h5 className="font-bold text-[11.5px] text-theme-txt">Prospectos B2B Identificados</h5>
                          <span className="text-[10px] text-theme-txt3 font-mono">Directores, RRHH y CEOs</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-extrabold text-theme-txt">{b2bTotal}</span>
                        <span className="text-[9.5px] font-mono text-theme-txt3 block">100% base</span>
                      </div>
                    </div>

                    {/* B2B Tier 2 */}
                    <div className="p-3 bg-[#2979ff]/15 border border-[#2979ff]/30 rounded-xl flex items-center justify-between shadow-2xs mx-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#2979ff] text-white flex items-center justify-center font-mono font-bold text-[11px]">2</span>
                        <div>
                          <h5 className="font-bold text-[11.5px] text-[#2979ff]">Contactados / Conversación</h5>
                          <span className="text-[10px] text-theme-txt3 font-mono">Mensaje enviado o diálogo</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-extrabold text-[#2979ff]">{b2bInContact}</span>
                        <span className="text-[9.5px] font-mono text-theme-txt3 block">
                          {b2bTotal > 0 ? Math.round((b2bInContact / b2bTotal) * 100) : 0}% avance
                        </span>
                      </div>
                    </div>

                    {/* B2B Tier 3 */}
                    <div className="p-3 bg-[#ff6d3b]/15 border border-[#ff6d3b]/30 rounded-xl flex items-center justify-between shadow-2xs mx-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#ff6d3b] text-white flex items-center justify-center font-mono font-bold text-[11px]">3</span>
                        <div>
                          <h5 className="font-bold text-[11.5px] text-[#ff6d3b]">Discovery / Reunión & Oportunidad</h5>
                          <span className="text-[10px] text-theme-txt3 font-mono">Diagnóstico corporativo o propuesta</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-extrabold text-[#ff6d3b]">{b2bOpportunity}</span>
                        <span className="text-[9.5px] font-mono text-theme-txt3 block">
                          {b2bTotal > 0 ? Math.round((b2bOpportunity / b2bTotal) * 100) : 0}% calificado
                        </span>
                      </div>
                    </div>

                    {/* B2B Tier 4 */}
                    <div className="p-3 bg-[#00e5a0]/15 border border-[#00e5a0]/30 rounded-xl flex items-center justify-between shadow-2xs mx-6">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#00e5a0] text-[#00110b] flex items-center justify-center font-mono font-bold text-[11px]">4</span>
                        <div>
                          <h5 className="font-bold text-[11.5px] text-[#00e5a0]">Ganadas / Contratos Cerrados</h5>
                          <span className="text-[10px] text-theme-txt3 font-mono">Cierre de servicio o capacitación in-house</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-extrabold text-[#00e5a0]">{b2bClient}</span>
                        <span className="text-[9.5px] font-mono text-theme-txt3 block font-bold">
                          {b2bConversionRate}% éxito
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Funnel: B2C Alumnos */}
                <div className="p-5 rounded-2xl bg-theme-sur2/40 border border-[#00a870]/30 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-theme-bor pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#00a870]/15 text-[#00a870]">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-theme-txt flex items-center gap-1.5">
                          <span>Embudo B2C Alumnos</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#00a870]/15 text-[#00a870] border border-[#00a870]/30">Kiara</span>
                        </h4>
                        <span className="text-[11px] text-theme-txt3 font-mono">Profesionales & Cursos Abiertos</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#00a870] block">{b2cConversionRate}% conv.</span>
                      <span className="text-[10px] font-mono text-theme-txt3">{b2cTotal} en base</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* B2C Tier 1 */}
                    <div className="p-3 bg-[#7d8fa8]/15 border border-[#7d8fa8]/30 rounded-xl flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#7d8fa8] text-white flex items-center justify-center font-mono font-bold text-[11px]">1</span>
                        <div>
                          <h5 className="font-bold text-[11.5px] text-theme-txt">Prospectos B2C Identificados</h5>
                          <span className="text-[10px] text-theme-txt3 font-mono">Búsqueda de empleo y crecimiento</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-extrabold text-theme-txt">{b2cTotal}</span>
                        <span className="text-[9.5px] font-mono text-theme-txt3 block">100% base</span>
                      </div>
                    </div>

                    {/* B2C Tier 2 */}
                    <div className="p-3 bg-[#2979ff]/15 border border-[#2979ff]/30 rounded-xl flex items-center justify-between shadow-2xs mx-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#2979ff] text-white flex items-center justify-center font-mono font-bold text-[11px]">2</span>
                        <div>
                          <h5 className="font-bold text-[11.5px] text-[#2979ff]">En Contacto / Diálogo</h5>
                          <span className="text-[10px] text-theme-txt3 font-mono">Interacción inicial o mensaje enviado</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-extrabold text-[#2979ff]">{b2cInContact}</span>
                        <span className="text-[9.5px] font-mono text-theme-txt3 block">
                          {b2cTotal > 0 ? Math.round((b2cInContact / b2cTotal) * 100) : 0}% avance
                        </span>
                      </div>
                    </div>

                    {/* B2C Tier 3 */}
                    <div className="p-3 bg-[#ff6d3b]/15 border border-[#ff6d3b]/30 rounded-xl flex items-center justify-between shadow-2xs mx-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#ff6d3b] text-white flex items-center justify-center font-mono font-bold text-[11px]">3</span>
                        <div>
                          <h5 className="font-bold text-[11.5px] text-[#ff6d3b]">Oportunidad / Temario o Beca</h5>
                          <span className="text-[10px] text-theme-txt3 font-mono">Interés calificado en programa</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-extrabold text-[#ff6d3b]">{b2cOpportunity}</span>
                        <span className="text-[9.5px] font-mono text-theme-txt3 block">
                          {b2cTotal > 0 ? Math.round((b2cOpportunity / b2cTotal) * 100) : 0}% calificado
                        </span>
                      </div>
                    </div>

                    {/* B2C Tier 4 */}
                    <div className="p-3 bg-[#00e5a0]/15 border border-[#00e5a0]/30 rounded-xl flex items-center justify-between shadow-2xs mx-6">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#00e5a0] text-[#00110b] flex items-center justify-center font-mono font-bold text-[11px]">4</span>
                        <div>
                          <h5 className="font-bold text-[11.5px] text-[#00e5a0]">Matriculados / Alumnos</h5>
                          <span className="text-[10px] text-theme-txt3 font-mono">Inscripción o pago concretado</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-extrabold text-[#00e5a0]">{b2cClient}</span>
                        <span className="text-[9.5px] font-mono text-theme-txt3 block font-bold">
                          {b2cConversionRate}% éxito
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* SINGLE FOCUSED FUNNEL FOR SPECIFIC SEGMENT (B2B OR B2C) */
              <div className="max-w-2xl mx-auto space-y-3 pt-2">
                {/* Funnel Tier 1 */}
                <div className="p-3.5 bg-[#7d8fa8]/15 border border-[#7d8fa8]/30 rounded-xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#7d8fa8] text-white flex items-center justify-center font-mono font-bold text-xs">1</span>
                    <div>
                      <h4 className="font-bold text-xs text-theme-txt">Prospectos Identificados en Base</h4>
                      <span className="text-[10.5px] text-theme-txt3 font-mono">Punto de partida del ciclo comercial {segmentView}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-extrabold text-theme-txt">{activeTotal}</span>
                    <span className="text-[10px] font-mono text-theme-txt3 block">100% base</span>
                  </div>
                </div>

                {/* Funnel Tier 2 */}
                <div className="p-3.5 bg-[#2979ff]/15 border border-[#2979ff]/30 rounded-xl flex items-center justify-between shadow-2xs mx-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#2979ff] text-white flex items-center justify-center font-mono font-bold text-xs">2</span>
                    <div>
                      <h4 className="font-bold text-xs text-[#2979ff]">Contactados / En Diálogo Inicial</h4>
                      <span className="text-[10.5px] text-theme-txt3 font-mono">Mensaje de valor enviado y respuesta iniciada</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-extrabold text-[#2979ff]">{inContact}</span>
                    <span className="text-[10px] font-mono text-theme-txt3 block">
                      {activeTotal > 0 ? Math.round((inContact / activeTotal) * 100) : 0}% avance
                    </span>
                  </div>
                </div>

                {/* Funnel Tier 3 */}
                <div className="p-3.5 bg-[#ff6d3b]/15 border border-[#ff6d3b]/30 rounded-xl flex items-center justify-between shadow-2xs mx-6">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#ff6d3b] text-white flex items-center justify-center font-mono font-bold text-xs">3</span>
                    <div>
                      <h4 className="font-bold text-xs text-[#ff6d3b]">
                        {segmentView === 'B2B' ? 'Discovery / Reunión & Diagnóstico' : 'Oportunidad / Temario Solicitado'}
                      </h4>
                      <span className="text-[10.5px] text-theme-txt3 font-mono">Evaluación calificada de requerimientos</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-extrabold text-[#ff6d3b]">{opportunity}</span>
                    <span className="text-[10px] font-mono text-theme-txt3 block">
                      {activeTotal > 0 ? Math.round((opportunity / activeTotal) * 100) : 0}% calificado
                    </span>
                  </div>
                </div>

                {/* Funnel Tier 4 */}
                <div className="p-3.5 bg-[#00e5a0]/15 border border-[#00e5a0]/30 rounded-xl flex items-center justify-between shadow-2xs mx-9">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#00e5a0] text-[#00110b] flex items-center justify-center font-mono font-bold text-xs">4</span>
                    <div>
                      <h4 className="font-bold text-xs text-[#00e5a0]">
                        {segmentView === 'B2B' ? 'Ganadas / Cierres Corporativos' : 'Matriculados / Cierres de Formación'}
                      </h4>
                      <span className="text-[10.5px] text-theme-txt3 font-mono">Éxito comercial concretado</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-extrabold text-[#00e5a0]">{client}</span>
                    <span className="text-[10px] font-mono text-theme-txt3 block font-bold">
                      {activeTotal > 0 ? ((client / activeTotal) * 100).toFixed(1) : 0}% tasa de éxito
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CHART TAB 3: Data Quality & Segment Distribution Radial/Donut */}
        {activeChartTab === 'activity' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            {/* Donut Chart: B2B vs B2C Ratio */}
            <div className="p-4 rounded-xl bg-theme-sur2/60 border border-theme-bor space-y-4">
              <h4 className="font-bold text-xs text-theme-txt flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#2979ff]" />
                <span>Distribución por Línea de Negocio (B2B vs B2C)</span>
              </h4>

              <div className="flex items-center justify-center gap-6 py-2">
                {/* SVG Donut */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="14"
                      className="text-theme-bor/40 fill-none"
                    />
                    {/* B2B Arc */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#2979ff"
                      strokeWidth="14"
                      strokeDasharray={`${b2bStrokeDash} ${circumference}`}
                      strokeDashoffset="0"
                      className="fill-none transition-all duration-1000"
                    />
                    {/* B2C Arc */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#00a870"
                      strokeWidth="14"
                      strokeDasharray={`${b2cStrokeDash} ${circumference}`}
                      strokeDashoffset={`-${b2bStrokeDash}`}
                      className="fill-none transition-all duration-1000"
                    />
                  </svg>

                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="font-mono font-extrabold text-sm text-theme-txt">{total}</span>
                    <span className="text-[9px] font-mono text-theme-txt3 uppercase">Total</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#2979ff]" />
                    <span className="text-theme-txt font-semibold">B2B Corporativo:</span>
                    <span className="text-[#2979ff] font-bold">{b2bTotal} ({b2bPct}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#00a870]" />
                    <span className="text-theme-txt font-semibold">B2C Alumnos:</span>
                    <span className="text-[#00a870] font-bold">{b2cTotal} ({b2cPct}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Readiness: Channel Enriched Data */}
            <div className="p-4 rounded-xl bg-theme-sur2/60 border border-theme-bor space-y-4">
              <h4 className="font-bold text-xs text-theme-txt flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00a870]" />
                <span>Contactabilidad & Calidad de Información</span>
              </h4>

              <div className="space-y-3 pt-1 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-theme-txt2 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#00a870]" />
                      <span>Con Teléfono / WhatsApp:</span>
                    </span>
                    <span className="font-mono font-bold text-[#00a870]">{withPhone} ({phonePct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-theme-sur rounded-full overflow-hidden">
                    <div className="h-full bg-[#00a870]" style={{ width: `${phonePct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-theme-txt2 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#2979ff]" />
                      <span>Con Correo Electrónico:</span>
                    </span>
                    <span className="font-mono font-bold text-[#2979ff]">{withEmail} ({emailPct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-theme-sur rounded-full overflow-hidden">
                    <div className="h-full bg-[#2979ff]" style={{ width: `${emailPct}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-theme-txt2 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#f59e0b]" />
                      <span>Empresas Diferenciadas:</span>
                    </span>
                    <span className="font-mono font-bold text-[#f59e0b]">{companiesCount} registradas</span>
                  </div>
                  <div className="w-full h-2 bg-theme-sur rounded-full overflow-hidden">
                    <div className="h-full bg-[#f59e0b]" style={{ width: `${Math.min(100, Math.round((companiesCount / Math.max(total, 1)) * 100))}%` }} />
                  </div>
                </div>
              </div>
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

      {/* Grid: Geographic Distribution & Top Companies */}
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
