'use client';

import { ContactStats } from '@/lib/types';
import { Users, Mail, Building2, Calendar, Filter } from 'lucide-react';

interface StatsCardsProps {
  stats: ContactStats | null;
  showingCount: number;
}

export default function StatsCards({ stats, showingCount }: StatsCardsProps) {
  const total = stats?.total || 0;
  const withEmail = stats?.withEmail || 0;
  const companies = stats?.companiesCount || 0;
  const recent = stats?.recentCount || 0;
  const emailPct = total > 0 ? ((withEmail / total) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 border-b border-theme-bor bg-theme-sur/60 shrink-0">
      <div className="bg-theme-sur border border-theme-bor rounded-xl p-3 shadow-xs hover:border-theme-bor2 transition-all">
        <div className="flex items-center justify-between text-theme-txt2 text-xs font-mono mb-1 uppercase tracking-wider">
          <span>Total Red</span>
          <Users className="w-3.5 h-3.5 text-[#00e5a0]" />
        </div>
        <div className="text-2xl font-bold text-theme-txt tracking-tight">{total.toLocaleString()}</div>
        <div className="text-[11px] text-theme-txt2 mt-0.5">Contactos LinkedIn</div>
      </div>

      <div className="bg-theme-sur border border-theme-bor rounded-xl p-3 shadow-xs hover:border-theme-bor2 transition-all">
        <div className="flex items-center justify-between text-theme-txt2 text-xs font-mono mb-1 uppercase tracking-wider">
          <span>Con Email</span>
          <Mail className="w-3.5 h-3.5 text-[#00e5a0]" />
        </div>
        <div className="text-2xl font-bold text-[#00e5a0] tracking-tight">{withEmail.toLocaleString()}</div>
        <div className="text-[11px] text-theme-txt2 mt-0.5">{emailPct}% del total</div>
      </div>

      <div className="bg-theme-sur border border-theme-bor rounded-xl p-3 shadow-xs hover:border-theme-bor2 transition-all">
        <div className="flex items-center justify-between text-theme-txt2 text-xs font-mono mb-1 uppercase tracking-wider">
          <span>Empresas</span>
          <Building2 className="w-3.5 h-3.5 text-[#2979ff]" />
        </div>
        <div className="text-2xl font-bold text-[#2979ff] tracking-tight">{companies.toLocaleString()}</div>
        <div className="text-[11px] text-theme-txt2 mt-0.5">Compañías únicas</div>
      </div>

      <div className="bg-theme-sur border border-theme-bor rounded-xl p-3 shadow-xs hover:border-theme-bor2 transition-all">
        <div className="flex items-center justify-between text-theme-txt2 text-xs font-mono mb-1 uppercase tracking-wider">
          <span>Recientes</span>
          <Calendar className="w-3.5 h-3.5 text-[#ff6d3b]" />
        </div>
        <div className="text-2xl font-bold text-[#ff6d3b] tracking-tight">{recent.toLocaleString()}</div>
        <div className="text-[11px] text-theme-txt2 mt-0.5">2025–2026</div>
      </div>

      <div className="bg-theme-sur border border-theme-bor rounded-xl p-3 shadow-xs col-span-2 md:col-span-1">
        <div className="flex items-center justify-between text-theme-txt2 text-xs font-mono mb-1 uppercase tracking-wider">
          <span>Mostrando</span>
          <Filter className="w-3.5 h-3.5 text-theme-txt" />
        </div>
        <div className="text-2xl font-bold text-theme-txt tracking-tight">{showingCount.toLocaleString()}</div>
        <div className="text-[11px] text-theme-txt2 mt-0.5">Contactos filtrados</div>
      </div>
    </div>
  );
}
