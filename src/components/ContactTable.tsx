'use client';

import React, { useState, useMemo } from 'react';
import { Contact, ContactStatus } from '@/lib/types';
import { MessageTemplate } from '@/lib/templates';
import { ExternalLink, Mail, Edit3, CheckCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MessageSquare, Star, Clock, Copy, Check } from 'lucide-react';

interface ContactTableProps {
  contacts: Contact[];
  onSelectContact: (c: Contact) => void;
  onQuickStatusChange: (id: string, newStatus: ContactStatus) => void;
  onOpenTemplates?: (c: Contact) => void;
  activeTemplate?: MessageTemplate;
  viewMode?: 'table' | 'grid';
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Sin contactar': { bg: 'bg-[#7d8fa8]/15', text: 'text-theme-txt2', border: 'border-[#7d8fa8]/30' },
  'Sin asignar': { bg: 'bg-[#7d8fa8]/15', text: 'text-theme-txt2', border: 'border-[#7d8fa8]/30' },
  'new': { bg: 'bg-[#2979ff]/15', text: 'text-[#2979ff]', border: 'border-[#2979ff]/30' },
  'Nuevo': { bg: 'bg-[#2979ff]/15', text: 'text-[#2979ff]', border: 'border-[#2979ff]/30' },
  'contacted': { bg: 'bg-[#ff6d3b]/15', text: 'text-[#ff6d3b]', border: 'border-[#ff6d3b]/30' },
  'Contactado': { bg: 'bg-[#ff6d3b]/15', text: 'text-[#ff6d3b]', border: 'border-[#ff6d3b]/30' },
  'qualified': { bg: 'bg-[#00e5a0]/15', text: 'text-[#00e5a0]', border: 'border-[#00e5a0]/30' },
  'Calificado': { bg: 'bg-[#00e5a0]/15', text: 'text-[#00e5a0]', border: 'border-[#00e5a0]/30' },
  'Oportunidad': { bg: 'bg-[#ff6d3b]/15', text: 'text-[#ff6d3b]', border: 'border-[#ff6d3b]/30' },
  'Cliente': { bg: 'bg-[#00e5a0]/15', text: 'text-[#00e5a0]', border: 'border-[#00e5a0]/30' },
  'En pausa': { bg: 'bg-[#f59e0b]/15', text: 'text-[#f59e0b]', border: 'border-[#f59e0b]/30' },
  'lost': { bg: 'bg-[#3e4c63]/25', text: 'text-theme-txt3', border: 'border-theme-bor2' },
  'Descartado': { bg: 'bg-[#3e4c63]/25', text: 'text-theme-txt3', border: 'border-theme-bor2' },
};

const ALL_STATUSES: ContactStatus[] = [
  'Sin contactar',
  'En contacto',
  'Oportunidad',
  'Cliente',
  'En pausa',
  'Descartado',
];

export default function ContactTable({
  contacts,
  onSelectContact,
  onQuickStatusChange,
  onOpenTemplates,
  activeTemplate,
  viewMode = 'table',
}: ContactTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination calculation
  const totalPages = Math.ceil(contacts.length / pageSize) || 1;
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return contacts.slice(start, start + pageSize);
  }, [contacts, currentPage, pageSize]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [contacts.length]);

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

  if (contacts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-theme-txt2">
        <CheckCircle className="w-10 h-10 mb-3 text-theme-txt3" />
        <p className="text-sm font-medium text-theme-txt">No se encontraron contactos</p>
        <p className="text-xs text-theme-txt2 mt-1">
          Prueba cambiando los filtros o importa un archivo CSV de LinkedIn.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-theme-bg overflow-hidden">
      {/* View Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'table' ? (
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-theme-sur border-b border-theme-bor z-10 text-theme-txt2 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Empresa y Cargo</th>
                <th className="py-3 px-4">Conectado / Seguimiento</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Etiquetas</th>
                <th className="py-3 px-4 text-right">Acciones Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-bor">
              {paginatedContacts.map((c) => {
                const statusConfig = STATUS_COLORS[c.status] || STATUS_COLORS['Sin contactar'];
                const isFollowUpDue = c.follow_up_date && new Date(c.follow_up_date) <= new Date();
                const isCopied = copiedId === c.id;

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-theme-sur/70 transition-colors group cursor-pointer"
                    onClick={() => onSelectContact(c)}
                  >
                    {/* Contact name & avatar + priority */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-theme-sur2 border border-theme-bor2 flex items-center justify-center font-bold text-[#00e5a0] text-xs shrink-0">
                          {(c.first_name[0] || '') + (c.last_name?.[0] || '')}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-theme-txt group-hover:text-[#00e5a0] transition-colors">
                              {c.first_name} {c.last_name || ''}
                            </span>
                            {c.priority && c.priority > 1 && (
                              <span className="flex items-center text-[#f59e0b]" title={`${c.priority} Estrellas`}>
                                {[...Array(c.priority)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-[#f59e0b]" />
                                ))}
                              </span>
                            )}
                          </div>

                          {c.email ? (
                            <div className="flex items-center gap-1 text-[11px] text-theme-txt2">
                              <Mail className="w-3 h-3 text-[#00e5a0] shrink-0" />
                              <span className="truncate max-w-[180px]">{c.email}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-theme-txt3">Sin email</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Company & Position */}
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="font-medium text-theme-txt truncate">{c.company || '—'}</div>
                      <div className="text-[11px] text-theme-txt2 truncate">{c.position || '—'}</div>
                    </td>

                    {/* Connected Date & Follow-up */}
                    <td className="py-3 px-4 text-theme-txt2 font-mono text-[11px] whitespace-nowrap">
                      <div>{c.connected_on || '—'}</div>
                      {c.follow_up_date && (
                        <div className={`flex items-center gap-1 text-[10px] mt-0.5 ${isFollowUpDue ? 'text-[#ff6d3b] font-bold' : 'text-theme-txt3'}`}>
                          <Clock className="w-2.5 h-2.5" />
                          <span>{c.follow_up_date}</span>
                        </div>
                      )}
                    </td>

                    {/* Quick Status Select */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={c.status}
                        onChange={(e) => onQuickStatusChange(c.id, e.target.value as ContactStatus)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border outline-hidden cursor-pointer ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-theme-sur text-theme-txt">
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Tags preview */}
                    <td className="py-3 px-4 max-w-[170px]">
                      {c.tags && c.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {c.tags.slice(0, 2).map((t) => (
                            <span key={t} className="px-1.5 py-0.5 rounded text-[9.5px] bg-[#2979ff]/15 text-[#2979ff] font-medium truncate max-w-[80px]">
                              {t}
                            </span>
                          ))}
                          {c.tags.length > 2 && (
                            <span className="text-[9.5px] text-theme-txt3">+{c.tags.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-theme-txt3">—</span>
                      )}
                    </td>

                    {/* Actions: Quick Copy + Open Templates + LinkedIn + Edit */}
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1-Click Fast Copy active campaign message */}
                        <button
                          onClick={(e) => handleQuickCopy(e, c)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            isCopied
                              ? 'bg-[#00e5a0] text-[#00110b] shadow-xs'
                              : 'bg-theme-sur2 hover:bg-theme-sur3 text-theme-txt border border-theme-bor hover:border-[#00e5a0]'
                          }`}
                          title={activeTemplate ? `Copiar: "${activeTemplate.name}"` : 'Copiar mensaje de campaña'}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                        </button>

                        {/* Open Full Templates Modal */}
                        {onOpenTemplates && (
                          <button
                            onClick={() => onOpenTemplates(c)}
                            className="p-1.5 text-theme-txt2 hover:text-[#00e5a0] hover:bg-theme-sur2 rounded-lg transition-colors cursor-pointer"
                            title="Ver / cambiar plantilla de mensaje"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}

                        {/* Open LinkedIn Profile in new tab */}
                        {c.linkedin_url && (
                          <a
                            href={c.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-theme-txt2 hover:text-[#2979ff] hover:bg-theme-sur2 rounded-lg transition-colors"
                            title="Abrir perfil en LinkedIn"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        {/* Edit Drawer */}
                        <button
                          onClick={() => onSelectContact(c)}
                          className="p-1.5 text-theme-txt2 hover:text-[#00e5a0] hover:bg-theme-sur2 rounded-lg transition-colors cursor-pointer"
                          title="Editar / Ver detalle"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* Cards Grid View */
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {paginatedContacts.map((c) => {
              const statusConfig = STATUS_COLORS[c.status] || STATUS_COLORS['Sin contactar'];
              const isCopied = copiedId === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => onSelectContact(c)}
                  className="bg-theme-sur border border-theme-bor hover:border-[#00e5a0]/40 rounded-xl p-4 transition-all cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-theme-sur2 border border-theme-bor flex items-center justify-center font-bold text-[#00e5a0] text-xs shrink-0">
                        {(c.first_name[0] || '') + (c.last_name?.[0] || '')}
                      </div>
                      <div className="flex items-center gap-1">
                        {c.priority && c.priority > 1 && (
                          <span className="flex items-center text-[#f59e0b]">
                            {[...Array(c.priority)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-[#f59e0b]" />
                            ))}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                        >
                          {c.status}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-semibold text-xs text-theme-txt group-hover:text-[#00e5a0] transition-colors truncate">
                      {c.first_name} {c.last_name || ''}
                    </h4>
                    <p className="text-[11px] text-theme-txt2 truncate mt-0.5">{c.position || 'Sin cargo'}</p>
                    <p className="text-[10px] text-theme-txt3 truncate">{c.company || 'Sin empresa'}</p>

                    {c.tags && c.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.tags.slice(0, 3).map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded text-[9px] bg-[#2979ff]/15 text-[#2979ff]">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-theme-bor flex items-center justify-between text-[11px] text-theme-txt2 gap-1.5">
                    <button
                      onClick={(e) => handleQuickCopy(e, c)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                        isCopied
                          ? 'bg-[#00e5a0] text-[#00110b]'
                          : 'bg-theme-sur2 hover:bg-theme-sur3 text-theme-txt border border-theme-bor'
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
                        className="p-1.5 text-theme-txt2 hover:text-[#00e5a0] rounded-lg"
                        title="Ver plantillas"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {c.linkedin_url && (
                      <a
                        href={c.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#2979ff] hover:underline flex items-center gap-1 ml-auto text-xs"
                      >
                        <span>LinkedIn</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-2.5 bg-theme-sur border-t border-theme-bor flex items-center justify-between text-xs text-theme-txt2 shrink-0">
        <div className="flex items-center gap-2">
          <span>Mostrando</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-theme-sur2 border border-theme-bor rounded px-2 py-1 text-theme-txt outline-hidden cursor-pointer"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
          <span>de <b className="text-theme-txt font-mono">{contacts.length.toLocaleString()}</b> contactos</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-theme-bor hover:bg-theme-sur2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Primera página"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-theme-bor hover:bg-theme-sur2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Página anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono px-3 py-1 bg-theme-sur2 border border-theme-bor rounded-lg text-theme-txt">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-theme-bor hover:bg-theme-sur2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Página siguiente"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-theme-bor hover:bg-theme-sur2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Última página"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
