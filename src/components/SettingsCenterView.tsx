'use client';

import React, { useState } from 'react';
import { 
  Users, UserCog, FileSpreadsheet, MessageSquare, Download, Upload, 
  Settings, KeyRound, Shield, Check, RefreshCw, Layers, Sparkles, FolderGit2
} from 'lucide-react';
import { TeamMember } from '@/lib/types';

interface SettingsCenterViewProps {
  currentUser: TeamMember | null;
  teamMembers: TeamMember[];
  onOpenTeamManager: () => void;
  onOpenTemplateManager: () => void;
  onOpenImport: () => void;
  onExport: () => void;
  onOpenProfile: () => void;
  onOpenResources: () => void;
}

export default function SettingsCenterView({
  currentUser,
  teamMembers = [],
  onOpenTeamManager,
  onOpenTemplateManager,
  onOpenImport,
  onExport,
  onOpenProfile,
  onOpenResources,
}: SettingsCenterViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-theme-bg">
      {/* Header */}
      <div className="bg-theme-sur p-5 sm:p-6 rounded-2xl border border-theme-bor">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#00a870] font-bold bg-[#00a870]/10 px-2 py-0.5 rounded flex items-center gap-1">
            <Settings className="w-3 h-3 text-[#00a870]" />
            <span>Centro de Control & Configuración</span>
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-theme-txt">
          Ajustes del CRM, Recursos & Herramientas
        </h1>
        <p className="text-xs sm:text-sm text-theme-txt2 mt-1">
          Administra de forma unificada tu equipo comercial, directorio de recursos, plantillas de mensajes, importación y exportación.
        </p>
      </div>

      {/* Grid of Settings Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Directorio de Recursos Comerciales (Flyers, PDFs, Videos, Links) */}
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#a855f7]/50 transition-all shadow-xs group">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#a855f7]/10 text-[#a855f7] flex items-center justify-center font-bold">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-theme-txt group-hover:text-[#a855f7] transition-colors">
              Directorio de Recursos
            </h3>
            <p className="text-xs text-theme-txt2 leading-relaxed">
              Biblioteca de archivos de hasta 20 MB (PDFs, brochures, flyers) y enlaces externos de videos para enviar a prospectos.
            </p>
          </div>

          <button
            onClick={onOpenResources}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#a855f7]/15 text-[#a855f7] hover:bg-[#a855f7] hover:text-white border border-[#a855f7]/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Abrir Directorio de Archivos</span>
          </button>
        </div>

        {/* 2. Equipo Comercial */}
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#2979ff]/50 transition-all shadow-xs group">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2979ff]/10 text-[#2979ff] flex items-center justify-center font-bold">
              <UserCog className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-theme-txt group-hover:text-[#2979ff] transition-colors">
                Equipo Comercial
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-sur2 text-theme-txt3">
                {teamMembers.length} Miembros
              </span>
            </div>
            <p className="text-xs text-theme-txt2 leading-relaxed">
              Crea nuevos usuarios (Gabino, Kiara, etc.), define roles, reasigna contactos y visualiza cargas de prospección.
            </p>
          </div>

          <button
            onClick={onOpenTeamManager}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#2979ff]/15 text-[#2979ff] hover:bg-[#2979ff] hover:text-white border border-[#2979ff]/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Gestionar Equipo</span>
          </button>
        </div>

        {/* 3. Plantillas de Mensajes */}
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#00a870]/50 transition-all shadow-xs group">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#00a870]/10 text-[#00a870] flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-theme-txt group-hover:text-[#00a870] transition-colors">
              Plantillas de Prospección
            </h3>
            <p className="text-xs text-theme-txt2 leading-relaxed">
              Crea y edita plantillas para LinkedIn, WhatsApp y respuestas a publicaciones con variables automáticas {'{nombre}'}.
            </p>
          </div>

          <button
            onClick={onOpenTemplateManager}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#00a870]/15 text-[#00a870] hover:bg-[#00a870] hover:text-[#00110b] border border-[#00a870]/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Configurar Plantillas</span>
          </button>
        </div>

        {/* 4. Importar Base CSV */}
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#00a870]/50 transition-all shadow-xs group">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#00a870]/10 text-[#00a870] flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-theme-txt group-hover:text-[#00a870] transition-colors">
              Importar Contactos (CSV)
            </h3>
            <p className="text-xs text-theme-txt2 leading-relaxed">
              Carga tus conexiones exportadas de LinkedIn o bases de prospección en formato CSV para asignarlas a tu equipo.
            </p>
          </div>

          <button
            onClick={onOpenImport}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#00a870] text-[#00110b] hover:bg-[#008f5f] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs font-bold"
          >
            <Upload className="w-4 h-4" />
            <span>Importar Archivo CSV</span>
          </button>
        </div>

        {/* 5. Exportar Base de Datos */}
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#ff6d3b]/50 transition-all shadow-xs group">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#ff6d3b]/10 text-[#ff6d3b] flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-theme-txt group-hover:text-[#ff6d3b] transition-colors">
              Exportar Base Completa
            </h3>
            <p className="text-xs text-theme-txt2 leading-relaxed">
              Descarga una copia de seguridad en Excel/CSV con todos los prospectos, estados, notas, teléfonos y responsables.
            </p>
          </div>

          <button
            onClick={onExport}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-theme-sur2 text-theme-txt hover:text-[#ff6d3b] border border-theme-bor hover:border-[#ff6d3b] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Backup CSV</span>
          </button>
        </div>

        {/* 6. Mi Perfil & Contraseña */}
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#2979ff]/50 transition-all shadow-xs group">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2979ff]/10 text-[#2979ff] flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-theme-txt group-hover:text-[#2979ff] transition-colors">
              Mi Perfil & Seguridad
            </h3>
            <p className="text-xs text-theme-txt2 leading-relaxed">
              Cambia tu contraseña personal, edita tu nombre comercial y visualiza tu rol actual ({currentUser?.role || 'Comercial'}).
            </p>
          </div>

          <button
            onClick={onOpenProfile}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#2979ff]/15 text-[#2979ff] hover:bg-[#2979ff] hover:text-white border border-[#2979ff]/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Editar Mi Contraseña</span>
          </button>
        </div>
      </div>
    </div>
  );
}
