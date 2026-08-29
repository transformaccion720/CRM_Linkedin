'use client';

import React from 'react';

interface ExecutiveDashboardProps {
  stats: {
    total: number;
    withEmail: number;
    companiesCount: number;
    recentCount: number;
    byStatus: Record<string, number>;
    topCompanies?: { company: string; count: string }[];
    recentContacts?: { id: string; first_name: string; last_name: string; connected_on: string }[];
  } | null;
}

export default function ExecutiveDashboard({ stats }: ExecutiveDashboardProps) {
  const total = stats?.total || 0;
  const withEmail = stats?.withEmail || 0;
  const companies = stats?.companiesCount || 0;
  const recent = stats?.recentCount || 0;
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
    <div className="flex-1 overflow-y-auto p-6 bg-theme-bg space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-theme-txt">Dashboard Ejecutivo</h2>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Estado general del pipeline y salud de tu red de contactos en Neon DB
          </p>
        </div>
        <span className="font-mono text-[10px] text-theme-txt2 bg-theme-sur border border-theme-bor px-3 py-1 rounded-full">
          Red completa · Sin filtros
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-theme-sur border-l-4 border-l-[#dde3ef] border border-theme-bor rounded-xl p-3.5 shadow-xs">
          <div className="font-mono text-[9px] uppercase tracking-wider text-theme-txt2 mb-1">Red Total</div>
          <div className="text-2xl font-bold text-theme-txt">{total.toLocaleString()}</div>
          <div className="text-[10px] text-theme-txt2 mt-1">Contactos LinkedIn</div>
        </div>

        <div className="bg-theme-sur border-l-4 border-l-[#00e5a0] border border-theme-bor rounded-xl p-3.5 shadow-xs">
          <div className="font-mono text-[9px] uppercase tracking-wider text-theme-txt2 mb-1">Con Email</div>
          <div className="text-2xl font-bold text-[#00e5a0]">{withEmail.toLocaleString()}</div>
          <div className="text-[10px] text-theme-txt2 mt-1">{emailPct}% accionables</div>
        </div>

        <div className="bg-theme-sur border-l-4 border-l-[#2979ff] border border-theme-bor rounded-xl p-3.5 shadow-xs">
          <div className="font-mono text-[9px] uppercase tracking-wider text-theme-txt2 mb-1">Empresas</div>
          <div className="text-2xl font-bold text-[#2979ff]">{companies.toLocaleString()}</div>
          <div className="text-[10px] text-theme-txt2 mt-1">Organizaciones</div>
        </div>

        <div className="bg-theme-sur border-l-4 border-l-[#ff6d3b] border border-theme-bor rounded-xl p-3.5 shadow-xs">
          <div className="font-mono text-[9px] uppercase tracking-wider text-theme-txt2 mb-1">Pipeline</div>
          <div className="text-2xl font-bold text-[#ff6d3b]">{managed.toLocaleString()}</div>
          <div className="text-[10px] text-theme-txt2 mt-1">{managedPct}% con estado</div>
        </div>

        <div className="bg-theme-sur border-l-4 border-l-[#00e5a0] border border-theme-bor rounded-xl p-3.5 shadow-xs">
          <div className="font-mono text-[9px] uppercase tracking-wider text-theme-txt2 mb-1">Tasa Calificación</div>
          <div className="text-2xl font-bold text-[#00e5a0]">{qualRate}%</div>
          <div className="text-[10px] text-theme-txt2 mt-1">Calificados / gestión</div>
        </div>

        <div className="bg-theme-sur border-l-4 border-l-[#2979ff] border border-theme-bor rounded-xl p-3.5 shadow-xs">
          <div className="font-mono text-[9px] uppercase tracking-wider text-theme-txt2 mb-1">Recientes</div>
          <div className="text-2xl font-bold text-[#2979ff]">{recent.toLocaleString()}</div>
          <div className="text-[10px] text-theme-txt2 mt-1">2025–2026</div>
        </div>
      </div>

      {/* Grid with Funnel & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Funnel */}
        <div className="bg-theme-sur border border-theme-bor rounded-xl p-5 shadow-xs">
          <div className="font-mono text-[10px] tracking-wider uppercase text-theme-txt2 mb-4">
            Pipeline · Nuevo → Contactado → Calificado
          </div>
          <div className="space-y-3">
            {steps.map((step) => {
              const pct = Math.round((step.count / maxStep) * 100);
              const shareOfManaged = managed > 0 ? Math.round((step.count / managed) * 100) : 0;

              return (
                <div key={step.label} className="flex items-center gap-3 text-xs">
                  <div className="w-24 text-theme-txt">{step.label}</div>
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
          <div className="mt-4 pt-3 border-t border-theme-bor text-[11px] text-theme-txt2">
            Descartados: <span className="text-theme-txt font-bold">{(byStatus.lost || 0).toLocaleString()}</span> · Sin asignar: <span className="text-theme-txt font-bold">{(byStatus.unassigned || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Insights Automáticos */}
        <div className="bg-theme-sur border border-theme-bor rounded-xl p-5 shadow-xs">
          <div className="font-mono text-[10px] tracking-wider uppercase text-theme-txt2 mb-4">
            Insights Automáticos
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
                  <b className="text-theme-txt">{byStatus.unassigned.toLocaleString()} contactos</b> están sin gestionar en el pipeline de seguimiento.
                </p>
              </div>
            )}

            {top1Company && (
              <div className="p-3 bg-theme-sur2/50 border border-theme-bor rounded-lg flex items-start gap-2.5 text-xs">
                <div className="w-5 h-5 rounded-full bg-[#ff6d3b]/15 text-[#ff6d3b] flex items-center justify-center shrink-0 text-[10px] font-bold">
                  ★
                </div>
                <p className="text-theme-txt2">
                  Tu empresa con mayor presencia es <b className="text-theme-txt">{top1Company.company}</b> con {top1Company.count} conexiones.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
