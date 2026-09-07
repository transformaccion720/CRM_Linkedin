'use client';

import React, { useState, useMemo } from 'react';
import { Contact, ContactStats } from '@/lib/types';
import { 
  Filter, UserCheck, Star, MessageSquare, ExternalLink, ArrowRight, 
  TrendingUp, Users, CheckCircle2, ChevronRight, Activity, Flame, 
  Percent, Layers, Sparkles, Briefcase, GraduationCap
} from 'lucide-react';

interface FunnelViewProps {
  stats: ContactStats | null;
  contacts: Contact[];
  onSelectContact: (c: Contact) => void;
  onOpenTemplates?: (c: Contact) => void;
}

export default function FunnelView({
  stats,
  contacts,
  onSelectContact,
  onOpenTemplates,
}: FunnelViewProps) {
  const [funnelSegment, setFunnelSegment] = useState<'all' | 'B2B' | 'B2C'>('all');
  const [activeStage, setActiveStage] = useState<string>('all');
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  // Filter contacts by selected funnel segment first
  const activeContacts = useMemo(() => {
    if (funnelSegment === 'all') return contacts;
    return contacts.filter((c) => c.business_segment === funnelSegment);
  }, [contacts, funnelSegment]);

  const total = activeContacts.length;

  const byStage: Record<string, Contact[]> = useMemo(() => ({
    'Sin contactar': activeContacts.filter((c) => !c.status || c.status === 'Sin contactar'),
    'En contacto': activeContacts.filter((c) => c.status === 'En contacto'),
    'Oportunidad': activeContacts.filter((c) => c.status === 'Oportunidad'),
    'Cliente': activeContacts.filter((c) => c.status === 'Cliente'),
    'Seguimiento': activeContacts.filter((c) => c.status === 'Seguimiento' || c.status === 'En pausa'),
    'Descartado': activeContacts.filter((c) => c.status === 'Descartado'),
  }), [activeContacts]);

  const stageCounts = useMemo(() => ({
    'Sin contactar': byStage['Sin contactar'].length,
    'En contacto': byStage['En contacto'].length,
    'Oportunidad': byStage['Oportunidad'].length,
    'Cliente': byStage['Cliente'].length,
  }), [byStage]);

  const filteredContacts = activeStage === 'all' 
    ? activeContacts 
    : byStage[activeStage] || [];

  // Contextual Funnel Steps according to selected segment
  const funnelSteps = useMemo(() => {
    if (funnelSegment === 'B2B') {
      return [
        {
          id: 'Sin contactar',
          title: '1. Cuentas Corporativas & RRHH',
          subtitle: 'Decisores y Talento Por Contactar',
          count: stageCounts['Sin contactar'],
          color: '#7d8fa8',
          gradient: 'from-[#7d8fa8]/30 to-[#7d8fa8]/10',
          border: 'border-[#7d8fa8]/40',
          description: 'Cuentas empresariales y áreas de RRHH/Talento listas para primer mensaje de valor y prospección corporativa.',
          badge: 'Etapa Inicial B2B',
          widthPct: 100,
        },
        {
          id: 'En contacto',
          title: '2. En Diálogo / Diagnóstico Inicial',
          subtitle: 'Contacto Activo en LinkedIn/WhatsApp',
          count: stageCounts['En contacto'],
          color: '#2979ff',
          gradient: 'from-[#2979ff]/30 to-[#2979ff]/10',
          border: 'border-[#2979ff]/40',
          description: 'Diálogo iniciado explorando necesidades de entrenamiento in-company, agilidad o consultoría de procesos.',
          badge: 'Diálogo Activo',
          widthPct: 78,
        },
        {
          id: 'Oportunidad',
          title: '3. Propuesta Económica Presentada',
          subtitle: 'Cotización In-Company / Solución',
          count: stageCounts['Oportunidad'],
          color: '#ff6d3b',
          gradient: 'from-[#ff6d3b]/30 to-[#ff6d3b]/10',
          border: 'border-[#ff6d3b]/40',
          description: 'Oportunidad formal con cotización corporativa enviada, reunión técnica o evaluación en comité de compra.',
          badge: 'Propuesta en Negociación',
          widthPct: 56,
        },
        {
          id: 'Cliente',
          title: '4. Contrato Corporativo Cerrado',
          subtitle: 'Venta B2B Ganada & Facturación',
          count: stageCounts['Cliente'],
          color: '#00a870',
          gradient: 'from-[#00a870]/30 to-[#00a870]/10',
          border: 'border-[#00a870]/40',
          description: 'Servicio cerrado exitosamente con la empresa. Cliente corporativo fidelizado para entrenamientos recurrentes.',
          badge: 'Cierre B2B Exitoso',
          widthPct: 38,
        },
      ];
    }

    if (funnelSegment === 'B2C') {
      return [
        {
          id: 'Sin contactar',
          title: '1. Profesionales Por Contactar',
          subtitle: 'Analistas, PMs, Scrum Masters',
          count: stageCounts['Sin contactar'],
          color: '#7d8fa8',
          gradient: 'from-[#7d8fa8]/30 to-[#7d8fa8]/10',
          border: 'border-[#7d8fa8]/40',
          description: 'Profesionales individuales en búsqueda de certificaciones oficiales (CertiProf) y habilidades ágiles.',
          badge: 'Base Alumnos',
          widthPct: 100,
        },
        {
          id: 'En contacto',
          title: '2. En Conversación / Información',
          subtitle: 'Presentación del Programa de Agilidad',
          count: stageCounts['En contacto'],
          color: '#2979ff',
          gradient: 'from-[#2979ff]/30 to-[#2979ff]/10',
          border: 'border-[#2979ff]/40',
          description: 'Interacción directa brindando detalles sobre el programa especializado, horarios y modalidad de certificación.',
          badge: 'Información Brindada',
          widthPct: 78,
        },
        {
          id: 'Oportunidad',
          title: '3. Pide Temario / Beca / Fechas',
          subtitle: 'Evaluación y Facilidades de Pago',
          count: stageCounts['Oportunidad'],
          color: '#ff6d3b',
          gradient: 'from-[#ff6d3b]/30 to-[#ff6d3b]/10',
          border: 'border-[#ff6d3b]/40',
          description: 'Alumno con alto interés evaluando el temario detallado, descuento por pronto pago o reserva de cupo.',
          badge: 'Por Matricular',
          widthPct: 56,
        },
        {
          id: 'Cliente',
          title: '4. Alumno Matriculado / Pagado',
          subtitle: 'Inscripción Confirmada en Cohorte',
          count: stageCounts['Cliente'],
          color: '#00a870',
          gradient: 'from-[#00a870]/30 to-[#00a870]/10',
          border: 'border-[#00a870]/40',
          description: 'Pago validado e incorporación oficial al aula virtual y grupo de estudio del programa.',
          badge: 'Alumno Matriculado',
          widthPct: 38,
        },
      ];
    }

    // Consolidated view
    return [
      {
        id: 'Sin contactar',
        title: '1. Base Global Sin Contactar',
        subtitle: 'Prospectos Importados B2B + B2C',
        count: stageCounts['Sin contactar'],
        color: '#7d8fa8',
        gradient: 'from-[#7d8fa8]/30 to-[#7d8fa8]/10',
        border: 'border-[#7d8fa8]/40',
        description: 'Contactos en frío listos para lanzamiento de campaña y primer mensaje de prospección.',
        badge: 'Etapa Inicial',
        widthPct: 100,
      },
      {
        id: 'En contacto',
        title: '2. En Conversación Activa',
        subtitle: 'Primer Mensaje Enviado',
        count: stageCounts['En contacto'],
        color: '#2979ff',
        gradient: 'from-[#2979ff]/30 to-[#2979ff]/10',
        border: 'border-[#2979ff]/40',
        description: 'Diálogo iniciado en LinkedIn o WhatsApp. Se envió plantilla o propuesta de valor.',
        badge: 'Interacción',
        widthPct: 78,
      },
      {
        id: 'Oportunidad',
        title: '3. Oportunidad / Interesado',
        subtitle: 'Propuesta Comercial o Temario Solicitado',
        count: stageCounts['Oportunidad'],
        color: '#ff6d3b',
        gradient: 'from-[#ff6d3b]/30 to-[#ff6d3b]/10',
        border: 'border-[#ff6d3b]/40',
        description: 'Lead calificado con interés explícito, necesidad detectada o cotización enviada.',
        badge: 'Calificado',
        widthPct: 56,
      },
      {
        id: 'Cliente',
        title: '4. Cierre / Cliente Ganado',
        subtitle: 'Venta Cerrada & Facturación',
        count: stageCounts['Cliente'],
        color: '#00a870',
        gradient: 'from-[#00a870]/30 to-[#00a870]/10',
        border: 'border-[#00a870]/40',
        description: 'Cierre comercial exitoso de programa formativo, agilidad o consultoría.',
        badge: 'Éxito Comercial',
        widthPct: 38,
      },
    ];
  }, [funnelSegment, stageCounts]);

  // Pipeline conversion rate
  const globalConversion = total > 0 ? ((stageCounts['Cliente'] / total) * 100).toFixed(1) : '0.0';
  const pipelineEngagement = total > 0 
    ? (((stageCounts['En contacto'] + stageCounts['Oportunidad'] + stageCounts['Cliente']) / total) * 100).toFixed(1) 
    : '0.0';

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-theme-bg">
      {/* Left side: Interactive Visual Funnel Dashboard */}
      <div className="w-full md:w-[480px] p-4 sm:p-6 border-b md:border-b-0 md:border-r border-theme-bor overflow-y-auto space-y-5 shrink-0 bg-theme-sur/20">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00a870] font-bold bg-[#00a870]/10 px-2 py-0.5 rounded flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#00a870]" />
              <span>
                {funnelSegment === 'B2B' ? 'EMBUDO CORPORATIVO B2B' : funnelSegment === 'B2C' ? 'EMBUDO ALUMNOS B2C' : 'EMBUDO COMERCIAL GLOBAL'}
              </span>
            </span>
          </div>
          <h2 className="font-extrabold text-lg text-theme-txt flex items-center gap-2">
            <span>Embudo Comercial Dinámico</span>
          </h2>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Alterna entre el embudo B2B y B2C, y haz clic en cualquier fase para filtrar prospectos.
          </p>
        </div>

        {/* Funnel Segment Switcher */}
        <div className="flex items-center gap-1 bg-theme-sur p-1 rounded-xl border border-theme-bor">
          <button
            type="button"
            onClick={() => { setFunnelSegment('all'); setActiveStage('all'); }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
              funnelSegment === 'all'
                ? 'bg-theme-sur2 text-theme-txt shadow-xs'
                : 'text-theme-txt2 hover:text-theme-txt'
            }`}
          >
            🌐 Consolidado
          </button>
          <button
            type="button"
            onClick={() => { setFunnelSegment('B2B'); setActiveStage('all'); }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
              funnelSegment === 'B2B'
                ? 'bg-[#2979ff] text-white shadow-xs'
                : 'text-theme-txt2 hover:text-theme-txt'
            }`}
          >
            🏢 B2B Gabino
          </button>
          <button
            type="button"
            onClick={() => { setFunnelSegment('B2C'); setActiveStage('all'); }}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
              funnelSegment === 'B2C'
                ? 'bg-[#00a870] text-white shadow-xs'
                : 'text-theme-txt2 hover:text-theme-txt'
            }`}
          >
            👤 B2C Kiara
          </button>
        </div>

        {/* Conversion KPI Pills */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 bg-theme-sur border border-theme-bor rounded-xl">
            <span className="text-[10.5px] font-medium text-theme-txt3 block mb-0.5">Tasa de Activación</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-lg font-extrabold text-[#2979ff]">{pipelineEngagement}%</span>
              <Activity className="w-4 h-4 text-[#2979ff]/70" />
            </div>
            <span className="text-[9.5px] text-theme-txt3">Contactados o en proceso</span>
          </div>

          <div className="p-3 bg-theme-sur border border-theme-bor rounded-xl">
            <span className="text-[10.5px] font-medium text-theme-txt3 block mb-0.5">Cierre a Cliente</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-lg font-extrabold text-[#00a870]">{globalConversion}%</span>
              <CheckCircle2 className="w-4 h-4 text-[#00a870]/70" />
            </div>
            <span className="text-[9.5px] text-theme-txt3">{stageCounts['Cliente']} cierres logrados</span>
          </div>
        </div>

        {/* Dynamic Interactive Funnel Trapezoid Blocks */}
        <div className="space-y-3 pt-1">
          {funnelSteps.map((step, idx) => {
            const pctOfTotal = total > 0 ? ((step.count / total) * 100).toFixed(1) : '0';
            const isActive = activeStage === step.id;

            return (
              <div
                key={step.id}
                onClick={() => setActiveStage(isActive ? 'all' : step.id)}
                onMouseEnter={() => setHoveredStage(step.id)}
                onMouseLeave={() => setHoveredStage(null)}
                className={`relative rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden p-4 shadow-xs ${
                  isActive
                    ? 'ring-2 ring-[#00a870] border-transparent bg-theme-sur shadow-md'
                    : 'border-theme-bor bg-theme-sur hover:border-theme-bor2 hover:shadow-xs'
                }`}
              >
                {/* Visual Trapezoid Bar Background */}
                <div
                  className="absolute left-0 top-0 bottom-0 opacity-15 transition-all duration-300"
                  style={{
                    backgroundColor: step.color,
                    width: `${step.widthPct}%`,
                  }}
                />

                <div className="relative z-10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: step.color }} />
                      <h3 className="font-bold text-xs sm:text-sm text-theme-txt">{step.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-theme-sur2 text-theme-txt border border-theme-bor">
                        {step.count.toLocaleString()}
                      </span>
                      <span className="font-mono text-[11px] text-theme-txt3">({pctOfTotal}%)</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-theme-txt2 font-normal leading-relaxed">
                    {step.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10.5px]">
                    <span className="font-mono text-[10px] text-theme-txt3">{step.subtitle}</span>
                    <span className="text-[#00a870] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      {isActive ? 'Filtro activo (clic para quitar)' : 'Filtrar etapa'}
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Secondary Stages: Seguimiento & Descartados */}
        <div className="pt-2 border-t border-theme-bor flex items-center justify-between gap-2">
          <button
            onClick={() => setActiveStage(activeStage === 'Seguimiento' ? 'all' : 'Seguimiento')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeStage === 'Seguimiento'
                ? 'bg-theme-sur2 text-theme-txt border-theme-bor2 shadow-xs'
                : 'bg-theme-sur text-theme-txt3 border-theme-bor hover:border-theme-bor2'
            }`}
          >
            <span>⏳ En Seguimiento</span>
            <span className="font-mono text-[10px] font-bold">({byStage['Seguimiento'].length})</span>
          </button>

          <button
            onClick={() => setActiveStage(activeStage === 'Descartado' ? 'all' : 'Descartado')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeStage === 'Descartado'
                ? 'bg-theme-sur2 text-theme-txt border-theme-bor2 shadow-xs'
                : 'bg-theme-sur text-theme-txt3 border-theme-bor hover:border-theme-bor2'
            }`}
          >
            <span>🚫 Descartados</span>
            <span className="font-mono text-[10px] font-bold">({byStage['Descartado'].length})</span>
          </button>
        </div>
      </div>

      {/* Right side: Interactive Filtered Contacts Table / Cards */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Stage Header */}
        <div className="p-4 px-6 border-b border-theme-bor bg-theme-sur flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-sm font-bold text-theme-txt">
              {activeStage === 'all' 
                ? (funnelSegment === 'B2B' ? 'Cuentas Corporativas B2B' : funnelSegment === 'B2C' ? 'Alumnos & Certificaciones B2C' : 'Todos los Contactos del Embudo')
                : `Prospectos en: ${activeStage}`
              }
            </span>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#00a870]/15 text-[#00a870] font-bold border border-[#00a870]/30">
              {filteredContacts.length.toLocaleString()} leads
            </span>
          </div>

          {activeStage !== 'all' && (
            <button
              onClick={() => setActiveStage('all')}
              className="text-xs text-[#00a870] hover:underline font-semibold cursor-pointer"
            >
              Mostrar todo el embudo
            </button>
          )}
        </div>

        {/* Contacts Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center text-theme-txt2">
              <UserCheck className="w-12 h-12 text-theme-txt3 mb-3" />
              <p className="text-sm font-semibold text-theme-txt">No hay prospectos en esta etapa</p>
              <p className="text-xs text-theme-txt2 mt-1">
                Selecciona otra fase del embudo o cambia de segmento.
              </p>
            </div>
          ) : (
            filteredContacts.slice(0, 150).map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectContact(c)}
                className="p-3.5 sm:p-4 bg-theme-sur border border-theme-bor hover:border-[#00a870]/50 rounded-2xl transition-all flex items-center justify-between gap-3 group cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-theme-sur2 border border-theme-bor2 flex items-center justify-center font-bold text-[#00a870] text-xs shrink-0 group-hover:bg-[#00a870]/10 transition-colors">
                    {(c.first_name[0] || '') + (c.last_name?.[0] || '')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-xs sm:text-sm text-theme-txt group-hover:text-[#00a870] transition-colors truncate">
                        {c.first_name} {c.last_name || ''}
                      </h4>
                      <span
                        className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                          c.business_segment === 'B2C'
                            ? 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30'
                            : 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30'
                        }`}
                      >
                        {c.business_segment === 'B2C' ? '👤 B2C' : '🏢 B2B'}
                      </span>
                      {c.priority && c.priority > 1 && (
                        <span className="flex items-center text-[#f59e0b]">
                          {[...Array(c.priority)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-[#f59e0b]" />
                          ))}
                        </span>
                      )}
                      {c.source === 'BUSQUEDA_ACTIVA' && (
                        <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-[#00a870]/15 text-[#00a870] border border-[#00a870]/30">
                          ✨ Nuevo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-theme-txt2 truncate font-medium">{c.position || 'Sin cargo especificado'}</p>
                    <div className="flex items-center gap-2 text-[10.5px] text-theme-txt3 font-mono mt-0.5">
                      <span>{c.company || 'Sin empresa'}</span>
                      {c.assigned_to && (
                        <>
                          <span>•</span>
                          <span>Resp: {c.assigned_to}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {onOpenTemplates && (
                    <button
                      onClick={() => onOpenTemplates(c)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#00a870] bg-[#00a870]/15 hover:bg-[#00a870] hover:text-[#00110b] rounded-xl border border-[#00a870]/30 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Mensaje</span>
                    </button>
                  )}

                  {c.linkedin_url && (
                    <a
                      href={c.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-theme-txt2 hover:text-[#0a66c2] bg-theme-sur2 hover:bg-theme-sur3 rounded-xl border border-theme-bor transition-all"
                      title="Ver Perfil en LinkedIn"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
