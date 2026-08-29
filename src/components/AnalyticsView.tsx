'use client';

import React from 'react';

interface AnalyticsViewProps {
  stats: {
    total: number;
    withEmail: number;
    companiesCount: number;
    recentCount: number;
    topCompanies?: { company: string; count: string }[];
    byYear?: { yr: string; count: string }[];
    topPositions?: { position: string; count: string }[];
  } | null;
}

const COLORS = ['#00e5a0', '#2979ff', '#ff6d3b', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#10b981'];

export default function AnalyticsView({ stats }: AnalyticsViewProps) {
  const years = stats?.byYear || [];
  const maxYearCount = Math.max(1, ...years.map((y) => parseInt(y.count, 10)));

  const topCompanies = stats?.topCompanies || [];
  const maxCompanyCount = Math.max(1, ...topCompanies.map((c) => parseInt(c.count, 10)));

  const topPositions = stats?.topPositions || [];
  const maxPositionCount = Math.max(1, ...topPositions.map((p) => parseInt(p.count, 10)));

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-theme-bg">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-theme-txt">Analíticas de tu Red</h2>
        <p className="text-xs text-theme-txt2 mt-1">
          Análisis detallado de tu red completa de LinkedIn almacenada en Neon DB
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Connections by year */}
        <div className="bg-theme-sur border border-theme-bor rounded-xl p-5 md:col-span-2">
          <div className="font-mono text-[10px] tracking-wider uppercase text-theme-txt2 mb-4">
            Conexiones por Año
          </div>
          <div className="flex items-end gap-2 h-32 pt-6">
            {years.map((item) => {
              const count = parseInt(item.count, 10);
              const heightPct = Math.round((count / maxYearCount) * 100);
              const isRecent = parseInt(item.yr, 10) >= 2025;

              return (
                <div key={item.yr} className="flex-1 flex flex-col items-center group">
                  <span className="font-mono text-[9px] text-theme-txt2 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    {count}
                  </span>
                  <div
                    style={{ height: `${Math.max(heightPct, 6)}%` }}
                    className={`w-full rounded-t-sm transition-all duration-500 hover:brightness-125 ${
                      isRecent ? 'bg-[#00e5a0]' : 'bg-[#2979ff]'
                    }`}
                  />
                  <span className="font-mono text-[10px] text-theme-txt2 mt-2">{item.yr}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 10 Companies */}
        <div className="bg-theme-sur border border-theme-bor rounded-xl p-5">
          <div className="font-mono text-[10px] tracking-wider uppercase text-theme-txt2 mb-4">
            Top 10 Empresas
          </div>
          <div className="space-y-3">
            {topCompanies.map((c, i) => {
              const count = parseInt(c.count, 10);
              const pct = Math.round((count / maxCompanyCount) * 100);
              const color = COLORS[i % COLORS.length];

              return (
                <div key={c.company} className="flex items-center gap-3 text-xs">
                  <div className="w-36 truncate text-theme-txt" title={c.company}>
                    {c.company}
                  </div>
                  <div className="flex-1 h-2 bg-theme-sur2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%`, backgroundColor: color }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                  <span className="font-mono text-[10px] text-theme-txt2 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Positions */}
        <div className="bg-theme-sur border border-theme-bor rounded-xl p-5">
          <div className="font-mono text-[10px] tracking-wider uppercase text-theme-txt2 mb-4">
            Top Cargos y Puestos
          </div>
          <div className="space-y-3">
            {topPositions.map((p, i) => {
              const count = parseInt(p.count, 10);
              const pct = Math.round((count / maxPositionCount) * 100);
              const color = COLORS[i % COLORS.length];

              return (
                <div key={p.position} className="flex items-center gap-3 text-xs">
                  <div className="w-36 truncate text-theme-txt" title={p.position}>
                    {p.position}
                  </div>
                  <div className="flex-1 h-2 bg-theme-sur2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%`, backgroundColor: color }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                  <span className="font-mono text-[10px] text-theme-txt2 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
