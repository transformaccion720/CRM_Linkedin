'use client';

import React, { useState, useMemo, useRef, useEffect, memo } from 'react';
import { Contact, ContactStatus } from '@/lib/types';
import { 
  ExternalLink, Mail, Edit3, CheckCircle, ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight, MessageSquare, Star, Phone, AlertTriangle, 
  Tag, Filter, X, Briefcase, Building2, Search, ChevronDown, Check, FileText
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

const FilterCombobox = memo(function FilterCombobox({
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

  // Memoized filter for instant speed
  const filteredOptions = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <div className="relative min-w-[130px] max-w-[170px]" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl text-xs border transition-all cursor-pointer truncate ${
          value
            ? 'bg-theme-sur text-theme-txt font-semibold border-theme-bor2 shadow-xs'
            : 'bg-theme-sur2/80 text-theme-txt2 border-theme-bor hover:border-theme-bor2'
        }`}
        style={value ? { borderColor: `${themeColor}60` } : undefined}
      >
        <span className="flex items-center gap-1.5 truncate">
          <span style={{ color: themeColor }}>{icon}</span>
          <span className="truncate">{value || label}</span>
        </span>
        {value ? (
          <X
            className="w-3.5 h-3.5 text-theme-txt3 hover:text-theme-txt shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
          />
        ) : (
          <ChevronDown className="w-3 h-3 text-theme-txt3 shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-64 bg-theme-sur border border-theme-bor2 rounded-xl shadow-xl z-50 p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-theme-txt3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholderSearch}
              className="w-full bg-theme-sur2 border border-theme-bor rounded-lg pl-8 pr-2 py-1 text-xs text-theme-txt outline-hidden focus:border-theme-bor2"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
                setQuery('');
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                !value ? 'bg-theme-sur2 font-semibold text-theme-txt' : 'text-theme-txt2 hover:bg-theme-sur2/70'
              }`}
            >
              <span>(Todos)</span>
              {!value && <Check className="w-3 h-3 text-[#00a870]" />}
            </button>

            {filteredOptions.length === 0 ? (
              <div className="p-2 text-center text-xs text-theme-txt3">Sin resultados</div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors truncate ${
                    value === opt
                      ? 'bg-theme-sur2 font-semibold text-theme-txt'
                      : 'text-theme-txt2 hover:bg-theme-sur2/70 hover:text-theme-txt'
                  }`}
                  title={opt}
                >
                  <span className="truncate">{opt}</span>
                  {value === opt && <Check className="w-3 h-3 text-[#00a870] shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});

interface ContactTableProps {
  contacts: Contact[];
  onSelectContact: (c: Contact) => void;
  onQuickStatusChange: (id: string, newStatus: ContactStatus) => void;
  onOpenTemplates?: (c: Contact) => void;
  viewMode?: 'table' | 'grid';
  positionFilter?: string;
  setPositionFilter?: (val: string) => void;
  companyFilter?: string;
  setCompanyFilter?: (val: string) => void;
  tagFilter?: string;
  setTagFilter?: (val: string) => void;
  filterOptions?: {
    positions?: string[];
    companies?: string[];
    tags?: string[];
  };
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  // B2B Pipeline Stages
  'Prospecto identificado': { bg: 'bg-[#7d8fa8]/15', text: 'text-[#7d8fa8]', border: 'border-[#7d8fa8]/30' },
  'Contactado': { bg: 'bg-[#2979ff]/15', text: 'text-[#2979ff]', border: 'border-[#2979ff]/30' },
  'Conversación iniciada': { bg: 'bg-[#00d2ff]/15', text: 'text-[#00d2ff]', border: 'border-[#00d2ff]/30' },
  'Discovery / reunión': { bg: 'bg-[#a855f7]/15', text: 'text-[#a855f7]', border: 'border-[#a855f7]/30' },
  'Oportunidad calificada': { bg: 'bg-[#ff6d3b]/15', text: 'text-[#ff6d3b]', border: 'border-[#ff6d3b]/30' },
  'Propuesta enviada': { bg: 'bg-[#f59e0b]/15', text: 'text-[#f59e0b]', border: 'border-[#f59e0b]/30' },
  'Negociación': { bg: 'bg-[#ec4899]/15', text: 'text-[#ec4899]', border: 'border-[#ec4899]/30' },
  'Ganada': { bg: 'bg-[#00a870]/15', text: 'text-[#00a870]', border: 'border-[#00a870]/30' },
  'Perdida': { bg: 'bg-[#ef4444]/15', text: 'text-[#ef4444]', border: 'border-[#ef4444]/30' },
  'Pausada': { bg: 'bg-[#64748b]/15', text: 'text-[#64748b]', border: 'border-[#64748b]/30' },

  // B2C Stages & Legacy Fallbacks
  'Sin contactar': { bg: 'bg-[#7d8fa8]/15', text: 'text-theme-txt2', border: 'border-[#7d8fa8]/30' },
  'Sin asignar': { bg: 'bg-[#7d8fa8]/15', text: 'text-theme-txt2', border: 'border-[#7d8fa8]/30' },
  'new': { bg: 'bg-[#2979ff]/15', text: 'text-[#2979ff]', border: 'border-[#2979ff]/30' },
  'Nuevo': { bg: 'bg-[#2979ff]/15', text: 'text-[#2979ff]', border: 'border-[#2979ff]/30' },
  'contacted': { bg: 'bg-[#2979ff]/15', text: 'text-[#2979ff]', border: 'border-[#2979ff]/30' },
  'En contacto': { bg: 'bg-[#2979ff]/15', text: 'text-[#2979ff]', border: 'border-[#2979ff]/30' },
  'qualified': { bg: 'bg-[#00a870]/15', text: 'text-[#00a870]', border: 'border-[#00a870]/30' },
  'Calificado': { bg: 'bg-[#00a870]/15', text: 'text-[#00a870]', border: 'border-[#00a870]/30' },
  'Oportunidad': { bg: 'bg-[#ff6d3b]/15', text: 'text-[#ff6d3b]', border: 'border-[#ff6d3b]/30' },
  'Cliente': { bg: 'bg-[#00a870]/15', text: 'text-[#00a870]', border: 'border-[#00a870]/30' },
  'Seguimiento': { bg: 'bg-[#f59e0b]/15', text: 'text-[#f59e0b]', border: 'border-[#f59e0b]/30' },
  'En pausa': { bg: 'bg-[#64748b]/15', text: 'text-[#64748b]', border: 'border-[#64748b]/30' },
  'lost': { bg: 'bg-[#3e4c63]/25', text: 'text-theme-txt3', border: 'border-theme-bor2' },
  'Descartado': { bg: 'bg-[#ef4444]/15', text: 'text-[#ef4444]', border: 'border-[#ef4444]/30' },
};

const B2B_STATUS_OPTIONS: { value: ContactStatus; label: string }[] = [
  { value: 'Prospecto identificado', label: '1. Prospecto Identificado' },
  { value: 'Contactado', label: '2. Contactado' },
  { value: 'Conversación iniciada', label: '3. Conversación Iniciada' },
  { value: 'Discovery / reunión', label: '4. Discovery / Reunión' },
  { value: 'Oportunidad calificada', label: '5. Oportunidad Calificada' },
  { value: 'Propuesta enviada', label: '6. Propuesta Enviada' },
  { value: 'Negociación', label: '7. Negociación' },
  { value: 'Ganada', label: '8. Ganada / Cerrada' },
  { value: 'Perdida', label: '9. Perdida' },
  { value: 'Pausada', label: '10. Pausada' },
];

const B2C_STATUS_OPTIONS: { value: ContactStatus; label: string }[] = [
  { value: 'Sin contactar', label: 'Sin contactar' },
  { value: 'En contacto', label: 'En contacto' },
  { value: 'Seguimiento', label: 'Seguimiento' },
  { value: 'Oportunidad', label: 'Oportunidad' },
  { value: 'Cliente', label: 'Cliente' },
  { value: 'En pausa', label: 'En pausa' },
  { value: 'Descartado', label: 'Descartado' },
];

function ContactTableInner({
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

  // Complete alphabetically sorted list of positions, companies and tags (fast memoization)
  const uniquePositions = useMemo(() => {
    if (filterOptions?.positions && filterOptions.positions.length > 0) {
      return filterOptions.positions;
    }
    const set = new Set<string>();
    contacts.forEach((c) => { if (c.position) set.add(c.position); });
    return Array.from(set).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }, [contacts, filterOptions?.positions]);

  const uniqueCompanies = useMemo(() => {
    if (filterOptions?.companies && filterOptions.companies.length > 0) {
      return filterOptions.companies;
    }
    const set = new Set<string>();
    contacts.forEach((c) => { if (c.company) set.add(c.company); });
    return Array.from(set).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }, [contacts, filterOptions?.companies]);

  const uniqueTags = useMemo(() => {
    if (filterOptions?.tags && filterOptions.tags.length > 0) {
      return filterOptions.tags;
    }
    const set = new Set<string>();
    contacts.forEach((c) => { c.tags?.forEach((t) => set.add(t)); });
    return Array.from(set).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
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
                              <span
                                className={`inline-flex items-center px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold border ${
                                  c.business_segment === 'B2C'
                                    ? 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30'
                                    : 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30'
                                }`}
                                title={c.business_segment === 'B2C' ? 'B2C - Alumnos & Programas (Kiara)' : 'B2B - Corporativo & RRHH (Gabino)'}
                              >
                                {c.business_segment === 'B2C' ? '👤 B2C' : '🏢 B2B'}
                              </span>
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
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#ff6d3b]/20 text-[#ff6d3b] border border-[#ff6d3b]/40 animate-in fade-in"
                                  title={`⚠️ Coincide también en la base de: ${c.shared_with?.join(', ')}`}
                                >
                                  <AlertTriangle className="w-3 h-3 text-[#ff6d3b] shrink-0" />
                                  <span>Compartido ({c.shared_with?.join(', ')})</span>
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
                          {c.business_segment === 'B2B' ? (
                            <>
                              <optgroup label="🏢 Etapas B2B">
                                {B2B_STATUS_OPTIONS.map((st) => (
                                  <option key={st.value} value={st.value} className="bg-theme-sur text-theme-txt">
                                    {st.label}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="👤 Etapas B2C">
                                {B2C_STATUS_OPTIONS.map((st) => (
                                  <option key={st.value} value={st.value} className="bg-theme-sur text-theme-txt">
                                    {st.label}
                                  </option>
                                ))}
                              </optgroup>
                            </>
                          ) : (
                            <>
                              <optgroup label="👤 Etapas B2C">
                                {B2C_STATUS_OPTIONS.map((st) => (
                                  <option key={st.value} value={st.value} className="bg-theme-sur text-theme-txt">
                                    {st.label}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="🏢 Etapas B2B">
                                {B2B_STATUS_OPTIONS.map((st) => (
                                  <option key={st.value} value={st.value} className="bg-theme-sur text-theme-txt">
                                    {st.label}
                                  </option>
                                ))}
                              </optgroup>
                            </>
                          )}
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

                          {c.post_url && (
                            <a
                              href={c.post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-theme-txt2 hover:text-[#ff6d3b] hover:bg-[#ff6d3b]/15 rounded-lg border border-transparent hover:border-[#ff6d3b]/30 transition-all cursor-pointer"
                              title="Abrir post / publicación donde busca servicio en LinkedIn"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#ff6d3b]" />
                            </a>
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
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                                  c.business_segment === 'B2C'
                                    ? 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30'
                                    : 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30'
                                }`}
                              >
                                {c.business_segment === 'B2C' ? '👤 B2C' : '🏢 B2B'}
                              </span>
                              <span className="text-[10px] text-theme-txt3 font-mono">{c.assigned_to}</span>
                            </div>
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
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        {c.status}
                      </span>
                      <div className="flex items-center gap-1">
                        {c.post_url && (
                          <a
                            href={c.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded-lg text-theme-txt2 hover:text-[#ff6d3b] hover:bg-[#ff6d3b]/10 transition-colors"
                            title="Abrir post en LinkedIn donde busca servicio"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {onOpenTemplates && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenTemplates(c);
                            }}
                            className="p-1 rounded-lg text-theme-txt2 hover:text-[#00a870] hover:bg-[#00a870]/10 transition-colors"
                            title="Generar mensaje"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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

const ContactTable = memo(ContactTableInner);
export default ContactTable;

