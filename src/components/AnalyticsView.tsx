'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ContactStats, ActivityLog, Contact, ContactStatus, BusinessSegment } from '@/lib/types';
import { 
  Users, Mail, Building2, Calendar, TrendingUp, History, RefreshCw, 
  User, Sparkles, Filter, Briefcase, Star, Search, Tag, ExternalLink, 
  ChevronRight, ArrowUpRight, Flame, BarChart3, Layers, Target, Award,
  CheckCircle2, Globe, FileText, Phone
} from 'lucide-react';

interface AnalyticsViewProps {
  stats: ContactStats | null;
  contacts?: Contact[];
  onSelectContact?: (contact: Contact) => void;
}

// 9 Categories for Executive Demand Radar
const DEMAND_CATEGORIES = [
  {
    id: 'liderazgo',
    title: 'Capacitación en Liderazgo & Habilidades Directivas',
    keywords: ['liderazgo', 'líder', 'lider', 'manager', 'jefe', 'gerencia', 'conducción', 'supervisores', 'coaching'],
    color: '#2979ff',
    badgeBg: 'bg-[#2979ff]/15',
    borderColor: 'border-[#2979ff]/30',
    icon: '👑',
  },
  {
    id: 'habilidades_blandas',
    title: 'Habilidades Blandas & Comunicación Asertiva',
    keywords: ['habilidades blandas', 'comunicación', 'comunicacion', 'asertiva', 'feedback', 'inteligencia emocional', 'empatía'],
    color: '#00a870',
    badgeBg: 'bg-[#00a870]/15',
    borderColor: 'border-[#00a870]/30',
    icon: '🗣️',
  },
  {
    id: 'clima_cultura',
    title: 'Clima Laboral, Cultura & Engagement',
    keywords: ['clima', 'cultura', 'clima laboral', 'engagement', 'bienestar', 'desarrollo organizacional', 'clima y cultura', 'cultura'],
    color: '#ff6d3b',
    badgeBg: 'bg-[#ff6d3b]/15',
    borderColor: 'border-[#ff6d3b]/30',
    icon: '🏢',
  },
  {
    id: 'ventas_negociacion',
    title: 'Ventas B2B, Prospección & Negociación',
    keywords: ['ventas', 'comercial', 'prospección', 'prospeccion', 'negociación', 'negociacion', 'b2b', 'cierre', 'pipeline'],
    color: '#f59e0b',
    badgeBg: 'bg-[#f59e0b]/15',
    borderColor: 'border-[#f59e0b]/30',
    icon: '💼',
  },
  {
    id: 'talento_rrhh',
    title: 'Gestión del Talento Humano & People',
    keywords: ['rrhh', 'recursos humanos', 'talento', 'gestión humana', 'gestion humana', 'people', 'selección', 'atracción'],
    color: '#a855f7',
    badgeBg: 'bg-[#a855f7]/15',
    borderColor: 'border-[#a855f7]/30',
    icon: '👥',
  },
  {
    id: 'agilidad_scrum',
    title: 'Agilidad, Scrum & Transformación Digital',
    keywords: ['agilidad', 'scrum', 'agile', 'proyectos', 'tecnología', 'ti', 'transformación digital', 'kanban'],
    color: '#00d2ff',
    badgeBg: 'bg-[#00d2ff]/15',
    borderColor: 'border-[#00d2ff]/30',
    icon: '⚡',
  },
  {
    id: 'talleres_medida',
    title: 'Talleres In-House a Medida & Facilitación',
    keywords: ['taller', 'talleres', 'in-house', 'a medida', 'programa corporativo', 'capacitador', 'facilitador', 'capacitacion', 'capacitación'],
    color: '#10b981',
    badgeBg: 'bg-[#10b981]/15',
    borderColor: 'border-[#10b981]/30',
    icon: '🛠️',
  },
  {
    id: 'empleabilidad_b2c',
    title: 'Crecimiento Profesional & Cursos Abiertos (B2C)',
    keywords: ['empleabilidad', 'cv', 'linkedin', 'certificación', 'certificacion', 'alumno', 'curso', 'empleo', 'especialización'],
    color: '#6366f1',
    badgeBg: 'bg-[#6366f1]/15',
    borderColor: 'border-[#6366f1]/30',
    icon: '🎓',
  },
];

