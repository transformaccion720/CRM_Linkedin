'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, AlertTriangle, Check, User, X, ChevronRight, CheckCheck } from 'lucide-react';
import { FollowUpReminder } from '@/lib/types';

interface FollowUpBellProps {
  onOpenCalendarTab?: () => void;
  onOpenContactDrawer?: (contactId: string) => void;
}

export default function FollowUpBell({ onOpenCalendarTab, onOpenContactDrawer }: FollowUpBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reminders, setReminders] = useState<FollowUpReminder[]>([]);
  const [stats, setStats] = useState<{ total: number; overdue: number; today: number; upcoming: number }>({
    total: 0,
    overdue: 0,
    today: 0,
    upcoming: 0,
  });
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/follow-ups');
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
    const interval = setInterval(fetchFollowUps, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const urgentCount = stats.today + stats.overdue;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer relative flex items-center justify-center border ${
          urgentCount > 0
            ? 'bg-[#ff6d3b]/15 text-[#ff6d3b] border-[#ff6d3b]/40 hover:bg-[#ff6d3b]/25 shadow-xs'
            : 'bg-theme-sur2 text-theme-txt2 hover:text-theme-txt border-theme-bor hover:bg-theme-sur3'
        }`}
        title={`Seguimientos Programados (${urgentCount} urgentes hoy/vencidos)`}
      >
        <Calendar className="w-4 h-4" />
        {urgentCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff6d3b] text-white text-[9px] font-mono font-bold flex items-center justify-center animate-pulse">
            {urgentCount > 9 ? '9+' : urgentCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-theme-sur border border-theme-bor rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[75vh]">
          {/* Header */}
          <div className="p-3 px-4 border-b border-theme-bor flex items-center justify-between bg-theme-sur shrink-0">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#ff6d3b]" />
              <span className="font-bold text-xs text-theme-txt">Agenda de Seguimientos</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#ff6d3b]/15 text-[#ff6d3b] font-bold">
                {urgentCount} urgentes
              </span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-theme-txt3 hover:text-theme-txt rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick stats banner */}
          <div className="grid grid-cols-3 gap-1 p-2 bg-theme-sur2/60 border-b border-theme-bor text-center text-[10px] font-mono">
            <div className="p-1 rounded bg-theme-sur border border-theme-bor">
              <span className="text-[#00a870] font-bold block">{stats.today}</span>
              <span className="text-theme-txt3">Hoy</span>
            </div>
            <div className="p-1 rounded bg-theme-sur border border-theme-bor">
              <span className="text-[#ff6d3b] font-bold block">{stats.overdue}</span>
              <span className="text-theme-txt3">Vencidos</span>
            </div>
            <div className="p-1 rounded bg-theme-sur border border-theme-bor">
              <span className="text-[#2979ff] font-bold block">{stats.upcoming}</span>
              <span className="text-theme-txt3">Próximos</span>
            </div>
          </div>

          {/* List */}
          <div className="p-3 space-y-2 overflow-y-auto flex-1 text-xs">
            {reminders.length === 0 ? (
              <div className="p-8 text-center text-xs text-theme-txt2">
                <Clock className="w-8 h-8 text-theme-txt3 mx-auto mb-2 opacity-50" />
                <p>No tienes seguimientos pendientes</p>
              </div>
            ) : (
              reminders.slice(0, 10).map((r) => {
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      setIsOpen(false);
                      if (onOpenContactDrawer) onOpenContactDrawer(r.id);
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-2xs space-y-1 ${
                      r.is_overdue
                        ? 'bg-[#ff6d3b]/10 border-[#ff6d3b]/30 hover:border-[#ff6d3b]'
                        : r.is_today
                        ? 'bg-[#00a870]/10 border-[#00a870]/30 hover:border-[#00a870]'
                        : 'bg-theme-sur2/70 border-theme-bor hover:border-theme-bor2'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-theme-txt truncate max-w-[190px]">
                        {r.first_name} {r.last_name || ''}
                      </span>
                      <span
                        className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          r.is_overdue
                            ? 'bg-[#ff6d3b]/20 text-[#ff6d3b]'
                            : r.is_today
                            ? 'bg-[#00a870]/20 text-[#00a870]'
                            : 'bg-theme-sur text-theme-txt3 border border-theme-bor'
                        }`}
                      >
                        {r.is_today ? 'Hoy' : r.is_overdue ? 'Vencido' : r.follow_up_date}
                      </span>
                    </div>

                    <p className="text-[11px] text-theme-txt2 truncate">
                      {r.position || 'Prospecto'} {r.company ? `• ${r.company}` : ''}
                    </p>

                    {r.notes && (
                      <p className="text-[10.5px] text-theme-txt3 italic truncate">
                        "{r.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[9.5px] font-mono text-theme-txt3 pt-0.5">
                      <span>Resp: {r.assigned_to}</span>
                      <span className="text-[#00a870] font-semibold flex items-center gap-0.5">
                        <span>Gestionar</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer - Full calendar link */}
          <div className="p-2.5 px-4 border-t border-theme-bor bg-theme-sur text-center shrink-0">
            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenCalendarTab) onOpenCalendarTab();
              }}
              className="w-full py-1.5 rounded-lg text-xs font-bold text-white bg-[#ff6d3b] hover:bg-[#e05626] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Abrir Calendario Completo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
