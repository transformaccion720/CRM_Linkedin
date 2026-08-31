'use client';

import React from 'react';
import { Upload, CheckCircle2, RefreshCw, Users, Kanban, BarChart2, PieChart, Download, Sun, Moon, Settings, Menu, Filter, UserPlus, UserCog } from 'lucide-react';

interface NavbarProps {
  onOpenImport: () => void;
  onOpenNewContact: () => void;
  onOpenTeamManager?: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onOpenTemplateManager?: () => void;
  onToggleMobileSidebar?: () => void;
  activeTab: 'contactos' | 'segmentos' | 'funnel' | 'analytics' | 'ejecutivo';
  setActiveTab: (tab: 'contactos' | 'segmentos' | 'funnel' | 'analytics' | 'ejecutivo') => void;
  totalContacts: number;
}

export default function Navbar({
  onOpenImport,
  onOpenNewContact,
  onOpenTeamManager,
  onRefresh,
  onExport,
  onOpenTemplateManager,
  onToggleMobileSidebar,
  activeTab,
  setActiveTab,
  totalContacts,
}: NavbarProps) {
  const [initStatus, setInitStatus] = React.useState<string | null>(null);
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');

  React.useEffect(() => {
    const savedTheme = (localStorage.getItem('crm-theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Register service worker for PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('crm-theme', nextTheme);
  };

  return (
    <>
      <header className="bg-theme-sur border-b border-theme-bor px-3 sm:px-6 h-14 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile hamburger menu */}
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 rounded-lg text-theme-txt2 hover:text-theme-txt bg-theme-sur2 border border-theme-bor cursor-pointer"
            title="Abrir menú de filtros"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="w-2.5 h-2.5 rounded-full bg-[#00a870] shadow-[0_0_10px_#00a870] animate-pulse shrink-0" />
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-theme-txt truncate">
            CRM <span className="text-[#00a870]">LINKEDIN</span>
          </span>
          <span className="hidden lg:inline text-[11px] font-mono text-theme-txt2 bg-theme-sur2 px-2 py-0.5 rounded border border-theme-bor">
            Neon Postgres
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {initStatus && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#00a870] bg-[#00a870]/10 border border-[#00a870]/20 px-3 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{initStatus}</span>
            </div>
          )}

          {/* Manage Team Members button */}
          {onOpenTeamManager && (
            <button
              onClick={onOpenTeamManager}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-theme-txt hover:text-[#00a870] bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Crear y Gestionar Miembros del Equipo"
            >
              <UserCog className="w-3.5 h-3.5 text-[#2979ff]" />
              <span className="hidden md:inline">Equipo</span>
            </button>
          )}

          {/* New Contact button */}
          <button
            onClick={onOpenNewContact}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#00a870] hover:bg-[#008f5f] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Registrar nuevo prospecto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo Prospecto</span>
            <span className="sm:hidden">Nuevo</span>
          </button>

          {/* Manage Message Templates button */}
          {onOpenTemplateManager && (
            <button
              onClick={onOpenTemplateManager}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold text-theme-txt hover:text-[#00a870] bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Configurar Plantillas Comerciales"
            >
              <Settings className="w-3.5 h-3.5 text-[#00a870]" />
              <span className="hidden md:inline">Plantillas</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-lg text-theme-txt2 hover:text-[#00a870] bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor transition-all cursor-pointer flex items-center gap-1.5 text-xs"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-[#00a870]" />
                <span className="hidden lg:inline">Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#2979ff]" />
                <span className="hidden lg:inline">Oscuro</span>
              </>
            )}
          </button>

          <button
            onClick={onExport}
            className="hidden sm:flex px-2.5 py-1.5 rounded-lg text-xs font-medium text-theme-txt2 hover:text-theme-txt bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor items-center gap-1.5 transition-all cursor-pointer"
            title="Exportar contactos a CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Exportar</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-1.5 sm:p-2 text-theme-txt2 hover:text-theme-txt bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor rounded-lg transition-all cursor-pointer"
            title="Refrescar datos de Neon DB"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenImport}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-theme-txt bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Importar CSV</span>
            <span className="sm:hidden">Importar</span>
          </button>
        </div>
      </header>

      {/* Navigation tabs */}
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

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-[#00a870] text-[#00a870] font-semibold'
              : 'border-transparent text-theme-txt2 hover:text-theme-txt hover:bg-theme-sur2'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Analíticas</span>
        </button>

        <button
          onClick={() => setActiveTab('ejecutivo')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ejecutivo'
              ? 'border-[#00a870] text-[#00a870] font-semibold'
              : 'border-transparent text-theme-txt2 hover:text-theme-txt hover:bg-theme-sur2'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
      </nav>
    </>
  );
}
