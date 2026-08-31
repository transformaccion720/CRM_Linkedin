'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, ShieldAlert, Sparkles, User, RefreshCw, X } from 'lucide-react';
import { ActivityLog } from '@/lib/types';

interface ActivityBellProps {
  onRefreshTrigger?: () => void;
}

export default function ActivityBell({ onRefreshTrigger }: ActivityBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/activities?limit=25');
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
        
        // Count unread based on last seen timestamp in localStorage
        const lastSeen = localStorage.getItem('crm_last_seen_activity') || '';
        if (!lastSeen) {
          setUnreadCount(Math.min(data.activities?.length || 0, 9));
        } else {
          const unread = (data.activities || []).filter(
            (a: ActivityLog) => new Date(a.created_at) > new Date(lastSeen)
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
    const interval = setInterval(fetchActivities, 20000); // Polling every 20s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
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
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark as read
      setUnreadCount(0);
      localStorage.setItem('crm_last_seen_activity', new Date().toISOString());
      fetchActivities();
    }
  };

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'STATUS_CHANGE':
        return { label: 'Estado', bg: 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30' };
      case 'PHONE_ADDED':
        return { label: 'Teléfono', bg: 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30' };
      case 'EMAIL_ADDED':
        return { label: 'Email', bg: 'bg-[#ff6d3b]/15 text-[#ff6d3b] border-[#ff6d3b]/30' };
      case 'NOTE_ADDED':
        return { label: 'Notas', bg: 'bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/30' };
      default:
        return { label: 'Datos', bg: 'bg-theme-sur2 text-theme-txt border-theme-bor' };
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
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff6d3b] text-white text-[9.5px] font-mono font-bold flex items-center justify-center animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Activity Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-theme-sur border border-theme-bor rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[75vh]">
          {/* Header */}
          <div className="p-3.5 px-4 border-b border-theme-bor flex items-center justify-between bg-theme-sur shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00a870]" />
              <span className="font-bold text-xs text-theme-txt">Historial de Gestiones en Vivo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={fetchActivities}
                className="p-1 text-theme-txt3 hover:text-theme-txt rounded transition-colors cursor-pointer"
                title="Refrescar actividades"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
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
          <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-xs text-theme-txt2">
                <Clock className="w-8 h-8 text-theme-txt3 mx-auto mb-2 opacity-50" />
                <p>No hay gestiones recientes registradas</p>
              </div>
            ) : (
              activities.map((a) => {
                const badge = getActionBadge(a.action_type);

                return (
                  <div
                    key={a.id}
                    className="p-2.5 bg-theme-sur2/70 border border-theme-bor rounded-xl text-xs space-y-1 shadow-2xs hover:border-theme-bor2 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-bold text-theme-txt truncate max-w-[200px]">
                        {a.contact_name}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${badge.bg}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-[11px] text-theme-txt2 leading-relaxed">
                      {a.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-theme-txt3 pt-1 border-t border-theme-bor/60">
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
          <div className="p-2.5 px-4 border-t border-theme-bor bg-theme-sur text-center shrink-0">
            <span className="text-[10px] font-mono text-theme-txt3">
              Auditoría sincronizada con Neon PostgreSQL
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
