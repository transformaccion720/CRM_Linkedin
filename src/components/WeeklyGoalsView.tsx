'use client';

import React, { useState, useEffect } from 'react';
import { Target, Trophy, Flame, ChevronLeft, ChevronRight, Settings2, TrendingUp, Phone, Users, CheckCircle2, MessageSquare, Award, AlertCircle } from 'lucide-react';
import { WeeklySprintData } from '@/lib/types';

interface WeeklyGoalsViewProps {
  onOpenGoalConfig?: () => void;
}

export default function WeeklyGoalsView() {
  const [sprintData, setSprintData] = useState<WeeklySprintData | null>(null);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Edit goal form state
  const [contactedGoal, setContactedGoal] = useState<number>(150);
  const [phonesGoal, setPhonesGoal] = useState<number>(25);
  const [opportunitiesGoal, setOpportunitiesGoal] = useState<number>(8);
  const [clientsGoal, setClientsGoal] = useState<number>(2);
  const [savingGoals, setSavingGoals] = useState(false);

  const fetchSprint = async (offset = weekOffset) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/goals?weekOffset=${offset}`);
      if (res.ok) {
        const data = await res.json();
        setSprintData(data.sprint);
        if (data.sprint?.goals) {
          setContactedGoal(data.sprint.goals.contacted);
          setPhonesGoal(data.sprint.goals.phones);
          setOpportunitiesGoal(data.sprint.goals.opportunities);
          setClientsGoal(data.sprint.goals.clients);
        }
      }
    } catch (e) {
      console.error('Error fetching sprint data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSprint(weekOffset);
  }, [weekOffset]);

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGoals(true);
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacted: contactedGoal,
          phones: phonesGoal,
          opportunities: opportunitiesGoal,
          clients: clientsGoal,
        }),
      });
      if (res.ok) {
        setIsConfigOpen(false);
        fetchSprint(weekOffset);
      }
    } catch (e) {
      console.error('Error saving goals:', e);
    } finally {
      setSavingGoals(false);
    }
  };

  if (loading && !sprintData) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-xs text-theme-txt2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00a870] animate-ping" />
          <span>Calculando sprint comercial y objetivos semanales...</span>
        </div>
      </div>
    );
  }

  const global = sprintData?.global_totals;
  const members = sprintData?.members_progress || [];

  // Sort members by overall percentage (Rankings)
  const rankedMembers = [...members].sort((a, b) => b.overall_pct - a.overall_pct);

  const getStatusColor = (pct: number) => {
    if (pct >= 80) return { text: 'text-[#00a870]', bg: 'bg-[#00a870]', border: 'border-[#00a870]/30', badge: 'bg-[#00a870]/15' };
    if (pct >= 50) return { text: 'text-[#f59e0b]', bg: 'bg-[#f59e0b]', border: 'border-[#f59e0b]/30', badge: 'bg-[#f59e0b]/15' };
    return { text: 'text-[#ff6d3b]', bg: 'bg-[#ff6d3b]', border: 'border-[#ff6d3b]/30', badge: 'bg-[#ff6d3b]/15' };
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-theme-bg">
      {/* Sprint Header & Week Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-sur p-5 rounded-2xl border border-theme-bor">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00a870] font-bold bg-[#00a870]/10 px-2 py-0.5 rounded flex items-center gap-1">
              <Flame className="w-3 h-3 text-[#ff6d3b]" />
              <span>Sprint Comercial Semanal</span>
            </span>
            <span className="text-[10px] font-mono text-theme-txt3">Lunes a Domingo</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-theme-txt">
            {sprintData?.week_label || 'Sprint Semanal'}
          </h2>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Monitoreo en tiempo real de metas comerciales por miembro del equipo
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Week Selector */}
          <div className="flex items-center bg-theme-sur2 border border-theme-bor rounded-xl p-1">
            <button
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-1 text-theme-txt2 hover:text-theme-txt rounded-lg hover:bg-theme-sur cursor-pointer"
              title="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 text-xs font-mono font-bold text-theme-txt">
              {weekOffset === 0 ? 'Semana Actual' : weekOffset === -1 ? 'Semana Pasada' : `Semana (${weekOffset})`}
            </span>
            <button
              onClick={() => setWeekOffset((prev) => Math.min(prev + 1, 0))}
              disabled={weekOffset >= 0}
              className="p-1 text-theme-txt2 hover:text-theme-txt rounded-lg hover:bg-theme-sur disabled:opacity-30 cursor-pointer"
              title="Siguiente semana"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Goal Config Button */}
          <button
            onClick={() => setIsConfigOpen(true)}
            className="px-3 py-2 bg-[#00a870]/15 hover:bg-[#00a870]/25 text-[#00a870] border border-[#00a870]/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Definir Metas</span>
          </button>
        </div>
      </div>

      {/* Global Team Sprint Progress Bar */}
      {global && (
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
                <Target className="w-4 h-4 text-[#00a870]" />
                <span>Cumplimiento Global del Equipo</span>
              </h3>
              <p className="text-xs text-theme-txt2 mt-0.5">
                Avance ponderado hacia la meta colectiva de la semana
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-mono font-black ${getStatusColor(global.overall_pct).text}`}>
                {global.overall_pct}%
              </span>
              <span className="text-xs text-theme-txt3 font-mono">completado</span>
            </div>
          </div>

          {/* Large Progress Bar */}
          <div className="w-full h-3.5 bg-theme-sur2 rounded-full overflow-hidden p-0.5 border border-theme-bor">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getStatusColor(global.overall_pct).bg}`}
              style={{ width: `${Math.max(global.overall_pct, 2)}%` }}
            />
          </div>

          {/* 4 Objective Pillars Global Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* 1. Contactados */}
            <div className="bg-theme-sur2 border border-theme-bor p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between text-theme-txt2 mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider">💬 Contactados</span>
                <span className="text-[11px] font-bold font-mono text-[#2979ff]">
                  {Math.round((global.contacted_actual / Math.max(global.contacted_goal, 1)) * 100)}%
                </span>
              </div>
              <div className="text-base font-extrabold text-theme-txt font-mono">
                {global.contacted_actual} <span className="text-xs text-theme-txt3 font-normal">/ {global.contacted_goal}</span>
              </div>
              <div className="w-full h-1.5 bg-theme-sur rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-[#2979ff]"
                  style={{ width: `${Math.min(100, (global.contacted_actual / Math.max(global.contacted_goal, 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* 2. Teléfonos */}
            <div className="bg-theme-sur2 border border-theme-bor p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between text-theme-txt2 mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider">📱 Teléfonos</span>
                <span className="text-[11px] font-bold font-mono text-[#00a870]">
                  {Math.round((global.phones_actual / Math.max(global.phones_goal, 1)) * 100)}%
                </span>
              </div>
              <div className="text-base font-extrabold text-theme-txt font-mono">
                {global.phones_actual} <span className="text-xs text-theme-txt3 font-normal">/ {global.phones_goal}</span>
              </div>
              <div className="w-full h-1.5 bg-theme-sur rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-[#00a870]"
                  style={{ width: `${Math.min(100, (global.phones_actual / Math.max(global.phones_goal, 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* 3. Oportunidades */}
            <div className="bg-theme-sur2 border border-theme-bor p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between text-theme-txt2 mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider">🔥 Oportunidades</span>
                <span className="text-[11px] font-bold font-mono text-[#ff6d3b]">
                  {Math.round((global.opportunities_actual / Math.max(global.opportunities_goal, 1)) * 100)}%
                </span>
              </div>
              <div className="text-base font-extrabold text-[#ff6d3b] font-mono">
                {global.opportunities_actual} <span className="text-xs text-theme-txt3 font-normal">/ {global.opportunities_goal}</span>
              </div>
              <div className="w-full h-1.5 bg-theme-sur rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-[#ff6d3b]"
                  style={{ width: `${Math.min(100, (global.opportunities_actual / Math.max(global.opportunities_goal, 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* 4. Cierres */}
            <div className="bg-theme-sur2 border border-theme-bor p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between text-theme-txt2 mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider">🏆 Cierres</span>
                <span className="text-[11px] font-bold font-mono text-[#a855f7]">
                  {Math.round((global.clients_actual / Math.max(global.clients_goal, 1)) * 100)}%
                </span>
              </div>
              <div className="text-base font-extrabold text-[#00a870] font-mono">
                {global.clients_actual} <span className="text-xs text-theme-txt3 font-normal">/ {global.clients_goal}</span>
              </div>
              <div className="w-full h-1.5 bg-theme-sur rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-[#a855f7]"
                  style={{ width: `${Math.min(100, (global.clients_actual / Math.max(global.clients_goal, 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Performance per Member (Cards with Breakdown) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#f59e0b]" />
            <span>Desempeño Individual del Sprint</span>
          </h3>
          <span className="text-xs text-theme-txt3 font-mono">
            {rankedMembers.length} comerciales monitoreados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rankedMembers.map((m, index) => {
            const colors = getStatusColor(m.overall_pct);
            const isLeader = index === 0 && m.overall_pct > 0;

            return (
              <div
                key={m.member_name}
                className="bg-theme-sur border border-theme-bor hover:border-theme-bor2 rounded-2xl p-5 shadow-xs space-y-4 transition-all relative overflow-hidden"
              >
                {/* Top Member Card Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs"
                      style={{ backgroundColor: m.color || '#00a870' }}
                    >
                      {m.member_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-theme-txt">{m.member_name}</h4>
                        {isLeader && (
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40 flex items-center gap-0.5">
                            <Award className="w-3 h-3" />
                            <span>Líder</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-theme-txt3 font-mono">Comercial asignado</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xl font-extrabold font-mono ${colors.text}`}>
                      {m.overall_pct}%
                    </span>
                    <span className="text-[10px] text-theme-txt3 block font-mono">cumplimiento</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-theme-sur2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colors.bg}`}
                    style={{ width: `${Math.max(m.overall_pct, 2)}%` }}
                  />
                </div>

                {/* 4 Metrics for this member */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs pt-1">
                  <div className="p-2 rounded-xl bg-theme-sur2 border border-theme-bor">
                    <span className="text-[9.5px] font-mono uppercase text-theme-txt3 block mb-0.5">Contactados</span>
                    <span className="font-bold text-theme-txt font-mono">
                      {m.contacted_actual} <span className="text-theme-txt3 text-[10px]">/{m.contacted_goal}</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-theme-sur2 border border-theme-bor">
                    <span className="text-[9.5px] font-mono uppercase text-theme-txt3 block mb-0.5">Teléfonos</span>
                    <span className="font-bold text-[#00a870] font-mono">
                      {m.phones_actual} <span className="text-theme-txt3 text-[10px]">/{m.phones_goal}</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-theme-sur2 border border-theme-bor">
                    <span className="text-[9.5px] font-mono uppercase text-theme-txt3 block mb-0.5">Oportunid.</span>
                    <span className="font-bold text-[#ff6d3b] font-mono">
                      {m.opportunities_actual} <span className="text-theme-txt3 text-[10px]">/{m.opportunities_goal}</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-theme-sur2 border border-theme-bor">
                    <span className="text-[9.5px] font-mono uppercase text-theme-txt3 block mb-0.5">Cierres</span>
                    <span className="font-bold text-[#a855f7] font-mono">
                      {m.clients_actual} <span className="text-theme-txt3 text-[10px]">/{m.clients_goal}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Configuration Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-theme-txt animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 px-6 border-b border-theme-bor flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#00a870]" />
                <h3 className="font-bold text-sm text-theme-txt">Definir Metas Semanales</h3>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="p-1 text-theme-txt2 hover:text-theme-txt rounded-lg hover:bg-theme-sur2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGoals} className="p-6 space-y-4 text-xs">
              <p className="text-theme-txt2 text-xs">
                Ajusta los objetivos semanales esperados para cada comercial. El progreso se recalcula automáticamente.
              </p>

              <div>
                <label className="text-[11px] font-mono uppercase text-theme-txt2 block mb-1">
                  💬 Contactados por semana (Mensajes enviados)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={contactedGoal}
                  onChange={(e) => setContactedGoal(Number(e.target.value))}
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs text-theme-txt font-mono outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-theme-txt2 block mb-1">
                  📱 Teléfonos / WhatsApp conseguidos
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={phonesGoal}
                  onChange={(e) => setPhonesGoal(Number(e.target.value))}
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs text-theme-txt font-mono outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-theme-txt2 block mb-1">
                  🔥 Oportunidades calificadas
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={opportunitiesGoal}
                  onChange={(e) => setOpportunitiesGoal(Number(e.target.value))}
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs text-theme-txt font-mono outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-theme-txt2 block mb-1">
                  🏆 Clientes cerrados en la semana
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={clientsGoal}
                  onChange={(e) => setClientsGoal(Number(e.target.value))}
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs text-theme-txt font-mono outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs text-theme-txt2 hover:bg-theme-sur2 border border-theme-bor cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingGoals}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#00110b] bg-[#00a870] hover:bg-[#00a870]/90 disabled:opacity-50 cursor-pointer shadow-md shadow-[#00a870]/20"
                >
                  {savingGoals ? 'Guardando...' : 'Guardar Metas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