// 10 B2B Stages
const B2B_STAGES_CONFIG = [
  { name: 'Prospecto identificado', color: '#7d8fa8', label: '1. Identificado' },
  { name: 'Contactado', color: '#2979ff', label: '2. Contactado' },
  { name: 'Conversación iniciada', color: '#00d2ff', label: '3. Conversación' },
  { name: 'Discovery / reunión', color: '#ffb300', label: '4. Discovery' },
  { name: 'Oportunidad calificada', color: '#ff6d3b', label: '5. Calificado' },
  { name: 'Propuesta enviada', color: '#a855f7', label: '6. Propuesta' },
  { name: 'Negociación', color: '#ec4899', label: '7. Negociación' },
  { name: 'Ganada', color: '#00e5a0', label: '8. Ganada' },
  { name: 'Perdida', color: '#ef4444', label: '9. Perdida' },
  { name: 'Pausada', color: '#94a3b8', label: '10. Pausada' },
];

// B2C Stages
const B2C_STAGES_CONFIG = [
  { name: 'Sin contactar', color: '#7d8fa8', label: 'Sin contactar' },
  { name: 'En contacto', color: '#2979ff', label: 'En contacto' },
  { name: 'Seguimiento', color: '#f59e0b', label: 'Seguimiento' },
  { name: 'Oportunidad', color: '#ff6d3b', label: 'Oportunidad' },
  { name: 'Cliente', color: '#00a870', label: 'Cliente' },
  { name: 'En pausa', color: '#94a3b8', label: 'En pausa' },
  { name: 'Descartado', color: '#ef4444', label: 'Descartado' },
];

