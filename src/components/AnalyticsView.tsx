'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ContactStats, ActivityLog, Contact, ContactStatus, BusinessSegment } from '@/lib/types';
import { 
  Users, Mail, Building2, Calendar, TrendingUp, History, RefreshCw, 
  User, Sparkles, Filter, Briefcase, Star, Search, Tag, ExternalLink, 
  ChevronRight, ArrowUpRight, Flame, BarChart3, Layers, Target, Award,
  CheckCircle2, Globe, FileText, Phone, Check, Copy, AlertCircle, Clock, Zap,
  CheckCheck, ArrowRight, ShieldCheck, HelpCircle, Eye, RefreshCcw
} from 'lucide-react';

interface AnalyticsViewProps {
  stats: ContactStats | null;
  contacts?: Contact[];
  onSelectContact?: (contact: Contact) => void;
}

// B2B Corporate Demand Categories (Aligned with TransformAcción 720° Portfolio)
const B2B_DEMAND_CATEGORIES = [
  {
    id: 'liderazgo_directivo',
    title: 'Capacitación en Liderazgo & Equipos Directivos',
    keywords: ['liderazgo', 'líder', 'lider', 'manager', 'jefe', 'gerencia', 'conducción', 'supervisores', 'coaching directivo', 'management'],
    color: '#2979ff',
    badgeBg: 'bg-[#2979ff]/15',
    borderColor: 'border-[#2979ff]/30',
    icon: '👑',
    segment: 'B2B',
  },
  {
    id: 'gestion_cambio_transformacion',
    title: 'Gestión del Cambio & Transformación Organizacional',
    keywords: ['gestión del cambio', 'gestion del cambio', 'change management', 'transformación', 'transformacion', 'cambio organizacional', 'adopción del cambio', 'transformación cultural', 'transformacion cultural'],
    color: '#00d2ff',
    badgeBg: 'bg-[#00d2ff]/15',
    borderColor: 'border-[#00d2ff]/30',
    icon: '🔄',
    segment: 'B2B',
  },
  {
    id: 'cultura_desarrollo_organizacional',
    title: 'Cultura, Clima & Desarrollo Organizacional (D.O.)',
    keywords: ['cultura y talento', 'desarrollo organizacional', 'cultura organizacional', 'clima laboral', 'clima', 'cultura', 'engagement', 'bienestar', 'desarrollo del talento'],
    color: '#ff6d3b',
    badgeBg: 'bg-[#ff6d3b]/15',
    borderColor: 'border-[#ff6d3b]/30',
    icon: '🏢',
    segment: 'B2B',
  },
  {
    id: 'habilidades_blandas_corp',
    title: 'Habilidades Blandas In-House & Comunicación Asertiva',
    keywords: ['habilidades blandas', 'comunicación', 'comunicacion', 'asertiva', 'feedback', 'inteligencia emocional', 'empatía', 'soft skills', 'comunicación asertiva'],
    color: '#00a870',
    badgeBg: 'bg-[#00a870]/15',
    borderColor: 'border-[#00a870]/30',
    icon: '🗣️',
    segment: 'B2B',
  },
  {
    id: 'talento_rrhh_consulting',
    title: 'Gestión del Talento Humano & People Consulting',
    keywords: ['rrhh', 'recursos humanos', 'talento', 'gestión humana', 'gestion humana', 'people', 'selección', 'headhunting', 'gestión del talento'],
    color: '#a855f7',
    badgeBg: 'bg-[#a855f7]/15',
    borderColor: 'border-[#a855f7]/30',
    icon: '👥',
    segment: 'B2B',
  },
  {
    id: 'agilidad_scrum_corp',
    title: 'Agilidad Empresarial, Scrum & Procesos Ágiles',
    keywords: ['agilidad', 'scrum', 'agile', 'proyectos', 'tecnología', 'ti', 'transformación digital', 'kanban', 'agilista', 'agilidad empresarial'],
    color: '#38bdf8',
    badgeBg: 'bg-[#38bdf8]/15',
    borderColor: 'border-[#38bdf8]/30',
    icon: '⚡',
    segment: 'B2B',
  },
  {
    id: 'talleres_inhouse_medida',
    title: 'Talleres In-House a Medida & Facilitación Corporativa',
    keywords: ['taller', 'talleres', 'in-house', 'a medida', 'programa corporativo', 'capacitador', 'facilitador', 'capacitacion', 'capacitación', 'team building'],
    color: '#10b981',
    badgeBg: 'bg-[#10b981]/15',
    borderColor: 'border-[#10b981]/30',
    icon: '🛠️',
    segment: 'B2B',
  },
  {
    id: 'ventas_negociacion_b2b',
    title: 'Ventas Consultivas B2B, Prospección & Negociación',
    keywords: ['ventas', 'comercial', 'prospección', 'prospeccion', 'negociación', 'negociacion', 'b2b', 'cierre', 'kam', 'ejecutivo comercial'],
    color: '#f59e0b',
    badgeBg: 'bg-[#f59e0b]/15',
    borderColor: 'border-[#f59e0b]/30',
    icon: '💼',
    segment: 'B2B',
  },
];

// B2C Individual Demand Categories
const B2C_DEMAND_CATEGORIES = [
  {
    id: 'coaching_ejecutivo_b2c',
    title: 'Coaching Ejecutivo 1 a 1 & Mentoría de Carrera',
    keywords: ['coaching', 'coach', 'mentoría', 'mentoria', 'sesiones 1 a 1', 'transición de carrera', 'crecimiento personal'],
    color: '#2979ff',
    badgeBg: 'bg-[#2979ff]/15',
    borderColor: 'border-[#2979ff]/30',
    icon: '🎯',
    segment: 'B2C',
  },
  {
    id: 'empleabilidad_linkedin_b2c',
    title: 'Empleabilidad, Optimización de CV & Perfil LinkedIn',
    keywords: ['empleabilidad', 'cv', 'linkedin', 'perfil', 'búsqueda laboral', 'entrevistas', 'recolocación', 'outplacement', 'empleo'],
    color: '#00a870',
    badgeBg: 'bg-[#00a870]/15',
    borderColor: 'border-[#00a870]/30',
    icon: '💼',
    segment: 'B2C',
  },
  {
    id: 'cursos_certificaciones_b2c',
    title: 'Cursos Abiertos, Certificaciones & Talleres Prácticos',
    keywords: ['curso', 'cursos', 'certificación', 'certificacion', 'diplomado', 'especialización', 'alumno', 'estudiante', 'taller abierto'],
    color: '#a855f7',
    badgeBg: 'bg-[#a855f7]/15',
    borderColor: 'border-[#a855f7]/30',
    icon: '🎓',
    segment: 'B2C',
  },
  {
    id: 'oratoria_marca_personal_b2c',
    title: 'Oratoria, Marca Personal & Comunicación de Alto Impacto',
    keywords: ['oratoria', 'marca personal', 'presentaciones', 'comunicación efectiva', 'hablar en público', 'pitch'],
    color: '#ff6d3b',
    badgeBg: 'bg-[#ff6d3b]/15',
    borderColor: 'border-[#ff6d3b]/30',
    icon: '🗣️',
    segment: 'B2C',
  },
  {
    id: 'liderazgo_nuevos_mandos_b2c',
    title: 'Liderazgo para Nuevos Mandos & Primeras Jefaturas',
    keywords: ['jefe', 'coordinador', 'analista senior', 'primera jefatura', 'ascenso', 'liderazgo personal', 'supervisión'],
    color: '#f59e0b',
    badgeBg: 'bg-[#f59e0b]/15',
    borderColor: 'border-[#f59e0b]/30',
    icon: '🚀',
    segment: 'B2C',
  },
];

