'use client';

import React, { useState, useEffect } from 'react';
import { WeeklySprintData, WeeklyGoal, DayBreakdown, SegmentedWeeklyGoals } from '@/lib/types';
import { 
  Trophy, Target, Zap, Phone, Star, Sparkles, TrendingUp, CheckCircle2, 
  Settings2, ChevronLeft, ChevronRight, Users, Flame, Clock, Award, BarChart3, 
  CalendarDays, Calendar, Building2, UserCheck, ShieldCheck, ArrowRight, RefreshCw,
  HelpCircle, Check
} from 'lucide-react';

export default function WeeklyGoalsView() {
  const [goalSegment, setGoalSegment] = useState<'all' | 'B2B' | 'B2C'>('all');
  const [allGoals, setAllGoals] = useState<SegmentedWeeklyGoals | null>(null);
  const [sprintData, setSprintData] = useState<WeeklySprintData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isUpdatingAssignee, setIsUpdatingAssignee] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'rhythm' | 'pillars' | 'members' | 'overview'>('rhythm');

  const fetchSprintData = async (offset = weekOffset, seg = goalSegment) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/goals?weekOffset=${offset}&segment=${seg}`);
      if (res.ok) {
        const data = await res.json();
        setSprintData(data.sprint);
        if (data.all_goals) {
          setAllGoals(data.all_goals);
        }
      }
    } catch (e) {
      console.error('Error fetching weekly sprint goals:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSprintData(weekOffset, goalSegment);
  }, [weekOffset, goalSegment]);

  // Quick reassign lead for B2B or B2C
  const handleQuickReassign = async (segmentKey: 'b2b' | 'b2c', newAssignee: string) => {
    if (!allGoals) return;
    setIsUpdatingAssignee(true);
    try {
      const updatedAllGoals = {
        ...allGoals,
        [segmentKey]: {
          ...allGoals[segmentKey],
          assignee: newAssignee,
        },
      };

      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          all_goals: updatedAllGoals,
          segment: segmentKey === 'b2b' ? 'B2B' : 'B2C',
          updated_by: newAssignee,
        }),
      });

      if (res.ok) {
        setAllGoals(updatedAllGoals);
        await fetchSprintData(weekOffset, goalSegment);
      }
    } catch (e) {
      console.error('Error updating assignee:', e);
    } finally {
      setIsUpdatingAssignee(false);
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

  const b2bAssignee = allGoals?.b2b?.assignee || 'Gabino';
  const b2cAssignee = allGoals?.b2c?.assignee || 'Kiara';

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-theme-bg">
      {/* Sprint Header & Week Navigator & Segment Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-theme-sur p-5 rounded-2xl border border-theme-bor shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00a870] font-bold bg-[#00a870]/10 px-2 py-0.5 rounded flex items-center gap-1">
              <Flame className="w-3 h-3 text-[#ff6d3b]" />
              <span>Sprint Comercial Semanal & Diario</span>
            </span>
            <span className="text-[10px] font-mono text-theme-txt3">Lunes a Domingo</span>

            {/* Segment indicator badge */}
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              goalSegment === 'B2B'
                ? 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30'
                : goalSegment === 'B2C'
                ? 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30'
                : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
            }`}>
              {goalSegment === 'B2B' ? '🏢 B2B Corporativo' : goalSegment === 'B2C' ? '👤 B2C Alumnos' : '🌐 Consolidado Global'}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-theme-txt flex items-center gap-2">
            <span>{sprintData?.week_label || 'Sprint Semanal'}</span>
          </h2>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Monitoreo en tiempo real de metas diarias, semanales y desglose por línea de negocio
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segment Selector Tabs */}
          <div className="flex items-center bg-theme-sur2 border border-theme-bor rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => setGoalSegment('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                goalSegment === 'all'
                  ? 'bg-theme-sur text-theme-txt shadow-xs border border-theme-bor'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
            >
              <span>🌐</span>
              <span>Consolidado</span>
            </button>

            <button
              onClick={() => setGoalSegment('B2B')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                goalSegment === 'B2B'
                  ? 'bg-[#2979ff] text-white shadow-xs font-extrabold'
                  : 'text-theme-txt2 hover:text-theme-txt hover:bg-theme-sur/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>B2B ({b2bAssignee})</span>
            </button>

            <button
              onClick={() => setGoalSegment('B2C')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                goalSegment === 'B2C'
                  ? 'bg-[#00a870] text-white shadow-xs font-extrabold'
                  : 'text-theme-txt2 hover:text-theme-txt hover:bg-theme-sur/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>B2C ({b2cAssignee})</span>
            </button>
          </div>

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
            className="px-3.5 py-2 bg-[#00a870]/15 hover:bg-[#00a870]/25 text-[#00a870] border border-[#00a870]/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Settings2 className="w-4 h-4" />
            <span>Definir Metas</span>
          </button>
        </div>
      </div>

      {/* Segment Assignment & Mutual Co-Management Banner */}
      <div className={`p-4 rounded-2xl border transition-all ${
        goalSegment === 'B2B'
          ? 'bg-[#2979ff]/10 border-[#2979ff]/30 text-theme-txt'
          : goalSegment === 'B2C'
          ? 'bg-[#00a870]/10 border-[#00a870]/30 text-theme-txt'
          : 'bg-theme-sur border-theme-bor text-theme-txt'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
              goalSegment === 'B2B'
                ? 'bg-[#2979ff]/20 text-[#2979ff]'
                : goalSegment === 'B2C'
                ? 'bg-[#00a870]/20 text-[#00a870]'
                : 'bg-purple-500/20 text-purple-400'
            }`}>
              {goalSegment === 'B2B' ? <Building2 className="w-5 h-5" /> : goalSegment === 'B2C' ? <Users className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm">
                  {goalSegment === 'B2B' 
                    ? 'Sprint B2B Corporativo (Formación In-Company, RRHH, Talento & Directivos)' 
                    : goalSegment === 'B2C' 
                    ? 'Sprint B2C Alumnos (Agilidad, Scrum Master & Certificaciones Abiertas)' 
                    : 'Sprint Consolidado de Todo el Equipo (B2B + B2C)'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-theme-sur2 border border-theme-bor font-bold">
                  Sincronización Mutua ⚡
                </span>
              </div>
              <p className="text-xs text-theme-txt2 mt-0.5">
                {goalSegment === 'B2B'
                  ? `Líder asignado principal: ${b2bAssignee}. Kiara y Gabino tienen visibilidad total y pueden prospectar o co-gestionar en cualquier momento.`
                  : goalSegment === 'B2C'
                  ? `Líder asignada principal: ${b2cAssignee}. Gabino y Kiara tienen visibilidad total y pueden apoyar en inscripciones o prospección.`
                  : `Gestión combinada y colaborativa: Gabino (${b2bAssignee === 'Gabino' ? 'B2B' : 'Co-gestor'}) y Kiara (${b2cAssignee === 'Kiara' ? 'B2C' : 'Co-gestora'}).`}
              </p>
            </div>
          </div>

          {/* Dynamic Action Buttons / Fast Reassign */}
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            {goalSegment === 'B2B' && (
              <div className="flex items-center gap-2 bg-theme-sur/80 px-3 py-1.5 rounded-xl border border-theme-bor">
                <span className="text-[11px] font-mono text-theme-txt2">Responsable:</span>
                <select
                  value={b2bAssignee}
                  disabled={isUpdatingAssignee}
                  onChange={(e) => handleQuickReassign('b2b', e.target.value)}
                  className="bg-theme-sur2 text-xs font-bold text-[#2979ff] rounded-lg px-2 py-1 border border-theme-bor focus:outline-hidden cursor-pointer"
                >
                  <option value="Gabino">Gabino (CEO)</option>
                  <option value="Kiara">Kiara (COO)</option>
                  <option value="Ambos">Ambos (Co-Líderes)</option>
                </select>
              </div>
            )}

            {goalSegment === 'B2C' && (
              <div className="flex items-center gap-2 bg-theme-sur/80 px-3 py-1.5 rounded-xl border border-theme-bor">
                <span className="text-[11px] font-mono text-theme-txt2">Responsable:</span>
                <select
                  value={b2cAssignee}
                  disabled={isUpdatingAssignee}
                  onChange={(e) => handleQuickReassign('b2c', e.target.value)}
                  className="bg-theme-sur2 text-xs font-bold text-[#00a870] rounded-lg px-2 py-1 border border-theme-bor focus:outline-hidden cursor-pointer"
                >
                  <option value="Kiara">Kiara (COO)</option>
                  <option value="Gabino">Gabino (CEO)</option>
                  <option value="Ambos">Ambos (Co-Líderes)</option>
                </select>
              </div>
            )}

            {goalSegment === 'all' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGoalSegment('B2B')}
                  className="px-3 py-1.5 bg-[#2979ff]/15 hover:bg-[#2979ff]/25 text-[#2979ff] border border-[#2979ff]/30 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Ver B2B</span>
                </button>
                <button
                  onClick={() => setGoalSegment('B2C')}
                  className="px-3 py-1.5 bg-[#00a870]/15 hover:bg-[#00a870]/25 text-[#00a870] border border-[#00a870]/30 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Ver B2C</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation for Better Organization & Mobile UX */}
      <div className="flex items-center gap-1.5 p-1 bg-theme-sur2 border border-theme-bor rounded-xl overflow-x-auto no-scrollbar shadow-2xs">
        <button
          onClick={() => setActiveSubTab('rhythm')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'rhythm'
              ? 'bg-theme-sur text-[#00a870] shadow-xs border border-theme-bor'
              : 'text-theme-txt2 hover:text-theme-txt'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span>Ritmo & Cumplimiento</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pillars')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'pillars'
              ? 'bg-theme-sur text-[#2979ff] shadow-xs border border-theme-bor'
              : 'text-theme-txt2 hover:text-theme-txt'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#2979ff]" />
          <span>3 Pilares Comerciales</span>
        </button>

        <button
          onClick={() => setActiveSubTab('members')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'members'
              ? 'bg-theme-sur text-[#a855f7] shadow-xs border border-theme-bor'
              : 'text-theme-txt2 hover:text-theme-txt'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-[#a855f7]" />
          <span>Desempeño por Comercial</span>
        </button>

        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSubTab === 'overview'
              ? 'bg-theme-sur text-theme-txt shadow-xs border border-theme-bor'
              : 'text-theme-txt2 hover:text-theme-txt'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-theme-txt" />
          <span>Vista Integral</span>
        </button>
      </div>

      {/* SUBTAB 1 & OVERVIEW: RITMO SEMANAL Y DIARIO */}
      {(activeSubTab === 'rhythm' || activeSubTab === 'overview') && global && (
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
                <Target className="w-4 h-4 text-[#00a870]" />
                <span>
                  Cumplimiento del Sprint ({goalSegment === 'B2B' ? 'B2B Corporativo' : goalSegment === 'B2C' ? 'B2C Alumnos' : 'Consolidado Global'})
                </span>
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
          <div className="p-3.5 sm:p-4 bg-theme-sur2/90 border border-theme-bor rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f59e0b]/15 text-[#f59e0b] flex items-center justify-center font-bold shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs text-theme-txt">
                    Ritmo Diario de Prospección ({goalSegment === 'B2B' ? 'B2B' : goalSegment === 'B2C' ? 'B2C' : 'Total'} - Hoy)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#00a870]/15 text-[#00a870] font-bold border border-[#00a870]/30">
                    Meta: {sprintData?.goals?.daily_contacted || 30} / día por comercial
                  </span>
                </div>
                <p className="text-xs text-theme-txt2 mt-0.5">
                  Se ha abordado a <b className="text-theme-txt font-mono">{global.contacted_today_total}</b> prospectos hoy ({global.today_pct_total}% de la meta diaria de {global.contacted_daily_goal_total})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <div className="w-28 sm:w-36 h-2.5 bg-theme-sur rounded-full overflow-hidden border border-theme-bor">
                <div
                  className="h-full bg-[#f59e0b] rounded-full transition-all"
                  style={{ width: `${Math.min(global.today_pct_total, 100)}%` }}
                />
              </div>
              <span className="font-mono font-bold text-xs text-[#f59e0b] min-w-[40px] text-right">
                {global.today_pct_total}%
              </span>
            </div>
          </div>

          {/* Timeline Semanal Día a Día (7 Días Lunes a Domingo) - Responsive Scroll/Grid */}
          {global.global_days_breakdown && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 flex items-center gap-1.5 font-bold">
                  <CalendarDays className="w-3.5 h-3.5 text-[#00a870]" />
                  <span>Desglose Diario de la Semana ({goalSegment === 'B2B' ? 'B2B' : goalSegment === 'B2C' ? 'B2C' : 'Consolidado'}):</span>
                </span>
                <span className="text-[10px] font-mono text-theme-txt3 hidden sm:inline">
                  Lunes a Domingo
                </span>
              </div>

              <div className="flex sm:grid sm:grid-cols-7 overflow-x-auto pb-2 gap-2 no-scrollbar snap-x">
                {global.global_days_breakdown.map((day) => {
                  const isHit = day.pct >= 100;

                  return (
                    <div
                      key={day.date_str}
                      className={`min-w-[76px] sm:min-w-0 flex-1 snap-start p-2 sm:p-2.5 rounded-xl border text-center transition-all ${
                        day.is_today
                          ? 'bg-[#00a870]/10 border-[#00a870] shadow-xs ring-1 ring-[#00a870]/40'
                          : day.contacted_count > 0
                          ? 'bg-theme-sur2 border-theme-bor'
                          : 'bg-theme-sur2/40 border-theme-bor/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="font-bold text-theme-txt">{day.day_name}</span>
                        <span className="text-theme-txt3 text-[9px]">{day.display_date}</span>
                      </div>

                      <div className="text-sm font-extrabold font-mono text-theme-txt my-0.5">
                        {day.contacted_count}
                      </div>

                      <div className="text-[9px] font-mono text-theme-txt3">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
            {/* 1. Contactados */}
            <div className="bg-theme-sur2 border border-theme-bor p-3 sm:p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between text-theme-txt2 mb-1.5">
                <span className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider">📤 Contactados</span>
                <span className="text-[10.5px] sm:text-[11px] font-bold font-mono text-[#00a870]">
                  {Math.round((global.contacted_actual / Math.max(global.contacted_goal, 1)) * 100)}%
                </span>
              </div>
              <div className="text-sm sm:text-base font-extrabold text-theme-txt font-mono">
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
            <div className="bg-theme-sur2 border border-theme-bor p-3 sm:p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between text-theme-txt2 mb-1.5">
                <span className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider">📱 Teléfonos</span>
                <span className="text-[10.5px] sm:text-[11px] font-bold font-mono text-[#2979ff]">
                  {Math.round((global.phones_actual / Math.max(global.phones_goal, 1)) * 100)}%
                </span>
              </div>
              <div className="text-sm sm:text-base font-extrabold text-[#2979ff] font-mono">
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
            <div className="bg-theme-sur2 border border-theme-bor p-3 sm:p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between text-theme-txt2 mb-1.5">
                <span className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider">🔥 Oportunidades</span>
                <span className="text-[10.5px] sm:text-[11px] font-bold font-mono text-[#ff6d3b]">
                  {Math.round((global.opportunities_actual / Math.max(global.opportunities_goal, 1)) * 100)}%
                </span>
              </div>
              <div className="text-sm sm:text-base font-extrabold text-[#ff6d3b] font-mono">
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
            <div className="bg-theme-sur2 border border-theme-bor p-3 sm:p-3.5 rounded-xl shadow-2xs">
              <div className="flex items-center justify-between text-theme-txt2 mb-1.5">
                <span className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider">🏆 Cierres</span>
                <span className="text-[10.5px] sm:text-[11px] font-bold font-mono text-[#a855f7]">
                  {Math.round((global.clients_actual / Math.max(global.clients_goal, 1)) * 100)}%
                </span>
              </div>
              <div className="text-sm sm:text-base font-extrabold text-[#00a870] font-mono">
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

      {/* SUBTAB 2 & OVERVIEW: 3 PILARES COMERCIALES (ACTIVIDAD, CONVERSIÓN, DINERO) */}
      {(activeSubTab === 'pillars' || activeSubTab === 'overview') && sprintData?.weekly_pillars && (
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-theme-bor pb-3">
            <div>
              <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00a870]" />
                <span>3 Pilares del Éxito Comercial ({goalSegment === 'B2B' ? 'B2B Corporativo' : goalSegment === 'B2C' ? 'B2C Alumnos' : 'Consolidado'})</span>
              </h3>
              <p className="text-xs text-theme-txt2 mt-0.5">
                Mapeo semanal integral de Actividad, Eficacia del Funnel y Pipeline Económico
              </p>
            </div>
            <span className="text-[10px] font-mono text-theme-txt3 hidden sm:inline">
              Actividad • Conversión • Dinero
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Pilar 1: Actividad */}
            <div className="bg-theme-sur2/70 border border-[#2979ff]/30 p-4 rounded-xl shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-theme-bor pb-2">
                <span className="text-xs font-bold text-[#2979ff] flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>A. Actividad</span>
                </span>
                <span className="text-[9.5px] font-mono text-theme-txt3">Esfuerzo Semanal</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between bg-theme-sur p-2.5 rounded-lg border border-theme-bor">
                  <span className="text-xs text-theme-txt2">Nuevas empresas identificadas:</span>
                  <span className="font-mono font-bold text-sm text-theme-txt">
                    {sprintData.weekly_pillars.activity.new_companies_identified}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-theme-sur p-2.5 rounded-lg border border-theme-bor">
                  <span className="text-xs text-theme-txt2">Nuevos contactos realizados:</span>
                  <span className="font-mono font-bold text-sm text-[#2979ff]">
                    {sprintData.weekly_pillars.activity.new_contacts_made}
                  </span>
                </div>
              </div>
            </div>

            {/* Pilar 2: Conversión */}
            <div className="bg-theme-sur2/70 border border-[#ff6d3b]/30 p-4 rounded-xl shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-theme-bor pb-2">
                <span className="text-xs font-bold text-[#ff6d3b] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>B. Conversión</span>
                </span>
                <span className="text-[9.5px] font-mono text-theme-txt3">Eficacia del Funnel</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-theme-sur p-2 rounded-lg border border-theme-bor">
                  <div className="text-theme-txt3 text-[9.5px]">Respuestas:</div>
                  <div className="font-mono font-bold text-theme-txt text-xs sm:text-sm mt-0.5">
                    {sprintData.weekly_pillars.conversion.responses_received}
                  </div>
                </div>

                <div className="bg-theme-sur p-2 rounded-lg border border-theme-bor">
                  <div className="text-theme-txt3 text-[9.5px]">Reuniones agendadas:</div>
                  <div className="font-mono font-bold text-[#ff6d3b] text-xs sm:text-sm mt-0.5">
                    {sprintData.weekly_pillars.conversion.meetings_scheduled}
                  </div>
                </div>

                <div className="bg-theme-sur p-2 rounded-lg border border-theme-bor">
                  <div className="text-theme-txt3 text-[9.5px]">Oportunidades calif.:</div>
                  <div className="font-mono font-bold text-[#f59e0b] text-xs sm:text-sm mt-0.5">
                    {sprintData.weekly_pillars.conversion.qualified_opportunities}
                  </div>
                </div>

                <div className="bg-theme-sur p-2 rounded-lg border border-theme-bor">
                  <div className="text-theme-txt3 text-[9.5px]">Ventas cerradas:</div>
                  <div className="font-mono font-bold text-[#00e5a0] text-xs sm:text-sm mt-0.5">
                    {sprintData.weekly_pillars.conversion.deals_won}
                  </div>
                </div>
              </div>
            </div>

            {/* Pilar 3: Dinero */}
            <div className="bg-theme-sur2/70 border border-[#00e5a0]/30 p-4 rounded-xl shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-theme-bor pb-2">
                <span className="text-xs font-bold text-[#00e5a0] flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>C. Dinero</span>
                </span>
                <span className="text-[9.5px] font-mono text-theme-txt3">Pipeline Activo</span>
              </div>

              <div className="space-y-2.5">
                <div className="bg-theme-sur p-3 rounded-lg border border-theme-bor">
                  <div className="text-xs text-theme-txt2">Valor total del pipeline:</div>
                  <div className="font-mono font-extrabold text-lg sm:text-xl text-[#00e5a0] mt-0.5">
                    ${sprintData.weekly_pillars.financial.pipeline_total_value.toLocaleString('en-US', { minimumFractionDigits: 0 })} USD
                  </div>
                </div>

                <div className="text-[10.5px] text-theme-txt3 font-mono">
                  {sprintData.weekly_pillars.financial.deals_count} oportunidades activas registradas con valor económico.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3 & OVERVIEW: DESEMPEÑO POR COMERCIAL (GABINO & KIARA) */}
      {(activeSubTab === 'members' || activeSubTab === 'overview') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#f59e0b]" />
              <span>
                {goalSegment === 'B2B' 
                  ? `Desempeño del Líder B2B Corporativo (${b2bAssignee})` 
                  : goalSegment === 'B2C' 
                  ? `Desempeño de la Líder B2C Alumnos (${b2cAssignee})` 
                  : 'Desempeño Consolidado del Equipo (Gabino & Kiara)'}
              </span>
            </h3>
            <span className="text-xs text-theme-txt3 font-mono">
              {goalSegment === 'all' ? `${rankedMembers.length} comerciales consolidados` : `1 responsable asignado`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rankedMembers.map((m, index) => {
              const colors = getStatusColor(m.overall_pct);
              const isLeader = index === 0 && m.overall_pct > 0;
              const daily = m.daily_progress;

              const isB2BLead = (goalSegment === 'B2B' && m.member_name.toLowerCase().includes(b2bAssignee.toLowerCase()));
              const isB2CLead = (goalSegment === 'B2C' && m.member_name.toLowerCase().includes(b2cAssignee.toLowerCase()));
              const isPrimaryForSegment = isB2BLead || isB2CLead;

              return (
                <div
                  key={m.member_name}
                  className="bg-theme-sur border border-theme-bor hover:border-theme-bor2 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 transition-all relative overflow-hidden"
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-theme-txt">{m.member_name}</span>
                          {isPrimaryForSegment && (
                            <span className="text-[9.5px] font-mono font-bold text-[#00a870] bg-[#00a870]/15 px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#00a870]/30">
                              ⭐ Asignado Principal
                            </span>
                          )}
                          {!isPrimaryForSegment && goalSegment !== 'all' && (
                            <span className="text-[9.5px] font-mono font-bold text-theme-txt2 bg-theme-sur2 px-2 py-0.5 rounded-full flex items-center gap-1 border border-theme-bor">
                              🤝 Co-gestión / Apoyo
                            </span>
                          )}
                          {isLeader && goalSegment === 'all' && (
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

                    <span className={`text-[10px] sm:text-[10.5px] font-bold px-2.5 py-1 rounded-full border ${colors.text} ${colors.border} bg-theme-sur2 shrink-0`}>
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

                  {/* Individual 7-Day Mini Breakdown - Responsive Snap Scroll */}
                  {m.days_breakdown && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-mono uppercase text-theme-txt3 block font-bold">
                        Ritmo Día a Día (Lun - Dom)
                      </span>
                      <div className="flex sm:grid sm:grid-cols-7 overflow-x-auto pb-1 gap-1 no-scrollbar snap-x">
                        {m.days_breakdown.map((d) => (
                          <div
                            key={d.date_str}
                            className={`min-w-[48px] sm:min-w-0 flex-1 snap-start p-1.5 rounded-lg border text-center text-[9.5px] font-mono ${
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
                      <span className="text-[9px] sm:text-[9.5px] font-mono uppercase text-theme-txt3 block mb-0.5">Contactados</span>
                      <span className="font-bold text-theme-txt font-mono">
                        {m.contacted_actual} <span className="text-theme-txt3 text-[10px]">/{m.contacted_goal}</span>
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-theme-sur2 border border-theme-bor">
                      <span className="text-[9px] sm:text-[9.5px] font-mono uppercase text-theme-txt3 block mb-0.5">Teléfonos</span>
                      <span className="font-bold text-[#00a870] font-mono">
                        {m.phones_actual} <span className="text-theme-txt3 text-[10px]">/{m.phones_goal}</span>
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-theme-sur2 border border-theme-bor">
                      <span className="text-[9px] sm:text-[9.5px] font-mono uppercase text-theme-txt3 block mb-0.5">Oportunid.</span>
                      <span className="font-bold text-[#ff6d3b] font-mono">
                        {m.opportunities_actual} <span className="text-theme-txt3 text-[10px]">/{m.opportunities_goal}</span>
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-theme-sur2 border border-theme-bor">
                      <span className="text-[9px] sm:text-[9.5px] font-mono uppercase text-theme-txt3 block mb-0.5">Cierres</span>
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
      )}

      {/* Goal Configuration Modal - Supports B2B, B2C and Global */}
      <GoalConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        initialSegment={goalSegment === 'all' ? 'global' : goalSegment === 'B2B' ? 'b2b' : 'b2c'}
        allGoals={allGoals}
        onSaved={() => fetchSprintData(weekOffset, goalSegment)}
      />
    </div>
  );
}

interface GoalConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSegment: 'b2b' | 'b2c' | 'global';
  allGoals?: SegmentedWeeklyGoals | null;
  onSaved: () => void;
}

const GoalConfigModal = React.memo(function GoalConfigModal({
  isOpen,
  onClose,
  initialSegment,
  allGoals,
  onSaved,
}: GoalConfigModalProps) {
  const [activeTab, setActiveTab] = useState<'b2b' | 'b2c' | 'global'>(initialSegment);

  // Segment states
  const [b2bGoals, setB2BGoals] = useState<WeeklyGoal>({
    daily_contacted: 15,
    contacted: 75,
    phones: 15,
    opportunities: 5,
    clients: 1,
    assignee: 'Gabino',
  });

  const [b2cGoals, setB2CGoals] = useState<WeeklyGoal>({
    daily_contacted: 30,
    contacted: 150,
    phones: 25,
    opportunities: 10,
    clients: 3,
    assignee: 'Kiara',
  });

  const [globalGoals, setGlobalGoals] = useState<WeeklyGoal>({
    daily_contacted: 45,
    contacted: 225,
    phones: 40,
    opportunities: 15,
    clients: 4,
    mode: 'mutual',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialSegment);
      if (allGoals) {
        if (allGoals.b2b) setB2BGoals({ ...allGoals.b2b, assignee: allGoals.b2b.assignee || 'Gabino' });
        if (allGoals.b2c) setB2CGoals({ ...allGoals.b2c, assignee: allGoals.b2c.assignee || 'Kiara' });
        if (allGoals.global) setGlobalGoals({ ...allGoals.global });
      }
    }
  }, [isOpen, initialSegment, allGoals]);

  if (!isOpen) return null;

  const currentGoal = activeTab === 'b2b' ? b2bGoals : activeTab === 'b2c' ? b2cGoals : globalGoals;

  const updateCurrentGoalField = (field: keyof WeeklyGoal, value: any) => {
    if (activeTab === 'b2b') {
      setB2BGoals((prev) => ({ ...prev, [field]: value }));
    } else if (activeTab === 'b2c') {
      setB2CGoals((prev) => ({ ...prev, [field]: value }));
    } else {
      setGlobalGoals((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        all_goals: {
          b2b: b2bGoals,
          b2c: b2cGoals,
          global: globalGoals,
        },
        segment: activeTab === 'b2b' ? 'B2B' : activeTab === 'b2c' ? 'B2C' : 'all',
        updated_by: activeTab === 'b2b' ? b2bGoals.assignee : activeTab === 'b2c' ? b2cGoals.assignee : 'Administrador',
      };

      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onClose();
        onSaved();
      }
    } catch (e) {
      console.error('Error saving goals:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-theme-txt animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 px-6 border-b border-theme-bor flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#00a870]" />
            <h3 className="font-bold text-sm text-theme-txt">Definir Metas Semanales & Diarias</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-theme-txt2 hover:text-theme-txt rounded-lg hover:bg-theme-sur2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher: B2B vs B2C vs Global */}
        <div className="p-4 pb-0 bg-theme-sur2/40 border-b border-theme-bor flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('b2b')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'b2b'
                ? 'border-[#2979ff] text-[#2979ff] bg-theme-sur'
                : 'border-transparent text-theme-txt2 hover:text-theme-txt'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>🏢 B2B Corporativo ({b2bGoals.assignee || 'Gabino'})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('b2c')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'b2c'
                ? 'border-[#00a870] text-[#00a870] bg-theme-sur'
                : 'border-transparent text-theme-txt2 hover:text-theme-txt'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>👤 B2C Alumnos ({b2cGoals.assignee || 'Kiara'})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('global')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'global'
                ? 'border-purple-500 text-purple-400 bg-theme-sur'
                : 'border-transparent text-theme-txt2 hover:text-theme-txt'
            }`}
          >
            <span>🌐 Global / Consolidado</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Header info per tab */}
          <div className="p-3 rounded-xl bg-theme-sur2 border border-theme-bor flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-xs text-theme-txt block">
                {activeTab === 'b2b'
                  ? 'Metas B2B Corporativo (RRHH, Empresas, Consultoría)'
                  : activeTab === 'b2c'
                  ? 'Metas B2C Alumnos (Agilidad, Certificaciones Abiertas)'
                  : 'Metas Globales Consolidadas del Equipo'}
              </span>
              <span className="text-[11px] text-theme-txt2">
                {activeTab === 'b2b'
                  ? 'Enfoque en cuentas de alto valor, ciclos de 15-30 días.'
                  : activeTab === 'b2c'
                  ? 'Enfoque en volumen, respuesta rápida y matrículas en 3-7 días.'
                  : 'Total consolidado de la organización comercial.'}
              </span>
            </div>

            {/* Assignee selector for B2B and B2C */}
            {activeTab !== 'global' && (
              <div className="shrink-0 flex items-center gap-2">
                <span className="text-[10px] font-mono text-theme-txt3 uppercase font-bold">Líder:</span>
                <select
                  value={currentGoal.assignee || (activeTab === 'b2b' ? 'Gabino' : 'Kiara')}
                  onChange={(e) => updateCurrentGoalField('assignee', e.target.value)}
                  className="bg-theme-sur border border-theme-bor rounded-lg px-2 py-1 text-xs font-bold text-theme-txt cursor-pointer focus:outline-hidden"
                >
                  <option value="Gabino">Gabino (CEO)</option>
                  <option value="Kiara">Kiara (COO)</option>
                  <option value="Ambos">Ambos (Co-gestión)</option>
                </select>
              </div>
            )}
          </div>

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
                value={currentGoal.daily_contacted}
                onChange={(e) => updateCurrentGoalField('daily_contacted', parseInt(e.target.value, 10) || 0)}
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
                value={currentGoal.contacted}
                onChange={(e) => updateCurrentGoalField('contacted', parseInt(e.target.value, 10) || 0)}
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
                  value={currentGoal.phones}
                  onChange={(e) => updateCurrentGoalField('phones', parseInt(e.target.value, 10) || 0)}
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
                  value={currentGoal.opportunities}
                  onChange={(e) => updateCurrentGoalField('opportunities', parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs font-mono text-theme-txt outline-hidden font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-theme-txt2 block mb-1">
                🏆 Cierres de Ventas ({activeTab === 'b2b' ? 'Contratos Firmados' : activeTab === 'b2c' ? 'Alumnos Matriculados' : 'Clientes Ganados'})
              </label>
              <input
                type="number"
                min={0}
                required
                value={currentGoal.clients}
                onChange={(e) => updateCurrentGoalField('clients', parseInt(e.target.value, 10) || 0)}
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs font-mono text-theme-txt outline-hidden font-bold"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-2 border-t border-theme-bor">
            <span className="text-[10px] text-theme-txt3 font-mono">
              * Las 3 líneas se guardan en sincronía.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-theme-txt2 hover:bg-theme-sur2 border border-theme-bor cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-bold text-[#00110b] bg-[#00a870] hover:bg-[#00a870]/90 disabled:opacity-50 cursor-pointer shadow-md shadow-[#00a870]/20 flex items-center gap-1.5"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Guardar y Aplicar Metas</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
});
