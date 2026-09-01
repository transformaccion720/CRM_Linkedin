'use client';

import React, { useState, useEffect } from 'react';
import { FollowUpReminder, TeamMember, Contact } from '@/lib/types';
import { 
  Calendar, Clock, AlertTriangle, CheckCircle2, UserCheck, ExternalLink, 
  Search, RefreshCw, ChevronRight, CalendarDays, Star, MessageSquare, Phone, Filter
} from 'lucide-react';

interface FollowUpsCalendarViewProps {
  currentUser: TeamMember | null;
  teamMembers: TeamMember[];
  onOpenContactDrawer?: (contactId: string) => void;
  onOpenTemplates?: (contact: Contact) => void;
}

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
  const [memberFilter, setMemberFilter] = useState<string>('');
  const [activeSegment, setActiveSegment] = useState<'all' | 'today' | 'overdue' | 'plus_1_day' | 'plus_3_days' | 'plus_1_week' | 'plus_1_month'>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

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

  // Filter list by Segment + Search
  const filteredReminders = reminders.filter((r) => {
    if (activeSegment === 'today' && r.time_bucket !== 'today') return false;
    if (activeSegment === 'overdue' && r.time_bucket !== 'overdue') return false;
    if (activeSegment === 'plus_1_day' && r.time_bucket !== 'plus_1_day') return false;
    if (activeSegment === 'plus_3_days' && r.time_bucket !== 'plus_3_days' && r.time_bucket !== 'plus_1_day') return false;
    if (activeSegment === 'plus_1_week' && r.time_bucket !== 'plus_1_week') return false;
    if (activeSegment === 'plus_1_month' && r.time_bucket !== 'plus_1_month') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = `${r.first_name} ${r.last_name || ''}`.toLowerCase().includes(q);
      const matchCompany = (r.company || '').toLowerCase().includes(q);
      const matchNotes = (r.notes || '').toLowerCase().includes(q);
      return matchName || matchCompany || matchNotes;
    }
    return true;
  });

  const getBucketBadge = (bucket: string, dateStr: string, diff: number) => {
    switch (bucket) {
      case 'today':
        return { label: `🔔 HOY (${dateStr})`, bg: 'bg-[#00a870]/20 text-[#00a870] border-[#00a870]/40' };
      case 'overdue':
        return { label: `⚠️ VENCIDO (${Math.abs(diff)}d atrás - ${dateStr})`, bg: 'bg-[#ff6d3b]/20 text-[#ff6d3b] border-[#ff6d3b]/40' };
      case 'plus_1_day':
        return { label: `⚡ Mañana (+1 día - ${dateStr})`, bg: 'bg-[#2979ff]/20 text-[#2979ff] border-[#2979ff]/40' };
      case 'plus_3_days':
        return { label: `📅 Próx. 3 días (+${diff}d - ${dateStr})`, bg: 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30' };
      case 'plus_1_week':
        return { label: `🗓️ En 1 semana (+${diff}d - ${dateStr})`, bg: 'bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/30' };
      case 'plus_1_month':
        return { label: `📌 En este mes (+${diff}d - ${dateStr})`, bg: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30' };
      default:
        return { label: `📆 Futuro (+${diff}d - ${dateStr})`, bg: 'bg-theme-sur2 text-theme-txt3 border-theme-bor' };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-theme-bg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-sur p-5 rounded-2xl border border-theme-bor">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff6d3b] font-bold bg-[#ff6d3b]/10 px-2 py-0.5 rounded flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#ff6d3b]" />
              <span>Agenda de Seguimientos Segmentada</span>
            </span>
            <span className="text-[10px] font-mono text-theme-txt3">{stats.total} fechas agendadas</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-theme-txt">
            Mapeo de Seguimientos Comerciales
          </h2>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Organizados con precisión por urgencia: Hoy, Mañana (+1 día), Próximos 3 días, 1 semana y 1 mes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchFollowUps}
            disabled={loading}
            className="p-2 rounded-xl bg-theme-sur2 border border-theme-bor hover:border-[#ff6d3b] text-theme-txt2 hover:text-theme-txt text-xs flex items-center gap-1 cursor-pointer"
            title="Refrescar seguimientos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Segmented Time-Bucket Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
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
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-theme-sur border border-theme-bor p-3.5 rounded-xl flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSegment('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSegment === 'all'
                ? 'bg-[#00a870] text-[#00110b] shadow-xs font-bold'
                : 'bg-theme-sur2 text-theme-txt2 hover:text-theme-txt border border-theme-bor'
            }`}
          >
            Ver Todos ({stats.total})
          </button>

          {teamMembers.map((m) => (
            <button
              key={m.id}
              onClick={() => setMemberFilter(memberFilter === m.name ? '' : m.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                memberFilter === m.name
                  ? 'bg-[#2979ff] text-white shadow-xs'
                  : 'bg-theme-sur2 text-theme-txt2 hover:text-theme-txt border border-theme-bor'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{m.name}</span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-theme-txt3 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por prospecto, empresa..."
            className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-lg pl-8 pr-3 py-1.5 text-xs text-theme-txt outline-hidden"
          />
        </div>
      </div>

      {/* Reminder Cards List */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center p-12 text-xs text-theme-txt2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff6d3b] animate-ping" />
            <span>Cargando calendario de seguimientos...</span>
          </div>
        </div>
      ) : filteredReminders.length === 0 ? (
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-12 text-center text-xs text-theme-txt2">
          <Calendar className="w-8 h-8 text-theme-txt3 mx-auto mb-2 opacity-50" />
          <p className="font-bold text-sm text-theme-txt">No hay recordatorios en este segmento</p>
          <p className="mt-1">Selecciona "Ver Todos" o programa seguimientos en las fichas de contacto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReminders.map((r) => {
            const badge = getBucketBadge(r.time_bucket, r.follow_up_date, r.days_diff);

            return (
              <div
                key={r.id}
                onClick={() => onOpenContactDrawer && onOpenContactDrawer(r.id)}
                className={`bg-theme-sur border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3.5 transition-all cursor-pointer hover:shadow-md ${
                  r.time_bucket === 'overdue'
                    ? 'border-[#ff6d3b]/40 hover:border-[#ff6d3b]'
                    : r.time_bucket === 'today'
                    ? 'border-[#00a870]/40 hover:border-[#00a870]'
                    : 'border-theme-bor hover:border-theme-bor2'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${badge.bg}`}>
                      <Calendar className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>

                    <span className="text-[10px] font-mono text-theme-txt3 bg-theme-sur2 px-2 py-0.5 rounded">
                      Resp: {r.assigned_to}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-theme-txt hover:text-[#00a870] transition-colors">
                      {r.first_name} {r.last_name || ''}
                    </h3>
                    <p className="text-xs text-theme-txt2 line-clamp-1">
                      {r.position || 'Sin cargo'} {r.company ? `• ${r.company}` : ''}
                    </p>
                  </div>

                  {r.notes && (
                    <div className="p-2.5 rounded-xl bg-theme-sur2 border border-theme-bor text-xs text-theme-txt2 italic line-clamp-2">
                      "{r.notes}"
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-theme-bor flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-sur2 text-theme-txt3">
                    Estado: {r.status}
                  </span>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {r.linkedin_url && (
                      <a
                        href={r.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-theme-sur2 hover:bg-[#0a66c2]/15 text-theme-txt2 hover:text-[#0a66c2] border border-theme-bor"
                        title="Ver en LinkedIn"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={() => onOpenContactDrawer && onOpenContactDrawer(r.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#00a870]/15 text-[#00a870] hover:bg-[#00a870]/25 border border-[#00a870]/30 flex items-center gap-1"
                    >
                      <span>Gestionar</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
