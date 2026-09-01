'use client';

import React, { memo } from 'react';
import { 
  Users, Mail, MailX, Calendar, Filter, Clock, Star, X, UserCheck, 
  AlertTriangle, Plus, Flame, Settings, KeyRound, ChevronRight, MessageSquare, UserPlus
} from 'lucide-react';
import { TeamMember } from '@/lib/types';

interface SidebarProps {
  viewFilter: 'all' | 'email' | 'noemail' | 'recent' | 'follow_up' | 'star3' | 'shared' | 'active_search';
  setViewFilter: (f: 'all' | 'email' | 'noemail' | 'recent' | 'follow_up' | 'star3' | 'shared' | 'active_search') => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  assignedToFilter?: string;
  setAssignedToFilter?: (u: string) => void;
  teamMembers?: TeamMember[];
  currentUser?: TeamMember | null;
  activeTab?: string;
  onOpenProfile?: () => void;
  onSwitchTab: (tab: 'contactos' | 'segmentos' | 'funnel' | 'objetivos' | 'seguimientos' | 'mensajeria' | 'recursos' | 'analytics' | 'ejecutivo' | 'configuracion') => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  counts: {
    total: number;
    withEmail: number;
    noEmail: number;
    recent: number;
    pendingFollowUps?: number;
    activeSearchCount?: number;
  };
}

