'use client';

import React, { useState, useMemo } from 'react';
import { Contact, ContactStatus, B2BStage, B2CStage, BusinessSegment } from '@/lib/types';
import { MessageTemplate } from '@/lib/templates';
import { 
  ExternalLink, Edit3, GripVertical, Plus, Star, MessageSquare, Copy, Check, 
  DollarSign, ArrowRight, TrendingUp, Briefcase, User, Layers, Calendar, Sparkles
} from 'lucide-react';

interface PipelineViewProps {
  contacts: Contact[];
  onSelectContact: (c: Contact) => void;
  onQuickStatusChange: (id: string, newStatus: ContactStatus) => void;
  onOpenTemplates?: (c: Contact) => void;
  activeTemplate?: MessageTemplate;
  defaultSegment?: 'B2B' | 'B2C' | 'all';
  onSegmentFilterChange?: (segment: 'all' | 'B2B' | 'B2C') => void;
}

// 10 B2B Stages defined for core B2B management
const B2B_COLUMNS: { status: B2BStage; title: string; color: string; badgeBg: string; description: string }[] = [
  { status: 'Prospecto identificado', title: '1. Prospecto Identificado', color: '#7d8fa8', badgeBg: 'bg-[#7d8fa8]/15', description: 'Decisor o cuenta identificada en LinkedIn' },
  { status: 'Contactado', title: '2. Contactado', color: '#2979ff', badgeBg: 'bg-[#2979ff]/15', description: 'Primer mensaje enviado / invitación aceptada' },
  { status: 'Conversación iniciada', title: '3. Conversación Iniciada', color: '#00d2ff', badgeBg: 'bg-[#00d2ff]/15', description: 'Respuesta recibida / diálogo abierto' },
  { status: 'Discovery / reunión', title: '4. Discovery / Reunión', color: '#a855f7', badgeBg: 'bg-[#a855f7]/15', description: 'Reunión de exploración de necesidades agendada o realizada' },
  { status: 'Oportunidad calificada', title: '5. Oportunidad Calificada', color: '#ff6d3b', badgeBg: 'bg-[#ff6d3b]/15', description: 'Presupuesto, dolor y decisión confirmados' },
  { status: 'Propuesta enviada', title: '6. Propuesta Enviada', color: '#f59e0b', badgeBg: 'bg-[#f59e0b]/15', description: 'Cotización o propuesta técnico-económica presentada' },
  { status: 'Negociación', title: '7. Negociación', color: '#ec4899', badgeBg: 'bg-[#ec4899]/15', description: 'Ajuste de alcance, precio o términos contractuales' },
  { status: 'Ganada', title: '8. Ganada / Cerrada', color: '#00e5a0', badgeBg: 'bg-[#00e5a0]/15', description: 'Contrato firmado / inicio de servicio' },
  { status: 'Perdida', title: '9. Perdida', color: '#ef4444', badgeBg: 'bg-[#ef4444]/15', description: 'Oportunidad descartada por presupuesto o tiempo' },
  { status: 'Pausada', title: '10. Pausada', color: '#64748b', badgeBg: 'bg-[#64748b]/15', description: 'En espera de reactivación / presupuesto futuro' },
];

// Original B2C Stages strictly preserved as requested by the user
const B2C_COLUMNS: { status: B2CStage; title: string; color: string; badgeBg: string; description: string }[] = [
  { status: 'Sin contactar', title: 'Sin Contactar', color: '#7d8fa8', badgeBg: 'bg-[#7d8fa8]/15', description: 'Alumnos y profesionales sin mensaje inicial' },
  { status: 'En contacto', title: 'En Contacto', color: '#2979ff', badgeBg: 'bg-[#2979ff]/15', description: 'Mensaje de campaña enviado' },
  { status: 'Seguimiento', title: 'Seguimiento Activo', color: '#f59e0b', badgeBg: 'bg-[#f59e0b]/15', description: 'Nutrición de prospecto con temario o fechas' },
  { status: 'Oportunidad', title: 'Oportunidad / Interesado', color: '#ff6d3b', badgeBg: 'bg-[#ff6d3b]/15', description: 'Interés formal en matricularse' },
  { status: 'Cliente', title: 'Cliente / Matriculado', color: '#00e5a0', badgeBg: 'bg-[#00e5a0]/15', description: 'Inscripción confirmada y pagada' },
  { status: 'En pausa', title: 'En Pausa', color: '#64748b', badgeBg: 'bg-[#64748b]/15', description: 'Para próxima convocatoria o edición' },
  { status: 'Descartado', title: 'Descartado', color: '#ef4444', badgeBg: 'bg-[#ef4444]/15', description: 'No interesado / no califica' },
];

