'use client';

import React, { useState, useEffect, useMemo, memo } from 'react';
import { FollowUpReminder, TeamMember, Contact, ContactStatus } from '@/lib/types';
import { 
  Calendar, Clock, AlertTriangle, CheckCircle2, UserCheck, ExternalLink, 
  Search, RefreshCw, ChevronRight, ChevronDown, ChevronUp, CalendarDays, Star, MessageSquare, Phone, 
  Filter, Layers, LayoutGrid, LayoutList, Flame, Users, Sparkles, Loader2, X
} from 'lucide-react';

interface FollowUpsCalendarViewProps {
  currentUser: TeamMember | null;
  teamMembers: TeamMember[];
  onOpenContactDrawer?: (contactId: string) => void;
  onOpenTemplates?: (contact: Contact) => void;
}

const BUCKET_CONFIG = {
  overdue: {
    id: 'overdue',
    title: 'Atrasados / Vencidos Urgentes',
    subtitle: 'Seguimientos que requieren contacto inmediato',
    icon: AlertTriangle,
    accentColor: '#ff6d3b',
    borderClass: 'border-[#ff6d3b]/30 bg-[#ff6d3b]/5',
    badgeClass: 'bg-[#ff6d3b]/15 text-[#ff6d3b] border-[#ff6d3b]/30',
    cardBorder: 'border-[#ff6d3b]/30 hover:border-[#ff6d3b]',
  },
  today: {
    id: 'today',
    title: 'Para Contactar Hoy',
    subtitle: 'Prioridad comercial programada para la jornada',
    icon: Flame,
    accentColor: '#00a870',
    borderClass: 'border-[#00a870]/30 bg-[#00a870]/5',
    badgeClass: 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30',
    cardBorder: 'border-[#00a870]/30 hover:border-[#00a870]',
  },
  plus_1_day: {
    id: 'plus_1_day',
    title: 'Mañana (+1 Día)',
    subtitle: 'Prospectos a preparar para contactar mañana',
    icon: Clock,
    accentColor: '#2979ff',
    borderClass: 'border-[#2979ff]/30 bg-[#2979ff]/5',
    badgeClass: 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30',
    cardBorder: 'border-[#2979ff]/30 hover:border-[#2979ff]',
  },
  plus_3_days: {
    id: 'plus_3_days',
    title: 'Próximos 2 a 3 Días (+3 Días)',
    subtitle: 'Planificación de corto plazo',
    icon: Calendar,
    accentColor: '#2979ff',
    borderClass: 'border-[#2979ff]/20 bg-theme-sur2/40',
    badgeClass: 'bg-[#2979ff]/10 text-[#2979ff] border-[#2979ff]/20',
    cardBorder: 'border-theme-bor hover:border-[#2979ff]/60',
  },
  plus_1_week: {
    id: 'plus_1_week',
    title: 'Próxima Semana (+4 a +7 Días)',
    subtitle: 'Seguimientos activos para los próximos días',
    icon: CalendarDays,
    accentColor: '#a855f7',
    borderClass: 'border-[#a855f7]/20 bg-[#a855f7]/5',
    badgeClass: 'bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20',
    cardBorder: 'border-theme-bor hover:border-[#a855f7]/60',
  },
  plus_1_month: {
    id: 'plus_1_month',
    title: 'Mediano Plazo (+8 a 30 Días)',
    subtitle: 'Contactos calendarizados para este mes',
    icon: Sparkles,
    accentColor: '#f59e0b',
    borderClass: 'border-[#f59e0b]/20 bg-[#f59e0b]/5',
    badgeClass: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
    cardBorder: 'border-theme-bor hover:border-[#f59e0b]/60',
  },
  future: {
    id: 'future',
    title: 'Largo Plazo (+30 Días)',
    subtitle: 'Seguimientos programados a futuro',
    icon: Calendar,
    accentColor: '#8899a6',
    borderClass: 'border-theme-bor bg-theme-sur2/30',
    badgeClass: 'bg-theme-sur2 text-theme-txt3 border-theme-bor',
    cardBorder: 'border-theme-bor hover:border-theme-bor2',
  },
} as const;

type BucketKey = keyof typeof BUCKET_CONFIG;

