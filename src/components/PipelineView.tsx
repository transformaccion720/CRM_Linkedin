'use client';

import React, { useState, useMemo } from 'react';
import { Contact, ContactStatus } from '@/lib/types';
import { MessageTemplate } from '@/lib/templates';
import { ExternalLink, Mail, Edit3, GripVertical, Plus, Star, MessageSquare, Copy, Check } from 'lucide-react';

interface PipelineViewProps {
  contacts: Contact[];
  onSelectContact: (c: Contact) => void;
  onQuickStatusChange: (id: string, newStatus: ContactStatus) => void;
  onOpenTemplates?: (c: Contact) => void;
  activeTemplate?: MessageTemplate;
}

const COLUMNS: { status: ContactStatus; title: string; color: string; badgeBg: string }[] = [
  { status: 'Sin contactar', title: 'Sin Contactar', color: '#7d8fa8', badgeBg: 'bg-[#7d8fa8]/15' },
  { status: 'En contacto', title: 'En Contacto', color: '#2979ff', badgeBg: 'bg-[#2979ff]/15' },
  { status: 'Oportunidad', title: 'Oportunidad', color: '#ff6d3b', badgeBg: 'bg-[#ff6d3b]/15' },
  { status: 'Cliente', title: 'Cliente / Cerrado', color: '#00e5a0', badgeBg: 'bg-[#00e5a0]/15' },
  { status: 'En pausa', title: 'En Pausa', color: '#f59e0b', badgeBg: 'bg-[#f59e0b]/15' },
];

const INITIAL_PAGE_SIZE = 40;
const STEP_PAGE_SIZE = 40;

export default function PipelineView({
  contacts,
  onSelectContact,
  onQuickStatusChange,
  onOpenTemplates,
  activeTemplate,
}: PipelineViewProps) {
  const [draggedContactId, setDraggedContactId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [columnLimits, setColumnLimits] = useState<Record<string, number>>({
    'Sin contactar': INITIAL_PAGE_SIZE,
    'En contacto': INITIAL_PAGE_SIZE,
    'Oportunidad': INITIAL_PAGE_SIZE,
    'Cliente': INITIAL_PAGE_SIZE,
    'En pausa': INITIAL_PAGE_SIZE,
  });

  const groupedContacts = useMemo(() => {
    const map: Record<string, Contact[]> = {
      'Sin contactar': [],
      'En contacto': [],
      'Oportunidad': [],
      'Cliente': [],
      'En pausa': [],
    };

    for (const c of contacts) {
      let st = c.status || 'Sin contactar';
      if (!map[st]) st = 'Sin contactar';
      map[st].push(c);
    }

    return map;
  }, [contacts]);

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

  return (
    <div className="flex-1 overflow-x-auto p-4 flex gap-4 bg-theme-bg select-none">
      {COLUMNS.map((col) => {
        const fullList = groupedContacts[col.status] || [];
        const limit = columnLimits[col.status] || INITIAL_PAGE_SIZE;
        const visibleContacts = fullList.slice(0, limit);
        const hasMore = fullList.length > limit;
        const isOver = dragOverColumn === col.status;

        return (
          <div
            key={col.status}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.status)}
            className={`w-72 shrink-0 bg-theme-sur border rounded-xl flex flex-col max-h-full transition-all duration-200 ${
              isOver
                ? 'border-[#00e5a0] bg-theme-sur2/70 ring-2 ring-[#00e5a0]/20 shadow-lg'
                : 'border-theme-bor'
            }`}
          >
            {/* Column Header */}
            <div className="p-3 border-b border-theme-bor flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                <span className="text-xs font-semibold text-theme-txt">{col.title}</span>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}
                style={{ color: col.color }}
              >
                {fullList.length.toLocaleString()}
              </span>
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

                        <div className="text-[11px] text-theme-txt2 mt-1 truncate pl-4.5">
                          {c.position || 'Sin cargo'}
                        </div>
                        <div className="text-[10px] text-theme-txt3 truncate pl-4.5">
                          {c.company || 'Sin empresa'}
                        </div>

                        {c.tags && c.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2 pl-4.5">
                            {c.tags.slice(0, 2).map((t) => (
                              <span key={t} className="px-1.5 py-0.5 rounded text-[8.5px] bg-[#2979ff]/15 text-[#2979ff]">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Card bottom bar: Separate Quick Copy + Open Template + Status */}
                        <div className="mt-2.5 pt-2 border-t border-theme-bor flex items-center justify-between text-[10px] text-theme-txt2 gap-1.5">
                          <button
                            onClick={(e) => handleQuickCopy(e, c)}
                            className={`px-2 py-0.5 rounded text-[10.5px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                              isCopied
                                ? 'bg-[#00e5a0] text-[#00110b]'
                                : 'bg-theme-sur hover:bg-theme-sur3 text-theme-txt border border-theme-bor'
                            }`}
                            title="Copiar mensaje de campaña"
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

                          {/* Quick fallback dropdown */}
                          <select
                            value={c.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onQuickStatusChange(c.id, e.target.value as ContactStatus)}
                            className="bg-theme-sur border border-theme-bor text-[9.5px] rounded px-1 py-0.5 text-theme-txt2 outline-hidden hover:text-theme-txt cursor-pointer ml-auto"
                          >
                            {COLUMNS.map((item) => (
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
  );
}