const INITIAL_PAGE_SIZE = 40;
const STEP_PAGE_SIZE = 40;

export default function PipelineView({
  contacts,
  onSelectContact,
  onQuickStatusChange,
  onOpenTemplates,
  activeTemplate,
  defaultSegment = 'B2B',
  onSegmentFilterChange,
}: PipelineViewProps) {
  // Segment view switcher: 'B2B' or 'B2C'
  const [pipelineMode, setPipelineMode] = useState<'B2B' | 'B2C'>(defaultSegment === 'B2C' ? 'B2C' : 'B2B');
  const [draggedContactId, setDraggedContactId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter contacts by active pipeline mode
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const seg = c.business_segment || 'B2C';
      if (pipelineMode === 'B2B') {
        return seg === 'B2B';
      } else {
        return seg === 'B2C';
      }
    });
  }, [contacts, pipelineMode]);

  // Active columns configuration
  const activeColumns = useMemo(() => {
    return pipelineMode === 'B2B' ? B2B_COLUMNS : B2C_COLUMNS;
  }, [pipelineMode]);

  // Group contacts by active columns
  const groupedContacts = useMemo(() => {
    const map: Record<string, Contact[]> = {};
    activeColumns.forEach((col) => {
      map[col.status] = [];
    });

    for (const c of filteredContacts) {
      let st = c.status || (pipelineMode === 'B2B' ? 'Prospecto identificado' : 'Sin contactar');
      
      // Auto-normalize if an older status is present in B2B
      if (pipelineMode === 'B2B') {
        if (st === 'Sin contactar') st = 'Prospecto identificado';
        if (st === 'En contacto') st = 'Contactado';
        if (st === 'Seguimiento') st = 'Conversación iniciada';
        if (st === 'Oportunidad') st = 'Oportunidad calificada';
        if (st === 'Cliente') st = 'Ganada';
        if (st === 'Descartado') st = 'Perdida';
        if (st === 'En pausa') st = 'Pausada';
      }

      if (!map[st]) {
        // Fallback to first stage of active pipeline
        st = activeColumns[0].status;
      }
      map[st].push(c);
    }

    return map;
  }, [filteredContacts, activeColumns, pipelineMode]);

  // Metrics for B2B Pipeline
  const b2bMetrics = useMemo(() => {
    if (pipelineMode !== 'B2B') return null;

    let totalValue = 0;
    let activeDealsCount = 0;
    let proposalsCount = 0;
    let wonValue = 0;

    for (const c of filteredContacts) {
      const val = Number(c.deal_value) || 0;
      const st = c.status;

      if (st === 'Ganada' || st === 'Cliente') {
        wonValue += val;
      } else if (st !== 'Perdida' && st !== 'Pausada' && st !== 'Descartado') {
        totalValue += val;
        if (val > 0) activeDealsCount++;
      }

      if (st === 'Propuesta enviada' || st === 'Negociación') {
        proposalsCount++;
      }
    }

    return {
      totalValue,
      activeDealsCount,
      proposalsCount,
      wonValue,
    };
  }, [filteredContacts, pipelineMode]);

  const [columnLimits, setColumnLimits] = useState<Record<string, number>>({});

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedContactId(id);
  };

  const handleDragEnd = () => {
    setDraggedContactId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ContactStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const id = e.dataTransfer.getData('text/plain') || draggedContactId;
    if (id) {
      onQuickStatusChange(id, targetStatus);
    }
    setDraggedContactId(null);
  };

  const loadMoreForColumn = (status: string) => {
    setColumnLimits((prev) => ({
      ...prev,
      [status]: (prev[status] || INITIAL_PAGE_SIZE) + STEP_PAGE_SIZE,
    }));
  };

  const handleQuickCopy = async (e: React.MouseEvent, c: Contact) => {
    e.stopPropagation();
    if (!activeTemplate) {
      if (onOpenTemplates) onOpenTemplates(c);
      return;
    }

    const text = activeTemplate.text
      .replace(/{nombre}/g, c.first_name || '')
      .replace(/{apellido}/g, c.last_name || '')
      .replace(/{empresa}/g, c.company || 'tu empresa')
      .replace(/{cargo}/g, c.position || 'tu rol actual');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(c.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Error copying:', err);
    }
  };

  const switchPipelineMode = (mode: 'B2B' | 'B2C') => {
    setPipelineMode(mode);
    if (onSegmentFilterChange) {
      onSegmentFilterChange(mode);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-theme-bg select-none">
      {/* Top Header: Pipeline Selector (B2B vs B2C) + Financial Summary */}
      <div className="p-3 bg-theme-sur border-b border-theme-bor flex items-center justify-between gap-3 shrink-0 flex-wrap shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-theme-sur2 border border-theme-bor p-1 rounded-xl">
            <button
              type="button"
              onClick={() => switchPipelineMode('B2B')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                pipelineMode === 'B2B'
                  ? 'bg-[#2979ff] text-white shadow-xs'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>🏢 Pipeline B2B Corporativo (10 Etapas)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold">
                {contacts.filter(c => c.business_segment === 'B2B').length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => switchPipelineMode('B2C')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                pipelineMode === 'B2C'
                  ? 'bg-[#00a870] text-white shadow-xs'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>👤 Pipeline B2C Alumnos (Etapas Originales)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold">
                {contacts.filter(c => c.business_segment === 'B2C').length}
              </span>
            </button>
          </div>
        </div>

        {/* B2B Financial & Deal Summary Widget */}
        {pipelineMode === 'B2B' && b2bMetrics && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-theme-sur2 border border-theme-bor px-3 py-1.5 rounded-xl">
              <span className="text-[10.5px] text-theme-txt3 font-mono font-medium">Valor Total Pipeline:</span>
              <span className="text-xs font-bold text-[#00e5a0] font-mono">
                ${b2bMetrics.totalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })} USD
              </span>
            </div>
            <div className="flex items-center gap-2 bg-theme-sur2 border border-theme-bor px-3 py-1.5 rounded-xl">
              <span className="text-[10.5px] text-theme-txt3 font-mono font-medium">Propuestas Enviadas:</span>
              <span className="text-xs font-bold text-[#f59e0b] font-mono">
                {b2bMetrics.proposalsCount}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-theme-sur2 border border-theme-bor px-3 py-1.5 rounded-xl">
              <span className="text-[10.5px] text-theme-txt3 font-mono font-medium">Cerradas / Ganadas:</span>
              <span className="text-xs font-bold text-[#00a870] font-mono">
                ${b2bMetrics.wonValue.toLocaleString('en-US', { minimumFractionDigits: 0 })} USD
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Kanban Board Columns Horizontal Scroll */}
      <div className="flex-1 overflow-x-auto p-4 flex gap-3.5 bg-theme-bg">
        {activeColumns.map((col) => {
          const fullList = groupedContacts[col.status] || [];
          const limit = columnLimits[col.status] || INITIAL_PAGE_SIZE;
          const visibleContacts = fullList.slice(0, limit);
          const hasMore = fullList.length > limit;
          const isOver = dragOverColumn === col.status;

          // Column subtotal deal value in B2B
          const colValue = pipelineMode === 'B2B'
            ? fullList.reduce((acc, curr) => acc + (Number(curr.deal_value) || 0), 0)
            : 0;

          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.status as ContactStatus)}
              className={`w-72 shrink-0 bg-theme-sur border rounded-xl flex flex-col max-h-full transition-all duration-200 shadow-xs ${
                isOver
                  ? 'border-[#00e5a0] bg-theme-sur2/70 ring-2 ring-[#00e5a0]/20 shadow-lg'
                  : 'border-theme-bor'
              }`}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-theme-bor flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                    <span className="text-xs font-bold text-theme-txt truncate" title={col.title}>
                      {col.title}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${col.badgeBg}`}
                    style={{ color: col.color }}
                  >
                    {fullList.length.toLocaleString()}
                  </span>
                </div>

                {pipelineMode === 'B2B' && colValue > 0 && (
                  <div className="text-[10px] font-mono text-[#00e5a0] font-semibold pl-4.5">
                    ${colValue.toLocaleString()} USD
                  </div>
                )}
              </div>

              {/* Column Body / Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[140px]">
                {fullList.length === 0 ? (
                  <div
                    className={`h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-3 text-center text-xs transition-colors ${
                      isOver
                        ? 'border-[#00e5a0] text-[#00e5a0] bg-[#00e5a0]/5'
                        : 'border-theme-bor text-theme-txt3'
                    }`}
                  >
                    <p className="text-[11px]">Arrastra un contacto aquí</p>
                  </div>
                ) : (
                  <>
                    {visibleContacts.map((c) => {
                      const isDragging = draggedContactId === c.id;
                      const isCopied = copiedId === c.id;

                      return (
                        <div
                          key={c.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, c.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => onSelectContact(c)}
                          className={`p-3 rounded-lg bg-theme-sur2 border transition-all cursor-grab active:cursor-grabbing group shadow-xs hover:shadow-md ${
                            isDragging
                              ? 'opacity-40 border-[#00e5a0] scale-95'
                              : 'border-theme-bor hover:border-theme-bor2'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <GripVertical className="w-3 h-3 text-theme-txt3 group-hover:text-theme-txt2 shrink-0" />
                              <div className="font-semibold text-xs text-theme-txt group-hover:text-[#00e5a0] transition-colors truncate">
                                {c.first_name} {c.last_name || ''}
                              </div>
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
                                <span className="flex items-center text-[#f59e0b] shrink-0">
                                  {[...Array(c.priority)].map((_, i) => (
                                    <Star key={i} className="w-2.5 h-2.5 fill-[#f59e0b]" />
                                  ))}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              {c.linkedin_url && (
                                <a
                                  href={c.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-theme-txt2 hover:text-[#2979ff] p-0.5"
                                  title="Abrir perfil en LinkedIn"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => onSelectContact(c)}
                                className="text-theme-txt2 hover:text-[#00e5a0] p-0.5 cursor-pointer"
                                title="Editar"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="text-[11px] text-theme-txt2 mt-1 truncate pl-4.5 font-medium">
                            {c.position || 'Sin cargo'}
                          </div>
                          <div className="text-[10px] text-theme-txt3 truncate pl-4.5">
                            {c.company || 'Sin empresa'}
                          </div>

                          {/* B2B Deal Value & Next Step highlight */}
                          {pipelineMode === 'B2B' && (c.deal_value || c.next_step) && (
                            <div className="mt-2 pl-4.5 space-y-1">
                              {c.deal_value ? (
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00e5a0]/15 text-[#00e5a0] border border-[#00e5a0]/25">
                                  <DollarSign className="w-2.5 h-2.5 stroke-[2.5]" />
                                  <span>${Number(c.deal_value).toLocaleString()} USD</span>
                                </div>
                              ) : null}
                              {c.next_step && (
                                <div className="text-[9.5px] text-theme-txt2 truncate flex items-center gap-1 font-mono">
                                  <span className="text-[#f59e0b]">⚡</span>
                                  <span className="truncate">{c.next_step}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {c.tags && c.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 pl-4.5">
                              {c.tags.slice(0, 2).map((t) => (
                                <span key={t} className="px-1.5 py-0.5 rounded text-[8.5px] bg-[#2979ff]/15 text-[#2979ff]">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Card bottom bar: Quick Copy + Open Template + Status Dropdown */}
                          <div className="mt-2.5 pt-2 border-t border-theme-bor flex items-center justify-between text-[10px] text-theme-txt2 gap-1.5">
                            <button
                              onClick={(e) => handleQuickCopy(e, c)}
                              className={`px-2 py-0.5 rounded text-[10.5px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                isCopied
                                  ? 'bg-[#00e5a0] text-[#00110b]'
                                  : 'bg-theme-sur hover:bg-theme-sur3 text-theme-txt border border-theme-bor'
                              }`}
                              title="Copiar mensaje de prospección"
                            >
                              {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                            </button>

                            {onOpenTemplates && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenTemplates(c);
                                }}
                                className="p-1 text-theme-txt2 hover:text-[#00e5a0]"
                                title="Ver / cambiar plantilla"
                              >
                                <MessageSquare className="w-3 h-3" />
                              </button>
                            )}

                            {/* Contextual Status Dropdown */}
                            <select
                              value={c.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => onQuickStatusChange(c.id, e.target.value as ContactStatus)}
                              className="bg-theme-sur border border-theme-bor text-[9.5px] rounded px-1 py-0.5 text-theme-txt2 outline-hidden hover:text-theme-txt cursor-pointer ml-auto max-w-[110px] truncate"
                            >
                              {activeColumns.map((item) => (
                                <option key={item.status} value={item.status} className="bg-theme-sur text-theme-txt">
                                  {item.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}

                    {/* Load more block */}
                    {hasMore && (
                      <button
                        onClick={() => loadMoreForColumn(col.status)}
                        className="w-full py-2 px-3 text-[11px] font-medium text-[#00e5a0] bg-theme-sur hover:bg-theme-sur2 border border-theme-bor rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Cargar {Math.min(STEP_PAGE_SIZE, fullList.length - limit)} más ({fullList.length - limit} restantes)</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
