'use client';

import React, { useState } from 'react';
import { ContactStats } from '@/lib/types';
import { Users, Mail, Building2, Calendar, Filter, TrendingUp, CheckCircle, Clock, Star } from 'lucide-react';

interface ExecutiveDashboardProps {
  stats: (ContactStats & {
    pendingFollowUps?: number;
    topPositions?: { position: string; count: string }[];
    recentContacts?: { id: string; first_name: string; last_name: string; connected_on: string }[];
  }) | null;
}

export default function ExecutiveDashboard({ stats }: ExecutiveDashboardProps) {
  const total = stats?.total || 0;
  const withEmail = stats?.withEmail || 0;
  const companies = stats?.companiesCount || 0;
  const recent = stats?.recentCount || 0;
  const pendingFollowUps = stats?.pendingFollowUps || 0;
  const byStatus = stats?.byStatus || { new: 0, contacted: 0, qualified: 0, lost: 0, unassigned: 0 };

  const managed = (byStatus.new || 0) + (byStatus.contacted || 0) + (byStatus.qualified || 0) + (byStatus.lost || 0);
  const qualRate = managed > 0 ? Math.round(((byStatus.qualified || 0) / managed) * 100) : 0;
  const emailPct = total > 0 ? ((withEmail / total) * 100).toFixed(1) : '0';
  const managedPct = total > 0 ? ((managed / total) * 100).toFixed(1) : '0';

  const steps = [
    { label: 'Nuevo', count: byStatus.new || 0, color: '#2979ff' },
    { label: 'Contactado', count: byStatus.contacted || 0, color: '#ff6d3b' },
    { label: 'Calificado', count: byStatus.qualified || 0, color: '#00e5a0' },
  ];
  const maxStep = Math.max(1, ...steps.map((s) => s.count));

  const top1Company = stats?.topCompanies?.[0];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-theme-bg space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-theme-txt">Dashboard Ejecutivo y Métricas</h2>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Consolidado general de tu red, pipeline y salud de prospección
          </p>
        </div>
        <span className="font-mono text-[10px] text-theme-txt2 bg-theme-sur border border-theme-bor px-3 py-1 rounded-full shrink-0">
          Red completa · Sincronizada
        </span>
      </div>

      {/* Main Consolidated KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* Total Red */}
        <div className="bg-theme-sur border-l-4 border-l-[#00e5a0] border border-theme-bor rounded-xl p-3 sm:p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-theme-txt2 text-[10px] font-mono mb-1 uppercase tracking-wider">
            <span>Total Red</span>
            <Users className="w-3.5 h-3.5 text-[#00e5a0]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-theme-txt">{total.toLocaleString()}</div>
          <div className="text-[10px] text-theme-txt2 mt-0.5">Contactos LinkedIn</div>
        </div>

        {/* Con Email */}
        <div className="bg-theme-sur border-l-4 border-l-[#00e5a0] border border-theme-bor rounded-xl p-3 sm:p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-theme-txt2 text-[10px] font-mono mb-1 uppercase tracking-wider">
            <span>Con Email</span>
            <Mail className="w-3.5 h-3.5 text-[#00e5a0]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#00e5a0]">{withEmail.toLocaleString()}</div>
          <div className="text-[10px] text-theme-txt2 mt-0.5">{emailPct}% del total</div>
        </div>

        {/* Empresas */}
        <div className="bg-theme-sur border-l-4 border-l-[#2979ff] border border-theme-bor rounded-xl p-3 sm:p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-theme-txt2 text-[10px] font-mono mb-1 uppercase tracking-wider">
            <span>Empresas</span>
            <Building2 className="w-3.5 h-3.5 text-[#2979ff]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#2979ff]">{companies.toLocaleString()}</div>
          <div className="text-[10px] text-theme-txt2 mt-0.5">Compañías únicas</div>
        </div>

        {/* Recientes */}
        <div className="bg-theme-sur border-l-4 border-l-[#ff6d3b] border border-theme-bor rounded-xl p-3 sm:p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-theme-txt2 text-[10px] font-mono mb-1 uppercase tracking-wider">
            <span>Recientes</span>
            <Calendar className="w-3.5 h-3.5 text-[#ff6d3b]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#ff6d3b]">{recent.toLocaleString()}</div>
          <div className="text-[10px] text-theme-txt2 mt-0.5">2025–2026</div>
        </div>

        {/* Seguimientos Pendientes */}
        <div className="bg-theme-sur border-l-4 border-l-[#ff6d3b] border border-theme-bor rounded-xl p-3 sm:p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-theme-txt2 text-[10px] font-mono mb-1 uppercase tracking-wider">
            <span>Seguimientos</span>
            <Clock className="w-3.5 h-3.5 text-[#ff6d3b]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#ff6d3b]">{pendingFollowUps.toLocaleString()}</div>
          <div className="text-[10px] text-theme-txt2 mt-0.5">Hoy y próximos 7 días</div>
        </div>

        {/* Tasa Calificación */}
        <div className="bg-theme-sur border-l-4 border-l-[#00e5a0] border border-theme-bor rounded-xl p-3 sm:p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-theme-txt2 text-[10px] font-mono mb-1 uppercase tracking-wider">
            <span>Conversión</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#00e5a0]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#00e5a0]">{qualRate}%</div>
          <div className="text-[10px] text-theme-txt2 mt-0.5">Calificados / gestión</div>
        </div>
      </div>

      {/* Grid with Funnel & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Funnel */}
        <div className="bg-theme-sur border border-theme-bor rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="font-mono text-[10px] tracking-wider uppercase text-theme-txt2 mb-3">
            Pipeline · Nuevo → Contactado → Calificado
          </div>
          <div className="space-y-3">
            {steps.map((step) => {
              const pct = Math.round((step.count / maxStep) * 100);
              const shareOfManaged = managed > 0 ? Math.round((step.count / managed) * 100) : 0;

              return (
                <div key={step.label} className="flex items-center gap-3 text-xs">
                  <div className="w-24 text-theme-txt font-medium">{step.label}</div>
                  <div className="flex-1 h-6 bg-theme-sur2 rounded-lg overflow-hidden relative">
                    <div
                      style={{ width: `${Math.max(pct, 6)}%`, backgroundColor: step.color }}
                      className="h-full flex items-center justify-end pr-2 rounded-lg text-[10px] font-bold text-[#00110b] transition-all duration-500"
                    >
                      {step.count.toLocaleString()}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-theme-txt2 w-10 text-right">{shareOfManaged}%</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-theme-bor text-[11px] text-theme-txt2 flex justify-between flex-wrap gap-2">
            <span>Descartados: <b className="text-theme-txt">{(byStatus.lost || 0).toLocaleString()}</b></span>
            <span>Sin asignar: <b className="text-theme-txt">{(byStatus.unassigned || 0).toLocaleString()}</b></span>
          </div>
        </div>

        {/* Insights Automáticos */}
        <div className="bg-theme-sur border border-theme-bor rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="font-mono text-[10px] tracking-wider uppercase text-theme-txt2 mb-3">
            Insights y Oportunidades Clave
          </div>
          <div className="space-y-2.5">
            <div className="p-3 bg-theme-sur2/50 border border-theme-bor rounded-lg flex items-start gap-2.5 text-xs">
              <div className="w-5 h-5 rounded-full bg-[#00e5a0]/15 text-[#00e5a0] flex items-center justify-center shrink-0 text-[10px] font-bold">
                %
              </div>
              <p className="text-theme-txt2">
                El <b className="text-theme-txt">{((withEmail / Math.max(1, total)) * 100).toFixed(0)}%</b> de tu red ({withEmail.toLocaleString()} contactos) tiene correo disponible para contacto directo.
              </p>
            </div>

            {byStatus.unassigned > 0 && (
              <div className="p-3 bg-theme-sur2/50 border border-theme-bor rounded-lg flex items-start gap-2.5 text-xs">
                <div className="w-5 h-5 rounded-full bg-[#2979ff]/15 text-[#2979ff] flex items-center justify-center shrink-0 text-[10px] font-bold">
                  ○
                </div>
                <p className="text-theme-txt2">
                  <b className="text-theme-txt">{byStatus.unassigned.toLocaleString()} contactos</b> listos para ser prospectados en tus campañas de Gestión Ágil o Consultoría.
                </p>
              </div>
            )}

            {top1Company && (
              <div className="p-3 bg-theme-sur2/50 border border-theme-bor rounded-lg flex items-start gap-2.5 text-xs">
                <div className="w-5 h-5 rounded-full bg-[#ff6d3b]/15 text-[#ff6d3b] flex items-center justify-center shrink-0 text-[10px] font-bold">
                  ★
                </div>
                <p className="text-theme-txt2">
                  Empresa con mayor presencia: <b className="text-theme-txt">{top1Company.company}</b> ({top1Company.count} conexiones).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