// Keywords lists aligned with TransformAcción 720°
const B2B_POPULAR_KEYWORDS = [
  'Gestión del Cambio',
  'Desarrollo Organizacional',
  'Cultura y Talento',
  'Liderazgo',
  'Habilidades Blandas',
  'Capacitación',
  'Clima Laboral',
  'Talento Humano',
  'Agilidad',
  'Comunicación',
  'Talleres In-House',
  'Ventas B2B',
  'RRHH',
  'Feedback',
  'Team Building'
];

const B2C_POPULAR_KEYWORDS = [
  'Empleabilidad',
  'CV',
  'LinkedIn',
  'Coaching',
  'Certificación',
  'Curso',
  'Oratoria',
  'Marca Personal',
  'Alumno',
  'Especialización',
  'Entrevistas',
  'Liderazgo'
];

// 10 B2B Stages Config
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

// B2C Stages Config
const B2C_STAGES_CONFIG = [
  { name: 'Sin contactar', color: '#7d8fa8', label: 'Sin contactar' },
  { name: 'En contacto', color: '#2979ff', label: 'En contacto' },
  { name: 'Seguimiento', color: '#f59e0b', label: 'Seguimiento' },
  { name: 'Oportunidad', color: '#ff6d3b', label: 'Oportunidad' },
  { name: 'Cliente', color: '#00a870', label: 'Cliente' },
  { name: 'En pausa', color: '#94a3b8', label: 'En pausa' },
  { name: 'Descartado', color: '#ef4444', label: 'Descartado' },
];

// Helper: Check if contact is in ACTIVE MANAGEMENT (not cold unmanaged mass)
export const isContactInActiveManagement = (c: Contact) => {
  // 1. Follow up scheduled
  if (c.follow_up_date && String(c.follow_up_date).trim()) return true;
  // 2. Commercial notes or agreements logged
  if (c.notes && c.notes.trim()) return true;
  // 3. Deal value assigned
  if (c.deal_value && Number(c.deal_value) > 0) return true;
  // 4. Signal lead or explicit service demand
  if (c.service_needed && c.service_needed.trim()) return true;
  if (c.post_url && c.post_url.trim()) return true;
  // 5. Star priority 2 or 3
  if (c.priority && c.priority >= 2) return true;
  // 6. Direct phone registered
  if (c.phone && c.phone.trim()) return true;
  // 7. Tags assigned
  if (c.tags && c.tags.length > 0) return true;
  // 8. Stage advanced beyond cold
  const st = (c.status || '').trim();
  if (st && st !== 'Sin contactar' && st !== 'Prospecto identificado') return true;
  return false;
};

