'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, Sparkles, User, RefreshCw, X, CheckCheck, Trash2, ChevronRight, ExternalLink } from 'lucide-react';
import { ActivityLog } from '@/lib/types';

interface ActivityBellProps {
  onRefreshTrigger?: () => void;
  onOpenContactDrawer?: (contactId: string) => void;
}

export default function ActivityBell({ onRefreshTrigger, onOpenContactDrawer }: ActivityBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/activities?limit=40');
      if (res.ok) {
        const data = await res.json();
        const acts: ActivityLog[] = data.activities || [];
        setActivities(acts);
        
        const lastSeen = localStorage.getItem('crm_last_seen_activity');
        if (!lastSeen) {
          setUnreadCount(Math.min(acts.length, 9));
        } else {
          const lastSeenDate = new Date(lastSeen).getTime();
          const unread = acts.filter(
            (a) => new Date(a.created_at).getTime() > lastSeenDate
          );
          setUnreadCount(unread.length);
        }
      }
    } catch (e) {
      console.error('Error fetching activities:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 20000);
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

  const handleOpenDropdown = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      setUnreadCount(0);
      localStorage.setItem('crm_last_seen_activity', new Date().toISOString());
    }
  };

  const handleMarkAllRead = () => {
    setUnreadCount(0);
    localStorage.setItem('crm_last_seen_activity', new Date().toISOString());
  };

  const handleDeleteActivity = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/activities?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setActivities((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error('Error deleting activity:', err);
    }
  };

  const handleClearAllActivities = async () => {
    if (!confirm('¿Deseas limpiar todo el historial de notificaciones?')) return;
    try {
      const res = await fetch('/api/activities?all=true', { method: 'DELETE' });
      if (res.ok) {
        setActivities([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error clearing activities:', err);
    }
  };

  const handleActivityClick = (a: ActivityLog) => {
    if (a.contact_id && onOpenContactDrawer) {
      setIsOpen(false);
      onOpenContactDrawer(a.contact_id);
    }
  };

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'STATUS_CHANGE':
        return { label: 'Estado', bg: 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30' };
      case 'CONTACTED_OUTREACH':
        return { label: 'Mensaje Enviado', bg: 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30' };
      case 'PHONE_ADDED':
        return { label: 'Teléfono', bg: 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30' };
      case 'EMAIL_ADDED':
        return { label: 'Email', bg: 'bg-[#ff6d3b]/15 text-[#ff6d3b] border-[#ff6d3b]/30' };
      case 'NOTE_ADDED':
        return { label: 'Nota / Respuesta', bg: 'bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/30' };
      case 'GOAL_UPDATED':
        return { label: '🎯 Metas', bg: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30' };
      default:
        return { label: 'Gestión', bg: 'bg-theme-sur2 text-theme-txt border-theme-bor' };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={handleOpenDropdown}
        className="p-1.5 sm:p-2 rounded-lg text-theme-txt2 hover:text-[#00a870] bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor transition-all cursor-pointer relative flex items-center justify-center"
        title="Historial de Gestiones y Alertas del Equipo"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff6d3b] text-white text-[9px] font-mono font-bold flex items-center justify-center animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Activity Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-theme-sur border border-theme-bor rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[75vh]">
          {/* Header */}
          <div className="p-3 px-4 border-b border-theme-bor flex items-center justify-between bg-theme-sur shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00a870]" />
              <span className="font-bold text-xs text-theme-txt">Alertas y Gestiones</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllRead}
                className="p-1 text-theme-txt3 hover:text-[#00a870] rounded transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Marcar Leídas</span>
              </button>

              <button
                onClick={handleClearAllActivities}
                className="p-1 text-theme-txt3 hover:text-[#ff6d3b] rounded transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                title="Limpiar todas las notificaciones"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-theme-txt3 hover:text-theme-txt rounded transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Activity list */}
          <div className="p-3 space-y-2 overflow-y-auto flex-1">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-xs text-theme-txt2">
                <Clock className="w-8 h-8 text-theme-txt3 mx-auto mb-2 opacity-50" />
                <p>No hay gestiones pendientes</p>
              </div>
            ) : (
              activities.map((a) => {
                const badge = getActionBadge(a.action_type);
                const hasContactLink = Boolean(a.contact_id);

                return (
                  <div
                    key={a.id}
                    onClick={() => handleActivityClick(a)}
                    className={`p-2.5 bg-theme-sur2/70 border border-theme-bor rounded-xl text-xs space-y-1 shadow-2xs hover:border-[#00a870]/40 transition-colors group relative ${
                      hasContactLink ? 'cursor-pointer' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-bold text-theme-txt truncate max-w-[190px] flex items-center gap-1">
                        <span>{a.contact_name}</span>
                        {hasContactLink && <ChevronRight className="w-3 h-3 text-[#00a870] opacity-70 group-hover:opacity-100" />}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                        <button
                          onClick={(e) => handleDeleteActivity(a.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-theme-txt3 hover:text-[#ff6d3b] transition-opacity cursor-pointer"
                          title="Eliminar notificación"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-theme-txt2 leading-relaxed">
                      {a.description}
                    </p>

                    <div className="flex items-center justify-between text-[9.5px] font-mono text-theme-txt3 pt-1 border-t border-theme-bor/60">
                      <span className="flex items-center gap-1 text-[#00a870]">
                        <User className="w-2.5 h-2.5" />
                        <span>Por: {a.performed_by}</span>
                      </span>
                      <span>{a.created_at}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2 px-4 border-t border-theme-bor bg-theme-sur text-center shrink-0">
            <span className="text-[10px] font-mono text-theme-txt3">
              Notificaciones y auditoría en tiempo real
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
