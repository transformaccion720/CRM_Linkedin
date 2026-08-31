'use client';

import React, { useState, useMemo } from 'react';
import { Contact, ContactStatus } from '@/lib/types';
import { ExternalLink, Mail, Edit3, CheckCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MessageSquare, Star, Clock, Phone, AlertTriangle } from 'lucide-react';

interface ContactTableProps {
  contacts: Contact[];
  onSelectContact: (c: Contact) => void;
  onQuickStatusChange: (id: string, newStatus: ContactStatus) => void;
  onOpenTemplates?: (c: Contact) => void;
  viewMode?: 'table' | 'grid';
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Sin contactar': { bg: 'bg-[#7d8fa8]/15', text: 'text-theme-txt2', border: 'border-[#7d8fa8]/30' },
  'Sin asignar': { bg: 'bg-[#7d8fa8]/15', text: 'text-theme-txt2', border: 'border-[#7d8fa8]/30' },
  'new': { bg: 'bg-[#2979ff]/15', text: 'text-[#2979ff]', border: 'border-[#2979ff]/30' },
  'Nuevo': { bg: 'bg-[#2979ff]/15', text: 'text-[#2979ff]', border: 'border-[#2979ff]/30' },
  'contacted': { bg: 'bg-[#ff6d3b]/15', text: 'text-[#ff6d3b]', border: 'border-[#ff6d3b]/30' },
  'Contactado': { bg: 'bg-[#ff6d3b]/15', text: 'text-[#ff6d3b]', border: 'border-[#ff6d3b]/30' },
  'En contacto': { bg: 'bg-[#2979ff]/15', text: 'text-[#2979ff]', border: 'border-[#2979ff]/30' },
  'qualified': { bg: 'bg-[#00a870]/15', text: 'text-[#00a870]', border: 'border-[#00a870]/30' },
  'Calificado': { bg: 'bg-[#00a870]/15', text: 'text-[#00a870]', border: 'border-[#00a870]/30' },
  'Oportunidad': { bg: 'bg-[#ff6d3b]/15', text: 'text-[#ff6d3b]', border: 'border-[#ff6d3b]/30' },
  'Cliente': { bg: 'bg-[#00a870]/15', text: 'text-[#00a870]', border: 'border-[#00a870]/30' },
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
  viewMode = 'table',
}: ContactTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Pagination calculation
  const totalPages = Math.ceil(contacts.length / pageSize) || 1;
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return contacts.slice(start, start + pageSize);
  }, [contacts, currentPage, pageSize]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [contacts.length]);

  if (contacts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-theme-txt2">
        <CheckCircle className="w-10 h-10 mb-3 text-theme-txt3" />
        <p className="text-sm font-medium text-theme-txt">No se encontraron contactos</p>
        <p className="text-xs text-theme-txt2 mt-1">
          Prueba cambiando los filtros de comercial o importa un archivo CSV.
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
                <th className="py-3 px-4">Cargo</th>
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Teléfono / WhatsApp</th>
                <th className="py-3 px-4">Conexión / Seguimiento</th>
                <th className="py-3 px-4">Estado CRM</th>
                <th className="py-3 px-4">Etiquetas</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-bor">
              {paginatedContacts.map((c) => {
                const statusConfig = STATUS_COLORS[c.status] || STATUS_COLORS['Sin contactar'];
                const isFollowUpDue = c.follow_up_date && new Date(c.follow_up_date) <= new Date();
                const isShared = c.shared_with && c.shared_with.length > 0;

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-theme-sur/70 transition-colors group cursor-pointer"
                    onClick={() => onSelectContact(c)}
                  >
                    {/* 1. Contact Name & Avatar + Priority + Shared Alert */}
                    <td className="py-3 px-4 min-w-[190px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-theme-sur2 border border-theme-bor2 flex items-center justify-center font-bold text-[#00a870] text-xs shrink-0">
                          {(c.first_name[0] || '') + (c.last_name?.[0] || '')}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-theme-txt group-hover:text-[#00a870] transition-colors truncate">
                              {c.first_name} {c.last_name || ''}
                            </span>
                            {c.priority && c.priority > 1 && (
                              <span className="flex items-center text-[#f59e0b] shrink-0" title={`${c.priority} Estrellas`}>
                                {[...Array(c.priority)].map((_, i) => (
                                  <Star key={i} className="w-2.5 h-2.5 fill-[#f59e0b]" />
                                ))}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            {c.assigned_to && (
                              <span className="text-[9.5px] text-theme-txt3 truncate font-mono">
                                Resp: {c.assigned_to}
                              </span>
                            )}

                            {/* Shared contact warning */}
                            {isShared && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#ff6d3b]/15 text-[#ff6d3b] border border-[#ff6d3b]/30"
                                title={`También en la base de: ${c.shared_with?.join(', ')}`}
                              >
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>Compartido ({c.shared_with?.[0]})</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Position (Cargo) */}
                    <td className="py-3 px-4 max-w-[190px]">
                      <span className="text-theme-txt font-medium block truncate" title={c.position || '—'}>
                        {c.position || '—'}
                      </span>
                    </td>

                    {/* 3. Company (Empresa) */}
                    <td className="py-3 px-4 max-w-[170px]">
                      <span className="text-theme-txt2 block truncate" title={c.company || '—'}>
                        {c.company || '—'}
                      </span>
                    </td>

                    {/* 4. Separate Email Column */}
                    <td className="py-3 px-4 min-w-[150px]">
                      {c.email ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#00a870] hover:underline">
                          <Mail className="w-3 h-3 shrink-0" />
                          <a href={`mailto:${c.email}`} onClick={(e) => e.stopPropagation()} className="truncate max-w-[140px]">
                            {c.email}
                          </a>
                        </div>
                      ) : (
                        <span className="text-[10px] text-theme-txt3">Sin email</span>
                      )}
                    </td>

                    {/* 5. Separate Phone / WhatsApp Column */}
                    <td className="py-3 px-4 min-w-[140px]">
                      {c.phone ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#2979ff]">
                          <Phone className="w-3 h-3 shrink-0" />
                          <a
                            href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline font-mono"
                          >
                            {c.phone}
                          </a>
                        </div>
                      ) : (
                        <span className="text-[10px] text-theme-txt3">Sin teléfono</span>
                      )}
                    </td>

                    {/* 6. Connected Date & Follow-up */}
                    <td className="py-3 px-4 text-theme-txt2 font-mono text-[11px] whitespace-nowrap">
                      <div>{c.connected_on || '—'}</div>
                      {c.follow_up_date && (
                        <div className={`flex items-center gap-1 text-[10px] mt-0.5 ${isFollowUpDue ? 'text-[#ff6d3b] font-bold' : 'text-theme-txt3'}`}>
                          <Clock className="w-2.5 h-2.5" />
                          <span>{c.follow_up_date}</span>
                        </div>
                      )}
                    </td>

                    {/* 7. Status CRM Dropdown */}
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

                    {/* 8. Tags preview */}
                    <td className="py-3 px-4 max-w-[130px]">
                      {c.tags && c.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {c.tags.slice(0, 2).map((t) => (
                            <span key={t} className="px-1.5 py-0.5 rounded text-[9.5px] bg-[#2979ff]/15 text-[#2979ff] font-medium truncate max-w-[65px]">
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

                    {/* 9. Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {onOpenTemplates && (
                          <button
                            onClick={() => onOpenTemplates(c)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#00a870] bg-[#00a870]/10 hover:bg-[#00a870]/20 border border-[#00a870]/30 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                            title="Generar mensaje personalizado"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Mensaje</span>
                          </button>
                        )}

                        {c.linkedin_url && (
                          <a
                            href={c.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-theme-txt2 hover:text-[#0a66c2] hover:bg-theme-sur2 rounded-lg transition-colors"
                            title="Abrir perfil en LinkedIn"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={() => onSelectContact(c)}
                          className="p-1.5 text-theme-txt2 hover:text-[#00a870] hover:bg-theme-sur2 rounded-lg transition-colors cursor-pointer"
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
              const isShared = c.shared_with && c.shared_with.length > 0;

              return (
                <div
                  key={c.id}
                  onClick={() => onSelectContact(c)}
                  className="bg-theme-sur border border-theme-bor hover:border-[#00a870]/40 rounded-xl p-4 transition-all cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-theme-sur2 border border-theme-bor flex items-center justify-center font-bold text-[#00a870] text-xs shrink-0">
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

                    <h4 className="font-semibold text-xs text-theme-txt group-hover:text-[#00a870] transition-colors truncate">
                      {c.first_name} {c.last_name || ''}
                    </h4>
                    <p className="text-[11px] text-theme-txt2 truncate mt-0.5 font-medium">{c.position || 'Sin cargo'}</p>
                    <p className="text-[10px] text-theme-txt3 truncate">{c.company || 'Sin empresa'}</p>

                    <div className="flex items-center justify-between text-[10px] mt-1.5">
                      <span className="text-theme-txt3 font-mono">Resp: {c.assigned_to || 'Gabino'}</span>
                      {isShared && (
                        <span className="text-[#ff6d3b] font-bold flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Compartido</span>
                        </span>
                      )}
                    </div>

                    {c.phone && (
                      <p className="text-[10px] text-[#2979ff] truncate mt-1 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" />
                        <span>{c.phone}</span>
                      </p>
                    )}

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
                    {onOpenTemplates && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTemplates(c);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-[#00a870] bg-[#00a870]/10 hover:bg-[#00a870]/20 rounded-lg flex items-center gap-1"
                        title="Ver plantillas"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Mensaje</span>
                      </button>
                    )}

                    {c.linkedin_url && (
                      <a
                        href={c.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#0a66c2] hover:underline flex items-center gap-1 ml-auto text-xs font-medium"
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