export default function AnalyticsView({ stats, contacts = [], onSelectContact }: AnalyticsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'pipeline_dinamico' | 'radar_demanda' | 'auditoria' | 'graficas'>('pipeline_dinamico');
  const [pipelineSegment, setPipelineSegment] = useState<'B2B' | 'B2C' | 'all'>('B2B');
  const [pipelineSearch, setPipelineSearch] = useState('');
  const [selectedKeywordFilter, setSelectedKeywordFilter] = useState<string | null>(null);

  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>('all');

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const res = await fetch('/api/activities?limit=100');
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'auditoria') {
      fetchActivities();
    }
  }, [activeSubTab]);

  // Filter contacts by pipeline segment and search
  const filteredPipelineContacts = useMemo(() => {
    let list = contacts;
    if (pipelineSegment !== 'all') {
      list = list.filter((c) => {
        const seg = (c.business_segment || '').trim().toUpperCase();
        return seg === pipelineSegment;
      });
    }
    if (pipelineSearch.trim()) {
      const q = pipelineSearch.toLowerCase().trim();
      list = list.filter((c) => 
        (c.first_name || '').toLowerCase().includes(q) ||
        (c.last_name || '').toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q) ||
        (c.position || '').toLowerCase().includes(q) ||
        (c.service_needed || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [contacts, pipelineSegment, pipelineSearch]);

  // Group contacts by stage for the active pipeline
  const activePipelineStages = useMemo(() => {
    return pipelineSegment === 'B2B' 
      ? B2B_STAGES_CONFIG 
      : pipelineSegment === 'B2C' 
      ? B2C_STAGES_CONFIG 
      : [...B2B_STAGES_CONFIG, ...B2C_STAGES_CONFIG.filter(s => !B2B_STAGES_CONFIG.some(b => b.name === s.name))];
  }, [pipelineSegment]);

  const contactsByStage = useMemo(() => {
    const map: Record<string, Contact[]> = {};
    activePipelineStages.forEach((st) => {
      map[st.name] = [];
    });

    for (const c of filteredPipelineContacts) {
      let st = c.status || (pipelineSegment === 'B2B' ? 'Prospecto identificado' : 'Sin contactar');
      if (!map[st]) {
        map[st] = [];
      }
      map[st].push(c);
    }
    return map;
  }, [filteredPipelineContacts, activePipelineStages, pipelineSegment]);

  // Executive Demand & Keyword Intelligence Engine
  const demandAnalysis = useMemo(() => {
    const categoryCounts: Record<string, { category: typeof DEMAND_CATEGORIES[0]; count: number; contacts: Contact[] }> = {};
    DEMAND_CATEGORIES.forEach((cat) => {
      categoryCounts[cat.id] = { category: cat, count: 0, contacts: [] };
    });

    const singleKeywordsMap: Record<string, { word: string; count: number; contacts: Contact[] }> = {};

    const POPULAR_KEYWORDS = [
      'Liderazgo', 'Capacitación', 'Habilidades Blandas', 'Comunicación', 'Clima Laboral',
      'Ventas B2B', 'RRHH', 'Talento Humano', 'Scrum', 'Agilidad', 'Coaching', 'Cultura',
      'Taller', 'Feedback', 'Negociación', 'Inteligencia Emocional', 'Empleabilidad'
    ];

    POPULAR_KEYWORDS.forEach((kw) => {
      singleKeywordsMap[kw] = { word: kw, count: 0, contacts: [] };
    });

    let explicitNeedCount = 0;
    let totalDealPotential = 0;

    for (const c of contacts) {
      const textToAnalyze = [
        c.service_needed || '',
        c.notes || '',
        (c.tags || []).join(' '),
        c.position || '',
      ].join(' ').toLowerCase();

      if (c.service_needed && c.service_needed.trim()) {
        explicitNeedCount++;
      }
      if (c.deal_value && Number(c.deal_value) > 0) {
        totalDealPotential += Number(c.deal_value);
      }

      // Check demand categories
      DEMAND_CATEGORIES.forEach((cat) => {
        const matches = cat.keywords.some((kw) => textToAnalyze.includes(kw));
        if (matches) {
          categoryCounts[cat.id].count++;
          categoryCounts[cat.id].contacts.push(c);
        }
      });

      // Check popular single keywords
      POPULAR_KEYWORDS.forEach((kw) => {
        if (textToAnalyze.includes(kw.toLowerCase())) {
          singleKeywordsMap[kw].count++;
          singleKeywordsMap[kw].contacts.push(c);
        }
      });
    }

    const categoriesRanked = Object.values(categoryCounts)
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);

    const keywordsRanked = Object.values(singleKeywordsMap)
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);

    const topCategory = categoriesRanked[0]?.category.title || 'Capacitación en Liderazgo & Habilidades Directivas';

    return {
      categoriesRanked,
      keywordsRanked,
      explicitNeedCount,
      totalDealPotential,
      topCategory,
    };
  }, [contacts]);

  // Contacts filtered by selected keyword in Radar
  const contactsForSelectedKeyword = useMemo(() => {
    if (!selectedKeywordFilter) return [];
    const kwLower = selectedKeywordFilter.toLowerCase();
    return contacts.filter((c) => {
      const full = [
        c.service_needed || '',
        c.notes || '',
        (c.tags || []).join(' '),
        c.position || '',
      ].join(' ').toLowerCase();
      return full.includes(kwLower);
    });
  }, [contacts, selectedKeywordFilter]);

  if (!stats) return null;

  const total = stats.total || 0;
  const filteredActivities = activityFilter === 'all'
    ? activities
    : activities.filter((a) => a.action_type === activityFilter);

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'STATUS_CHANGE':
        return { label: 'Cambio de Estado', bg: 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30' };
      case 'PHONE_ADDED':
        return { label: 'Teléfono / WhatsApp', bg: 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30' };
      case 'EMAIL_ADDED':
        return { label: 'Email Actualizado', bg: 'bg-[#ff6d3b]/15 text-[#ff6d3b] border-[#ff6d3b]/30' };
      case 'NOTE_ADDED':
        return { label: 'Notas / Acuerdos', bg: 'bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/30' };
      default:
        return { label: 'Datos Generales', bg: 'bg-theme-sur2 text-theme-txt border-theme-bor' };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-theme-bg">
      {/* Sub-header navigation with 4 Core Analytics Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-theme-sur p-5 rounded-2xl border border-theme-bor shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00a870] font-bold bg-[#00a870]/10 px-2 py-0.5 rounded flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#00a870]" />
              <span>Inteligencia de Datos & Análisis de Mercado</span>
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-theme-txt">
            Analítica Avanzada de Prospección & Demanda
          </h2>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Pipeline dinámico en tiempo real, radar de servicios más demandados y trazabilidad de gestiones
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-theme-sur2 p-1 rounded-xl border border-theme-bor overflow-x-auto no-scrollbar">
          {/* Sub-tab 1: Pipeline Dinámico */}
          <button
            onClick={() => setActiveSubTab('pipeline_dinamico')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'pipeline_dinamico'
                ? 'bg-[#2979ff] text-white shadow-xs'
                : 'text-theme-txt2 hover:text-theme-txt'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pipeline Dinámico</span>
          </button>

          {/* Sub-tab 2: Radar de Demanda & Palabras Clave */}
          <button
            onClick={() => setActiveSubTab('radar_demanda')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'radar_demanda'
                ? 'bg-[#ff6d3b] text-white shadow-xs'
                : 'text-theme-txt2 hover:text-theme-txt'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Radar de Demanda & Servicios</span>
          </button>

          {/* Sub-tab 3: Auditoría */}
          <button
            onClick={() => setActiveSubTab('auditoria')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'auditoria'
                ? 'bg-theme-sur text-[#00a870] shadow-xs border border-theme-bor'
                : 'text-theme-txt2 hover:text-theme-txt'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Auditoría ({activities.length})</span>
          </button>

          {/* Sub-tab 4: Gráficas Temporales */}
          <button
            onClick={() => setActiveSubTab('graficas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'graficas'
                ? 'bg-theme-sur text-[#00a870] shadow-xs border border-theme-bor'
                : 'text-theme-txt2 hover:text-theme-txt'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Gráficas Temporales</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: PIPELINE DINÁMICO CARGADO CON PERSONAS Y ESTADOS
          ========================================================================= */}
      {activeSubTab === 'pipeline_dinamico' && (
        <div className="space-y-4">
          {/* Controls Bar: Segment Switcher & Fast Search */}
          <div className="bg-theme-sur border border-theme-bor rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-theme-txt font-mono uppercase tracking-wider">
                Ver Pipeline:
              </span>
              <div className="flex items-center bg-theme-sur2 border border-theme-bor p-1 rounded-xl">
                <button
                  onClick={() => setPipelineSegment('B2B')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pipelineSegment === 'B2B'
                      ? 'bg-[#2979ff] text-white shadow-xs'
                      : 'text-theme-txt2 hover:text-theme-txt'
                  }`}
                >
                  🏢 B2B Corporativo (10 Fases)
                </button>
                <button
                  onClick={() => setPipelineSegment('B2C')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pipelineSegment === 'B2C'
                      ? 'bg-[#00a870] text-white shadow-xs'
                      : 'text-theme-txt2 hover:text-theme-txt'
                  }`}
                >
                  👤 B2C Alumnos
                </button>
                <button
                  onClick={() => setPipelineSegment('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pipelineSegment === 'all'
                      ? 'bg-theme-sur text-theme-txt shadow-xs border border-theme-bor'
                      : 'text-theme-txt2 hover:text-theme-txt'
                  }`}
                >
                  🌐 Todo
                </button>
              </div>
            </div>

            {/* Pipeline Search */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-theme-txt3" />
              <input
                type="text"
                value={pipelineSearch}
                onChange={(e) => setPipelineSearch(e.target.value)}
                placeholder="Buscar por prospecto, empresa o cargo..."
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#2979ff] rounded-xl pl-9 pr-3 py-1.5 text-xs text-theme-txt outline-hidden"
              />
            </div>
          </div>

          {/* Horizontal Scrollable Pipeline Columns with loaded people */}
          <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1 no-scrollbar">
            {activePipelineStages.map((st) => {
              const stageContacts = contactsByStage[st.name] || [];
              const stageTotalVal = stageContacts.reduce((acc, c) => acc + (Number(c.deal_value) || 0), 0);

              return (
                <div
                  key={st.name}
                  className="w-[280px] shrink-0 bg-theme-sur border border-theme-bor rounded-2xl flex flex-col max-h-[75vh] shadow-xs"
                >
                  {/* Stage Column Header */}
                  <div className="p-3 border-b border-theme-bor bg-theme-sur2/50 rounded-t-2xl space-y-1 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                        <h4 className="font-bold text-xs text-theme-txt truncate max-w-[180px]">
                          {st.name}
                        </h4>
                      </div>
                      <span className="font-mono text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-theme-sur text-theme-txt border border-theme-bor">
                        {stageContacts.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-theme-txt3 pt-0.5">
                      <span>{Math.round((stageContacts.length / (filteredPipelineContacts.length || 1)) * 100)}% del total</span>
                      {stageTotalVal > 0 && (
                        <span className="font-bold text-[#00e5a0]">${stageTotalVal.toLocaleString()} USD</span>
                      )}
                    </div>
                  </div>

                  {/* Stage Contacts Cards List */}
                  <div className="p-2.5 space-y-2 overflow-y-auto flex-1">
                    {stageContacts.length === 0 ? (
                      <div className="py-8 text-center text-xs text-theme-txt3 font-mono">
                        Sin prospectos en esta etapa
                      </div>
                    ) : (
                      stageContacts.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => onSelectContact && onSelectContact(c)}
                          className="p-3 bg-theme-sur2/70 hover:bg-theme-sur2 border border-theme-bor hover:border-theme-bor2 rounded-xl transition-all cursor-pointer shadow-2xs space-y-2 group"
                        >
                          {/* Name & Priority */}
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-[#2979ff]/15 text-[#2979ff] font-bold text-xs flex items-center justify-center shrink-0">
                                {c.first_name.slice(0, 1)}
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-bold text-xs text-theme-txt truncate group-hover:text-[#2979ff] transition-colors">
                                  {c.first_name} {c.last_name || ''}
                                </h5>
                                <span className="text-[10px] text-theme-txt3 block truncate font-mono">
                                  {c.position || 'Sin cargo'}
                                </span>
                              </div>
                            </div>

                            {/* Stars Priority */}
                            <div className="flex items-center shrink-0">
                              {[1, 2, 3].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    (c.priority || 1) >= star
                                      ? 'text-[#f59e0b] fill-[#f59e0b]'
                                      : 'text-theme-txt3/30'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Company info */}
                          {c.company && (
                            <div className="flex items-center gap-1.5 text-[10.5px] text-theme-txt2 font-mono">
                              <Building2 className="w-3 h-3 text-theme-txt3 shrink-0" />
                              <span className="truncate">{c.company}</span>
                              {c.country && (
                                <span className="text-theme-txt3 text-[9px] ml-auto">({c.country})</span>
                              )}
                            </div>
                          )}

                          {/* Service Needed or Tag */}
                          {(c.service_needed || (c.tags && c.tags.length > 0)) && (
                            <div className="flex items-center gap-1 flex-wrap pt-0.5">
                              {c.service_needed ? (
                                <span className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-[#ff6d3b]/15 text-[#ff6d3b] border border-[#ff6d3b]/30 truncate max-w-full font-semibold">
                                  🎯 {c.service_needed}
                                </span>
                              ) : (
                                c.tags?.slice(0, 2).map((t) => (
                                  <span
                                    key={t}
                                    className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-theme-sur text-theme-txt3 border border-theme-bor truncate"
                                  >
                                    #{t}
                                  </span>
                                ))
                              )}
                            </div>
                          )}

                          {/* Footer: Assigned to & Value */}
                          <div className="flex items-center justify-between pt-1 border-t border-theme-bor/60 text-[10px] font-mono">
                            <span className="text-theme-txt3 flex items-center gap-1">
                              <User className="w-2.5 h-2.5" />
                              <span>{c.assigned_to || 'Gabino'}</span>
                            </span>

                            {Number(c.deal_value) > 0 ? (
                              <span className="font-bold text-[#00e5a0]">
                                ${Number(c.deal_value).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-theme-txt3 hover:text-[#2979ff] flex items-center gap-0.5">
                                Ver ficha <ChevronRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: RADAR DE DEMANDA & PALABRAS CLAVE (EXECUTIVE DEMAND INTELLIGENCE)
          ========================================================================= */}
      {activeSubTab === 'radar_demanda' && (
        <div className="space-y-6">
          {/* Executive KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-theme-sur border border-theme-bor p-4.5 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-theme-txt2">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Servicio Líder</span>
                <div className="p-2 rounded-xl bg-[#2979ff]/15 text-[#2979ff]">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div className="text-sm font-extrabold text-[#2979ff] truncate font-sans">
                {demandAnalysis.topCategory}
              </div>
              <p className="text-[11px] text-theme-txt3 font-mono">
                Mayor demanda detectada en prospección
              </p>
            </div>

            <div className="bg-theme-sur border border-theme-bor p-4.5 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-theme-txt2">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Demanda Explícita</span>
                <div className="p-2 rounded-xl bg-[#ff6d3b]/15 text-[#ff6d3b]">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-[#ff6d3b] font-mono">
                {demandAnalysis.explicitNeedCount}
              </div>
              <p className="text-[11px] text-theme-txt3 font-mono">
                Prospectos con necesidad o post vinculado
              </p>
            </div>

            <div className="bg-theme-sur border border-theme-bor p-4.5 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-theme-txt2">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Pipeline en Demanda</span>
                <div className="p-2 rounded-xl bg-[#00e5a0]/15 text-[#00e5a0]">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-[#00e5a0] font-mono">
                ${demandAnalysis.totalDealPotential.toLocaleString()} USD
              </div>
              <p className="text-[11px] text-theme-txt3 font-mono">
                Valor estimado acumulado en gestión
              </p>
            </div>

            <div className="bg-theme-sur border border-theme-bor p-4.5 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-theme-txt2">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Líneas de Servicio</span>
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-purple-400 font-mono">
                {demandAnalysis.categoriesRanked.length} categorías
              </div>
              <p className="text-[11px] text-theme-txt3 font-mono">
                Diversificación de oferta corporativa y B2C
              </p>
            </div>
          </div>

          {/* Ranking of Demanded Services & Keyword Cloud */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Services Ranking */}
            <div className="lg:col-span-2 bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-theme-bor pb-3">
                <div>
                  <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#00a870]" />
                    <span>Ranking de Servicios con Mayor Demanda en el Mercado</span>
                  </h3>
                  <p className="text-xs text-theme-txt2 mt-0.5">
                    Extracción inteligente de necesidades, cargos, posts de LinkedIn y notas comerciales
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                {demandAnalysis.categoriesRanked.map((item, idx) => {
                  const pct = Math.round((item.count / (contacts.length || 1)) * 100);

                  return (
                    <div
                      key={item.category.id}
                      onClick={() => setSelectedKeywordFilter(item.category.keywords[0])}
                      className="p-3.5 rounded-xl bg-theme-sur2/60 hover:bg-theme-sur2 border border-theme-bor hover:border-theme-bor2 transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{item.category.icon}</span>
                          <div>
                            <h4 className="font-bold text-xs text-theme-txt flex items-center gap-2">
                              <span>{idx + 1}. {item.category.title}</span>
                              <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded ${item.category.badgeBg} text-theme-txt font-semibold`}>
                                Nivel {idx === 0 ? 'Muy Alto' : idx < 3 ? 'Alto' : 'En Crecimiento'}
                              </span>
                            </h4>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <span className="font-bold text-xs text-theme-txt">{item.count} leads</span>
                          <span className="text-[10px] text-theme-txt3 block">{pct}% de la base</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 bg-theme-sur rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.max(pct * 2, 4)}%`,
                            backgroundColor: item.category.color,
                          }}
                        />
                      </div>

                      {/* Sample companies */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-theme-txt3 pt-0.5">
                        <span className="truncate max-w-[300px]">
                          Empresas: {item.contacts.slice(0, 3).map(c => c.company || c.first_name).join(', ')}
                        </span>
                        <span className="text-[#2979ff] font-semibold hover:underline flex items-center gap-0.5">
                          Filtrar prospectos →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Col: Interactive Keyword Cloud */}
            <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#ff6d3b]" />
                  <span>Nube de Palabras Clave</span>
                </h3>
                <p className="text-xs text-theme-txt2 mt-0.5">
                  Haz clic en cualquier palabra para ver los prospectos asociados
                </p>
              </div>

              {/* Tag Cloud Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {demandAnalysis.keywordsRanked.map((kw) => {
                  const isSelected = selectedKeywordFilter?.toLowerCase() === kw.word.toLowerCase();

                  return (
                    <button
                      key={kw.word}
                      onClick={() => {
                        setSelectedKeywordFilter(isSelected ? null : kw.word);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-[#ff6d3b] text-white border-[#ff6d3b] shadow-xs font-bold'
                          : 'bg-theme-sur2 text-theme-txt hover:bg-theme-sur3 border-theme-bor'
                      }`}
                    >
                      <span>#{kw.word}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-theme-sur text-theme-txt2'
                      }`}>
                        {kw.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Strategic Advice Card for Directors */}
              <div className="p-3.5 bg-[#00a870]/10 border border-[#00a870]/30 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#00a870]">
                  <Sparkles className="w-4 h-4" />
                  <span>Recomendación para Gabino y Kiara</span>
                </div>
                <p className="text-theme-txt2 text-[11px] leading-relaxed">
                  Las solicitudes de <b>Liderazgo</b> y <b>Habilidades Blandas</b> concentran el mayor interés corporativo. Se sugiere priorizar en los mensajes de LinkedIn los brochures de <i>Liderazgo TransformAcción</i> y <i>Talleres In-House</i> para acelerar conversiones.
                </p>
              </div>
            </div>
          </div>

          {/* Drill-down: Leads matching selected keyword */}
          {selectedKeywordFilter && (
            <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-theme-bor pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#ff6d3b]/15 text-[#ff6d3b]">
                    <Search className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-theme-txt">
                      Prospectos interesados en: <span className="text-[#ff6d3b]">#{selectedKeywordFilter}</span>
                    </h3>
                    <span className="text-xs text-theme-txt2">
                      {contactsForSelectedKeyword.length} prospectos coinciden con esta necesidad o criterio
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedKeywordFilter(null)}
                  className="text-xs font-mono text-theme-txt3 hover:text-theme-txt underline cursor-pointer"
                >
                  Limpiar filtro
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {contactsForSelectedKeyword.slice(0, 12).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectContact && onSelectContact(c)}
                    className="p-3.5 bg-theme-sur2/70 hover:bg-theme-sur2 border border-theme-bor hover:border-theme-bor2 rounded-xl transition-all cursor-pointer space-y-2 group shadow-2xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-theme-txt group-hover:text-[#2979ff] transition-colors">
                          {c.first_name} {c.last_name || ''}
                        </h4>
                        <span className="text-[10px] text-theme-txt3 font-mono block truncate max-w-[200px]">
                          {c.position || 'Sin cargo especificado'}
                        </span>
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        c.business_segment === 'B2B' ? 'bg-[#2979ff]/15 text-[#2979ff]' : 'bg-[#00a870]/15 text-[#00a870]'
                      }`}>
                        {c.business_segment || 'B2B'}
                      </span>
                    </div>

                    {c.company && (
                      <div className="flex items-center gap-1 text-[11px] text-theme-txt2 font-mono">
                        <Building2 className="w-3 h-3 text-theme-txt3" />
                        <span>{c.company}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-theme-bor/60">
                      <span className="text-theme-txt3">Estado: <b className="text-theme-txt">{c.status}</b></span>
                      <span className="text-[#2979ff] font-semibold flex items-center gap-0.5">
                        Abrir <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: AUDITORÍA & HISTORIAL DE CAMBIOS
          ========================================================================= */}
      {activeSubTab === 'auditoria' && (
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00a870]" />
              <h3 className="font-bold text-sm text-theme-txt">
                Registro Completo de Auditoría y Gestiones
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="bg-theme-sur2 border border-theme-bor rounded-lg px-2.5 py-1 text-xs text-theme-txt outline-hidden cursor-pointer"
              >
                <option value="all">Todas las acciones</option>
                <option value="STATUS_CHANGE">Cambios de Estado</option>
                <option value="PHONE_ADDED">Teléfonos</option>
                <option value="EMAIL_ADDED">Emails</option>
                <option value="NOTE_ADDED">Notas</option>
                <option value="DATA_UPDATE">Datos / Cargos</option>
              </select>

              <button
                onClick={fetchActivities}
                className="p-1.5 rounded-lg bg-theme-sur2 border border-theme-bor hover:text-[#00a870] transition-colors cursor-pointer text-xs flex items-center gap-1"
                title="Refrescar auditoría"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingActivities ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            </div>
          </div>

          {/* Audit Table */}
          <div className="overflow-x-auto rounded-xl border border-theme-bor">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-theme-sur2 border-b border-theme-bor font-mono uppercase text-[10px] text-theme-txt2 tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3">Contacto</th>
                  <th className="py-2.5 px-3">Tipo de Gestión</th>
                  <th className="py-2.5 px-3">Detalle del Cambio Realizado</th>
                  <th className="py-2.5 px-3">Realizado Por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-bor font-sans">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-theme-txt2">
                      No hay registros de auditoría que coincidan con el filtro
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((a) => {
                    const badge = getActionBadge(a.action_type);

                    return (
                      <tr key={a.id} className="hover:bg-theme-sur2/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-theme-txt2 whitespace-nowrap text-[11px]">
                          {new Date(a.created_at).toLocaleString('es-PE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-theme-txt">
                          {a.contact_name}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-theme-txt2 max-w-[320px] truncate">
                          {a.description}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-theme-txt whitespace-nowrap">
                          <span className="flex items-center gap-1 text-[11px]">
                            <User className="w-3 h-3 text-[#00a870]" />
                            <span>{a.performed_by || 'Gabino'}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: GRÁFICAS TEMPORALES & PUESTOS
          ========================================================================= */}
      {activeSubTab === 'graficas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Conexiones por año */}
          <div className="bg-theme-sur border border-theme-bor rounded-xl p-5 shadow-xs">
            <h3 className="font-semibold text-xs text-theme-txt mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00a870]" />
              <span>Conexiones por Año</span>
            </h3>

            <div className="space-y-2.5">
              {stats.byYear?.map((y) => {
                const count = parseInt(y.count, 10);
                const pct = total > 0 ? (count / total) * 100 : 0;

                return (
                  <div key={y.yr} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-theme-txt">{y.yr || 'Desconocido'}</span>
                      <span className="text-theme-txt2">{count.toLocaleString()} ({Math.round(pct)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-theme-sur2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00a870] rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 1)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Cargos */}
          <div className="bg-theme-sur border border-theme-bor rounded-xl p-5 shadow-xs">
            <h3 className="font-semibold text-xs text-theme-txt mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2979ff]" />
              <span>Top Cargos / Puestos Más Frecuentes</span>
            </h3>

            <div className="space-y-2.5">
              {stats.topPositions?.map((p) => {
                const count = parseInt(p.count, 10);
                const pct = total > 0 ? (count / total) * 100 : 0;

                return (
                  <div key={p.position} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-theme-txt truncate max-w-[220px] font-medium">{p.position}</span>
                      <span className="text-theme-txt2 font-mono shrink-0">{count} ({Math.round(pct)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-theme-sur2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2979ff] rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 1)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
