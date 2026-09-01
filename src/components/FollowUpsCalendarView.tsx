'use client';

import React, { useState, useEffect } from 'react';
import { FollowUpReminder, TeamMember, Contact } from '@/lib/types';
import { 
  Calendar, Clock, AlertTriangle, CheckCircle2, UserCheck, ExternalLink, 
  Search, RefreshCw, ChevronRight, CalendarDays, Star, MessageSquare, Phone
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
  const [stats, setStats] = useState<{ total: number; overdue: number; today: number; upcoming: number }>({
    total: 0,
    overdue: 0,
    today: 0,
    upcoming: 0,
  });
  const [memberFilter, setMemberFilter] = useState<string>('');
  const [statusTab, setStatusTab] = useState<'all' | 'today' | 'overdue' | 'upcoming'>('all');
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
        setStats(data.stats || { total: 0, overdue: 0, today: 0, upcoming: 0 });
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

  // Filter list
  const filteredReminders = reminders.filter((r) => {
    if (statusTab === 'today' && !r.is_today) return false;
    if (statusTab === 'overdue' && !r.is_overdue) return false;
    if (statusTab === 'upcoming' && (r.is_today || r.is_overdue)) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = `${r.first_name} ${r.last_name || ''}`.toLowerCase().includes(q);
      const matchCompany = (r.company || '').toLowerCase().includes(q);
      const matchNotes = (r.notes || '').toLowerCase().includes(q);
      return matchName || matchCompany || matchNotes;
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-theme-bg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-sur p-5 rounded-2xl border border-theme-bor">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff6d3b] font-bold bg-[#ff6d3b]/10 px-2 py-0.5 rounded flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#ff6d3b]" />
              <span>Calendario de Seguimientos & Recordatorios</span>
            </span>
            <span className="text-[10px] font-mono text-theme-txt3">{stats.total} fechas agendadas</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-theme-txt">
            Agenda y Mapeo de Seguimientos Comerciales
          </h2>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Visualiza todas las fechas programadas para retomar contacto con prospectos en pausa, oportunidades y clientes
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

      {/* KPI Cards for Follow-ups */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Hoy */}
        <button
          onClick={() => setStatusTab('today')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusTab === 'today'
              ? 'bg-[#00a870]/15 border-[#00a870] shadow-xs'
              : 'bg-theme-sur border-theme-bor hover:border-theme-bor2'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10.5px] font-mono uppercase text-[#00a870] font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Para Hoy</span>
            </span>
            <span className="text-xl font-extrabold font-mono text-[#00a870]">{stats.today}</span>
          </div>
          <p className="text-xs text-theme-txt2">Prospectos para llamar/escribir hoy</p>
        </button>

        {/* 2. Vencidos / Atrasados */}
        <button
          onClick={() => setStatusTab('overdue')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusTab === 'overdue'
              ? 'bg-[#ff6d3b]/15 border-[#ff6d3b] shadow-xs'
              : 'bg-theme-sur border-theme-bor hover:border-theme-bor2'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10.5px] font-mono uppercase text-[#ff6d3b] font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Atrasados / Vencidos</span>
            </span>
            <span className="text-xl font-extrabold font-mono text-[#ff6d3b]">{stats.overdue}</span>
          </div>
          <p className="text-xs text-theme-txt2">Fechas pasadas que requieren atención urgente</p>
        </button>

        {/* 3. Próximos */}
        <button
          onClick={() => setStatusTab('upcoming')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusTab === 'upcoming'
              ? 'bg-[#2979ff]/15 border-[#2979ff] shadow-xs'
              : 'bg-theme-sur border-theme-bor hover:border-theme-bor2'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10.5px] font-mono uppercase text-[#2979ff] font-bold flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Próximos Días</span>
            </span>
            <span className="text-xl font-extrabold font-mono text-[#2979ff]">{stats.upcoming}</span>
          </div>
          <p className="text-xs text-theme-txt2">Seguimientos agendados a futuro</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-theme-sur border border-theme-bor p-3.5 rounded-xl flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusTab === 'all'
                ? 'bg-[#00a870] text-[#00110b] shadow-xs'
                : 'bg-theme-sur2 text-theme-txt2 hover:text-theme-txt border border-theme-bor'
            }`}
          >
            Todos ({stats.total})
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
          <p className="font-bold text-sm text-theme-txt">No hay recordatorios en este filtro</p>
          <p className="mt-1">Usa el botón [+1 día] o elige fecha de seguimiento en la ficha del contacto para agendarlo aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReminders.map((r) => {
            return (
              <div
                key={r.id}
                onClick={() => onOpenContactDrawer && onOpenContactDrawer(r.id)}
                className={`bg-theme-sur border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3.5 transition-all cursor-pointer hover:shadow-md ${
                  r.is_overdue
                    ? 'border-[#ff6d3b]/40 hover:border-[#ff6d3b]'
                    : r.is_today
                    ? 'border-[#00a870]/40 hover:border-[#00a870]'
                    : 'border-theme-bor hover:border-theme-bor2'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                        r.is_overdue
                          ? 'bg-[#ff6d3b]/15 text-[#ff6d3b] border-[#ff6d3b]/30'
                          : r.is_today
                          ? 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30'
                          : 'bg-theme-sur2 text-theme-txt2 border-theme-bor'
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      <span>
                        {r.is_today ? '🔔 HOY: ' + r.follow_up_date : r.is_overdue ? '⚠️ VENCIDO: ' + r.follow_up_date : '📅 ' + r.follow_up_date}
                      </span>
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
