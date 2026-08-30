'use client';

import React from 'react';
import { Users, Mail, MailX, Calendar, BarChart2, PieChart, Filter, Clock, Star, X, UserCheck } from 'lucide-react';

interface SidebarProps {
  viewFilter: 'all' | 'email' | 'noemail' | 'recent' | 'follow_up' | 'star3';
  setViewFilter: (f: 'all' | 'email' | 'noemail' | 'recent' | 'follow_up' | 'star3') => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  assignedToFilter?: string;
  setAssignedToFilter?: (u: string) => void;
  usersList?: string[];
  onClearFilters: () => void;
  onSwitchTab: (tab: 'contactos' | 'segmentos' | 'funnel' | 'analytics' | 'ejecutivo') => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  counts: {
    total: number;
    withEmail: number;
    noEmail: number;
    recent: number;
    pendingFollowUps?: number;
  };
}

export default function Sidebar({
  viewFilter,
  setViewFilter,
  statusFilter,
  setStatusFilter,
  assignedToFilter,
  setAssignedToFilter,
  usersList = [],
  onClearFilters,
  onSwitchTab,
  isMobileOpen,
  onCloseMobile,
  counts,
}: SidebarProps) {
  const content = (
    <>
      <div className="flex items-center justify-between px-2 py-2">
        <span className="font-mono text-[9.5px] tracking-wider uppercase text-theme-txt3">
          Vistas y Prospección
        </span>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 text-theme-txt2 hover:text-theme-txt rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div
        onClick={() => {
          setViewFilter('all');
          setStatusFilter('');
          if (setAssignedToFilter) setAssignedToFilter('');
          onSwitchTab('contactos');
          if (onCloseMobile) onCloseMobile();
        }}
        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all mb-1 ${
          viewFilter === 'all' && !statusFilter && !assignedToFilter
            ? 'bg-[#00a870]/15 text-[#00a870] border border-[#00a870]/30 font-medium'
            : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt'
        }`}
      >
        <Users className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">Todos los contactos</span>
        <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-theme-sur2 text-theme-txt2">
          {counts.total.toLocaleString()}
        </span>
      </div>

      {/* Follow-up Pending view */}
      <div
        onClick={() => {
          setViewFilter('follow_up');
          setStatusFilter('');
          onSwitchTab('contactos');
          if (onCloseMobile) onCloseMobile();
        }}
        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all mb-1 ${
          viewFilter === 'follow_up'
            ? 'bg-[#ff6d3b]/15 text-[#ff6d3b] border border-[#ff6d3b]/30 font-medium'
            : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt'
        }`}
      >
        <Clock className="w-3.5 h-3.5 shrink-0 text-[#ff6d3b]" />
        <span className="truncate">Seguimientos / Hoy</span>
        <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-[#ff6d3b]/20 text-[#ff6d3b] font-bold">
          {(counts.pendingFollowUps || 0).toLocaleString()}
        </span>
      </div>

      {/* High Priority 3-Star Leads */}
      <div
        onClick={() => {
          setViewFilter('star3');
          setStatusFilter('');
          onSwitchTab('contactos');
          if (onCloseMobile) onCloseMobile();
        }}
        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all mb-1 ${
          viewFilter === 'star3'
            ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 font-medium'
            : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt'
        }`}
      >
        <Star className="w-3.5 h-3.5 shrink-0 text-[#f59e0b] fill-[#f59e0b]" />
        <span className="truncate">Prioridad Alta (3⭐)</span>
      </div>

      <div
        onClick={() => {
          setViewFilter('email');
          setStatusFilter('');
          onSwitchTab('contactos');
          if (onCloseMobile) onCloseMobile();
        }}
        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all mb-1 ${
          viewFilter === 'email'
            ? 'bg-[#00a870]/15 text-[#00a870] border border-[#00a870]/30 font-medium'
            : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt'
        }`}
      >
        <Mail className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">Con email</span>
        <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-theme-sur2 text-theme-txt2">
          {counts.withEmail.toLocaleString()}
        </span>
      </div>

      <div
        onClick={() => {
          setViewFilter('noemail');
          setStatusFilter('');
          onSwitchTab('contactos');
          if (onCloseMobile) onCloseMobile();
        }}
        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all mb-1 ${
          viewFilter === 'noemail'
            ? 'bg-[#00a870]/15 text-[#00a870] border border-[#00a870]/30 font-medium'
            : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt'
        }`}
      >
        <MailX className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">Sin email</span>
        <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-theme-sur2 text-theme-txt2">
          {counts.noEmail.toLocaleString()}
        </span>
      </div>

      <div
        onClick={() => {
          setViewFilter('recent');
          setStatusFilter('');
          onSwitchTab('contactos');
          if (onCloseMobile) onCloseMobile();
        }}
        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all mb-1 ${
          viewFilter === 'recent'
            ? 'bg-[#00a870]/15 text-[#00a870] border border-[#00a870]/30 font-medium'
            : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt'
        }`}
      >
        <Calendar className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">Recientes 2025+</span>
        <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-theme-sur2 text-theme-txt2">
          {counts.recent.toLocaleString()}
        </span>
      </div>

      {/* Multi-user Assignment Filter */}
      {usersList.length > 0 && setAssignedToFilter && (
        <>
          <div className="font-mono text-[9.5px] tracking-wider uppercase text-theme-txt3 px-2 py-3 mt-2">
            Equipo Comercial
          </div>

          <div
            onClick={() => {
              setAssignedToFilter('Gabino');
              onSwitchTab('contactos');
              if (onCloseMobile) onCloseMobile();
            }}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all mb-1 ${
              assignedToFilter === 'Gabino'
                ? 'bg-[#00a870]/15 text-[#00a870] border border-[#00a870]/30 font-medium'
                : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Mis Prospectos (Gabino)</span>
          </div>

          {usersList.filter((u) => u !== 'Gabino').map((u) => (
            <div
              key={u}
              onClick={() => {
                setAssignedToFilter(u);
                onSwitchTab('contactos');
                if (onCloseMobile) onCloseMobile();
              }}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all mb-1 ${
                assignedToFilter === u
                  ? 'bg-[#2979ff]/15 text-[#2979ff] border border-[#2979ff]/30 font-medium'
                  : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#2979ff]" />
              <span className="truncate">{u}</span>
            </div>
          ))}
        </>
      )}

      <div className="font-mono text-[9.5px] tracking-wider uppercase text-theme-txt3 px-2 py-3 mt-2">
        Estado CRM
      </div>

      <div
        onClick={() => {
          setStatusFilter('new');
          setViewFilter('all');
          onSwitchTab('contactos');
          if (onCloseMobile) onCloseMobile();
        }}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all mb-1 ${
          statusFilter === 'new'
            ? 'bg-[#2979ff]/15 text-[#2979ff] border border-[#2979ff]/30 font-medium'
            : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt'
        }`}
      >
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#2979ff]/20 text-[#2979ff]">
          NEW
        </span>
        <span>Lead nuevo</span>
      </div>

      <div
        onClick={() => {
          setStatusFilter('contacted');
          setViewFilter('all');
          onSwitchTab('contactos');
          if (onCloseMobile) onCloseMobile();
        }}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all mb-1 ${
          statusFilter === 'contacted'
            ? 'bg-[#ff6d3b]/15 text-[#ff6d3b] border border-[#ff6d3b]/30 font-medium'
            : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt'
        }`}
      >
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#ff6d3b]/20 text-[#ff6d3b]">
          CONTACT
        </span>
        <span>Contactado</span>
      </div>

      <div
        onClick={() => {
          setStatusFilter('qualified');
          setViewFilter('all');
          onSwitchTab('contactos');
          if (onCloseMobile) onCloseMobile();
        }}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all mb-1 ${
          statusFilter === 'qualified'
            ? 'bg-[#00a870]/15 text-[#00a870] border border-[#00a870]/30 font-medium'
            : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt'
        }`}
      >
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00a870]/20 text-[#00a870]">
          QUALIFIED
        </span>
        <span>Calificado</span>
      </div>

      <div
        onClick={() => {
          setStatusFilter('lost');
          setViewFilter('all');
          onSwitchTab('contactos');
          if (onCloseMobile) onCloseMobile();
        }}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all mb-1 ${
          statusFilter === 'lost'
            ? 'bg-theme-txt2/20 text-theme-txt border border-theme-bor2 font-medium'
            : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt'
        }`}
      >
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-theme-sur2 text-theme-txt2 border border-theme-bor">
          LOST
        </span>
        <span>Descartado</span>
      </div>

      <div className="font-mono text-[9.5px] tracking-wider uppercase text-theme-txt3 px-2 py-3 mt-auto border-t border-theme-bor">
        Módulos
      </div>

      <div
        onClick={() => {
          onSwitchTab('funnel');
          if (onCloseMobile) onCloseMobile();
        }}
        className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt transition-all mb-1"
      >
        <Filter className="w-3.5 h-3.5 text-[#ff6d3b]" />
        <span>Embudo (Funnel)</span>
      </div>

      <div
        onClick={() => {
          onSwitchTab('analytics');
          if (onCloseMobile) onCloseMobile();
        }}
        className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt transition-all mb-1"
      >
        <BarChart2 className="w-3.5 h-3.5 text-[#2979ff]" />
        <span>Ver analíticas</span>
      </div>

      <div
        onClick={() => {
          onSwitchTab('ejecutivo');
          if (onCloseMobile) onCloseMobile();
        }}
        className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt transition-all mb-1"
      >
        <PieChart className="w-3.5 h-3.5 text-[#00a870]" />
        <span>Dashboard ejecutivo</span>
      </div>

      <div
        onClick={() => {
          onClearFilters();
          if (onCloseMobile) onCloseMobile();
        }}
        className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer text-theme-txt2 hover:bg-theme-sur2 hover:text-[#00a870] transition-all"
      >
        <Filter className="w-3.5 h-3.5" />
        <span>Limpiar filtros</span>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 min-w-[224px] bg-theme-sur border-r border-theme-bor flex-col overflow-y-auto p-3 shrink-0 text-xs">
        {content}
      </aside>

      {/* Mobile drawer overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden flex">
          <aside className="w-64 max-w-[80vw] bg-theme-sur border-r border-theme-bor flex flex-col overflow-y-auto p-4 text-xs h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </aside>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
}