export default function FollowUpsCalendarView({
  currentUser,
  teamMembers = [],
  onOpenContactDrawer,
  onOpenTemplates,
}: FollowUpsCalendarViewProps) {
  const [reminders, setReminders] = useState<FollowUpReminder[]>([]);
  const [stats, setStats] = useState<{ 
    total: number; 
    overdue: number; 
    today: number; 
    plus_1_day: number;
    plus_3_days: number;
    plus_1_week: number;
    plus_1_month: number;
    future: number;
    upcoming: number;
  }>({
    total: 0,
    overdue: 0,
    today: 0,
    plus_1_day: 0,
    plus_3_days: 0,
    plus_1_week: 0,
    plus_1_month: 0,
    future: 0,
    upcoming: 0,
  });

  // Filters & State
  const [memberFilter, setMemberFilter] = useState<string>('');
  const [activeSegment, setActiveSegment] = useState<'all' | BucketKey>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [viewLayout, setViewLayout] = useState<'grouped' | 'grid'>('grouped');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [openingContactId, setOpeningContactId] = useState<string | null>(null);

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (memberFilter && memberFilter !== 'all') params.set('member', memberFilter);

      const res = await fetch(`/api/follow-ups?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReminders(data.reminders || []);
        setStats(data.stats || { 
          total: 0, overdue: 0, today: 0, plus_1_day: 0, plus_3_days: 0, plus_1_week: 0, plus_1_month: 0, future: 0, upcoming: 0 
        });
      }
    } catch (e) {
      console.error('Error fetching follow-ups:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [memberFilter]);

  const toggleSectionCollapse = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Safe handler to open drawer with feedback
  const handleManageClick = async (contactId: string) => {
    if (!onOpenContactDrawer) return;
    setOpeningContactId(contactId);
    try {
      await onOpenContactDrawer(contactId);
    } finally {
      setOpeningContactId(null);
    }
  };

  // Safe helper to open templates modal
  const handleOpenTemplatesHelper = (r: FollowUpReminder) => {
    if (!onOpenTemplates) return;
    const syntheticContact: Contact = {
      id: r.id,
      first_name: r.first_name,
      last_name: r.last_name,
      company: r.company,
      position: r.position,
      linkedin_url: r.linkedin_url,
      email: null,
      phone: r.phone,
      status: r.status,
      priority: r.priority,
      follow_up_date: r.follow_up_date,
      notes: r.notes,
      tags: [],
      assigned_to: r.assigned_to,
      connected_on: null,
      source: 'BASE_IMPORTADA',
      created_at: '',
      updated_at: '',
    };
    onOpenTemplates(syntheticContact);
  };

  // Filter list by Segment + Search + Priority + Status
  const filteredReminders = useMemo(() => {
    return reminders.filter((r) => {
      // 1. Time bucket filter
      if (activeSegment !== 'all' && r.time_bucket !== activeSegment) {
        return false;
      }

      // 2. Priority filter
      if (priorityFilter !== 'all') {
        if (priorityFilter === '2_3') {
          if (r.priority < 2) return false;
        } else {
          const pNum = parseInt(priorityFilter, 10);
          if (r.priority !== pNum) return false;
        }
      }

      // 3. Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'Seguimiento') {
          if (r.status !== 'Seguimiento' && r.status !== 'En pausa') return false;
        } else if (r.status !== statusFilter) {
          return false;
        }
      }

      // 4. Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = `${r.first_name} ${r.last_name || ''}`.toLowerCase().includes(q);
        const matchCompany = (r.company || '').toLowerCase().includes(q);
        const matchPos = (r.position || '').toLowerCase().includes(q);
        const matchNotes = (r.notes || '').toLowerCase().includes(q);
        return matchName || matchCompany || matchPos || matchNotes;
      }

      return true;
    });
  }, [reminders, activeSegment, priorityFilter, statusFilter, search]);

  // Group filtered reminders by time bucket
  const groupedReminders = useMemo(() => {
    const buckets: Record<BucketKey, FollowUpReminder[]> = {
      overdue: [],
      today: [],
      plus_1_day: [],
      plus_3_days: [],
      plus_1_week: [],
      plus_1_month: [],
      future: [],
    };

    filteredReminders.forEach((r) => {
      const b = (r.time_bucket in buckets ? r.time_bucket : 'future') as BucketKey;
      buckets[b].push(r);
    });

    return buckets;
  }, [filteredReminders]);

  const getBucketBadge = (bucket: string, dateStr: string, diff: number) => {
    switch (bucket) {
      case 'today':
        return { label: `🔔 HOY (${dateStr})`, bg: 'bg-[#00a870]/20 text-[#00a870] border-[#00a870]/40' };
      case 'overdue':
        return { label: `⚠️ VENCIDO (${Math.abs(diff)}d atrás - ${dateStr})`, bg: 'bg-[#ff6d3b]/20 text-[#ff6d3b] border-[#ff6d3b]/40' };
      case 'plus_1_day':
        return { label: `⚡ Mañana (+1 día - ${dateStr})`, bg: 'bg-[#2979ff]/20 text-[#2979ff] border-[#2979ff]/40' };
      case 'plus_3_days':
        return { label: `📅 En ${diff} días (${dateStr})`, bg: 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30' };
      case 'plus_1_week':
        return { label: `🗓️ En ${diff} días (${dateStr})`, bg: 'bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/30' };
      case 'plus_1_month':
        return { label: `📌 En ${diff} días (${dateStr})`, bg: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30' };
      default:
        return { label: `📆 Futuro (+${diff}d - ${dateStr})`, bg: 'bg-theme-sur2 text-theme-txt3 border-theme-bor' };
    }
  };

  const renderCard = (r: FollowUpReminder) => {
    const badge = getBucketBadge(r.time_bucket, r.follow_up_date, r.days_diff);
    const isOpening = openingContactId === r.id;
    const bucketCfg = BUCKET_CONFIG[r.time_bucket in BUCKET_CONFIG ? (r.time_bucket as BucketKey) : 'future'];

    return (
      <div
        key={r.id}
        onClick={() => handleManageClick(r.id)}
        className={`bg-theme-sur border rounded-2xl p-4.5 shadow-xs flex flex-col justify-between space-y-3 transition-all cursor-pointer hover:shadow-md ${bucketCfg.cardBorder}`}
      >
        <div className="space-y-2.5">
          {/* Top meta tags */}
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${badge.bg}`}>
              <Calendar className="w-3 h-3" />
              <span>{badge.label}</span>
            </span>

            <div className="flex items-center gap-1.5">
              {/* Stars badge */}
              {r.priority > 1 && (
                <span className="flex items-center text-[10px] text-[#f59e0b]" title={`Prioridad: ${r.priority} estrellas`}>
                  {Array.from({ length: r.priority }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </span>
              )}

              <span className="text-[10px] font-mono text-theme-txt3 bg-theme-sur2 px-2 py-0.5 rounded">
                Resp: {r.assigned_to}
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-bold text-sm text-theme-txt hover:text-[#00a870] transition-colors leading-snug">
              {r.first_name} {r.last_name || ''}
            </h3>
            <p className="text-xs text-theme-txt2 line-clamp-1 mt-0.5">
              {r.position || 'Sin cargo'} {r.company ? `• ${r.company}` : ''}
            </p>
          </div>

          {/* Notes preview */}
          {r.notes ? (
            <div className="p-2.5 rounded-xl bg-theme-sur2 border border-theme-bor text-xs text-theme-txt2 italic line-clamp-2">
              &quot;{r.notes}&quot;
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-theme-sur2/40 border border-theme-bor/60 text-[11px] text-theme-txt3 italic">
              Sin notas registradas aún
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2.5 border-t border-theme-bor flex items-center justify-between">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-sur2 text-theme-txt3 border border-theme-bor/60">
            Estado: {r.status}
          </span>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Quick Templates Action */}
            {onOpenTemplates && (
              <button
                onClick={() => handleOpenTemplatesHelper(r)}
                className="p-1.5 rounded-lg bg-theme-sur2 hover:bg-[#2979ff]/15 text-theme-txt2 hover:text-[#2979ff] border border-theme-bor cursor-pointer transition-colors"
                title="Redactar mensaje comercial"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            )}

            {/* LinkedIn profile link */}
            {r.linkedin_url && (
              <a
                href={r.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-theme-sur2 hover:bg-[#0a66c2]/15 text-theme-txt2 hover:text-[#0a66c2] border border-theme-bor cursor-pointer transition-colors"
                title="Abrir perfil de LinkedIn"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Direct Manage Drawer Button */}
            <button
              onClick={() => handleManageClick(r.id)}
              disabled={isOpening}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#00a870]/15 text-[#00a870] hover:bg-[#00a870]/25 border border-[#00a870]/30 flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
            >
              {isOpening ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Abriendo...</span>
                </>
              ) : (
                <>
                  <span>Gestionar</span>
                  <ChevronRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-theme-bg">
      {/* Header & Metric Banner */}
      <div className="bg-theme-sur p-5 rounded-2xl border border-theme-bor shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff6d3b] font-bold bg-[#ff6d3b]/10 px-2 py-0.5 rounded flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#ff6d3b]" />
              <span>Agenda de Seguimientos Inteligente</span>
            </span>
            <span className="text-[10px] font-mono text-theme-txt3 bg-theme-sur2 px-2 py-0.5 rounded border border-theme-bor">
              {stats.total} agendados
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-theme-txt">
            Mapeo y Segmentación de Seguimientos
          </h2>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Organización por urgencia cronológica, prioridad comercial y responsable
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Grouped vs Grid */}
          <div className="flex items-center bg-theme-sur2 p-0.5 rounded-xl border border-theme-bor text-xs">
            <button
              onClick={() => setViewLayout('grouped')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewLayout === 'grouped'
                  ? 'bg-[#00a870] text-[#00110b] font-bold shadow-xs'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
              title="Vista agrupada por urgencia temporal"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Agrupado</span>
            </button>
            <button
              onClick={() => setViewLayout('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewLayout === 'grid'
                  ? 'bg-[#00a870] text-[#00110b] font-bold shadow-xs'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
              title="Vista en cuadrícula plana"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cuadrícula</span>
            </button>
          </div>

          <button
            onClick={fetchFollowUps}
            disabled={loading}
            className="p-2 rounded-xl bg-theme-sur2 border border-theme-bor hover:border-[#ff6d3b] text-theme-txt2 hover:text-theme-txt text-xs flex items-center gap-1 cursor-pointer transition-colors"
            title="Refrescar seguimientos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Time-Bucket Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {/* Todos */}
        <button
          onClick={() => setActiveSegment('all')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeSegment === 'all'
              ? 'bg-[#00a870]/15 border-[#00a870] shadow-xs'
              : 'bg-theme-sur border-theme-bor hover:border-theme-bor2'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-theme-txt font-bold">📋 Todos</span>
            <span className="text-base font-extrabold font-mono text-theme-txt">{stats.total}</span>
          </div>
          <span className="text-[10.5px] text-theme-txt3 block">Vista completa</span>
        </button>

        {/* 1. Hoy */}
        <button
          onClick={() => setActiveSegment('today')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeSegment === 'today'
              ? 'bg-[#00a870]/15 border-[#00a870] shadow-xs'
              : 'bg-theme-sur border-theme-bor hover:border-theme-bor2'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-[#00a870] font-bold">🔔 Hoy</span>
            <span className="text-base font-extrabold font-mono text-[#00a870]">{stats.today}</span>
          </div>
          <span className="text-[10.5px] text-theme-txt3 block">Para contactar hoy</span>
        </button>

        {/* 2. Atrasados / Vencidos */}
        <button
          onClick={() => setActiveSegment('overdue')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeSegment === 'overdue'
              ? 'bg-[#ff6d3b]/15 border-[#ff6d3b] shadow-xs'
              : 'bg-theme-sur border-theme-bor hover:border-theme-bor2'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-[#ff6d3b] font-bold">⚠️ Vencidos</span>
            <span className="text-base font-extrabold font-mono text-[#ff6d3b]">{stats.overdue}</span>
          </div>
          <span className="text-[10.5px] text-theme-txt3 block">Urgentes pasados</span>
        </button>

        {/* 3. +1 Día (Mañana) */}
        <button
          onClick={() => setActiveSegment('plus_1_day')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeSegment === 'plus_1_day'
              ? 'bg-[#2979ff]/15 border-[#2979ff] shadow-xs'
              : 'bg-theme-sur border-theme-bor hover:border-theme-bor2'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-[#2979ff] font-bold">⚡ +1 Día</span>
            <span className="text-base font-extrabold font-mono text-[#2979ff]">{stats.plus_1_day}</span>
          </div>
          <span className="text-[10.5px] text-theme-txt3 block">Mañana</span>
        </button>

        {/* 4. +3 Días */}
        <button
          onClick={() => setActiveSegment('plus_3_days')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeSegment === 'plus_3_days'
              ? 'bg-[#2979ff]/15 border-[#2979ff] shadow-xs'
              : 'bg-theme-sur border-theme-bor hover:border-theme-bor2'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-[#2979ff] font-bold">📅 +3 Días</span>
            <span className="text-base font-extrabold font-mono text-[#2979ff]">{stats.plus_3_days}</span>
          </div>
          <span className="text-[10.5px] text-theme-txt3 block">En 2 a 3 días</span>
        </button>

        {/* 5. +1 Semana */}
        <button
          onClick={() => setActiveSegment('plus_1_week')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeSegment === 'plus_1_week'
              ? 'bg-[#a855f7]/15 border-[#a855f7] shadow-xs'
              : 'bg-theme-sur border-theme-bor hover:border-theme-bor2'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-[#a855f7] font-bold">🗓️ +1 Sem.</span>
            <span className="text-base font-extrabold font-mono text-[#a855f7]">{stats.plus_1_week}</span>
          </div>
          <span className="text-[10.5px] text-theme-txt3 block">En 4 a 7 días</span>
        </button>

        {/* 6. +1 Mes */}
        <button
          onClick={() => setActiveSegment('plus_1_month')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeSegment === 'plus_1_month'
              ? 'bg-[#f59e0b]/15 border-[#f59e0b] shadow-xs'
              : 'bg-theme-sur border-theme-bor hover:border-theme-bor2'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-[#f59e0b] font-bold">📌 +1 Mes</span>
            <span className="text-base font-extrabold font-mono text-[#f59e0b]">{stats.plus_1_month}</span>
          </div>
          <span className="text-[10.5px] text-theme-txt3 block">En 8 a 30 días</span>
        </button>

        {/* 7. Próximo Mes / Futuro */}
        <button
          onClick={() => setActiveSegment('future')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeSegment === 'future'
              ? 'bg-[#a855f7]/15 border-[#a855f7] shadow-xs'
              : 'bg-theme-sur border-theme-bor hover:border-theme-bor2'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-[#a855f7] font-bold">📆 Próx. Mes</span>
            <span className="text-base font-extrabold font-mono text-[#a855f7]">{stats.future}</span>
          </div>
          <span className="text-[10.5px] text-theme-txt3 block">+30 días a futuro</span>
        </button>
      </div>

      {/* Multi-Dimensional Smart Filter Toolbar */}
      <div className="bg-theme-sur border border-theme-bor p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-theme-txt3 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por prospecto, empresa, cargo o notas..."
              className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl pl-8 pr-8 py-2 text-xs text-theme-txt outline-hidden placeholder:text-theme-txt3"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-theme-txt3 hover:text-theme-txt cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Secondary Filter Dropdowns (Priority, Status, Responsable) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority filter */}
            <div className="flex items-center gap-1.5 bg-theme-sur2 border border-theme-bor rounded-xl px-2.5 py-1 text-xs text-theme-txt2">
              <Star className="w-3.5 h-3.5 text-[#f59e0b]" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent text-theme-txt outline-hidden cursor-pointer text-xs"
              >
                <option value="all">Prioridad: Todas</option>
                <option value="2_3">🔥 Posibles Compradores (2⭐ y 3⭐)</option>
                <option value="3">⭐⭐⭐ Alta (3 estrellas)</option>
                <option value="2">⭐⭐ Media (2 estrellas)</option>
                <option value="1">⭐ Normal (1 estrella)</option>
              </select>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5 bg-theme-sur2 border border-theme-bor rounded-xl px-2.5 py-1 text-xs text-theme-txt2">
              <Filter className="w-3.5 h-3.5 text-[#00a870]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-theme-txt outline-hidden cursor-pointer text-xs"
              >
                <option value="all">Estado: Todos</option>
                <option value="Sin contactar">Sin contactar</option>
                <option value="En contacto">En contacto</option>
                <option value="Oportunidad">Oportunidad</option>
                <option value="Cliente">Cliente</option>
                <option value="Seguimiento">Seguimiento</option>
              </select>
            </div>
          </div>
        </div>

        {/* Team Member Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-theme-bor/60">
          <span className="text-[11px] font-mono text-theme-txt3 uppercase tracking-wider">Responsable:</span>
          <button
            onClick={() => setMemberFilter('')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              memberFilter === ''
                ? 'bg-[#00a870] text-[#00110b] shadow-xs'
                : 'bg-theme-sur2 text-theme-txt2 hover:text-theme-txt border border-theme-bor'
            }`}
          >
            Todos
          </button>
          {teamMembers.map((m) => (
            <button
              key={m.id}
              onClick={() => setMemberFilter(memberFilter === m.name ? '' : m.name)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                memberFilter === m.name
                  ? 'bg-[#2979ff] text-white shadow-xs'
                  : 'bg-theme-sur2 text-theme-txt2 hover:text-theme-txt border border-theme-bor'
              }`}
            >
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: m.color || '#2979ff' }} 
              />
              <span>{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center p-16 text-xs text-theme-txt2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff6d3b] animate-ping" />
            <span>Cargando agenda de seguimientos...</span>
          </div>
        </div>
      ) : filteredReminders.length === 0 ? (
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-12 text-center text-xs text-theme-txt2 space-y-2 shadow-xs">
          <Calendar className="w-10 h-10 text-theme-txt3 mx-auto opacity-40" />
          <h3 className="font-bold text-sm text-theme-txt">No se encontraron seguimientos con los filtros actuales</h3>
          <p className="max-w-md mx-auto text-theme-txt3">
            Intenta cambiar el segmento temporal, limpiar la búsqueda o ajustar el filtro de prioridad y responsable.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setActiveSegment('all');
                setSearch('');
                setPriorityFilter('all');
                setStatusFilter('all');
                setMemberFilter('');
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#00a870]/15 text-[#00a870] hover:bg-[#00a870]/25 border border-[#00a870]/30 cursor-pointer"
            >
              Restablecer Filtros
            </button>
          </div>
        </div>
      ) : viewLayout === 'grouped' ? (
        /* Grouped View by Timeline Urgency */
        <div className="space-y-6">
          {(Object.keys(BUCKET_CONFIG) as BucketKey[]).map((bucketKey) => {
            const list = groupedReminders[bucketKey];
            if (!list || list.length === 0) return null;

            const config = BUCKET_CONFIG[bucketKey];
            const Icon = config.icon;
            const isCollapsed = Boolean(collapsedSections[bucketKey]);

            return (
              <div 
                key={bucketKey}
                className="bg-theme-sur border border-theme-bor rounded-2xl overflow-hidden shadow-xs transition-all"
              >
                {/* Section Header */}
                <button
                  type="button"
                  onClick={() => toggleSectionCollapse(bucketKey)}
                  className={`w-full p-4 px-5 border-b border-theme-bor flex items-center justify-between transition-colors cursor-pointer text-left ${config.borderClass}`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: `${config.accentColor}20`, color: config.accentColor }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-theme-txt">{config.title}</h3>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded-full border ${config.badgeClass}`}>
                          {list.length} {list.length === 1 ? 'prospecto' : 'prospectos'}
                        </span>
                      </div>
                      <p className="text-xs text-theme-txt2">{config.subtitle}</p>
                    </div>
                  </div>

                  <div className="text-theme-txt3 hover:text-theme-txt p-1 rounded-lg">
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </button>

                {/* Section Cards */}
                {!isCollapsed && (
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {list.map((r) => renderCard(r))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReminders.map((r) => renderCard(r))}
        </div>
      )}
    </div>
  );
}
