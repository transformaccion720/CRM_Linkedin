'use client';

import React from 'react';
import { 
  Users, Kanban, Filter, Calendar, BarChart3, LineChart, 
  UserPlus, RefreshCw, Moon, Sun, Menu, CheckCircle2,
  CalendarDays
} from 'lucide-react';
import ActivityBell from '@/components/ActivityBell';
import FollowUpBell from '@/components/FollowUpBell';
import { TeamMember } from '@/lib/types';

interface NavbarProps {
  totalContacts: number;
  activeTab: 'contactos' | 'segmentos' | 'funnel' | 'objetivos' | 'seguimientos' | 'mensajeria' | 'recursos' | 'analytics' | 'ejecutivo' | 'configuracion';
  setActiveTab: (tab: 'contactos' | 'segmentos' | 'funnel' | 'objetivos' | 'seguimientos' | 'mensajeria' | 'recursos' | 'analytics' | 'ejecutivo' | 'configuracion') => void;
  onOpenNewContact: () => void;
  onRefresh: () => void;
  onToggleMobileSidebar?: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  initStatus?: string | null;
  currentUser?: TeamMember | null;
  onOpenContactDrawer?: (contactId: string) => void;
}

export default function Navbar({
  totalContacts,
  activeTab,
  setActiveTab,
  onOpenNewContact,
  onRefresh,
  onToggleMobileSidebar,
  theme,
  toggleTheme,
  initStatus,
  currentUser,
  onOpenContactDrawer,
}: NavbarProps) {
  return (
    <div className="flex flex-col bg-theme-sur border-b border-theme-bor shrink-0 sticky top-0 z-30">
      {/* Top bar */}
      <header className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger toggle button for Mobile drawer */}
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg text-theme-txt2 hover:text-theme-txt bg-theme-sur2 border border-theme-bor transition-all cursor-pointer"
            aria-label="Abrir filtros"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00a870] to-[#008f5f] flex items-center justify-center font-bold text-white shadow-xs text-sm">
            T
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-theme-txt">
                TransformAccion 720°
              </span>
              <span className="hidden sm:inline font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#00a870]/15 text-[#00a870] border border-[#00a870]/30 font-bold">
                CRM B2B
              </span>
            </div>
            <p className="text-[10px] text-theme-txt3 font-mono hidden sm:block">
              Gestión Comercial & Sprints de Prospección
            </p>
          </div>
        </div>

        {/* Right side controls: Clean and streamlined */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {initStatus && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#00a870] bg-[#00a870]/10 border border-[#00a870]/20 px-3 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{initStatus}</span>
            </div>
          )}

          {/* Activity Notifications Bell */}
          <ActivityBell 
            onRefreshTrigger={onRefresh} 
            onOpenContactDrawer={onOpenContactDrawer}
          />

          {/* Special Follow-ups & Reminders Alert Bell */}
          <FollowUpBell
            onOpenCalendarTab={() => setActiveTab('seguimientos')}
            onOpenContactDrawer={onOpenContactDrawer}
          />

          {/* New Contact button (Highest Priority CTA) */}
          <button
            onClick={onOpenNewContact}
            className="px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#00a870] hover:bg-[#008f5f] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Registrar nuevo prospecto activo o manual"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo Prospecto</span>
            <span className="sm:hidden">Nuevo</span>
          </button>

          {/* Theme Toggle Button (Light & Dark mode) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-xl text-theme-txt2 hover:text-[#00a870] bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor transition-all cursor-pointer flex items-center gap-1.5 text-xs"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-[#00a870]" />
                <span className="hidden lg:inline font-medium">Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#2979ff]" />
                <span className="hidden lg:inline font-medium">Oscuro</span>
              </>
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="p-1.5 sm:p-2 text-theme-txt2 hover:text-theme-txt bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor rounded-xl transition-all cursor-pointer"
            title="Refrescar base de datos"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Navigation tabs (Streamlined core views) */}
      <nav className="flex gap-1 bg-theme-sur border-b border-theme-bor px-3 sm:px-6 shrink-0 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('contactos')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'contactos'
              ? 'border-[#00a870] text-[#00a870] font-semibold'
              : 'border-transparent text-theme-txt2 hover:text-theme-txt hover:bg-theme-sur2'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Contactos</span>
          <span className="font-mono text-[9px] sm:text-[9.5px] px-1.5 py-0.5 rounded-full bg-theme-sur2 text-theme-txt2">
            {totalContacts.toLocaleString()}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('segmentos')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'segmentos'
              ? 'border-[#00a870] text-[#00a870] font-semibold'
              : 'border-transparent text-theme-txt2 hover:text-theme-txt hover:bg-theme-sur2'
          }`}
        >
          <Kanban className="w-3.5 h-3.5" />
          <span>Segmentos (Kanban)</span>
        </button>

        <button
          onClick={() => setActiveTab('funnel')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'funnel'
              ? 'border-[#00a870] text-[#00a870] font-semibold'
              : 'border-transparent text-theme-txt2 hover:text-theme-txt hover:bg-theme-sur2'
          }`}
        >
          <Filter className="w-3.5 h-3.5 text-[#ff6d3b]" />
          <span>Embudo (Funnel)</span>
        </button>

        {/* Weekly Goals Tab */}
        <button
          onClick={() => setActiveTab('objetivos')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'objetivos'
              ? 'border-[#00a870] text-[#00a870] font-semibold'
              : 'border-transparent text-theme-txt2 hover:text-theme-txt hover:bg-theme-sur2'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5 text-[#00a870]" />
          <span>Objetivos Semanales</span>
        </button>

        {/* Follow-ups Agenda Tab */}
        <button
          onClick={() => setActiveTab('seguimientos')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'seguimientos'
              ? 'border-[#ff6d3b] text-[#ff6d3b] font-semibold'
              : 'border-transparent text-theme-txt2 hover:text-theme-txt hover:bg-theme-sur2'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-[#ff6d3b]" />
          <span>Seguimientos (Agenda)</span>
        </button>

        {/* Analytics Tab */}
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-[#00a870] text-[#00a870] font-semibold'
              : 'border-transparent text-theme-txt2 hover:text-theme-txt hover:bg-theme-sur2'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analíticas</span>
        </button>

        {/* Executive Dashboard Tab */}
        <button
          onClick={() => setActiveTab('ejecutivo')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ejecutivo'
              ? 'border-[#a855f7] text-[#a855f7] font-semibold'
              : 'border-transparent text-theme-txt2 hover:text-theme-txt hover:bg-theme-sur2'
          }`}
        >
          <LineChart className="w-3.5 h-3.5 text-[#a855f7]" />
          <span>Dashboard</span>
        </button>
      </nav>
    </div>
  );
}
