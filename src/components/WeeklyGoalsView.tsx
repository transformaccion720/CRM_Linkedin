'use client';

import React, { useState, useEffect } from 'react';
import { WeeklySprintData, WeeklyGoal, DayBreakdown } from '@/lib/types';
import { 
  Trophy, Target, Zap, Phone, Star, Sparkles, TrendingUp, CheckCircle2, 
  Settings2, ChevronLeft, ChevronRight, Users, Flame, Clock, Award, BarChart3, CalendarDays, Calendar
} from 'lucide-react';

export default function WeeklyGoalsView() {
  const [sprintData, setSprintData] = useState<WeeklySprintData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [selectedDayBreakdown, setSelectedDayBreakdown] = useState<DayBreakdown | null>(null);

  // Form states for manual goal configuration
  const [dailyGoalInput, setDailyGoalInput] = useState<number>(30);
  const [contactedGoalInput, setContactedGoalInput] = useState<number>(150);
  const [phonesGoalInput, setPhonesGoalInput] = useState<number>(25);
  const [oppsGoalInput, setOppsGoalInput] = useState<number>(8);
  const [clientsGoalInput, setClientsGoalInput] = useState<number>(2);
  const [savingGoals, setSavingGoals] = useState<boolean>(false);

  const fetchSprintData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/goals?weekOffset=${weekOffset}`);
      if (res.ok) {
        const data = await res.json();
        setSprintData(data.sprint);
        if (data.sprint?.goals) {
          setDailyGoalInput(data.sprint.goals.daily_contacted || 30);
          setContactedGoalInput(data.sprint.goals.contacted || 150);
          setPhonesGoalInput(data.sprint.goals.phones || 25);
          setOppsGoalInput(data.sprint.goals.opportunities || 8);
          setClientsGoalInput(data.sprint.goals.clients || 2);
        }
      }
    } catch (e) {
      console.error('Error fetching weekly sprint goals:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSprintData();
  }, [weekOffset]);

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGoals(true);
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daily_contacted: dailyGoalInput,
          contacted: contactedGoalInput,
          phones: phonesGoalInput,
          opportunities: oppsGoalInput,
          clients: clientsGoalInput,
        }),
      });

      if (res.ok) {
        setIsConfigOpen(false);
        fetchSprintData();
      }
    } catch (e) {
      console.error('Error saving goals:', e);
    } finally {
      setSavingGoals(false);
    }
  };

  const getStatusColor = (pct: number) => {
    if (pct >= 100) return { bg: 'bg-[#00a870]', text: 'text-[#00a870]', border: 'border-[#00a870]/30', label: 'Meta Superada 🚀' };
    if (pct >= 70) return { bg: 'bg-[#2979ff]', text: 'text-[#2979ff]', border: 'border-[#2979ff]/30', label: 'Ritmo Óptimo ⚡' };
    if (pct >= 40) return { bg: 'bg-[#f59e0b]', text: 'text-[#f59e0b]', border: 'border-[#f59e0b]/30', label: 'En Progreso ⏳' };
    return { bg: 'bg-[#ff6d3b]', text: 'text-[#ff6d3b]', border: 'border-[#ff6d3b]/30', label: 'Por Acelerar ⚠️' };
  };

  if (loading && !sprintData) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-xs text-theme-txt2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00a870] animate-ping" />
          <span>Cargando datos del Sprint Comercial...</span>
        </div>
      </div>
    );
  }

  const global = sprintData?.global_totals;
  const members = sprintData?.members_progress || [];
  const rankedMembers = [...members].sort((a, b) => b.overall_pct - a.overall_pct);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-theme-bg">
      {/* Sprint Header & Week Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-sur p-5 rounded-2xl border border-theme-bor">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00a870] font-bold bg-[#00a870]/10 px-2 py-0.5 rounded flex items-center gap-1">
              <Flame className="w-3 h-3 text-[#ff6d3b]" />
              <span>Sprint Comercial Semanal & Diario</span>
            </span>
            <span className="text-[10px] font-mono text-theme-txt3">Lunes a Domingo</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-theme-txt">
            {sprintData?.week_label || 'Sprint Semanal'}
          </h2>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Monitoreo en tiempo real de metas diarias, semanales y desglose día a día
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

      {/* Global Team Sprint Progress Bar + Daily Rhythm Banner */}
      {global && (
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
                <Target className="w-4 h-4 text-[#00a870]" />
                <span>Cumplimiento Global del Equipo ({sprintData?.week_label})</span>
              </h3>
              <p className="text-xs text-theme-txt2 mt-0.5">
                Ponderación: 35% Contactos Semanales + 25% Teléfonos + 25% Oportunidades + 15% Cierres
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(global.overall_pct).text} ${getStatusColor(global.overall_pct).border} bg-theme-sur2`}>
                {getStatusColor(global.overall_pct).label}
              </span>
              <span className="text-xl font-extrabold font-mono text-theme-txt">
                {global.overall_pct}%
              </span>
            </div>
          </div>

          {/* Master Progress Bar */}
          <div className="w-full h-3 bg-theme-sur2 rounded-full overflow-hidden border border-theme-bor p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getStatusColor(global.overall_pct).bg}`}
              style={{ width: `${Math.max(global.overall_pct, 2)}%` }}
            />
          </div>

          {/* Daily Rhythm Tracker Card (Meta Hoy) */}
          <div className="p-4 bg-theme-sur2/90 border border-theme-bor rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f59e0b]/15 text-[#f59e0b] flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-theme-txt">Ritmo Diario de Prospección (Hoy)</span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#00a870]/15 text-[#00a870] font-bold border border-[#00a870]/30">
                    Meta: {sprintData?.goals?.daily_contacted || 30} / día por comercial
                  </span>
                </div>
                <p className="text-xs text-theme-txt2">
                  El equipo ha abordado a <b className="text-theme-txt font-mono">{global.contacted_today_total}</b> prospectos hoy ({global.today_pct_total}% de la meta diaria global de {global.contacted_daily_goal_total})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-36 h-2.5 bg-theme-sur rounded-full overflow-hidden border border-theme-bor">
                <div
                  className="h-full bg-[#f59e0b] rounded-full transition-all"
                  style={{ width: `${Math.min(global.today_pct_total, 100)}%` }}
                />
              </div>
              <span className="font-mono font-bold text-xs text-[#f59e0b] min-w-[45px] text-right">
                {global.today_pct_total}%
              </span>
            </div>
          </div>

          {/* NEW: Timeline Semanal Día a Día (7 Días Lunes a Domingo) */}
          {global.global_days_breakdown && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 flex items-center gap-1.5 font-bold">
                  <CalendarDays className="w-3.5 h-3.5 text-[#00a870]" />
                  <span>Desglose Diario de la Semana (Lunes a Domingo):</span>
                </span>
                <span className="text-[10.5px] font-mono text-theme-txt3">
                  Pasa el mouse para ver detalles
                </span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {global.global_days_breakdown.map((day) => {
                  const isHit = day.pct >= 100;

                  return (
                    <div
                      key={day.date_str}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        day.is_today
                          ? 'bg-[#00a870]/10 border-[#00a870] shadow-xs'
                          : day.contacted_count > 0
                          ? 'bg-theme-sur2 border-theme-bor'
                          : 'bg-theme-sur2/40 border-theme-bor/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="font-bold text-theme-txt">{day.day_name}</span>
                        <span className="text-theme-txt3">{day.display_date}</span>
                      </div>

                      <div className="text-sm font-extrabold font-mono text-theme-txt my-0.5">
                        {day.contacted_count}
                      </div>

                      <div className="text-[9.5px] font-mono text-theme-txt3">
                        Meta: {day.goal_count}
                      </div>

                      <div className="w-full h-1 bg-theme-sur rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full ${isHit ? 'bg-[#00a870]' : 'bg-[#f59e0b]'}`}
                          style={{ width: `${Math.min(day.pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4 Core Weekly Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {/* 1. Contactados */}
            <div className="bg-theme-sur2 border border-theme-bor p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between text-theme-txt2 mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider">📤 Contactados</span>
                <span className="text-[11px] font-bold font-mono text-[#00a870]">
                  {Math.round((global.contacted_actual / Math.max(global.contacted_goal, 1)) * 100)}%
                </span>
              </div>
              <div className="text-base font-extrabold text-theme-txt font-mono">
                {global.contacted_actual} <span className="text-xs text-theme-txt3 font-normal">/ {global.contacted_goal}</span>
              </div>
              <div className="w-full h-1.5 bg-theme-sur rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-[#00a870]"
                  style={{ width: `${Math.min(100, (global.contacted_actual / Math.max(global.contacted_goal, 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* 2. Teléfonos */}
            <div className="bg-theme-sur2 border border-theme-bor p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between text-theme-txt2 mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider">📱 Teléfonos</span>
                <span className="text-[11px] font-bold font-mono text-[#2979ff]">
                  {Math.round((global.phones_actual / Math.max(global.phones_goal, 1)) * 100)}%
                </span>
              </div>
              <div className="text-base font-extrabold text-[#2979ff] font-mono">
                {global.phones_actual} <span className="text-xs text-theme-txt3 font-normal">/ {global.phones_goal}</span>
              </div>
              <div className="w-full h-1.5 bg-theme-sur rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-[#2979ff]"
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
            const daily = m.daily_progress;

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
                      style={{ backgroundColor: m.color }}
                    >
                      {m.member_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-theme-txt">{m.member_name}</span>
                        {isLeader && (
                          <span className="text-[9.5px] font-mono font-bold text-[#f59e0b] bg-[#f59e0b]/15 px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#f59e0b]/30">
                            👑 Líder
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-theme-txt2 font-mono">
                        Cumplimiento: <b className={`font-bold ${colors.text}`}>{m.overall_pct}%</b>
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full border ${colors.text} ${colors.border} bg-theme-sur2`}>
                    {colors.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-theme-sur2 rounded-full overflow-hidden border border-theme-bor">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colors.bg}`}
                    style={{ width: `${Math.max(m.overall_pct, 2)}%` }}
                  />
                </div>

                {/* Daily Sub-Bar for this Member */}
                {daily && (
                  <div className="p-2.5 bg-theme-sur2/70 border border-theme-bor rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
                      <span className="text-[11px] text-theme-txt font-medium">
                        Meta Hoy: <b className="font-mono text-theme-txt font-bold">{daily.contacted_today}</b> / {daily.contacted_daily_goal}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[#f59e0b] text-[11px]">
                      {daily.today_pct}% del día
                    </span>
                  </div>
                )}

                {/* Individual 7-Day Mini Breakdown */}
                {m.days_breakdown && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-mono uppercase text-theme-txt3 block font-bold">
                      Ritmo Día a Día (Lun - Dom)
                    </span>
                    <div className="grid grid-cols-7 gap-1">
                      {m.days_breakdown.map((d) => (
                        <div
                          key={d.date_str}
                          className={`p-1.5 rounded-lg border text-center text-[9.5px] font-mono ${
                            d.is_today
                              ? 'bg-[#00a870]/15 border-[#00a870] font-bold text-[#00a870]'
                              : d.contacted_count > 0
                              ? 'bg-theme-sur2 border-theme-bor text-theme-txt'
                              : 'bg-theme-sur2/40 border-theme-bor/40 text-theme-txt3 opacity-50'
                          }`}
                          title={`${d.day_name} ${d.display_date}: ${d.contacted_count} contactados`}
                        >
                          <div className="text-[8.5px] text-theme-txt3">{d.day_name}</div>
                          <div className="font-bold my-0.5">{d.contacted_count}</div>
                          <div className="text-[7.5px] text-theme-txt3">{d.display_date}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                <h3 className="font-bold text-sm text-theme-txt">Definir Metas Diarias & Semanales</h3>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="p-1 text-theme-txt2 hover:text-theme-txt rounded-lg hover:bg-theme-sur2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGoals} className="p-6 space-y-4 text-xs">
              <p className="text-xs text-theme-txt2 leading-relaxed">
                Ajusta las metas comerciales por miembro del equipo. Estos objetivos regirán los indicadores del Sprint y las alertas del sistema.
              </p>

              {/* Daily Contacted Goal Input */}
              <div className="p-3 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl">
                <label className="text-[11px] font-mono uppercase text-[#f59e0b] block mb-1 font-bold">
                  ⚡ Meta Diaria de Contactos (Por Comercial)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    required
                    value={dailyGoalInput}
                    onChange={(e) => setDailyGoalInput(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-theme-sur border border-theme-bor focus:border-[#f59e0b] rounded-lg px-3 py-2 text-sm font-bold font-mono text-theme-txt outline-hidden"
                  />
                  <span className="text-xs text-theme-txt3 font-mono">leads/día</span>
                </div>
              </div>

              {/* Weekly Goals */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] font-mono uppercase text-theme-txt2 block mb-1">
                    📤 Meta Semanal de Contactados (Total Semana)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={contactedGoalInput}
                    onChange={(e) => setContactedGoalInput(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs font-mono text-theme-txt outline-hidden font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono uppercase text-theme-txt2 block mb-1">
                      📱 Teléfonos Obtenidos
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={phonesGoalInput}
                      onChange={(e) => setPhonesGoalInput(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs font-mono text-theme-txt outline-hidden font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-theme-txt2 block mb-1">
                      🔥 Oportunidades
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={oppsGoalInput}
                      onChange={(e) => setOppsGoalInput(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs font-mono text-theme-txt outline-hidden font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-theme-txt2 block mb-1">
                    🏆 Cierres de Ventas (Clientes)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={clientsGoalInput}
                    onChange={(e) => setClientsGoalInput(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs font-mono text-theme-txt outline-hidden font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-theme-bor">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-theme-txt2 hover:bg-theme-sur2 border border-theme-bor cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingGoals}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-[#00110b] bg-[#00a870] hover:bg-[#00a870]/90 disabled:opacity-50 cursor-pointer shadow-md shadow-[#00a870]/20"
                >
                  {savingGoals ? 'Guardando...' : 'Guardar y Aplicar Metas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
