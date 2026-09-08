'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Clock, Sparkles, User, X, CheckCheck, Trash2, ChevronRight, Check } from 'lucide-react';
import { ActivityLog } from '@/lib/types';

interface ActivityBellProps {
  onRefreshTrigger?: () => void;
  onOpenContactDrawer?: (contactId: string) => void;
}

export default function ActivityBell({ onOpenContactDrawer }: ActivityBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/activities?limit=40', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const acts: ActivityLog[] = data.activities || [];
        setActivities(acts);
        setUnreadCount(typeof data.unread_count === 'number' ? data.unread_count : acts.filter(a => !a.is_read).length);
      }
    } catch (e) {
      console.error('Error fetching activities:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 25000);
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
    setIsOpen((prev) => !prev);
  };

  const handleMarkAllRead = async () => {
    try {
      // Optimistic update
      setUnreadCount(0);
      setActivities((prev) => prev.map((a) => ({ ...a, is_read: true })));
      await fetch('/api/activities?all=true', { method: 'PATCH' });
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  const handleItemClick = async (a: ActivityLog) => {
    // If not read yet, mark read on backend and locally
    if (!a.is_read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setActivities((prev) =>
        prev.map((item) => (item.id === a.id ? { ...item, is_read: true } : item))
      );
      try {
        await fetch(`/api/activities?id=${a.id}`, { method: 'PATCH' });
      } catch (err) {
        console.error('Error marking activity as read:', err);
      }
    }

    // If it has a contact attached, open its drawer
    if (a.contact_id && onOpenContactDrawer) {
      setIsOpen(false);
      onOpenContactDrawer(a.contact_id);
    }
  };

  const handleDeleteActivity = async (id: string, isUnread: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Optimistic update
      setActivities((prev) => prev.filter((a) => a.id !== id));
      if (isUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      await fetch(`/api/activities?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting activity:', err);
    }
  };

  const handleClearAllActivities = async () => {
    if (!confirm('¿Deseas eliminar todas las notificaciones de la bandeja?')) return;
    try {
      setActivities([]);
      setUnreadCount(0);
      await fetch('/api/activities?all=true', { method: 'DELETE' });
    } catch (err) {
      console.error('Error clearing activities:', err);
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
      case 'MEETING_SCHEDULED':
        return { label: '📅 Reunión', bg: 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30' };
      case 'PROPOSAL_SENT':
        return { label: '📄 Propuesta', bg: 'bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/30' };
      case 'CLIENT_WON':
        return { label: '🏆 Ganada', bg: 'bg-[#00a870]/20 text-[#00a870] border-[#00a870]/40' };
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
        title="Bandeja de Notificaciones y Alertas"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#ff6d3b] text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-xs animate-bounce">
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
              <div>
                <span className="font-bold text-xs text-theme-txt">Bandeja de Notificaciones</span>
                {unreadCount > 0 && (
                  <span className="ml-1.5 text-[10px] font-bold text-[#ff6d3b] font-mono">
                    ({unreadCount} pendientes)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-2 py-1 text-theme-txt3 hover:text-[#00a870] hover:bg-[#00a870]/10 rounded-lg transition-colors cursor-pointer text-[11px] font-medium flex items-center gap-1"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Marcar leídas</span>
                </button>
              )}

              {activities.length > 0 && (
                <button
                  onClick={handleClearAllActivities}
                  className="p-1.5 text-theme-txt3 hover:text-[#ff6d3b] hover:bg-[#ff6d3b]/10 rounded-lg transition-colors cursor-pointer"
                  title="Vaciar todas las notificaciones"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-theme-txt3 hover:text-theme-txt hover:bg-theme-sur2 rounded-lg transition-colors cursor-pointer"
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
                <p className="font-medium">No hay notificaciones pendientes</p>
                <p className="text-[11px] text-theme-txt3 mt-1">Tu bandeja está completamente al día</p>
              </div>
            ) : (
              activities.map((a) => {
                const badge = getActionBadge(a.action_type);
                const hasContactLink = Boolean(a.contact_id);
                const isUnread = !a.is_read;

                return (
                  <div
                    key={a.id}
                    onClick={() => handleItemClick(a)}
                    className={`p-3 rounded-xl text-xs space-y-1.5 shadow-2xs transition-all group relative border cursor-pointer ${
                      isUnread
                        ? 'bg-theme-sur border-[#2979ff]/40 hover:border-[#2979ff] shadow-xs'
                        : 'bg-theme-sur2/50 border-theme-bor hover:border-theme-bor2 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 truncate max-w-[210px]">
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#2979ff] shrink-0" title="No leída" />
                        )}
                        <span className={`truncate flex items-center gap-1 ${isUnread ? 'font-bold text-theme-txt' : 'font-medium text-theme-txt2'}`}>
                          <span>{a.contact_name}</span>
                          {hasContactLink && (
                            <ChevronRight className="w-3 h-3 text-[#00a870] opacity-70 group-hover:opacity-100" />
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${badge.bg}`}>
                          {badge.label}
                        </span>

                        {/* Delete single notification button */}
                        <button
                          onClick={(e) => handleDeleteActivity(a.id, isUnread, e)}
                          className="p-1 rounded text-theme-txt3 hover:text-[#ff6d3b] hover:bg-[#ff6d3b]/15 transition-all cursor-pointer opacity-70 group-hover:opacity-100"
                          title="Eliminar esta notificación"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className={`text-[11px] leading-relaxed ${isUnread ? 'text-theme-txt font-medium' : 'text-theme-txt2'}`}>
                      {a.description}
                    </p>

                    <div className="flex items-center justify-between text-[9.5px] font-mono text-theme-txt3 pt-1 border-t border-theme-bor/60">
                      <span className="flex items-center gap-1 text-[#00a870]">
                        <User className="w-2.5 h-2.5" />
                        <span>Por: {a.performed_by}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{a.created_at}</span>
                        {a.is_read ? (
                          <span className="text-theme-txt3 flex items-center gap-0.5" title="Leída">
                            <Check className="w-2.5 h-2.5 text-[#00a870]" />
                          </span>
                        ) : (
                          <span className="text-[#2979ff] font-bold text-[9px]">NUEVA</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2 px-4 border-t border-theme-bor bg-theme-sur text-center shrink-0 flex items-center justify-between text-[10px] font-mono text-theme-txt3">
            <span>Notificaciones del sistema</span>
            <span>{activities.length} registradas</span>
          </div>
        </div>
      )}
    </div>
  );
}