function SidebarInner({
  viewFilter,
  setViewFilter,
  statusFilter,
  setStatusFilter,
  assignedToFilter,
  setAssignedToFilter,
  teamMembers = [],
  currentUser,
  activeTab,
  onOpenProfile,
  onSwitchTab,
  isMobileOpen,
  onCloseMobile,
  counts,
}: SidebarProps) {
  const content = (
    <>
      <div className="flex items-center justify-between px-2 py-2">
        <span className="font-mono text-[9.5px] tracking-wider uppercase text-theme-txt3">
          Vistas de Prospección
        </span>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 text-theme-txt2 hover:text-theme-txt rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 1. Nuevos Prospectos (Agregados recientemente) */}
      <div
        onClick={() => {
          setViewFilter('active_search');
          setStatusFilter('');
          onSwitchTab('contactos');
          if (onCloseMobile) onCloseMobile();
        }}
        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all mb-1 ${
          activeTab === 'contactos' && viewFilter === 'active_search'
            ? 'bg-[#00a870]/15 text-[#00a870] border border-[#00a870]/30 font-bold shadow-xs'
            : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-[#00a870]'
        }`}
      >
        <UserPlus className="w-4 h-4 shrink-0 text-[#00a870]" />
        <span className="truncate">✨ Nuevos Prospectos</span>
        <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-[#00a870]/20 text-[#00a870] font-bold">
          {(counts.activeSearchCount || 0).toLocaleString()}
        </span>
      </div>

      {/* 2. Mensajería & Chats (Conversations Hub en Sidebar) */}
      <div
        onClick={() => {
          onSwitchTab('mensajeria');
          if (onCloseMobile) onCloseMobile();
        }}
        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all mb-1 ${
          activeTab === 'mensajeria'
            ? 'bg-[#2979ff]/15 text-[#2979ff] border border-[#2979ff]/30 font-bold shadow-xs'
            : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-[#2979ff]'
        }`}
      >
        <MessageSquare className="w-4 h-4 shrink-0 text-[#2979ff]" />
        <span className="truncate">Mensajería & Chats</span>
        <span className="ml-auto font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-[#2979ff]/20 text-[#2979ff] font-bold">
          LIVE
        </span>
      </div>

      {/* 3. Todos los Contactos (Base General) */}
      <div
        onClick={() => {
          setViewFilter('all');
          setStatusFilter('');
          if (setAssignedToFilter) setAssignedToFilter('');
          onSwitchTab('contactos');
          if (onCloseMobile) onCloseMobile();
        }}
        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all mb-1 ${
          activeTab === 'contactos' && viewFilter === 'all' && !statusFilter && !assignedToFilter
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
          activeTab === 'contactos' && viewFilter === 'follow_up'
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
          activeTab === 'contactos' && viewFilter === 'star3'
            ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 font-medium'
            : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt'
        }`}
      >
        <Star className="w-3.5 h-3.5 shrink-0 text-[#f59e0b] fill-[#f59e0b]" />
        <span className="truncate">Prioridad Alta (3⭐)</span>
      </div>

      {/* Con Email */}
      <div
        onClick={() => {
          setViewFilter('email');
          setStatusFilter('');
          onSwitchTab('contactos');
          if (onCloseMobile) onCloseMobile();
        }}
        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all mb-1 ${
          activeTab === 'contactos' && viewFilter === 'email'
            ? 'bg-[#00a870]/15 text-[#00a870] border border-[#00a870]/30 font-medium'
            : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt'
        }`}
      >
        <Mail className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">Con Email</span>
        <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-theme-sur2 text-theme-txt2">
          {counts.withEmail.toLocaleString()}
        </span>
      </div>

      {/* Sin Email */}
      <div
        onClick={() => {
          setViewFilter('noemail');
          setStatusFilter('');
          onSwitchTab('contactos');
          if (onCloseMobile) onCloseMobile();
        }}
        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all mb-1 ${
          activeTab === 'contactos' && viewFilter === 'noemail'
            ? 'bg-[#00a870]/15 text-[#00a870] border border-[#00a870]/30 font-medium'
            : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt'
        }`}
      >
        <MailX className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">Sin Email</span>
        <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-theme-sur2 text-theme-txt2">
          {counts.noEmail.toLocaleString()}
        </span>
      </div>

      {/* Recientes */}
      <div
        onClick={() => {
          setViewFilter('recent');
          setStatusFilter('');
          onSwitchTab('contactos');
          if (onCloseMobile) onCloseMobile();
        }}
        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all mb-1 ${
          activeTab === 'contactos' && viewFilter === 'recent'
            ? 'bg-[#00a870]/15 text-[#00a870] border border-[#00a870]/30 font-medium'
            : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt'
        }`}
      >
        <Calendar className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">Recientes (2025-2026)</span>
        <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-theme-sur2 text-theme-txt2">
          {counts.recent.toLocaleString()}
        </span>
      </div>

      {/* Separator: Team Members */}
      <div className="flex items-center justify-between px-2 pt-3 pb-1 mt-2 border-t border-theme-bor">
        <span className="font-mono text-[9.5px] tracking-wider uppercase text-theme-txt3">
          Por Responsable
        </span>
      </div>

      {teamMembers.map((member) => {
        const isSelected = assignedToFilter === member.name;
        return (
          <div
            key={member.id}
            onClick={() => {
              if (setAssignedToFilter) {
                setAssignedToFilter(isSelected ? '' : member.name);
              }
              onSwitchTab('contactos');
              if (onCloseMobile) onCloseMobile();
            }}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all mb-1 ${
              isSelected
                ? 'bg-[#2979ff]/15 text-[#2979ff] border border-[#2979ff]/30 font-medium'
                : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt'
            }`}
          >
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-white text-[8.5px] shrink-0"
              style={{ backgroundColor: member.color || '#2979ff' }}
            >
              {member.name.slice(0, 1)}
            </div>
            <span className="truncate">{member.name}</span>
            {member.contact_count !== undefined && (
              <span className="ml-auto font-mono text-[10px] text-theme-txt3">
                {member.contact_count.toLocaleString()}
              </span>
            )}
          </div>
        );
      })}

      {/* Bottom Actions: Settings & Profile (Clean UX - Only in Sidebar) */}
      <div className="mt-auto pt-4 border-t border-theme-bor space-y-2">
        {/* 1. Centro de Configuración (Exclusivo en el Sidebar) */}
        <button
          onClick={() => {
            onSwitchTab('configuracion');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
            activeTab === 'configuracion'
              ? 'bg-[#00a870] text-[#00110b] font-bold border border-[#00a870]'
              : 'text-theme-txt hover:text-[#00a870] bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings className={`w-4 h-4 ${activeTab === 'configuracion' ? 'text-[#00110b]' : 'text-[#00a870]'}`} />
            <span>Configuración</span>
          </div>
          <ChevronRight className={`w-3.5 h-3.5 ${activeTab === 'configuracion' ? 'text-[#00110b]' : 'text-theme-txt3'}`} />
        </button>

        {/* 2. Mi Perfil & Contraseña */}
        {currentUser && onOpenProfile && (
          <button
            onClick={() => {
              onOpenProfile();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-theme-txt2 hover:text-theme-txt bg-theme-sur2/70 hover:bg-theme-sur2 border border-theme-bor transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center font-bold text-white text-[9.5px]"
                style={{ backgroundColor: currentUser.color || '#00a870' }}
              >
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="truncate max-w-[120px]">{currentUser.name}</span>
            </div>
            <KeyRound className="w-3.5 h-3.5 text-theme-txt3" />
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 min-w-[240px] bg-theme-sur border-r border-theme-bor flex-col overflow-y-auto p-3 shrink-0 text-xs">
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

const Sidebar = memo(SidebarInner);
export default Sidebar;

