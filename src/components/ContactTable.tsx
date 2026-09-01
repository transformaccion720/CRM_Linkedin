'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Contact, ContactStatus } from '@/lib/types';
import { 
  ExternalLink, Mail, Edit3, CheckCircle, ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight, MessageSquare, Star, Phone, AlertTriangle, 
  Tag, Filter, X, Briefcase, Building2, Search, ChevronDown, Check
} from 'lucide-react';

interface FilterComboboxProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholderSearch?: string;
  themeColor?: string;
}

function FilterCombobox({
  label,
  icon,
  value,
  onChange,
  options,
  placeholderSearch = 'Buscar...',
  themeColor = '#00a870',
}: FilterComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase().trim();
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer max-w-[210px] ${
          value
            ? 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/40 font-bold shadow-xs'
            : 'bg-theme-sur2 text-theme-txt border-theme-bor hover:border-theme-bor2 hover:bg-theme-sur3'
        }`}
      >
        <span className="shrink-0">{icon}</span>
        <span className="truncate">
          {value ? value : label}
        </span>
        {value ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="p-0.5 hover:text-red-400 cursor-pointer shrink-0 ml-0.5"
            title="Limpiar"
          >
            <X className="w-3 h-3" />
          </span>
        ) : (
          <ChevronDown className="w-3 h-3 text-theme-txt3 shrink-0 ml-0.5" />
        )}
      </button>

      {/* Dropdown with Micro Search Bar (Positioned strictly in front with high z-index and elevation) */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-72 bg-theme-sur border border-theme-bor2 rounded-2xl shadow-2xl z-50 p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/20 backdrop-blur-md">
          {/* Micro Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-theme-txt3 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholderSearch}
              className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl pl-8 pr-7 py-1.5 text-xs text-theme-txt outline-hidden placeholder:text-theme-txt3"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-theme-txt3 hover:text-theme-txt cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Options List with comfortable scrolling (max 64 units) */}
          <div className="max-h-64 overflow-y-auto space-y-0.5 pt-1 pr-1 overscroll-contain">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
                setQuery('');
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                !value ? 'bg-[#00a870]/15 text-[#00a870] font-bold' : 'text-theme-txt2 hover:bg-theme-sur2 hover:text-theme-txt'
              }`}
            >
              <span>Todos ({options.length})</span>
              {!value && <Check className="w-3.5 h-3.5 text-[#00a870]" />}
            </button>

            {filtered.length === 0 ? (
              <div className="p-3 text-center text-xs text-theme-txt3">
                No se encontró &quot;{query}&quot;
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = value === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#00a870]/15 text-[#00a870] font-bold'
                        : 'text-theme-txt hover:bg-theme-sur2'
                    }`}
                  >
                    <span className="truncate pr-2">{opt}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#00a870] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface ContactTableProps {
  contacts: Contact[];
  onSelectContact: (c: Contact) => void;
  onQuickStatusChange: (id: string, newStatus: ContactStatus) => void;
  onOpenTemplates?: (c: Contact) => void;
  viewMode?: 'table' | 'grid';
  // Column Filters
  positionFilter?: string;
  setPositionFilter?: (p: string) => void;
  companyFilter?: string;
  setCompanyFilter?: (c: string) => void;
  tagFilter?: string;
  setTagFilter?: (t: string) => void;
  filterOptions?: {
    positions?: string[];
    companies?: string[];
    tags?: string[];
  };
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
  positionFilter = '',
  setPositionFilter,
  companyFilter = '',
  setCompanyFilter,
  tagFilter = '',
  setTagFilter,
  filterOptions,
}: ContactTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Complete alphabetically sorted list of positions, companies and tags
  const uniquePositions = useMemo(() => {
    if (filterOptions?.positions && filterOptions.positions.length > 0) {
      return [...filterOptions.positions].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    }
    const set = new Set<string>();
    contacts.forEach((c) => { if (c.position) set.add(c.position); });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [contacts, filterOptions?.positions]);

  const uniqueCompanies = useMemo(() => {
    if (filterOptions?.companies && filterOptions.companies.length > 0) {
      return [...filterOptions.companies].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    }
    const set = new Set<string>();
    contacts.forEach((c) => { if (c.company) set.add(c.company); });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [contacts, filterOptions?.companies]);

  const uniqueTags = useMemo(() => {
    if (filterOptions?.tags && filterOptions.tags.length > 0) {
      return [...filterOptions.tags].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    }
    const set = new Set<string>();
    contacts.forEach((c) => { c.tags?.forEach((t) => set.add(t)); });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [contacts, filterOptions?.tags]);

  const hasActiveColumnFilters = Boolean(positionFilter || companyFilter || tagFilter);

  const totalPages = Math.ceil(contacts.length / pageSize) || 1;
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return contacts.slice(start, start + pageSize);
  }, [contacts, currentPage, pageSize]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [contacts.length, positionFilter, companyFilter, tagFilter]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-theme-bg overflow-hidden relative">
      {/* Column Filter Bar (Quick Column Combobox Filters with Micro Search - elevated with z-30) */}
      <div className="px-3 py-2 bg-theme-sur border-b border-theme-bor flex items-center gap-2.5 overflow-visible shrink-0 text-xs relative z-30">
        <div className="flex items-center gap-1.5 text-theme-txt2 font-bold shrink-0">
          <Filter className="w-3.5 h-3.5 text-[#00a870]" />
          <span>Filtros Rápidos:</span>
        </div>

        {/* 1. Cargo Filter Combobox */}
        {setPositionFilter && (
          <FilterCombobox
            label="Todos los Cargos"
            icon={<Briefcase className="w-3.5 h-3.5 text-theme-txt3" />}
            value={positionFilter}
            onChange={setPositionFilter}
            options={uniquePositions}
            placeholderSearch="Buscar cargo (ej. Analista, Gerente)..."
          />
        )}

        {/* 2. Empresa Filter Combobox */}
        {setCompanyFilter && (
          <FilterCombobox
            label="Todas las Empresas"
            icon={<Building2 className="w-3.5 h-3.5 text-theme-txt3" />}
            value={companyFilter}
            onChange={setCompanyFilter}
            options={uniqueCompanies}
            placeholderSearch="Buscar empresa (ej. Alicorp, BCP)..."
          />
        )}

        {/* 3. Etiquetas Filter Combobox */}
        {setTagFilter && (
          <FilterCombobox
            label="Todas las Etiquetas"
            icon={<Tag className="w-3.5 h-3.5 text-theme-txt3" />}
            value={tagFilter}
            onChange={setTagFilter}
            options={uniqueTags}
            placeholderSearch="Buscar etiqueta (ej. Agile, Decisor)..."
          />
        )}

        {/* Reset Active Column Filters */}
        {hasActiveColumnFilters && (
          <button
            onClick={() => {
              if (setPositionFilter) setPositionFilter('');
              if (setCompanyFilter) setCompanyFilter('');
              if (setTagFilter) setTagFilter('');
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#ff6d3b] hover:bg-[#ff6d3b]/10 border border-[#ff6d3b]/30 flex items-center gap-1 cursor-pointer shrink-0 transition-all shadow-xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>Quitar Filtros</span>
          </button>
        )}
      </div>

      {contacts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-theme-txt2">
          <CheckCircle className="w-10 h-10 mb-3 text-theme-txt3" />
          <p className="text-sm font-medium text-theme-txt">No se encontraron contactos</p>
          <p className="text-xs text-theme-txt2 mt-1">
            Prueba cambiando los filtros de columna o la búsqueda.
          </p>
        </div>
      ) : (
        /* View Content (z-0 relative) */
        <div className="flex-1 overflow-x-auto overflow-y-auto relative z-0">
          {viewMode === 'table' ? (
            <table className="w-full text-left border-collapse text-xs table-fixed min-w-[950px]">
              <thead className="sticky top-0 bg-theme-sur border-b border-theme-bor z-10 text-theme-txt2 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-[22%]">Contacto</th>
                  <th className="py-2.5 px-3 w-[15%]">Cargo</th>
                  <th className="py-2.5 px-3 w-[14%]">Empresa</th>
                  <th className="py-2.5 px-3 w-[14%]">Email</th>
                  <th className="py-2.5 px-3 w-[11%]">Teléfono / WhatsApp</th>
                  <th className="py-2.5 px-3 w-[10%]">Estado</th>
                  <th className="py-2.5 px-3 w-[8%]">Etiquetas</th>
                  <th className="py-2.5 px-3 w-[6%] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-bor">
                {paginatedContacts.map((c) => {
                  const statusConfig = STATUS_COLORS[c.status] || STATUS_COLORS['Sin contactar'];
                  const isShared = c.shared_with && c.shared_with.length > 0;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-theme-sur/70 transition-colors group cursor-pointer"
                      onClick={() => onSelectContact(c)}
                    >
                      {/* 1. Contacto: Avatar + Nombre + Responsable */}
                      <td className="py-2.5 px-3 overflow-hidden">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-theme-sur2 border border-theme-bor2 flex items-center justify-center font-bold text-[#00a870] text-[11px] shrink-0">
                            {(c.first_name[0] || '') + (c.last_name?.[0] || '')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-theme-txt group-hover:text-[#00a870] transition-colors truncate">
                                {c.first_name} {c.last_name || ''}
                              </span>
                              {c.priority && c.priority > 1 && (
                                <span className="flex items-center text-[#f59e0b] shrink-0">
                                  {[...Array(c.priority)].map((_, i) => (
                                    <Star key={i} className="w-2.5 h-2.5 fill-[#f59e0b]" />
                                  ))}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                              {c.source === 'BUSQUEDA_ACTIVA' && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-[#00a870]/15 text-[#00a870] border border-[#00a870]/30">
                                  <span>✨ Nuevo Prospecto</span>
                                </span>
                              )}
                              {c.assigned_to && (
                                <span className="text-[9.5px] text-theme-txt3 truncate font-mono">
                                  Resp: {c.assigned_to}
                                </span>
                              )}
                              {isShared && (
                                <span
                                  className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8.5px] font-bold bg-[#ff6d3b]/15 text-[#ff6d3b] border border-[#ff6d3b]/30"
                                  title={`También en la base de: ${c.shared_with?.join(', ')}`}
                                >
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  <span>Compartido</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Cargo */}
                      <td className="py-2.5 px-3 overflow-hidden">
                        <span className="text-theme-txt font-medium block truncate text-[11px]" title={c.position || '—'}>
                          {c.position || '—'}
                        </span>
                      </td>

                      {/* 3. Empresa */}
                      <td className="py-2.5 px-3 overflow-hidden">
                        <span className="text-theme-txt2 block truncate text-[11px]" title={c.company || '—'}>
                          {c.company || '—'}
                        </span>
                      </td>

                      {/* 4. Email */}
                      <td className="py-2.5 px-3 overflow-hidden">
                        {c.email ? (
                          <div className="flex items-center gap-1 text-[11px] text-[#00a870] hover:underline min-w-0">
                            <Mail className="w-3 h-3 shrink-0" />
                            <a href={`mailto:${c.email}`} onClick={(e) => e.stopPropagation()} className="truncate block" title={c.email}>
                              {c.email}
                            </a>
                          </div>
                        ) : (
                          <span className="text-[10px] text-theme-txt3">Sin email</span>
                        )}
                      </td>

                      {/* 5. Teléfono / WhatsApp */}
                      <td className="py-2.5 px-3 overflow-hidden">
                        {c.phone ? (
                          <div className="flex items-center gap-1 text-[11px] text-[#2979ff] min-w-0">
                            <Phone className="w-3 h-3 shrink-0" />
                            <a
                              href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="hover:underline font-mono truncate"
                              title={c.phone}
                            >
                              {c.phone}
                            </a>
                          </div>
                        ) : (
                          <span className="text-[10px] text-theme-txt3">Sin teléfono</span>
                        )}
                      </td>

                      {/* 6. Estado CRM */}
                      <td className="py-2.5 px-3 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={c.status}
                          onChange={(e) => onQuickStatusChange(c.id, e.target.value as ContactStatus)}
                          className={`w-full px-1.5 py-1 rounded text-[10.5px] font-semibold border outline-hidden cursor-pointer truncate ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st} className="bg-theme-sur text-theme-txt">
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* 7. Etiquetas */}
                      <td className="py-2.5 px-3 overflow-hidden">
                        {c.tags && c.tags.length > 0 ? (
                          <div className="flex items-center gap-1 flex-wrap">
                            {c.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#2979ff]/15 text-[#2979ff] border border-[#2979ff]/30 truncate max-w-[65px]"
                                title={t}
                              >
                                {t}
                              </span>
                            ))}
                            {c.tags.length > 2 && (
                              <span className="text-[9px] text-theme-txt3">+{c.tags.length - 2}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-theme-txt3">—</span>
                        )}
                      </td>

                      {/* 8. Acciones Rápidas Directas */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {onOpenTemplates && (
                            <button
                              onClick={() => onOpenTemplates(c)}
                              className="p-1.5 text-theme-txt2 hover:text-[#00a870] hover:bg-[#00a870]/15 rounded-lg border border-transparent hover:border-[#00a870]/30 transition-all cursor-pointer"
                              title="Generar mensaje LinkedIn personalizado"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-[#00a870]" />
                            </button>
                          )}

                          {c.linkedin_url && (
                            <a
                              href={c.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-theme-txt2 hover:text-[#0a66c2] hover:bg-[#0a66c2]/15 rounded-lg border border-transparent hover:border-[#0a66c2]/30 transition-all cursor-pointer"
                              title="Abrir perfil de LinkedIn"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* Grid View */
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {paginatedContacts.map((c) => {
                const statusConfig = STATUS_COLORS[c.status] || STATUS_COLORS['Sin contactar'];
                return (
                  <div
                    key={c.id}
                    onClick={() => onSelectContact(c)}
                    className="p-3.5 bg-theme-sur border border-theme-bor hover:border-theme-bor2 rounded-xl transition-all flex flex-col justify-between space-y-3 cursor-pointer group shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-theme-sur2 border border-theme-bor2 flex items-center justify-center font-bold text-[#00a870] text-xs">
                            {(c.first_name[0] || '') + (c.last_name?.[0] || '')}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-theme-txt group-hover:text-[#00a870] transition-colors truncate max-w-[140px]">
                              {c.first_name} {c.last_name || ''}
                            </div>
                            <span className="text-[10px] text-theme-txt3 font-mono">{c.assigned_to}</span>
                          </div>
                        </div>
                        {c.priority && c.priority > 1 && (
                          <div className="flex items-center text-[#f59e0b]">
                            {[...Array(c.priority)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-[#f59e0b]" />
                            ))}
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-theme-txt font-medium truncate">{c.position || 'Sin cargo'}</p>
                      <p className="text-[10px] text-theme-txt2 truncate">{c.company || 'Sin empresa'}</p>
                    </div>

                    <div className="pt-2 border-t border-theme-bor flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                        {c.status}
                      </span>
                      {onOpenTemplates && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenTemplates(c);
                          }}
                          className="p-1 rounded-lg text-theme-txt2 hover:text-[#00a870] hover:bg-[#00a870]/10 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      {contacts.length > 0 && (
        <div className="px-4 py-2.5 bg-theme-sur border-t border-theme-bor flex items-center justify-between text-xs text-theme-txt2 shrink-0">
          <div className="flex items-center gap-2">
            <span>
              Mostrando {Math.min((currentPage - 1) * pageSize + 1, contacts.length)} -{' '}
              {Math.min(currentPage * pageSize, contacts.length)} de {contacts.length.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1 rounded bg-theme-sur2 border border-theme-bor disabled:opacity-30 cursor-pointer"
              title="Primera página"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-theme-sur2 border border-theme-bor disabled:opacity-30 cursor-pointer"
              title="Página anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] font-bold text-theme-txt">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-theme-sur2 border border-theme-bor disabled:opacity-30 cursor-pointer"
              title="Página siguiente"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-theme-sur2 border border-theme-bor disabled:opacity-30 cursor-pointer"
              title="Última página"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
