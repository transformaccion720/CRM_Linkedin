'use client';

import React from 'react';
import { ContactStats } from '@/lib/types';
import { Users, Mail, Building2, Calendar, Target, Award, Clock, ArrowUpRight, Phone, CheckCircle2, TrendingUp, UserCheck, Shield, Globe } from 'lucide-react';

interface ExecutiveDashboardProps {
  stats: ContactStats | null;
}

export default function ExecutiveDashboard({ stats }: ExecutiveDashboardProps) {
  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-xs text-theme-txt2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00a870] animate-ping" />
          <span>Cargando métricas consolidadas...</span>
        </div>
      </div>
    );
  }

  const total = stats.total || 0;
  const withEmail = stats.withEmail || 0;
  const withPhone = stats.withPhone || 0;
  const companiesCount = stats.companiesCount || 0;

  const inContact = stats.byStatus['En contacto'] || stats.byStatus['Contactado'] || 0;
  const opportunity = stats.byStatus['Oportunidad'] || 0;
  const client = stats.byStatus['Cliente'] || stats.byStatus['Calificado'] || 0;
  const paused = stats.byStatus['En pausa'] || 0;
  const uncontacted = stats.byStatus['Sin contactar'] || (total - inContact - opportunity - client - paused);

  const emailPct = total > 0 ? Math.round((withEmail / total) * 100) : 0;
  const phonePct = total > 0 ? Math.round((withPhone / total) * 100) : 0;
  const conversionRate = total > 0 ? ((client / total) * 100).toFixed(1) : '0';

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-theme-bg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-sur p-5 rounded-2xl border border-theme-bor">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00a870] font-bold bg-[#00a870]/10 px-2 py-0.5 rounded">
              KPIs & Performance Ejecutivo
            </span>
            <span className="text-[10px] font-mono text-theme-txt3">Actualizado en tiempo real</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-theme-txt">
            Panel de Control Global y Desempeño Comercial
          </h2>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Métricas estratégicas consolidadas, distribución geográfica y rendimiento por comercial
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-theme-sur2 border border-theme-bor px-3.5 py-2 rounded-xl text-center">
            <span className="text-[10px] font-mono uppercase text-theme-txt3 block">Base Total</span>
            <span className="text-base font-extrabold text-[#00a870] font-mono">{total.toLocaleString()}</span>
          </div>
          <div className="bg-theme-sur2 border border-theme-bor px-3.5 py-2 rounded-xl text-center">
            <span className="text-[10px] font-mono uppercase text-theme-txt3 block">Tasa Conversión</span>
            <span className="text-base font-extrabold text-[#2979ff] font-mono">{conversionRate}%</span>
          </div>
        </div>
      </div>

      {/* Global Highlights Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-theme-sur border border-theme-bor p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-theme-txt2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Contactos con Email</span>
            <div className="p-2 rounded-lg bg-[#00a870]/15 text-[#00a870]">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-theme-txt font-mono">{withEmail.toLocaleString()}</div>
          <div className="text-[11px] text-theme-txt3 mt-1 font-mono">{emailPct}% con correo validado</div>
        </div>

        <div className="bg-theme-sur border border-theme-bor p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-theme-txt2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Con Teléfono / WhatsApp</span>
            <div className="p-2 rounded-lg bg-[#2979ff]/15 text-[#2979ff]">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-[#2979ff] font-mono">{withPhone.toLocaleString()}</div>
          <div className="text-[11px] text-theme-txt3 mt-1 font-mono">{phonePct}% con número directo</div>
        </div>

        <div className="bg-theme-sur border border-theme-bor p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-theme-txt2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Empresas Únicas</span>
            <div className="p-2 rounded-lg bg-[#f59e0b]/15 text-[#f59e0b]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-theme-txt font-mono">{companiesCount.toLocaleString()}</div>
          <div className="text-[11px] text-theme-txt3 mt-1 font-mono">Cuentas corporativas B2B</div>
        </div>

        <div className="bg-theme-sur border border-theme-bor p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-theme-txt2 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Oportunidades & Clientes</span>
            <div className="p-2 rounded-lg bg-[#ff6d3b]/15 text-[#ff6d3b]">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-[#ff6d3b] font-mono">{(opportunity + client).toLocaleString()}</div>
          <div className="text-[11px] text-theme-txt3 mt-1 font-mono">{client} cierres logrados</div>
        </div>
      </div>

      {/* Breakdown by Commercial Team Member */}
      {stats.byMember && stats.byMember.length > 0 && (
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#00a870]" />
                <span>Rendimiento por Miembro del Equipo Comercial</span>
              </h3>
              <p className="text-xs text-theme-txt2 mt-0.5">
                Seguimiento de bases asignadas, enriquecimiento de datos y avance en el embudo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {stats.byMember.map((m) => {
              const mTotal = m.total || 0;
              const mEmailPct = mTotal > 0 ? Math.round((m.withEmail / mTotal) * 100) : 0;
              const mPhonePct = mTotal > 0 ? Math.round((m.withPhone / mTotal) * 100) : 0;
              const mSuccess = mTotal > 0 ? (((m.opportunity + m.client) / mTotal) * 100).toFixed(1) : '0';

              return (
                <div
                  key={m.member_name}
                  className="bg-theme-sur2/70 border border-theme-bor hover:border-theme-bor2 rounded-xl p-4 transition-all shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#00a870]/15 text-[#00a870] font-bold text-xs flex items-center justify-center">
                        {m.member_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-theme-txt">{m.member_name}</h4>
                        <span className="text-[10px] text-theme-txt3 font-mono">Comercial asignado</span>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-extrabold text-[#00a870] bg-[#00a870]/10 px-2 py-0.5 rounded border border-[#00a870]/20">
                      {mTotal.toLocaleString()} leads
                    </span>
                  </div>

                  {/* Funnel mini-bar for this member */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-theme-txt2">
                      <span>Progreso del Funnel:</span>
                      <span className="text-[#ff6d3b] font-bold">{mSuccess}% avanzado</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-mono pt-1">
                      <div className="p-1 rounded bg-theme-sur border border-theme-bor">
                        <span className="text-theme-txt3 block text-[8.5px]">CONTACT</span>
                        <span className="font-bold text-[#2979ff]">{m.inContact}</span>
                      </div>
                      <div className="p-1 rounded bg-theme-sur border border-theme-bor">
                        <span className="text-theme-txt3 block text-[8.5px]">OPORT</span>
                        <span className="font-bold text-[#ff6d3b]">{m.opportunity}</span>
                      </div>
                      <div className="p-1 rounded bg-theme-sur border border-theme-bor">
                        <span className="text-theme-txt3 block text-[8.5px]">CLIENTE</span>
                        <span className="font-bold text-[#00a870]">{m.client}</span>
                      </div>
                      <div className="p-1 rounded bg-theme-sur border border-theme-bor">
                        <span className="text-theme-txt3 block text-[8.5px]">PAUSA</span>
                        <span className="font-bold text-[#f59e0b]">{m.paused}</span>
                      </div>
                    </div>
                  </div>

                  {/* Enriched data pills */}
                  <div className="flex items-center justify-between text-[10.5px] font-mono text-theme-txt3 pt-2 border-t border-theme-bor">
                    <span>📧 {m.withEmail} emails ({mEmailPct}%)</span>
                    <span>📱 {m.withPhone} tels ({mPhonePct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid: Global Pipeline + Geographic Distribution (Countries) + Top Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Global Pipeline Conversion */}
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-3.5">
          <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00a870]" />
            <span>Embudo Global de Conversión</span>
          </h3>

          <div className="space-y-2.5 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-theme-txt2">1. Base Sin Contactar</span>
                <span className="font-mono font-bold text-theme-txt">{uncontacted.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-theme-sur2 rounded-full overflow-hidden">
                <div className="h-full bg-[#7d8fa8]" style={{ width: `${total > 0 ? (uncontacted / total) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-theme-txt2">2. En Conversación</span>
                <span className="font-mono font-bold text-[#2979ff]">{inContact.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-theme-sur2 rounded-full overflow-hidden">
                <div className="h-full bg-[#2979ff]" style={{ width: `${total > 0 ? (inContact / total) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-theme-txt2">3. Oportunidad Calificada</span>
                <span className="font-mono font-bold text-[#ff6d3b]">{opportunity.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-theme-sur2 rounded-full overflow-hidden">
                <div className="h-full bg-[#ff6d3b]" style={{ width: `${total > 0 ? (opportunity / total) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-theme-txt2">4. Clientes Ganados</span>
                <span className="font-mono font-bold text-[#00a870]">{client.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-theme-sur2 rounded-full overflow-hidden">
                <div className="h-full bg-[#00a870]" style={{ width: `${total > 0 ? (client / total) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Geographic Distribution: Top Countries */}
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-3.5">
          <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#f59e0b]" />
            <span>Distribución por País</span>
          </h3>

          <div className="space-y-2 pt-1">
            {stats.topCountries && stats.topCountries.length > 0 ? (
              stats.topCountries.map((c) => {
                const count = parseInt(c.count, 10);
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                return (
                  <div key={c.country} className="p-2 rounded-lg bg-theme-sur2 border border-theme-bor space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-theme-txt font-semibold flex items-center gap-1.5 truncate max-w-[170px]">
                        <span>🌎</span>
                        <span>{c.country}</span>
                      </span>
                      <span className="font-mono font-bold text-[#f59e0b]">
                        {count.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-theme-sur rounded-full overflow-hidden">
                      <div className="h-full bg-[#f59e0b]" style={{ width: `${Math.max(pct, 2)}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-theme-txt2">
                Sin datos de país registrados
              </div>
            )}
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-3.5">
          <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#2979ff]" />
            <span>Top Empresas con Mayor Red</span>
          </h3>

          <div className="space-y-2 pt-1">
            {stats.topCompanies && stats.topCompanies.map((c) => (
              <div key={c.company} className="flex items-center justify-between p-2 rounded-lg bg-theme-sur2 border border-theme-bor text-xs">
                <span className="text-theme-txt font-medium truncate max-w-[180px]">{c.company}</span>
                <span className="font-mono font-bold text-[#00a870] px-2 py-0.5 bg-theme-sur rounded border border-theme-bor">
                  {c.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