export default function AnalyticsView({ stats, contacts = [], onSelectContact }: AnalyticsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'pipeline_dinamico' | 'radar_demanda' | 'auditoria' | 'graficas'>('pipeline_dinamico');
  
  // Pipeline Dinámico Filters
  const [pipelineSegment, setPipelineSegment] = useState<'B2B' | 'B2C' | 'all'>('B2B');
  const [pipelineFocusFilter, setPipelineFocusFilter] = useState<'active_management' | 'scheduled' | 'high_priority' | 'opportunity' | 'all_universe'>('active_management');
  const [pipelineAssigneeFilter, setPipelineAssigneeFilter] = useState<string>('all');
  const [pipelineSearch, setPipelineSearch] = useState('');

  // Radar de Demanda Filters
  const [radarSegment, setRadarSegment] = useState<'B2B' | 'B2C' | 'all'>('B2B');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [selectedKeywordFilter, setSelectedKeywordFilter] = useState<string | null>(null);
  const [radarSearchKeyword, setRadarSearchKeyword] = useState('');
  const [radarMatchesFilter, setRadarMatchesFilter] = useState<'all' | 'high_priority' | 'with_email' | 'with_phone' | 'active_management'>('all');
  const [radarSortBy, setRadarSortBy] = useState<'match_score' | 'priority' | 'name'>('match_score');
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  // Audit activities
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

  // Handle email copy with feedback
  const handleCopyEmail = (email: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  // =========================================================================
  // 1. PIPELINE DINÁMICO ESTRATÉGICO ENGINE
  // =========================================================================
  const filteredPipelineContacts = useMemo(() => {
    let list = contacts;

    // 1. Filter by Segment
    if (pipelineSegment !== 'all') {
      list = list.filter((c) => {
        const seg = (c.business_segment || '').trim().toUpperCase();
        return seg === pipelineSegment;
      });
    }

    // 2. Filter by Assignee
    if (pipelineAssigneeFilter !== 'all') {
      list = list.filter((c) => (c.assigned_to || 'Gabino') === pipelineAssigneeFilter);
    }

    // 3. Strategic Management Focus (DEFAULT: SOLO EN GESTIÓN ACTIVA)
    if (pipelineFocusFilter === 'active_management') {
      list = list.filter(isContactInActiveManagement);
    } else if (pipelineFocusFilter === 'scheduled') {
      list = list.filter((c) => !!(c.follow_up_date && c.follow_up_date.trim()));
    } else if (pipelineFocusFilter === 'high_priority') {
      list = list.filter((c) => (c.priority || 1) >= 2);
    } else if (pipelineFocusFilter === 'opportunity') {
      list = list.filter((c) => {
        const st = (c.status || '').toLowerCase();
        return st.includes('oportunidad') || st.includes('propuesta') || st.includes('negociación') || (Number(c.deal_value) > 0);
      });
    } // 'all_universe' displays the full base

    // 4. Real-time Search
    if (pipelineSearch.trim()) {
      const q = pipelineSearch.toLowerCase().trim();
      list = list.filter((c) => 
        (c.first_name || '').toLowerCase().includes(q) ||
        (c.last_name || '').toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q) ||
        (c.position || '').toLowerCase().includes(q) ||
        (c.service_needed || '').toLowerCase().includes(q) ||
        (c.notes || '').toLowerCase().includes(q) ||
        (c.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [contacts, pipelineSegment, pipelineFocusFilter, pipelineAssigneeFilter, pipelineSearch]);

  // Active Pipeline Stages Config
  const activePipelineStages = useMemo(() => {
    return pipelineSegment === 'B2B' 
      ? B2B_STAGES_CONFIG 
      : pipelineSegment === 'B2C' 
      ? B2C_STAGES_CONFIG 
      : [...B2B_STAGES_CONFIG, ...B2C_STAGES_CONFIG.filter(s => !B2B_STAGES_CONFIG.some(b => b.name === s.name))];
  }, [pipelineSegment]);

  // Group contacts by stage
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

  // Strategic Pipeline KPIs
  const pipelineMetrics = useMemo(() => {
    const totalActiveManaged = filteredPipelineContacts.length;
    const totalValueUSD = filteredPipelineContacts.reduce((acc, c) => acc + (Number(c.deal_value) || 0), 0);
    const withFollowUp = filteredPipelineContacts.filter(c => !!(c.follow_up_date && c.follow_up_date.trim())).length;
    
    // Advanced stages: beyond first contact
    const advancedStages = filteredPipelineContacts.filter(c => {
      const st = (c.status || '').toLowerCase();
      return (
        st.includes('conversación') || 
        st.includes('discovery') || 
        st.includes('oportunidad') || 
        st.includes('propuesta') || 
        st.includes('negociación') || 
        st.includes('ganada') ||
        st.includes('seguimiento') ||
        st.includes('cliente')
      );
    }).length;

    const maturationRate = totalActiveManaged > 0 
      ? Math.round((advancedStages / totalActiveManaged) * 100) 
      : 0;

    return {
      totalActiveManaged,
      totalValueUSD,
      withFollowUp,
      advancedStages,
      maturationRate,
    };
  }, [filteredPipelineContacts]);

  // =========================================================================
  // 2. RADAR DE DEMANDA & MATCHING ENGINE (B2B / B2C SEGREGATED)
  // =========================================================================
  const activeDemandCategories = useMemo(() => {
    if (radarSegment === 'B2B') return B2B_DEMAND_CATEGORIES;
    if (radarSegment === 'B2C') return B2C_DEMAND_CATEGORIES;
    return [...B2B_DEMAND_CATEGORIES, ...B2C_DEMAND_CATEGORIES];
  }, [radarSegment]);

  const activePopularKeywords = useMemo(() => {
    if (radarSegment === 'B2B') return B2B_POPULAR_KEYWORDS;
    if (radarSegment === 'B2C') return B2C_POPULAR_KEYWORDS;
    return Array.from(new Set([...B2B_POPULAR_KEYWORDS, ...B2C_POPULAR_KEYWORDS]));
  }, [radarSegment]);

  // Filter contacts by radar segment
  const radarContacts = useMemo(() => {
    if (radarSegment === 'all') return contacts;
    return contacts.filter(c => (c.business_segment || '').trim().toUpperCase() === radarSegment);
  }, [contacts, radarSegment]);

  // Demand intelligence calculation
  const demandAnalysis = useMemo(() => {
    const categoryCounts: Record<string, { category: typeof activeDemandCategories[0]; count: number; contacts: Contact[] }> = {};
    activeDemandCategories.forEach((cat) => {
      categoryCounts[cat.id] = { category: cat, count: 0, contacts: [] };
    });

    const singleKeywordsMap: Record<string, { word: string; count: number; contacts: Contact[] }> = {};
    activePopularKeywords.forEach((kw) => {
      singleKeywordsMap[kw] = { word: kw, count: 0, contacts: [] };
    });

    let explicitNeedCount = 0;
    let totalDealPotential = 0;

    for (const c of radarContacts) {
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
      activeDemandCategories.forEach((cat) => {
        const matches = cat.keywords.some((kw) => textToAnalyze.includes(kw.toLowerCase()));
        if (matches) {
          categoryCounts[cat.id].count++;
          categoryCounts[cat.id].contacts.push(c);
        }
      });

      // Check popular single keywords
      activePopularKeywords.forEach((kw) => {
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

    const topCategory = categoriesRanked[0]?.category.title || (radarSegment === 'B2C' ? 'Coaching Ejecutivo 1 a 1' : 'Capacitación en Liderazgo Directivo');

    return {
      categoriesRanked,
      keywordsRanked,
      explicitNeedCount,
      totalDealPotential,
      topCategory,
    };
  }, [radarContacts, activeDemandCategories, activePopularKeywords, radarSegment]);

  // Smart Matching & Scoring Engine: Supports Category Full Universe, Single Keyword, or Search String
  const bestOptionsForKeyword = useMemo(() => {
    let targetKeywords: string[] = [];
    let displayTitle = '';
    let isCategory = false;

    if (radarSearchKeyword.trim()) {
      targetKeywords = [radarSearchKeyword.trim().toLowerCase()];
      displayTitle = `Búsqueda: "${radarSearchKeyword.trim()}"`;
    } else if (selectedKeywordFilter) {
      targetKeywords = [selectedKeywordFilter.toLowerCase()];
      displayTitle = `#${selectedKeywordFilter}`;
    } else if (selectedCategoryFilter) {
      const cat = activeDemandCategories.find(c => c.id === selectedCategoryFilter);
      if (cat) {
        targetKeywords = cat.keywords.map(k => k.toLowerCase());
        displayTitle = cat.title;
        isCategory = true;
      }
    }

    if (targetKeywords.length === 0) {
      // Default to top ranked category so user always sees the top opportunities right away
      const topCat = demandAnalysis.categoriesRanked[0]?.category;
      if (topCat) {
        targetKeywords = topCat.keywords.map(k => k.toLowerCase());
        displayTitle = topCat.title;
        isCategory = true;
      } else {
        return { list: [], displayTitle: '', isCategory: false };
      }
    }

    const scoredList = radarContacts.map((c) => {
      let score = 0;
      const matchReasons: string[] = [];

      const servNeeded = (c.service_needed || '').toLowerCase();
      const pos = (c.position || '').toLowerCase();
      const notes = (c.notes || '').toLowerCase();
      const tags = (c.tags || []).map(t => t.toLowerCase());
      const fullText = [servNeeded, pos, notes, tags.join(' ')].join(' ');

      let isMatch = false;

      for (const kw of targetKeywords) {
        if (servNeeded.includes(kw)) {
          score += 45;
          matchReasons.push(`🎯 Necesidad: "${c.service_needed}"`);
          isMatch = true;
        }
        if (tags.some(t => t.includes(kw))) {
          score += 30;
          matchReasons.push(`🏷️ Tag: #${tags.find(t => t.includes(kw))}`);
          isMatch = true;
        }
        if (notes.includes(kw)) {
          score += 25;
          matchReasons.push(`📝 Nota comercial`);
          isMatch = true;
        }
        if (pos.includes(kw)) {
          score += 25;
          matchReasons.push(`👔 Cargo afín`);
          isMatch = true;
        }
        if (fullText.includes(kw)) {
          isMatch = true;
        }
      }

      if (!isMatch) return null;

      // Strategic Boosts
      if (c.priority && c.priority >= 2) {
        score += c.priority * 5;
      }
      if (c.email && c.email.trim()) {
        score += 10;
      }
      if (c.phone && c.phone.trim()) {
        score += 10;
      }
      if (isContactInActiveManagement(c)) {
        score += 15;
      }

      // Fallback base score for relevant match
      if (score === 0) {
        score = 25;
        matchReasons.push('🔍 Coincidencia de perfil');
      }

      const uniqueReasons = Array.from(new Set(matchReasons));

      return {
        contact: c,
        score: Math.min(score, 100),
        matchReasons: uniqueReasons,
        isMatch: true,
      };
    }).filter((item): item is { contact: Contact; score: number; matchReasons: string[]; isMatch: boolean } => item !== null);

    // Apply sub-filters
    let filtered = scoredList;
    if (radarMatchesFilter === 'high_priority') {
      filtered = filtered.filter(item => (item.contact.priority || 1) >= 2);
    } else if (radarMatchesFilter === 'with_email') {
      filtered = filtered.filter(item => !!(item.contact.email && item.contact.email.trim()));
    } else if (radarMatchesFilter === 'with_phone') {
      filtered = filtered.filter(item => !!(item.contact.phone && item.contact.phone.trim()));
    } else if (radarMatchesFilter === 'active_management') {
      filtered = filtered.filter(item => isContactInActiveManagement(item.contact));
    }

    // Sort
    if (radarSortBy === 'match_score') {
      filtered.sort((a, b) => b.score - a.score);
    } else if (radarSortBy === 'priority') {
      filtered.sort((a, b) => (b.contact.priority || 1) - (a.contact.priority || 1));
    } else if (radarSortBy === 'name') {
      filtered.sort((a, b) => a.contact.first_name.localeCompare(b.contact.first_name));
    }

    return {
      list: filtered,
      displayTitle,
      isCategory,
    };
  }, [radarContacts, radarSearchKeyword, selectedKeywordFilter, selectedCategoryFilter, activeDemandCategories, demandAnalysis.categoriesRanked, radarMatchesFilter, radarSortBy]);

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
      {/* Top Header Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-theme-sur p-5 rounded-2xl border border-theme-bor shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00a870] font-bold bg-[#00a870]/10 px-2 py-0.5 rounded flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#00a870]" />
              <span>Inteligencia de Datos & Gestión Estratégica</span>
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-theme-txt">
            Analítica Avanzada de Prospección & Demanda
          </h2>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Monitoreo en tiempo real de gestiones activas, avance por fases y radar inteligente de demanda
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
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold">
              {pipelineMetrics.totalActiveManaged}
            </span>
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
                ? 'bg-theme-sur text-[#00a870] shadow-xs border border-theme-bor font-bold'
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
                ? 'bg-theme-sur text-[#00a870] shadow-xs border border-theme-bor font-bold'
                : 'text-theme-txt2 hover:text-theme-txt'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Gráficas Temporales</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: PIPELINE DINÁMICO ESTRATÉGICO (SOLO GESTIONES EN MOVIMIENTO)
          ========================================================================= */}
      {activeSubTab === 'pipeline_dinamico' && (
        <div className="space-y-4">
          {/* Executive Strategic Pipeline KPI Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-theme-sur border border-theme-bor p-3.5 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-theme-txt3 text-[11px] font-mono">
                <span>GESTIONES ACTIVAS</span>
                <Zap className="w-3.5 h-3.5 text-[#2979ff]" />
              </div>
              <div className="text-xl font-extrabold text-[#2979ff] font-mono">
                {pipelineMetrics.totalActiveManaged} <span className="text-xs font-sans text-theme-txt2">leads</span>
              </div>
              <p className="text-[10px] text-theme-txt3 font-mono truncate">
                {pipelineFocusFilter === 'active_management' ? 'Excluye base fría sin tocar' : 'Filtro personalizado'}
              </p>
            </div>

            <div className="bg-theme-sur border border-theme-bor p-3.5 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-theme-txt3 text-[11px] font-mono">
                <span>EN MADURACIÓN</span>
                <TrendingUp className="w-3.5 h-3.5 text-[#00a870]" />
              </div>
              <div className="text-xl font-extrabold text-[#00a870] font-mono">
                {pipelineMetrics.advancedStages} <span className="text-xs font-sans text-theme-txt2">leads</span>
              </div>
              <p className="text-[10px] text-theme-txt3 font-mono truncate">
                Superaron contacto inicial
              </p>
            </div>

            <div className="bg-theme-sur border border-theme-bor p-3.5 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-theme-txt3 text-[11px] font-mono">
                <span>CON SEGUIMIENTO</span>
                <Clock className="w-3.5 h-3.5 text-[#ffb300]" />
              </div>
              <div className="text-xl font-extrabold text-[#ffb300] font-mono">
                {pipelineMetrics.withFollowUp} <span className="text-xs font-sans text-theme-txt2">agendados</span>
              </div>
              <p className="text-[10px] text-theme-txt3 font-mono truncate">
                Fecha próxima programada
              </p>
            </div>

            <div className="bg-theme-sur border border-theme-bor p-3.5 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-theme-txt3 text-[11px] font-mono">
                <span>VALOR EN JUEGO</span>
                <Award className="w-3.5 h-3.5 text-[#00e5a0]" />
              </div>
              <div className="text-xl font-extrabold text-[#00e5a0] font-mono">
                ${pipelineMetrics.totalValueUSD.toLocaleString()} <span className="text-xs font-sans text-theme-txt2">USD</span>
              </div>
              <p className="text-[10px] text-theme-txt3 font-mono truncate">
                Oportunidades con monto
              </p>
            </div>

            <div className="col-span-2 lg:col-span-1 bg-theme-sur border border-theme-bor p-3.5 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-theme-txt3 text-[11px] font-mono">
                <span>RATIO DE AVANCE</span>
                <Target className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-xl font-extrabold text-purple-400 font-mono">
                {pipelineMetrics.maturationRate}%
              </div>
              <p className="text-[10px] text-theme-txt3 font-mono truncate">
                Conversión en cadencia
              </p>
            </div>
          </div>

          {/* Strategic Flow Bar (Visual Stepper) */}
          <div className="bg-theme-sur border border-theme-bor rounded-2xl p-3.5 shadow-xs overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-between min-w-[700px] gap-2">
              {activePipelineStages.slice(0, 6).map((st, i) => {
                const count = (contactsByStage[st.name] || []).length;
                const isFirst = i === 0;

                return (
                  <React.Fragment key={st.name}>
                    {!isFirst && (
                      <ArrowRight className="w-3.5 h-3.5 text-theme-txt3/40 shrink-0" />
                    )}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-theme-sur2/70 border border-theme-bor/60 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                      <span className="text-xs font-semibold text-theme-txt truncate max-w-[130px]">
                        {st.label || st.name}
                      </span>
                      <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-theme-sur text-theme-txt border border-theme-bor">
                        {count}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Controls Bar: Segment Switcher, Focus Filter & Assignee */}
          <div className="bg-theme-sur border border-theme-bor rounded-2xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 shadow-xs">
            {/* Left: Segment + Strategic Filter */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Segment Toggle */}
              <div className="flex items-center bg-theme-sur2 border border-theme-bor p-1 rounded-xl">
                <button
                  onClick={() => setPipelineSegment('B2B')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pipelineSegment === 'B2B'
                      ? 'bg-[#2979ff] text-white shadow-xs'
                      : 'text-theme-txt2 hover:text-theme-txt'
                  }`}
                >
                  🏢 B2B Corporativo (10 Fases)
                </button>
                <button
                  onClick={() => setPipelineSegment('B2C')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pipelineSegment === 'B2C'
                      ? 'bg-[#00a870] text-white shadow-xs'
                      : 'text-theme-txt2 hover:text-theme-txt'
                  }`}
                >
                  👤 B2C Alumnos
                </button>
                <button
                  onClick={() => setPipelineSegment('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pipelineSegment === 'all'
                      ? 'bg-theme-sur text-theme-txt shadow-xs border border-theme-bor'
                      : 'text-theme-txt2 hover:text-theme-txt'
                  }`}
                >
                  🌐 Consolidado
                </button>
              </div>

              {/* Strategic Management Filter Pills */}
              <div className="flex items-center bg-theme-sur2 border border-theme-bor p-1 rounded-xl overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setPipelineFocusFilter('active_management')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    pipelineFocusFilter === 'active_management'
                      ? 'bg-[#ff6d3b] text-white shadow-xs'
                      : 'text-theme-txt2 hover:text-theme-txt'
                  }`}
                  title="Muestra únicamente prospectos con seguimiento, notas, valor, tags o que avanzaron de fase"
                >
                  <Flame className="w-3 h-3" />
                  <span>En Gestión Activa</span>
                </button>

                <button
                  onClick={() => setPipelineFocusFilter('scheduled')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    pipelineFocusFilter === 'scheduled'
                      ? 'bg-theme-sur text-[#ffb300] font-bold border border-theme-bor shadow-xs'
                      : 'text-theme-txt2 hover:text-theme-txt'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Con Seguimiento</span>
                </button>

                <button
                  onClick={() => setPipelineFocusFilter('high_priority')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    pipelineFocusFilter === 'high_priority'
                      ? 'bg-theme-sur text-[#f59e0b] font-bold border border-theme-bor shadow-xs'
                      : 'text-theme-txt2 hover:text-theme-txt'
                  }`}
                >
                  <Star className="w-3 h-3 fill-[#f59e0b] text-[#f59e0b]" />
                  <span>Alta Prioridad (2-3★)</span>
                </button>

                <button
                  onClick={() => setPipelineFocusFilter('opportunity')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    pipelineFocusFilter === 'opportunity'
                      ? 'bg-theme-sur text-[#00e5a0] font-bold border border-theme-bor shadow-xs'
                      : 'text-theme-txt2 hover:text-theme-txt'
                  }`}
                >
                  <Award className="w-3 h-3" />
                  <span>Oportunidades</span>
                </button>

                <button
                  onClick={() => setPipelineFocusFilter('all_universe')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer whitespace-nowrap ${
                    pipelineFocusFilter === 'all_universe'
                      ? 'bg-theme-sur text-theme-txt font-bold border border-theme-bor shadow-xs'
                      : 'text-theme-txt3 hover:text-theme-txt'
                  }`}
                  title="Ver toda la base de datos completa sin filtrar fríos"
                >
                  <Eye className="w-3 h-3" />
                  <span>Ver Universo ({contacts.length})</span>
                </button>
              </div>
            </div>

            {/* Right: Assignee & Search */}
            <div className="flex items-center gap-2.5">
              <select
                value={pipelineAssigneeFilter}
                onChange={(e) => setPipelineAssigneeFilter(e.target.value)}
                className="bg-theme-sur2 border border-theme-bor focus:border-[#2979ff] rounded-xl px-3 py-1.5 text-xs text-theme-txt outline-hidden cursor-pointer"
              >
                <option value="all">👤 Todos los Responsables</option>
                <option value="Gabino">Gabino</option>
                <option value="Kiara Zavala Peralta">Kiara Zavala</option>
              </select>

              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-theme-txt3" />
                <input
                  type="text"
                  value={pipelineSearch}
                  onChange={(e) => setPipelineSearch(e.target.value)}
                  placeholder="Buscar prospecto, empresa o cargo..."
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#2979ff] rounded-xl pl-9 pr-3 py-1.5 text-xs text-theme-txt outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Notice when viewing active management */}
          {pipelineFocusFilter === 'active_management' && (
            <div className="flex items-center justify-between text-xs px-4 py-2 rounded-xl bg-[#ff6d3b]/10 border border-[#ff6d3b]/20 text-theme-txt">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#ff6d3b]" />
                <span>
                  <b>Modo Estratégico Activo:</b> Mostrando únicamente los <b>{pipelineMetrics.totalActiveManaged} prospectos en gestión comercial</b> (con interacción, seguimiento, notas, o valor). Los prospectos fríos permanecen en Contactos para no saturar el análisis.
                </span>
              </div>
              <button
                onClick={() => setPipelineFocusFilter('all_universe')}
                className="text-[11px] font-mono text-[#ff6d3b] hover:underline cursor-pointer ml-2 shrink-0"
              >
                Ver universo completo
              </button>
            </div>
          )}

          {/* Horizontal Scrollable Pipeline Columns with loaded people */}
          <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1 no-scrollbar">
            {activePipelineStages.map((st) => {
              const stageContacts = contactsByStage[st.name] || [];
              const stageTotalVal = stageContacts.reduce((acc, c) => acc + (Number(c.deal_value) || 0), 0);

              return (
                <div
                  key={st.name}
                  className="w-[290px] shrink-0 bg-theme-sur border border-theme-bor rounded-2xl flex flex-col max-h-[75vh] shadow-xs"
                >
                  {/* Stage Column Header */}
                  <div className="p-3 border-b border-theme-bor bg-theme-sur2/60 rounded-t-2xl space-y-1 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                        <h4 className="font-bold text-xs text-theme-txt truncate max-w-[170px]" title={st.name}>
                          {st.name}
                        </h4>
                      </div>
                      <span className="font-mono text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-theme-sur text-theme-txt border border-theme-bor">
                        {stageContacts.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-theme-txt3 pt-0.5">
                      <span>
                        {filteredPipelineContacts.length > 0
                          ? Math.round((stageContacts.length / filteredPipelineContacts.length) * 100)
                          : 0}% de gestiones
                      </span>
                      {stageTotalVal > 0 && (
                        <span className="font-bold text-[#00e5a0]">${stageTotalVal.toLocaleString()} USD</span>
                      )}
                    </div>
                  </div>

                  {/* Stage Contacts Cards List */}
                  <div className="p-2.5 space-y-2 overflow-y-auto flex-1">
                    {stageContacts.length === 0 ? (
                      <div className="py-10 px-3 text-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-theme-sur2 mx-auto flex items-center justify-center text-theme-txt3">
                          <CheckCircle2 className="w-4 h-4 text-theme-txt3/50" />
                        </div>
                        <p className="text-xs text-theme-txt2 font-medium">
                          Sin prospectos activos en esta fase
                        </p>
                        <p className="text-[10px] text-theme-txt3 font-mono leading-tight">
                          Aparecerán aquí conforme avance su cadencia de prospección
                        </p>
                      </div>
                    ) : (
                      stageContacts.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => onSelectContact && onSelectContact(c)}
                          className="p-3 bg-theme-sur2/70 hover:bg-theme-sur2 border border-theme-bor hover:border-[#2979ff]/40 rounded-xl transition-all cursor-pointer shadow-2xs space-y-2 group"
                        >
                          {/* Name, Initials & Priority */}
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2979ff]/20 to-[#00a870]/20 text-[#2979ff] font-bold text-xs flex items-center justify-center shrink-0 border border-theme-bor">
                                {c.first_name.slice(0, 1)}
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-bold text-xs text-theme-txt truncate group-hover:text-[#2979ff] transition-colors">
                                  {c.first_name} {c.last_name || ''}
                                </h5>
                                <span className="text-[10px] text-theme-txt3 block truncate font-mono">
                                  {c.position || 'Sin cargo especificado'}
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

                          {/* Company & Country info */}
                          {c.company && (
                            <div className="flex items-center gap-1.5 text-[10.5px] text-theme-txt2 font-mono">
                              <Building2 className="w-3 h-3 text-theme-txt3 shrink-0" />
                              <span className="truncate">{c.company}</span>
                              {c.country && (
                                <span className="text-theme-txt3 text-[9px] ml-auto">({c.country})</span>
                              )}
                            </div>
                          )}

                          {/* Dynamic Action Indicators: Follow-up Date, Service Needed, Deal Value */}
                          <div className="space-y-1 pt-0.5">
                            {/* Follow up date badge */}
                            {c.follow_up_date && (
                              <div className="flex items-center gap-1 text-[10px] font-mono text-[#ffb300] bg-[#ffb300]/10 border border-[#ffb300]/25 px-2 py-0.5 rounded-md">
                                <Clock className="w-3 h-3 shrink-0" />
                                <span className="truncate">Seguimiento: {c.follow_up_date}</span>
                              </div>
                            )}

                            {/* Service needed badge */}
                            {c.service_needed && (
                              <div className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-[#ff6d3b]/15 text-[#ff6d3b] border border-[#ff6d3b]/30 truncate font-semibold">
                                🎯 {c.service_needed}
                              </div>
                            )}

                            {/* Notes snippet preview if exists */}
                            {c.notes && c.notes.trim() && (
                              <div className="text-[9.5px] text-theme-txt3 italic truncate font-sans bg-theme-sur px-2 py-0.5 rounded border border-theme-bor/60">
                                📝 &ldquo;{c.notes.slice(0, 45)}...&rdquo;
                              </div>
                            )}

                            {/* Tags */}
                            {c.tags && c.tags.length > 0 && !c.service_needed && (
                              <div className="flex items-center gap-1 flex-wrap">
                                {c.tags.slice(0, 2).map((t) => (
                                  <span
                                    key={t}
                                    className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-theme-sur text-theme-txt3 border border-theme-bor truncate"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Footer: Assigned Member & CTA */}
                          <div className="flex items-center justify-between pt-1 border-t border-theme-bor/60 text-[10px] font-mono">
                            <span className="text-theme-txt3 flex items-center gap-1">
                              <User className="w-2.5 h-2.5" />
                              <span>{c.assigned_to || 'Gabino'}</span>
                            </span>

                            <div className="flex items-center gap-2">
                              {Number(c.deal_value) > 0 && (
                                <span className="font-bold text-[#00e5a0]">
                                  ${Number(c.deal_value).toLocaleString()}
                                </span>
                              )}
                              <span className="text-[#2979ff] font-semibold flex items-center gap-0.5 group-hover:underline">
                                Ficha <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
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
          TAB 2: RADAR DE DEMANDA & INTELIGENCIA DE PROSPECCIÓN (B2B / B2C SEGREGATED)
          ========================================================================= */}
      {activeSubTab === 'radar_demanda' && (
        <div className="space-y-6">
          {/* Top Segment Switcher for Demand Radar */}
          <div className="bg-theme-sur border border-theme-bor rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-theme-txt font-mono uppercase tracking-wider">
                Segmento a Analizar:
              </span>
              <div className="flex items-center bg-theme-sur2 border border-theme-bor p-1 rounded-xl">
                <button
                  onClick={() => {
                    setRadarSegment('B2B');
                    setSelectedCategoryFilter(null);
                    setSelectedKeywordFilter(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    radarSegment === 'B2B'
                      ? 'bg-[#2979ff] text-white shadow-xs'
                      : 'text-theme-txt2 hover:text-theme-txt'
                  }`}
                >
                  <span>🏢 B2B Corporativo</span>
                  <span className="text-[10px] font-mono opacity-80">
                    ({contacts.filter(c => (c.business_segment || '').toUpperCase() === 'B2B').length})
                  </span>
                </button>

                <button
                  onClick={() => {
                    setRadarSegment('B2C');
                    setSelectedCategoryFilter(null);
                    setSelectedKeywordFilter(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    radarSegment === 'B2C'
                      ? 'bg-[#00a870] text-white shadow-xs'
                      : 'text-theme-txt2 hover:text-theme-txt'
                  }`}
                >
                  <span>👤 B2C Alumnos</span>
                  <span className="text-[10px] font-mono opacity-80">
                    ({contacts.filter(c => (c.business_segment || '').toUpperCase() === 'B2C').length})
                  </span>
                </button>

                <button
                  onClick={() => {
                    setRadarSegment('all');
                    setSelectedCategoryFilter(null);
                    setSelectedKeywordFilter(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    radarSegment === 'all'
                      ? 'bg-theme-sur text-theme-txt shadow-xs border border-theme-bor'
                      : 'text-theme-txt2 hover:text-theme-txt'
                  }`}
                >
                  <span>🌐 Todo el Mercado</span>
                  <span className="text-[10px] font-mono opacity-80">
                    ({contacts.length})
                  </span>
                </button>
              </div>
            </div>

            {/* Keyword Search Input for on-the-fly exploration */}
            <div className="relative min-w-[280px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-theme-txt3" />
              <input
                type="text"
                value={radarSearchKeyword}
                onChange={(e) => {
                  setRadarSearchKeyword(e.target.value);
                  if (e.target.value) {
                    setSelectedCategoryFilter(null);
                    setSelectedKeywordFilter(null);
                  }
                }}
                placeholder="Escribe palabra clave (ej: gestión del cambio, minería, agile)..."
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#ff6d3b] rounded-xl pl-9 pr-3 py-1.5 text-xs text-theme-txt outline-hidden"
              />
            </div>
          </div>

          {/* Executive KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-theme-sur border border-theme-bor p-4.5 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-theme-txt2">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Servicio Más Demandado</span>
                <div className="p-2 rounded-xl bg-[#2979ff]/15 text-[#2979ff]">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div className="text-sm font-extrabold text-[#2979ff] truncate font-sans" title={demandAnalysis.topCategory}>
                {demandAnalysis.topCategory}
              </div>
              <p className="text-[11px] text-theme-txt3 font-mono">
                Segmento: <b className="text-theme-txt">{radarSegment === 'B2B' ? 'B2B Corporativo' : radarSegment === 'B2C' ? 'B2C Alumnos' : 'Consolidado'}</b>
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
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Pipeline Estimado</span>
                <div className="p-2 rounded-xl bg-[#00e5a0]/15 text-[#00e5a0]">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-[#00e5a0] font-mono">
                ${demandAnalysis.totalDealPotential.toLocaleString()} USD
              </div>
              <p className="text-[11px] text-theme-txt3 font-mono">
                Monto potencial en seguimiento
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
                Especialidades activas en este segmento
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
                    <span>
                      Ranking de Servicios {radarSegment === 'B2B' ? 'Corporativos (B2B)' : radarSegment === 'B2C' ? 'Individuales (B2C)' : 'del Mercado'}
                    </span>
                  </h3>
                  <p className="text-xs text-theme-txt2 mt-0.5">
                    Haz clic en cualquier categoría para desplegar abajo todos los prospectos de esa línea de servicio
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                {demandAnalysis.categoriesRanked.length === 0 ? (
                  <div className="py-8 text-center text-xs text-theme-txt3 font-mono">
                    No hay categorías registradas para este filtro
                  </div>
                ) : (
                  demandAnalysis.categoriesRanked.map((item, idx) => {
                    const pct = Math.round((item.count / (radarContacts.length || 1)) * 100);
                    const isSelected = selectedCategoryFilter === item.category.id;

                    return (
                      <div
                        key={item.category.id}
                        onClick={() => {
                          setSelectedCategoryFilter(item.category.id);
                          setSelectedKeywordFilter(null);
                          setRadarSearchKeyword('');
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? 'bg-[#ff6d3b]/10 border-[#ff6d3b] shadow-xs ring-1 ring-[#ff6d3b]/30'
                            : 'bg-theme-sur2/60 hover:bg-theme-sur2 border-theme-bor hover:border-theme-bor2'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{item.category.icon}</span>
                            <div>
                              <h4 className="font-bold text-xs text-theme-txt flex items-center gap-2">
                                <span>{idx + 1}. {item.category.title}</span>
                                <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded ${item.category.badgeBg} text-theme-txt font-semibold`}>
                                  {idx === 0 ? 'Demanda Muy Alta' : idx < 3 ? 'Demanda Alta' : 'En Crecimiento'}
                                </span>
                              </h4>
                            </div>
                          </div>

                          <div className="text-right font-mono">
                            <span className="font-bold text-xs text-theme-txt">{item.count} prospectos</span>
                            <span className="text-[10px] text-theme-txt3 block">{pct}% del segmento</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2 bg-theme-sur rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.max(pct * 2, 6)}%`,
                              backgroundColor: item.category.color,
                            }}
                          />
                        </div>

                        {/* Sample companies & CTA */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-theme-txt3 pt-0.5">
                          <span className="truncate max-w-[320px]">
                            Muestra: {item.contacts.slice(0, 3).map(c => c.company || c.first_name).join(', ')}
                          </span>
                          <span className="text-[#2979ff] font-semibold flex items-center gap-0.5">
                            {isSelected ? 'Mostrando abajo los ' + item.count + ' prospectos ↓' : 'Explorar todos los ' + item.count + ' prospectos →'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Col: Interactive Keyword Cloud */}
            <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#ff6d3b]" />
                  <span>Palabras Clave Estratégicas</span>
                </h3>
                <p className="text-xs text-theme-txt2 mt-0.5">
                  Haz clic en cualquier término para filtrar a los prospectos afines
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
                        if (isSelected) {
                          setSelectedKeywordFilter(null);
                        } else {
                          setSelectedKeywordFilter(kw.word);
                          setSelectedCategoryFilter(null);
                          setRadarSearchKeyword('');
                        }
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

              {/* Strategic Advice Card for Decision Makers */}
              <div className="p-3.5 bg-[#00a870]/10 border border-[#00a870]/30 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#00a870]">
                  <Sparkles className="w-4 h-4" />
                  <span>Portafolio TransformAcción 720°</span>
                </div>
                <p className="text-theme-txt2 text-[11px] leading-relaxed">
                  {radarSegment === 'B2B' ? (
                    <>
                      Las empresas valoran la sinergia entre <b>Gestión del Cambio</b>, <b>Desarrollo Organizacional</b> y <b>Cultura & Talento</b>. Proponer diagnósticos de adopción del cambio permite abrir cuentas corporativas de alto valor.
                    </>
                  ) : (
                    <>
                      En el segmento individual, la mayor demanda se concentra en <b>Empleabilidad / LinkedIn</b> y <b>Coaching Ejecutivo</b>. Ofrecer sesiones de diagnóstico gratuito acelera la tasa de conversión a alumno.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* =========================================================================
              DRILL-DOWN: LAS MEJORES OPCIONES & PROSPECTOS PARA ESTA CATEGORÍA / PALABRA CLAVE
              ========================================================================= */}
          {bestOptionsForKeyword.displayTitle && (
            <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-theme-bor pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#ff6d3b]/15 text-[#ff6d3b]">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-theme-txt flex items-center gap-2 flex-wrap">
                      <span>Mejores Opciones para:</span>
                      <span className="text-[#ff6d3b]">{bestOptionsForKeyword.displayTitle}</span>
                      <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-theme-sur2 text-theme-txt border border-theme-bor">
                        {bestOptionsForKeyword.list.length} prospectos identificados
                      </span>
                    </h3>
                    <p className="text-xs text-theme-txt2 mt-0.5">
                      {bestOptionsForKeyword.isCategory 
                        ? 'Mostrando el universo completo de esta línea de servicio, ordenado por idoneidad comercial'
                        : 'Prospectos afines a esta necesidad o término específico'}
                    </p>
                  </div>
                </div>

                {/* Sub-filters within keyword results */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-theme-sur2 border border-theme-bor p-0.5 rounded-xl text-xs">
                    <button
                      onClick={() => setRadarMatchesFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        radarMatchesFilter === 'all'
                          ? 'bg-theme-sur text-theme-txt shadow-xs font-bold'
                          : 'text-theme-txt2 hover:text-theme-txt'
                      }`}
                    >
                      Todos ({bestOptionsForKeyword.list.length})
                    </button>
                    <button
                      onClick={() => setRadarMatchesFilter('high_priority')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        radarMatchesFilter === 'high_priority'
                          ? 'bg-[#f59e0b] text-white shadow-xs font-bold'
                          : 'text-theme-txt2 hover:text-theme-txt'
                      }`}
                    >
                      ⭐ 2-3 Estrellas
                    </button>
                    <button
                      onClick={() => setRadarMatchesFilter('with_email')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        radarMatchesFilter === 'with_email'
                          ? 'bg-[#2979ff] text-white shadow-xs font-bold'
                          : 'text-theme-txt2 hover:text-theme-txt'
                      }`}
                    >
                      📧 Con Email
                    </button>
                    <button
                      onClick={() => setRadarMatchesFilter('active_management')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        radarMatchesFilter === 'active_management'
                          ? 'bg-[#00a870] text-white shadow-xs font-bold'
                          : 'text-theme-txt2 hover:text-theme-txt'
                      }`}
                    >
                      🔥 En Gestión
                    </button>
                  </div>

                  {/* Sorter */}
                  <select
                    value={radarSortBy}
                    onChange={(e) => setRadarSortBy(e.target.value as any)}
                    className="bg-theme-sur2 border border-theme-bor rounded-xl px-2.5 py-1 text-xs text-theme-txt outline-hidden cursor-pointer"
                  >
                    <option value="match_score">🎯 Mejor Match (Scoring)</option>
                    <option value="priority">⭐ Mayor Prioridad</option>
                    <option value="name">Abc Nombre A-Z</option>
                  </select>

                  {(selectedCategoryFilter || selectedKeywordFilter || radarSearchKeyword) && (
                    <button
                      onClick={() => {
                        setSelectedCategoryFilter(null);
                        setSelectedKeywordFilter(null);
                        setRadarSearchKeyword('');
                      }}
                      className="p-1.5 rounded-xl bg-theme-sur2 border border-theme-bor hover:text-[#ff6d3b] text-theme-txt3 transition-colors cursor-pointer text-xs flex items-center gap-1"
                      title="Restablecer a la categoría líder"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Restablecer</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Grid of Matched Prospects */}
              {bestOptionsForKeyword.list.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-theme-sur2 mx-auto flex items-center justify-center text-theme-txt3">
                    <Search className="w-5 h-5 text-theme-txt3/60" />
                  </div>
                  <p className="text-sm font-semibold text-theme-txt">
                    No se encontraron prospectos para los filtros seleccionados
                  </p>
                  <p className="text-xs text-theme-txt3 font-mono">
                    Prueba cambiando de filtro o seleccionando &ldquo;Todos&rdquo;
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {bestOptionsForKeyword.list.slice(0, 24).map(({ contact: c, score, matchReasons }) => {
                    const isTopMatch = score >= 70;
                    const isCopied = copiedEmailId === c.id;

                    return (
                      <div
                        key={c.id}
                        onClick={() => onSelectContact && onSelectContact(c)}
                        className="p-4 bg-theme-sur2/70 hover:bg-theme-sur2 border border-theme-bor hover:border-[#2979ff]/40 rounded-xl transition-all cursor-pointer space-y-2.5 group shadow-2xs"
                      >
                        {/* Header: Match Score + Segment + Stars */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                              isTopMatch
                                ? 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30'
                                : 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30'
                            }`}>
                              {score}% Match {isTopMatch ? '💎' : '⭐'}
                            </span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                              c.business_segment === 'B2B' ? 'bg-[#2979ff]/10 text-[#2979ff]' : 'bg-[#00a870]/10 text-[#00a870]'
                            }`}>
                              {c.business_segment || 'B2B'}
                            </span>
                          </div>

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

                        {/* Name & Position */}
                        <div>
                          <h4 className="font-bold text-xs text-theme-txt group-hover:text-[#2979ff] transition-colors truncate">
                            {c.first_name} {c.last_name || ''}
                          </h4>
                          <span className="text-[10px] text-theme-txt3 font-mono block truncate">
                            {c.position || 'Sin cargo especificado'}
                          </span>
                        </div>

                        {/* Company & Country */}
                        {c.company && (
                          <div className="flex items-center gap-1.5 text-[11px] text-theme-txt2 font-mono">
                            <Building2 className="w-3 h-3 text-theme-txt3 shrink-0" />
                            <span className="truncate">{c.company}</span>
                            {c.country && (
                              <span className="text-theme-txt3 text-[9.5px] ml-auto">({c.country})</span>
                            )}
                          </div>
                        )}

                        {/* Match Reason Badges */}
                        {matchReasons.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {matchReasons.slice(0, 2).map((r, idx) => (
                              <span
                                key={idx}
                                className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-theme-sur text-theme-txt border border-theme-bor truncate max-w-full font-medium"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Action Footer: Email, LinkedIn, Ficha */}
                        <div className="flex items-center justify-between pt-2 border-t border-theme-bor/60 text-[10px] font-mono">
                          <div className="flex items-center gap-1.5">
                            {c.email ? (
                              <button
                                onClick={(e) => handleCopyEmail(c.email!, c.id, e)}
                                className="flex items-center gap-1 text-theme-txt3 hover:text-[#2979ff] p-1 rounded hover:bg-theme-sur transition-colors cursor-pointer"
                                title="Copiar correo"
                              >
                                {isCopied ? (
                                  <Check className="w-3 h-3 text-[#00a870]" />
                                ) : (
                                  <Mail className="w-3 h-3" />
                                )}
                                <span className="text-[9px]">{isCopied ? '¡Copiado!' : 'Email'}</span>
                              </button>
                            ) : null}

                            {c.linkedin_url ? (
                              <a
                                href={c.linkedin_url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-0.5 text-theme-txt3 hover:text-[#2979ff] p-1 rounded hover:bg-theme-sur transition-colors"
                                title="Abrir perfil de LinkedIn"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span className="text-[9px]">LinkedIn</span>
                              </a>
                            ) : null}
                          </div>

                          <span className="text-[#2979ff] font-semibold flex items-center gap-0.5 group-hover:underline">
                            Ver ficha <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
