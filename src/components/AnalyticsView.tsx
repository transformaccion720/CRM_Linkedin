'use client';

import React, { useState, useEffect } from 'react';
import { ContactStats, ActivityLog } from '@/lib/types';
import { Users, Mail, Building2, Calendar, TrendingUp, History, RefreshCw, User, Sparkles, Filter } from 'lucide-react';

interface AnalyticsViewProps {
  stats: ContactStats | null;
}

export default function AnalyticsView({ stats }: AnalyticsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'graficas' | 'auditoria'>('auditoria');
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>('all');

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const res = await fetch('/api/activities?limit=100');
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'auditoria') {
      fetchActivities();
    }
  }, [activeSubTab]);

  if (!stats) return null;

  const total = stats.total || 0;
  const filteredActivities = activityFilter === 'all'
    ? activities
    : activities.filter((a) => a.action_type === activityFilter);

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'STATUS_CHANGE':
        return { label: 'Cambio de Estado', bg: 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30' };
      case 'PHONE_ADDED':
        return { label: 'Teléfono / WhatsApp', bg: 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30' };
      case 'EMAIL_ADDED':
        return { label: 'Email Actualizado', bg: 'bg-[#ff6d3b]/15 text-[#ff6d3b] border-[#ff6d3b]/30' };
      case 'NOTE_ADDED':
        return { label: 'Notas / Acuerdos', bg: 'bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/30' };
      default:
        return { label: 'Datos Generales', bg: 'bg-theme-sur2 text-theme-txt border-theme-bor' };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-theme-bg">
      {/* Sub-header navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-sur p-4 rounded-2xl border border-theme-bor">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-theme-txt flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00a870]" />
            <span>Analíticas & Historial de Cambios</span>
          </h2>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Métricas de prospección y auditoría de gestiones realizadas
          </p>
        </div>

        <div className="flex items-center gap-2 bg-theme-sur2 p-1 rounded-xl border border-theme-bor">
          <button
            onClick={() => setActiveSubTab('auditoria')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeSubTab === 'auditoria'
                ? 'bg-theme-sur text-[#00a870] shadow-xs'
                : 'text-theme-txt2 hover:text-theme-txt'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial de Cambios ({activities.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('graficas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeSubTab === 'graficas'
                ? 'bg-theme-sur text-[#00a870] shadow-xs'
                : 'text-theme-txt2 hover:text-theme-txt'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Distribución Temporal</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Historial de Cambios (Audit Table) */}
      {activeSubTab === 'auditoria' && (
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00a870]" />
              <h3 className="font-bold text-sm text-theme-txt">
                Registro Completo de Auditoría y Gestiones
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="bg-theme-sur2 border border-theme-bor rounded-lg px-2.5 py-1 text-xs text-theme-txt outline-hidden cursor-pointer"
              >
                <option value="all">Todas las acciones</option>
                <option value="STATUS_CHANGE">Cambios de Estado</option>
                <option value="PHONE_ADDED">Teléfonos</option>
                <option value="EMAIL_ADDED">Emails</option>
                <option value="NOTE_ADDED">Notas</option>
                <option value="DATA_UPDATE">Datos / Cargos</option>
              </select>

              <button
                onClick={fetchActivities}
                className="p-1.5 rounded-lg bg-theme-sur2 border border-theme-bor hover:text-[#00a870] transition-colors cursor-pointer text-xs flex items-center gap-1"
                title="Refrescar auditoría"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingActivities ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            </div>
          </div>

          {/* Audit Table */}
          <div className="overflow-x-auto rounded-xl border border-theme-bor">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-theme-sur2 border-b border-theme-bor font-mono uppercase text-[10px] text-theme-txt2 tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3">Contacto</th>
                  <th className="py-2.5 px-3">Tipo de Gestión</th>
                  <th className="py-2.5 px-3">Detalle del Cambio Realizado</th>
                  <th className="py-2.5 px-3">Realizado Por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-bor font-sans">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-theme-txt2">
                      No hay registros de auditoría que coincidan con el filtro
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((a) => {
                    const badge = getActionBadge(a.action_type);

                    return (
                      <tr key={a.id} className="hover:bg-theme-sur2/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-theme-txt3 whitespace-nowrap">
                          {a.created_at}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-theme-txt">
                          {a.contact_name}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-theme-txt2 font-medium">
                          {a.description}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-xs text-[#00a870] font-semibold">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{a.performed_by}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Gráficas Temporales */}
      {activeSubTab === 'graficas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Conexiones por año */}
          <div className="bg-theme-sur border border-theme-bor rounded-xl p-5 shadow-xs">
            <h3 className="font-semibold text-xs text-theme-txt mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00a870]" />
              <span>Conexiones por Año</span>
            </h3>

            <div className="space-y-2.5">
              {stats.byYear?.map((y) => {
                const count = parseInt(y.count, 10);
                const pct = total > 0 ? (count / total) * 100 : 0;

                return (
                  <div key={y.yr} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-theme-txt">{y.yr || 'Desconocido'}</span>
                      <span className="text-theme-txt2">{count.toLocaleString()} ({Math.round(pct)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-theme-sur2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00a870] rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 1)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Cargos */}
          <div className="bg-theme-sur border border-theme-bor rounded-xl p-5 shadow-xs">
            <h3 className="font-semibold text-xs text-theme-txt mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2979ff]" />
              <span>Top Cargos / Puestos Más Frecuentes</span>
            </h3>

            <div className="space-y-2.5">
              {stats.topPositions?.map((p) => {
                const count = parseInt(p.count, 10);
                const pct = total > 0 ? (count / total) * 100 : 0;

                return (
                  <div key={p.position} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-theme-txt truncate max-w-[220px] font-medium">{p.position}</span>
                      <span className="text-theme-txt2 font-mono shrink-0">{count} ({Math.round(pct)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-theme-sur2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2979ff] rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 1)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
