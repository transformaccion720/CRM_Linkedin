'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FollowUpReminder, TeamMember, Contact, ContactStatus, BusinessSegment } from '@/lib/types';
import { 
  Calendar, Clock, AlertTriangle, CheckCircle2, UserCheck, ExternalLink, 
  Search, RefreshCw, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, CalendarDays, Star, MessageSquare, Phone, 
  Filter, LayoutGrid, LayoutList, Flame, Users, Sparkles, Loader2, X, Building2, Briefcase, DollarSign,
  ListOrdered, ArrowUpDown, ShieldAlert, CheckCircle, MapPin
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

type PipelineGroup = 'all' | 'contacted' | 'in_conversation' | 'meeting' | 'opportunity_won';

type OverdueSubBucket = 'all' | 'overdue_week_plus' | 'overdue_this_week' | 'overdue_yesterday' | 'today' | 'tomorrow' | 'this_week';

type TableSort = 'urgency' | 'priority' | 'date_asc' | 'date_desc' | 'deal_value';

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface FollowUpStats {
  total: number;
  overdue: number;
  overdue_week_plus: number;
  overdue_this_week: number;
  overdue_yesterday: number;
  today: number;
  tomorrow: number;
  this_week: number;
  plus_1_day: number;
  plus_3_days: number;
  plus_1_week: number;
  plus_1_month: number;
  future: number;
  upcoming: number;
  b2bCount?: number;
  b2cCount?: number;
  contactedCount?: number;
  inConversationCount?: number;
  meetingCount?: number;
  opportunityWonCount?: number;
}

export default function FollowUpsCalendarView({
  currentUser,
  teamMembers = [],
  onOpenContactDrawer,
  onOpenTemplates,
}: FollowUpsCalendarViewProps) {
  const [reminders, setReminders] = useState<FollowUpReminder[]>([]);
  const [stats, setStats] = useState<FollowUpStats>({
    total: 0,
    overdue: 0,
    overdue_week_plus: 0,
    overdue_this_week: 0,
    overdue_yesterday: 0,
    today: 0,
    tomorrow: 0,
    this_week: 0,
    plus_1_day: 0,
    plus_3_days: 0,
    plus_1_week: 0,
    plus_1_month: 0,
    future: 0,
    upcoming: 0,
    b2bCount: 0,
    b2cCount: 0,
    contactedCount: 0,
    inConversationCount: 0,
    meetingCount: 0,
    opportunityWonCount: 0,
  });

  // Filters & State
  const [businessSegment, setBusinessSegment] = useState<'all' | 'B2B' | 'B2C'>('all');
  const [memberFilter, setMemberFilter] = useState<string>('');
  const [pipelineGroup, setPipelineGroup] = useState<PipelineGroup>('all');
  const [overdueSubFilter, setOverdueSubFilter] = useState<OverdueSubBucket>('all');
  const [activeSegment, setActiveSegment] = useState<'all' | BucketKey>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [viewLayout, setViewLayout] = useState<'table' | 'calendar' | 'grouped' | 'grid'>('table');
  const [tableSort, setTableSort] = useState<TableSort>('urgency');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [openingContactId, setOpeningContactId] = useState<string | null>(null);

  // Google Calendar Month State
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date());

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (businessSegment !== 'all') params.set('segment', businessSegment);
      if (memberFilter && memberFilter !== 'all') params.set('member', memberFilter);
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (pipelineGroup !== 'all') params.set('pipelineGroup', pipelineGroup);

      const res = await fetch(`/api/follow-ups?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReminders(data.reminders || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (e) {
      console.error('Error fetching follow-ups:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, [businessSegment, memberFilter, statusFilter, pipelineGroup]);

  const toggleSectionCollapse = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleManageClick = async (contactId: string) => {
    if (!onOpenContactDrawer) return;
    setOpeningContactId(contactId);
    try {
      await onOpenContactDrawer(contactId);
    } finally {
      setOpeningContactId(null);
    }
  };

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
      business_segment: r.business_segment,
      deal_value: r.deal_value,
      next_step: r.next_step,
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

  // Helper for overdue sub-bucket badge & styling
  const getOverdueSubBadge = (subBucket?: string, daysDiff: number = 0) => {
    if (subBucket === 'overdue_week_plus') {
      return {
        label: `Vencido Crítico (${Math.abs(daysDiff)}d atrás)`,
        shortLabel: `Vencido +1 sem (${Math.abs(daysDiff)}d)`,
        bg: 'bg-red-500/15 text-red-500 border-red-500/30',
        dot: 'bg-red-500',
        severity: 'critical'
      };
    }
    if (subBucket === 'overdue_this_week') {
      return {
        label: `Vencido esta sem (${Math.abs(daysDiff)}d atrás)`,
        shortLabel: `Vencido ${Math.abs(daysDiff)}d`,
        bg: 'bg-[#ff6d3b]/15 text-[#ff6d3b] border-[#ff6d3b]/30',
        dot: 'bg-[#ff6d3b]',
        severity: 'high'
      };
    }
    if (subBucket === 'overdue_yesterday') {
      return {
        label: `Vencido ayer (-1d)`,
        shortLabel: `Ayer (-1d)`,
        bg: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30',
        dot: 'bg-[#f59e0b]',
        severity: 'medium'
      };
    }
    if (subBucket === 'today') {
      return {
        label: `Para Hoy (0d)`,
        shortLabel: `Para Hoy`,
        bg: 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30',
        dot: 'bg-[#00a870]',
        severity: 'today'
      };
    }
    if (subBucket === 'tomorrow') {
      return {
        label: `Mañana (+1d)`,
        shortLabel: `Mañana`,
        bg: 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30',
        dot: 'bg-[#2979ff]',
        severity: 'tomorrow'
      };
    }
    if (subBucket === 'this_week') {
      return {
        label: `Esta semana (+${daysDiff}d)`,
        shortLabel: `En ${daysDiff}d`,
        bg: 'bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/30',
        dot: 'bg-[#a855f7]',
        severity: 'week'
      };
    }
    return {
      label: `Futuro (+${daysDiff}d)`,
      shortLabel: `+${daysDiff}d`,
      bg: 'bg-theme-sur2 text-theme-txt3 border-theme-bor',
      dot: 'bg-theme-txt3',
      severity: 'future'
    };
  };

  // Helper for pipeline stage badges
  const getStageBadge = (status: string, isB2B: boolean) => {
    switch (status) {
      case 'Contactado':
        return { label: '1. Contactado', bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30' };
      case 'Conversación iniciada':
        return { label: '2. Conversación activa', bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' };
      case 'Discovery / reunión':
        return { label: '3. Discovery / reunión', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'Oportunidad calificada':
      case 'Propuesta enviada':
      case 'Negociación':
        return { label: status, bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      case 'Ganada':
      case 'Cliente':
        return { label: status, bg: 'bg-[#00e5a0]/15 text-[#00e5a0] border-[#00e5a0]/30' };
      case 'En contacto':
        return { label: '1. En contacto', bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30' };
      case 'Seguimiento':
        return { label: '2. Seguimiento activo', bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' };
      case 'Oportunidad':
        return { label: '3. Oportunidad', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      default:
        return { label: status, bg: 'bg-theme-sur2 text-theme-txt2 border-theme-bor' };
    }
  };

  const formatFollowUpDate = (dateStr: string | null) => {
    if (!dateStr) return 'Sin fecha';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()];
      const monthShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][d.getMonth()];
      return `${dayName}, ${parts[2]} ${monthShort} ${parts[0]}`;
    }
    return dateStr;
  };

  // Filter list by Radar Overdue Sub-Bucket + Search + Priority + Time bucket
  const filteredReminders = useMemo(() => {
    return reminders.filter((r) => {
      // 1. Radar Overdue Sub-bucket filter
      if (overdueSubFilter !== 'all' && r.overdue_sub_bucket !== overdueSubFilter) {
        return false;
      }

      // 2. Time bucket filter (only for grouped/grid views)
      if (viewLayout !== 'calendar' && viewLayout !== 'table' && activeSegment !== 'all' && r.time_bucket !== activeSegment) {
        return false;
      }

      // 3. Priority filter
      if (priorityFilter !== 'all') {
        if (priorityFilter === '2_3') {
          if (r.priority < 2) return false;
        } else {
          const pNum = parseInt(priorityFilter, 10);
          if (r.priority !== pNum) return false;
        }
      }

      // 4. Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = `${r.first_name} ${r.last_name || ''}`.toLowerCase().includes(q);
        const matchCompany = (r.company || '').toLowerCase().includes(q);
        const matchPos = (r.position || '').toLowerCase().includes(q);
        const matchNotes = (r.notes || '').toLowerCase().includes(q);
        const matchStep = (r.next_step || '').toLowerCase().includes(q);
        return matchName || matchCompany || matchPos || matchNotes || matchStep;
      }

      return true;
    });
  }, [reminders, overdueSubFilter, activeSegment, priorityFilter, search, viewLayout]);

  // Sorted list for Table View
  const sortedTableReminders = useMemo(() => {
    return [...filteredReminders].sort((a, b) => {
      if (tableSort === 'urgency') {
        return (a.days_diff ?? 999) - (b.days_diff ?? 999);
      }
      if (tableSort === 'priority') {
        return (b.priority ?? 0) - (a.priority ?? 0);
      }
      if (tableSort === 'date_asc') {
        return (a.follow_up_date || '').localeCompare(b.follow_up_date || '');
      }
      if (tableSort === 'date_desc') {
        return (b.follow_up_date || '').localeCompare(a.follow_up_date || '');
      }
      if (tableSort === 'deal_value') {
        return (b.deal_value ?? 0) - (a.deal_value ?? 0);
      }
      return 0;
    });
  }, [filteredReminders, tableSort]);

  // Group filtered reminders by time bucket for Grouped view
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

  // Group reminders by date string (YYYY-MM-DD) for Google Calendar view
  const remindersByDate = useMemo(() => {
    const map: Record<string, FollowUpReminder[]> = {};
    filteredReminders.forEach((r) => {
      if (r.follow_up_date) {
        if (!map[r.follow_up_date]) map[r.follow_up_date] = [];
        map[r.follow_up_date].push(r);
      }
    });
    return map;
  }, [filteredReminders]);

  // Calendar Grid Builder (Google Calendar style 7x6 / 7x5)
  const calendarGrid = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const todayStr = new Date().toISOString().split('T')[0];

    const cells: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      const isoStr = prevDate.toISOString().split('T')[0];
      cells.push({
        dateStr: isoStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: isoStr === todayStr,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const currDate = new Date(year, month, d);
      const isoStr = currDate.toISOString().split('T')[0];
      cells.push({
        dateStr: isoStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: isoStr === todayStr,
      });
    }

    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const isoStr = nextDate.toISOString().split('T')[0];
      cells.push({
        dateStr: isoStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: isoStr === todayStr,
      });
    }

    return cells;
  }, [calendarDate]);

  const nextMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToToday = () => {
    setCalendarDate(new Date());
  };

  const renderCard = (r: FollowUpReminder) => {
    const isOpening = openingContactId === r.id;
    const bucketCfg = BUCKET_CONFIG[r.time_bucket in BUCKET_CONFIG ? (r.time_bucket as BucketKey) : 'future'];
    const isB2B = r.business_segment === 'B2B';
    const overdueBadge = getOverdueSubBadge(r.overdue_sub_bucket, r.days_diff);
    const stageBadge = getStageBadge(r.status, isB2B);

    return (
      <div
        key={r.id}
        onClick={() => handleManageClick(r.id)}
        className={`bg-theme-sur border rounded-2xl p-4.5 shadow-xs flex flex-col justify-between space-y-3 transition-all cursor-pointer hover:shadow-md ${bucketCfg.cardBorder}`}
      >
        <div className="space-y-2.5">
          {/* Top meta tags */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Segment Flag */}
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                isB2B 
                  ? 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30' 
                  : 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30'
              }`}>
                {isB2B ? <Building2 className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                <span>{isB2B ? 'B2B Corporativo' : 'B2C Alumnos'}</span>
              </span>

              {/* Urgency Badge */}
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 ${overdueBadge.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${overdueBadge.dot}`} />
                <span>{overdueBadge.label}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Stars badge */}
              {r.priority > 1 && (
                <span className="flex items-center text-[10px] text-[#f59e0b]" title={`Prioridad: ${r.priority} estrellas`}>
                  {Array.from({ length: r.priority }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </span>
              )}

              <span className="text-[10px] font-mono text-theme-txt3 bg-theme-sur2 px-2 py-0.5 rounded border border-theme-bor">
                {r.assigned_to}
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-sm text-theme-txt hover:text-[#00a870] transition-colors leading-snug">
                {r.first_name} {r.last_name || ''}
              </h3>
              {isB2B && r.deal_value && r.deal_value > 0 ? (
                <span className="text-xs font-mono font-bold text-[#00e5a0] bg-[#00e5a0]/10 px-2 py-0.5 rounded border border-[#00e5a0]/30 shrink-0">
                  ${r.deal_value.toLocaleString()} USD
                </span>
              ) : null}
            </div>
            <p className="text-xs text-theme-txt2 line-clamp-1 mt-0.5">
              {r.position || 'Sin cargo'} {r.company ? `• ${r.company}` : ''}
            </p>
          </div>

          {/* Pipeline Stage Banner */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded border ${stageBadge.bg}`}>
              {stageBadge.label}
            </span>
            <span className="text-[10.5px] font-mono text-theme-txt3">
              {formatFollowUpDate(r.follow_up_date)}
            </span>
          </div>

          {/* Next Step if present */}
          {r.next_step && (
            <div className="p-2 rounded-xl bg-[#2979ff]/10 border border-[#2979ff]/20 text-xs text-[#2979ff] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium truncate">Paso: {r.next_step}</span>
            </div>
          )}

          {/* Notes preview */}
          {r.notes ? (
            <div className="p-2.5 rounded-xl bg-theme-sur2 border border-theme-bor text-xs text-theme-txt2 italic line-clamp-2">
              &quot;{r.notes}&quot;
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-theme-sur2/40 border border-theme-bor/60 text-[11px] text-theme-txt3 italic">
              Sin notas adicionales
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2.5 border-t border-theme-bor flex items-center justify-between">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-sur2 text-theme-txt3 border border-theme-bor/60">
            {r.country || 'Sin país'}
          </span>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {onOpenTemplates && (
              <button
                onClick={() => handleOpenTemplatesHelper(r)}
                className="p-1.5 rounded-lg bg-theme-sur2 hover:bg-[#2979ff]/15 text-theme-txt2 hover:text-[#2979ff] border border-theme-bor cursor-pointer transition-colors"
                title="Redactar mensaje comercial con plantillas"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            )}

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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-theme-bg">
      {/* Header & Metric Banner with Segment Selector */}
      <div className="bg-theme-sur p-5 rounded-2xl border border-theme-bor shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff6d3b] font-bold bg-[#ff6d3b]/10 px-2 py-0.5 rounded flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#ff6d3b]" />
              <span>Agenda de Seguimientos Comercial</span>
            </span>
            <span className="text-[10px] font-mono text-theme-txt3 bg-theme-sur2 px-2 py-0.5 rounded border border-theme-bor">
              {stats.total} programados
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              businessSegment === 'B2B' 
                ? 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30' 
                : businessSegment === 'B2C' 
                ? 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30' 
                : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
            }`}>
              {businessSegment === 'B2B' ? '🏢 B2B Corporativo' : businessSegment === 'B2C' ? '👤 B2C Alumnos' : '🌐 Vista Consolidada'}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-theme-txt">
            Seguimiento de Agenda y Radar de Vencimientos
          </h2>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Mapeo cronológico y estratégico para atacar invitaciones, conversaciones activas, reuniones y cierres tanto B2B como B2C.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segment Selector: Todos vs B2B vs B2C */}
          <div className="flex items-center bg-theme-sur2 border border-theme-bor p-1 rounded-xl shadow-2xs">
            <button
              onClick={() => setBusinessSegment('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                businessSegment === 'all'
                  ? 'bg-theme-sur text-theme-txt shadow-xs border border-theme-bor'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
            >
              <span>🌐</span>
              <span>Todos</span>
            </button>
            <button
              onClick={() => setBusinessSegment('B2B')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                businessSegment === 'B2B'
                  ? 'bg-[#2979ff] text-white shadow-xs font-extrabold'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>B2B ({stats.b2bCount ?? 0})</span>
            </button>
            <button
              onClick={() => setBusinessSegment('B2C')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                businessSegment === 'B2C'
                  ? 'bg-[#00a870] text-white shadow-xs font-extrabold'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>B2C ({stats.b2cCount ?? 0})</span>
            </button>
          </div>

          {/* View Mode Toggle: Tabla Ordenada vs Google Calendar vs Vencimientos vs Cuadrícula */}
          <div className="flex items-center bg-theme-sur2 p-1 rounded-xl border border-theme-bor text-xs">
            <button
              onClick={() => setViewLayout('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewLayout === 'table'
                  ? 'bg-[#00a870] text-[#00110b] shadow-xs font-extrabold'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
              title="Tabla de Seguimiento Ordenado con prioridades y acciones"
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Tabla Ordenada</span>
            </button>
            <button
              onClick={() => setViewLayout('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewLayout === 'calendar'
                  ? 'bg-[#2979ff] text-white shadow-xs'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
              title="Vista mensual estilo Google Calendar"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendario</span>
            </button>
            <button
              onClick={() => setViewLayout('grouped')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewLayout === 'grouped'
                  ? 'bg-theme-sur text-theme-txt border border-theme-bor shadow-xs'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
              title="Vista agrupada por urgencia temporal"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Bloques</span>
            </button>
            <button
              onClick={() => setViewLayout('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewLayout === 'grid'
                  ? 'bg-theme-sur text-theme-txt border border-theme-bor shadow-xs'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
              title="Vista en cuadrícula plana"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tarjetas</span>
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

      {/* RADAR DE VENCIMIENTOS POR SEMANA Y DÍA (INTERACTIVO) */}
      <div className="bg-theme-sur border border-theme-bor p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff6d3b] animate-pulse" />
            <h3 className="text-xs font-extrabold text-theme-txt font-mono uppercase tracking-wider">
              Radar de Vencimientos: Por Semana y Día
            </h3>
            <span className="text-[10.5px] text-theme-txt3 hidden md:inline">
              (Haz clic en un cuadrante para filtrar inmediatamente)
            </span>
          </div>

          {overdueSubFilter !== 'all' && (
            <button
              onClick={() => setOverdueSubFilter('all')}
              className="text-[11px] font-mono text-[#2979ff] hover:underline flex items-center gap-1 cursor-pointer font-bold"
            >
              <span>Mostrar todos ({stats.total})</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* 1. Vencido >1 sem */}
          <button
            type="button"
            onClick={() => setOverdueSubFilter(overdueSubFilter === 'overdue_week_plus' ? 'all' : 'overdue_week_plus')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              overdueSubFilter === 'overdue_week_plus'
                ? 'bg-red-500/20 border-red-500 ring-2 ring-red-500/40 shadow-xs'
                : 'bg-theme-sur2/60 border-red-500/30 hover:border-red-500/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-red-400 uppercase">🔴 Vencido &gt;1 sem</span>
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-mono font-extrabold text-red-500">{stats.overdue_week_plus}</div>
              <div className="text-[9.5px] text-theme-txt3 mt-0.5">Urgencia Crítica (&gt;7d)</div>
            </div>
          </button>

          {/* 2. Vencido 2 a 6 días */}
          <button
            type="button"
            onClick={() => setOverdueSubFilter(overdueSubFilter === 'overdue_this_week' ? 'all' : 'overdue_this_week')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              overdueSubFilter === 'overdue_this_week'
                ? 'bg-[#ff6d3b]/20 border-[#ff6d3b] ring-2 ring-[#ff6d3b]/40 shadow-xs'
                : 'bg-theme-sur2/60 border-[#ff6d3b]/30 hover:border-[#ff6d3b]/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#ff6d3b] uppercase">🟠 Vencido 2-6d</span>
              <AlertTriangle className="w-3.5 h-3.5 text-[#ff6d3b]" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-mono font-extrabold text-[#ff6d3b]">{stats.overdue_this_week}</div>
              <div className="text-[9.5px] text-theme-txt3 mt-0.5">Semana en curso (-2 a -6d)</div>
            </div>
          </button>

          {/* 3. Vencido Ayer */}
          <button
            type="button"
            onClick={() => setOverdueSubFilter(overdueSubFilter === 'overdue_yesterday' ? 'all' : 'overdue_yesterday')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              overdueSubFilter === 'overdue_yesterday'
                ? 'bg-[#f59e0b]/20 border-[#f59e0b] ring-2 ring-[#f59e0b]/40 shadow-xs'
                : 'bg-theme-sur2/60 border-[#f59e0b]/30 hover:border-[#f59e0b]/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#f59e0b] uppercase">🟡 Vencido Ayer</span>
              <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-mono font-extrabold text-[#f59e0b]">{stats.overdue_yesterday}</div>
              <div className="text-[9.5px] text-theme-txt3 mt-0.5">Ayer (-1 día)</div>
            </div>
          </button>

          {/* 4. Para Hoy */}
          <button
            type="button"
            onClick={() => setOverdueSubFilter(overdueSubFilter === 'today' ? 'all' : 'today')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              overdueSubFilter === 'today'
                ? 'bg-[#00a870]/20 border-[#00a870] ring-2 ring-[#00a870]/40 shadow-xs'
                : 'bg-theme-sur2/60 border-[#00a870]/30 hover:border-[#00a870]/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#00a870] uppercase">🟢 Para Hoy</span>
              <Flame className="w-3.5 h-3.5 text-[#00a870]" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-mono font-extrabold text-[#00a870]">{stats.today}</div>
              <div className="text-[9.5px] text-theme-txt3 mt-0.5">Plan comercial de hoy (0d)</div>
            </div>
          </button>

          {/* 5. Mañana */}
          <button
            type="button"
            onClick={() => setOverdueSubFilter(overdueSubFilter === 'tomorrow' ? 'all' : 'tomorrow')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              overdueSubFilter === 'tomorrow'
                ? 'bg-[#2979ff]/20 border-[#2979ff] ring-2 ring-[#2979ff]/40 shadow-xs'
                : 'bg-theme-sur2/60 border-[#2979ff]/30 hover:border-[#2979ff]/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#2979ff] uppercase">🔵 Mañana</span>
              <Clock className="w-3.5 h-3.5 text-[#2979ff]" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-mono font-extrabold text-[#2979ff]">{stats.tomorrow}</div>
              <div className="text-[9.5px] text-theme-txt3 mt-0.5">Preparar para mañana (+1d)</div>
            </div>
          </button>

          {/* 6. Próximos esta semana */}
          <button
            type="button"
            onClick={() => setOverdueSubFilter(overdueSubFilter === 'this_week' ? 'all' : 'this_week')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              overdueSubFilter === 'this_week'
                ? 'bg-[#a855f7]/20 border-[#a855f7] ring-2 ring-[#a855f7]/40 shadow-xs'
                : 'bg-theme-sur2/60 border-[#a855f7]/30 hover:border-[#a855f7]/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#a855f7] uppercase">🟣 En la semana</span>
              <CalendarDays className="w-3.5 h-3.5 text-[#a855f7]" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-mono font-extrabold text-[#a855f7]">{stats.this_week}</div>
              <div className="text-[9.5px] text-theme-txt3 mt-0.5">Próximos 2 a 7 días</div>
            </div>
          </button>
        </div>
      </div>

      {/* FILTRO ESTRATÉGICO DE PIPELINE: CÓMO ATACAR PROSPECTOS */}
      <div className="bg-theme-sur border border-theme-bor p-3.5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-mono text-theme-txt3 uppercase tracking-wider font-bold shrink-0 mr-1">
            Estrategia de Ataque:
          </span>
          <button
            type="button"
            onClick={() => setPipelineGroup('all')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              pipelineGroup === 'all'
                ? 'bg-theme-txt text-theme-sur shadow-xs'
                : 'bg-theme-sur2 text-theme-txt2 hover:text-theme-txt border border-theme-bor'
            }`}
          >
            Todos ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setPipelineGroup('contacted')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              pipelineGroup === 'contacted'
                ? 'bg-sky-500 text-white shadow-xs font-extrabold'
                : 'bg-theme-sur2 text-theme-txt2 hover:text-sky-400 border border-theme-bor'
            }`}
            title="Prospectos con invitación enviada o primer contacto"
          >
            <span>🎯 1. Invitación / Contactado</span>
            <span className="text-[10px] font-mono opacity-85">({stats.contactedCount ?? 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setPipelineGroup('in_conversation')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              pipelineGroup === 'in_conversation'
                ? 'bg-indigo-500 text-white shadow-xs font-extrabold'
                : 'bg-theme-sur2 text-theme-txt2 hover:text-indigo-400 border border-theme-bor'
            }`}
            title="Prospectos con conversación activa o diálogo en curso"
          >
            <span>💬 2. Conversación activa</span>
            <span className="text-[10px] font-mono opacity-85">({stats.inConversationCount ?? 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setPipelineGroup('meeting')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              pipelineGroup === 'meeting'
                ? 'bg-emerald-500 text-white shadow-xs font-extrabold'
                : 'bg-theme-sur2 text-theme-txt2 hover:text-emerald-400 border border-theme-bor'
            }`}
            title="Discovery o reuniones programadas"
          >
            <span>📅 3. Reunión / Discovery</span>
            <span className="text-[10px] font-mono opacity-85">({stats.meetingCount ?? 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setPipelineGroup('opportunity_won')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              pipelineGroup === 'opportunity_won'
                ? 'bg-amber-500 text-white shadow-xs font-extrabold'
                : 'bg-theme-sur2 text-theme-txt2 hover:text-amber-400 border border-theme-bor'
            }`}
            title="Oportunidades calificadas, propuestas y cierres"
          >
            <span>💼 4. Oportunidades & Cierres</span>
            <span className="text-[10px] font-mono opacity-85">({stats.opportunityWonCount ?? 0})</span>
          </button>
        </div>

        {/* Quick Clear when filtered */}
        {(pipelineGroup !== 'all' || overdueSubFilter !== 'all' || search) && (
          <button
            onClick={() => {
              setPipelineGroup('all');
              setOverdueSubFilter('all');
              setSearch('');
            }}
            className="text-xs text-theme-txt3 hover:text-[#ff6d3b] flex items-center gap-1 cursor-pointer shrink-0 font-medium"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Multi-Dimensional Filter Toolbar: Search, Specific Pipeline Stage, Priority & Responsable */}
      <div className="bg-theme-sur border border-theme-bor p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-theme-txt3 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar prospecto, empresa, cargo, notas o próximo paso..."
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

          {/* Secondary Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Specific Pipeline stage filter */}
            <div className="flex items-center gap-1.5 bg-theme-sur2 border border-theme-bor rounded-xl px-2.5 py-1 text-xs text-theme-txt2">
              <Filter className="w-3.5 h-3.5 text-[#00a870]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-theme-txt outline-hidden cursor-pointer text-xs font-medium"
              >
                <option value="all">Etapas Individuales: Todas</option>
                <optgroup label="🏢 B2B Pipeline Completo">
                  <option value="Contactado">Contactado (Primer acercamiento)</option>
                  <option value="Conversación iniciada">Conversación iniciada</option>
                  <option value="Discovery / reunión">Discovery / reunión</option>
                  <option value="Oportunidad calificada">Oportunidad calificada</option>
                  <option value="Propuesta enviada">Propuesta enviada</option>
                  <option value="Negociación">Negociación</option>
                  <option value="Ganada">Ganada</option>
                </optgroup>
                <optgroup label="👤 B2C Pipeline Completo">
                  <option value="En contacto">En contacto</option>
                  <option value="Seguimiento">Seguimiento activo</option>
                  <option value="Oportunidad">Oportunidad</option>
                  <option value="Cliente">Cliente</option>
                </optgroup>
              </select>
            </div>

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
          </div>
        </div>

        {/* Team Member Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-theme-bor/60">
          <span className="text-[11px] font-mono text-theme-txt3 uppercase tracking-wider font-bold">
            Responsable:
          </span>
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
            <div className="w-2.5 h-2.5 rounded-full bg-[#2979ff] animate-ping" />
            <span>Cargando agenda comercial y radar de vencimientos...</span>
          </div>
        </div>
      ) : filteredReminders.length === 0 && viewLayout !== 'calendar' ? (
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-12 text-center text-xs text-theme-txt2 space-y-2 shadow-xs">
          <Calendar className="w-10 h-10 text-theme-txt3 mx-auto opacity-40" />
          <h3 className="font-bold text-sm text-theme-txt">No se encontraron seguimientos con los filtros seleccionados</h3>
          <p className="max-w-md mx-auto text-theme-txt3">
            Intenta cambiar el cuadrante de vencimientos, el segmento (B2B/B2C) o restablecer los filtros para ver todos los prospectos agendados.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setBusinessSegment('all');
                setPipelineGroup('all');
                setOverdueSubFilter('all');
                setActiveSegment('all');
                setSearch('');
                setPriorityFilter('all');
                setStatusFilter('all');
                setMemberFilter('');
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#00a870]/15 text-[#00a870] hover:bg-[#00a870]/25 border border-[#00a870]/30 cursor-pointer"
            >
              Restablecer Todos los Filtros
            </button>
          </div>
        </div>
      ) : viewLayout === 'table' ? (
        /* TABLA DE SEGUIMIENTO ORDENADO (VISTA PRINCIPAL SOLICITADA) */
        <div className="bg-theme-sur border border-theme-bor rounded-2xl shadow-xs overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-4 border-b border-theme-bor flex flex-wrap items-center justify-between gap-3 bg-theme-sur2/40">
            <div className="flex items-center gap-2.5">
              <ListOrdered className="w-4 h-4 text-[#00a870]" />
              <span className="text-xs font-extrabold text-theme-txt">
                Tabla de Seguimiento Ordenado ({sortedTableReminders.length} prospectos)
              </span>
              <span className="text-[11px] text-theme-txt3 hidden sm:inline">
                • Orden prioritario para ejecución comercial
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-theme-txt3 font-mono text-[11px] font-bold">Ordenar por:</span>
              <select
                value={tableSort}
                onChange={(e) => setTableSort(e.target.value as TableSort)}
                className="bg-theme-sur border border-theme-bor focus:border-[#00a870] rounded-lg px-2.5 py-1 text-xs text-theme-txt font-semibold outline-hidden cursor-pointer"
              >
                <option value="urgency">⚠️ Urgencia (Más atrasados primero)</option>
                <option value="priority">⭐ Prioridad Comercial (3⭐ primero)</option>
                <option value="date_asc">📅 Fecha (Cronológico próximo)</option>
                <option value="date_desc">📅 Fecha (Futuro a pasado)</option>
                <option value="deal_value">💰 Mayor Valor Deal (USD)</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-theme-bor bg-theme-sur2/60 text-theme-txt2 font-mono text-[10.5px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Urgencia / Vencimiento</th>
                  <th className="py-3 px-4 font-bold">Fecha Agendada</th>
                  <th className="py-3 px-4 font-bold">Prospecto & Cargo</th>
                  <th className="py-3 px-3 font-bold">Segmento</th>
                  <th className="py-3 px-3 font-bold">Etapa Pipeline</th>
                  <th className="py-3 px-3 font-bold">Deal USD</th>
                  <th className="py-3 px-3 font-bold text-center">Prioridad</th>
                  <th className="py-3 px-4 font-bold">Próximo Paso / Notas</th>
                  <th className="py-3 px-3 font-bold">Responsable</th>
                  <th className="py-3 px-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-bor/60">
                {sortedTableReminders.map((r) => {
                  const isB2B = r.business_segment === 'B2B';
                  const overdueBadge = getOverdueSubBadge(r.overdue_sub_bucket, r.days_diff);
                  const stageBadge = getStageBadge(r.status, isB2B);
                  const isOpening = openingContactId === r.id;

                  return (
                    <tr 
                      key={r.id}
                      onClick={() => handleManageClick(r.id)}
                      className="hover:bg-theme-sur2/50 transition-colors cursor-pointer group"
                    >
                      {/* Urgencia / Vencimiento */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-md border ${overdueBadge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${overdueBadge.dot}`} />
                          <span>{overdueBadge.label}</span>
                        </span>
                      </td>

                      {/* Fecha Agendada */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-theme-txt">
                        <div className="font-bold">{formatFollowUpDate(r.follow_up_date)}</div>
                        <div className="text-[10px] text-theme-txt3 font-sans">
                          {r.days_diff === 0 ? 'Hoy' : r.days_diff < 0 ? `Hace ${Math.abs(r.days_diff)} días` : `En ${r.days_diff} días`}
                        </div>
                      </td>

                      {/* Prospecto & Cargo */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="font-bold text-theme-txt group-hover:text-[#00a870] transition-colors truncate">
                          {r.first_name} {r.last_name || ''}
                        </div>
                        <div className="text-[11px] text-theme-txt2 truncate mt-0.5">
                          {r.position || 'Sin cargo'}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-theme-txt3 truncate">
                          {r.company && <span>{r.company}</span>}
                          {r.country && <span>• {r.country}</span>}
                        </div>
                      </td>

                      {/* Segmento */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 w-fit ${
                          isB2B 
                            ? 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30' 
                            : 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30'
                        }`}>
                          {isB2B ? <Building2 className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                          <span>{isB2B ? 'B2B' : 'B2C'}</span>
                        </span>
                      </td>

                      {/* Etapa Pipeline */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded border ${stageBadge.bg}`}>
                          {stageBadge.label}
                        </span>
                      </td>

                      {/* Deal USD */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono">
                        {isB2B && r.deal_value && r.deal_value > 0 ? (
                          <span className="font-bold text-[#00e5a0] bg-[#00e5a0]/10 px-1.5 py-0.5 rounded border border-[#00e5a0]/30">
                            ${r.deal_value.toLocaleString()} USD
                          </span>
                        ) : (
                          <span className="text-theme-txt3">-</span>
                        )}
                      </td>

                      {/* Prioridad */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {r.priority > 0 ? (
                          <div className="flex items-center justify-center text-[#f59e0b]">
                            {Array.from({ length: r.priority }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        ) : (
                          <span className="text-theme-txt3">-</span>
                        )}
                      </td>

                      {/* Próximo Paso / Notas */}
                      <td className="py-3 px-4 max-w-[220px]">
                        {r.next_step && (
                          <div className="text-[11px] font-semibold text-[#2979ff] truncate mb-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>{r.next_step}</span>
                          </div>
                        )}
                        {r.notes ? (
                          <div className="text-[11px] text-theme-txt2 italic line-clamp-2">
                            &quot;{r.notes}&quot;
                          </div>
                        ) : (
                          <span className="text-[10px] text-theme-txt3 italic">Sin notas</span>
                        )}
                      </td>

                      {/* Responsable */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[10.5px] text-theme-txt3">
                        <span className="bg-theme-sur2 px-2 py-0.5 rounded border border-theme-bor">
                          {r.assigned_to}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {onOpenTemplates && (
                            <button
                              onClick={() => handleOpenTemplatesHelper(r)}
                              className="p-1.5 rounded-lg bg-theme-sur2 hover:bg-[#2979ff]/15 text-theme-txt2 hover:text-[#2979ff] border border-theme-bor cursor-pointer transition-colors"
                              title="Redactar mensaje con plantillas inteligentes"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}

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

                          <button
                            onClick={() => handleManageClick(r.id)}
                            disabled={isOpening}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#00a870]/15 text-[#00a870] hover:bg-[#00a870]/25 border border-[#00a870]/30 flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                          >
                            {isOpening ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <span>Gestionar</span>
                                <ChevronRight className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewLayout === 'calendar' ? (
        /* GOOGLE CALENDAR MONTHLY VIEW */
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-4">
          {/* Calendar Header Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme-bor">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-theme-sur2 border border-theme-bor rounded-xl p-0.5">
                <button
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg text-theme-txt2 hover:text-theme-txt hover:bg-theme-sur transition-colors cursor-pointer"
                  title="Mes anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-theme-txt hover:bg-theme-sur transition-colors cursor-pointer"
                >
                  Hoy
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg text-theme-txt2 hover:text-theme-txt hover:bg-theme-sur transition-colors cursor-pointer"
                  title="Mes siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-theme-txt font-mono">
                {MONTH_NAMES[calendarDate.getMonth()]} {calendarDate.getFullYear()}
              </h3>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-theme-txt2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2979ff]" />
                <span>B2B Corporativo</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00a870]" />
                <span>B2C Alumnos</span>
              </span>
            </div>
          </div>

          {/* 7 Column Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono font-bold text-theme-txt3 uppercase tracking-wider py-1 border-b border-theme-bor/60">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>

          {/* Google Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarGrid.map((cell) => {
              const dayEvents = remindersByDate[cell.dateStr] || [];

              return (
                <div
                  key={cell.dateStr}
                  className={`min-h-[110px] sm:min-h-[125px] rounded-xl border p-2 flex flex-col justify-between transition-all ${
                    cell.isToday
                      ? 'bg-[#2979ff]/5 border-[#2979ff] shadow-xs'
                      : cell.isCurrentMonth
                      ? 'bg-theme-sur2/40 border-theme-bor hover:border-theme-bor2'
                      : 'bg-theme-sur2/10 border-theme-bor/30 opacity-40'
                  }`}
                >
                  {/* Day Number Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-mono font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        cell.isToday
                          ? 'bg-[#2979ff] text-white shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-theme-txt'
                          : 'text-theme-txt3'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[9.5px] font-mono font-bold text-theme-txt3 px-1.5 py-0.2 rounded bg-theme-sur border border-theme-bor">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event Chips List */}
                  <div className="flex-1 space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((ev) => {
                      const isB2B = ev.business_segment === 'B2B';
                      const isOverdue = ev.is_overdue;

                      return (
                        <div
                          key={ev.id}
                          onClick={() => handleManageClick(ev.id)}
                          className={`group p-1 rounded-md text-[10.5px] font-medium border truncate cursor-pointer transition-all flex items-center justify-between gap-1 shadow-2xs ${
                            isB2B
                              ? 'bg-[#2979ff]/15 hover:bg-[#2979ff]/25 text-[#2979ff] border-[#2979ff]/30'
                              : 'bg-[#00a870]/15 hover:bg-[#00a870]/25 text-[#00a870] border-[#00a870]/30'
                          }`}
                          title={`${isB2B ? '🏢 B2B' : '👤 B2C'}: ${ev.first_name} ${ev.last_name || ''} ${ev.company ? `(${ev.company})` : ''} - Etapa: ${ev.status}`}
                        >
                          <div className="flex items-center gap-1 truncate">
                            {isOverdue ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6d3b] shrink-0 animate-pulse" />
                            ) : (
                              <span className="text-[10px] shrink-0">{isB2B ? '🏢' : '👤'}</span>
                            )}
                            <span className="truncate font-semibold">
                              {ev.first_name} {ev.company ? `• ${ev.company}` : ''}
                            </span>
                            <span className="text-[9px] opacity-75 font-mono">[{ev.status.split(' ')[0]}]</span>
                          </div>

                          {isB2B && ev.deal_value && ev.deal_value > 0 ? (
                            <span className="text-[9px] font-mono font-bold text-[#00e5a0] bg-[#00e5a0]/15 px-1 rounded shrink-0">
                              ${ev.deal_value.toLocaleString()}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}

                    {dayEvents.length > 3 && (
                      <div className="text-[9.5px] font-mono text-theme-txt3 hover:text-theme-txt text-center cursor-pointer font-bold pt-0.5">
                        +{dayEvents.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
