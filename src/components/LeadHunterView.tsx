'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Globe, MapPin, Phone, MessageSquare, ExternalLink, Star, Plus, Check, 
  RefreshCw, Filter, Building2, Users, Flame, ShieldAlert, ShieldCheck, Sparkles, AlertCircle, 
  ArrowUpRight, Copy, Mail, CheckCircle2, ChevronRight, UserCheck, KeyRound, Clock,
  Compass, Send, CheckSquare, Loader2
} from 'lucide-react';
import { ExploredBusiness, TeamMember, Contact, ContactStatus } from '@/lib/types';

interface LeadHunterViewProps {
  currentUser: TeamMember | null;
  teamMembers: TeamMember[];
  onOpenContactDrawer?: (contactId: string) => void;
  onOpenApiSettings?: () => void;
  onRefreshContacts?: () => void;
}

const PERU_CITIES = [
  'Todo el Perú',
  'Lima Metropolitana',
  'Arequipa',
  'Trujillo',
  'Chiclayo',
  'Piura',
  'Cusco',
  'Huancayo',
  'Ica',
  'Tacna',
  'Chimbote',
  'Pucallpa',
  'Juliaca',
  'Cajamarca',
];

const BUSINESS_CATEGORIES = [
  { id: 'distribuidora', label: 'Distribuidoras & Mayoristas', icon: '📦' },
  { id: 'clinica', label: 'Clínicas & Centros Médicos', icon: '🏥' },
  { id: 'ferreteria industrial', label: 'Ferreterías Industriales', icon: '🔩' },
  { id: 'constructora', label: 'Constructoras & Contratistas', icon: '🏗️' },
  { id: 'metalmecanica', label: 'Talleres & Metalmecánica', icon: '⚙️' },
  { id: 'transporte de carga', label: 'Logística & Transporte de Carga', icon: '🚛' },
  { id: 'restaurante hotel', label: 'Restaurantes & Hoteles', icon: '🍽️' },
  { id: 'servicios contables', label: 'Servicios Profesionales / Contables', icon: '💼' },
  { id: 'laboratorio', label: 'Laboratorios & Farmacéuticas', icon: '🔬' },
];

export default function LeadHunterView({
  currentUser,
  teamMembers = [],
  onOpenContactDrawer,
  onOpenApiSettings,
  onRefreshContacts,
}: LeadHunterViewProps) {
  // Navigation Tabs: 'explore' (Google live search) vs 'managed' (Contactos Explorados en CRM)
  const [activeTab, setActiveTab] = useState<'explore' | 'managed'>('explore');

  // Search Filters
  const [selectedCity, setSelectedCity] = useState<string>('Arequipa');
  const [selectedCategory, setSelectedCategory] = useState<string>('distribuidora');
  const [onlyWithoutWebsite, setOnlyWithoutWebsite] = useState<boolean>(true);
  const [customKeyword, setCustomKeyword] = useState<string>('');

  // Results & Loading
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<ExploredBusiness[]>([]);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Managed Leads State (from Neon DB where b2b_subsegment = 'EXPLORATORIO')
  const [managedLeads, setManagedLeads] = useState<Contact[]>([]);
  const [loadingManaged, setLoadingManaged] = useState<boolean>(false);
  const [managedMemberFilter, setManagedMemberFilter] = useState<string>('');
  const [managedStatusFilter, setManagedStatusFilter] = useState<string>('all');
  const [managedSearchQuery, setManagedSearchQuery] = useState<string>('');

  // Importing action state
  const [importingPlaceId, setImportingPlaceId] = useState<string | null>(null);
  const [assignedTarget, setAssignedTarget] = useState<string>(currentUser?.name || 'Gabino');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // API status check & Quota
  const [apiStatus, setApiStatus] = useState<{ has_google_key: boolean; has_openrouter_key: boolean }>({
    has_google_key: false,
    has_openrouter_key: false,
  });
  const [searchQuota, setSearchQuota] = useState<{ limit: number; today: number }>({
    limit: 30,
    today: 0,
  });

  // Check API keys status
  const checkApiKeys = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setApiStatus({
          has_google_key: data.has_google_key || false,
          has_openrouter_key: data.has_openrouter_key || false,
        });
        if (typeof data.daily_search_limit === 'number') {
          setSearchQuota({
            limit: data.daily_search_limit,
            today: data.searches_today || 0,
          });
        }
      }
    } catch (e) {
      console.error('Error checking API keys:', e);
    }
  };

  // Fetch Managed Leads from Neon DB
  const fetchManagedLeads = async () => {
    setLoadingManaged(true);
    try {
      const res = await fetch('/api/contacts?limit=200');
      if (res.ok) {
        const data = await res.json();
        const allContacts: Contact[] = data.contacts || [];
        // Filter specifically for B2B Exploratory contacts
        const exploratory = allContacts.filter(
          (c) => c.b2b_subsegment === 'EXPLORATORIO' || c.source === 'GOOGLE_MAPS' || (c.tags || []).includes('B2B Exploratorio')
        );
        setManagedLeads(exploratory);
      }
    } catch (e) {
      console.error('Error fetching managed leads:', e);
    } finally {
      setLoadingManaged(false);
    }
  };

  useEffect(() => {
    checkApiKeys();
    fetchManagedLeads();
  }, []);

  // Execute Search via backend
  const handleSearch = async () => {
    setSearching(true);
    setSearchError(null);
    setHasSearched(true);
    try {
      const queryCat = customKeyword.trim() ? customKeyword.trim() : selectedCategory;
      const res = await fetch('/api/prospecting/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: selectedCity,
          category: queryCat,
          onlyWithoutWebsite,
        }),
      });

      const data = await res.json();
      if (typeof data.daily_limit === 'number') {
        setSearchQuota({
          limit: data.daily_limit,
          today: data.searches_today || 0,
        });
      }

      if (res.ok && data.success) {
        setSearchResults(data.results || []);
        setIsDemoMode(Boolean(data.is_demo));
      } else {
        setSearchError(data.error || 'No se pudo completar la búsqueda en Google.');
      }
    } catch (e: any) {
      setSearchError(`Error de conexión: ${e.message}`);
    } finally {
      setSearching(false);
    }
  };

  // Import lead to CRM
  const handleImportLead = async (biz: ExploredBusiness) => {
    setImportingPlaceId(biz.place_id);
    try {
      const res = await fetch('/api/prospecting/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business: biz,
          assigned_to: assignedTarget,
          deal_value: 500, // standard web starter price
          initial_status: 'Prospecto identificado',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Mark as imported in search results
        setSearchResults((prev) =>
          prev.map((item) =>
            item.place_id === biz.place_id
              ? { ...item, is_imported: true, imported_id: data.contact_id }
              : item
          )
        );
        // Refresh managed leads list
        fetchManagedLeads();
        if (onRefreshContacts) onRefreshContacts();
      }
    } catch (e) {
      console.error('Error importing lead:', e);
    } finally {
      setImportingPlaceId(null);
    }
  };

  // Generate WhatsApp pitch message
  const getWhatsAppMessage = (bizName: string, city: string, cat?: string) => {
    return encodeURIComponent(
      `Hola equipo de ${bizName}, un saludo desde TransformAcción en Perú.\n\n` +
      `Estuve revisando su excelente reputación en Google en ${city}, pero noté que al buscarlos sus clientes no cuentan con una página web oficial donde cotizar su catálogo directamente.\n\n` +
      `Nosotros desarrollamos páginas web comerciales de alto impacto listas en pocos días. ¿Con quién de la administración podría coordinar para mostrarles una muestra rápida sin costo?`
    );
  };

  // Generate Email pitch
  const getEmailSubject = (bizName: string) => {
    return encodeURIComponent(`Propuesta de Página Web Comercial para ${bizName}`);
  };

  const getEmailBody = (bizName: string, city: string) => {
    return encodeURIComponent(
      `Estimado equipo de ${bizName},\n\n` +
      `Les escribo desde TransformAcción. Revisamos su presencia en Google en ${city} y los felicitamos por su reputación comercial.\n\n` +
      `Notamos una gran oportunidad: hoy sus clientes no disponen de un sitio web oficial donde revisar su catálogo y solicitar cotizaciones inmediatas.\n\n` +
      `Diseñamos páginas web profesionales con catálogo interactivo y botón directo a WhatsApp, optimizadas para captar clientes en Perú.\n\n` +
      `¿Podríamos agendar una breve llamada de 10 minutos esta semana para mostrarles un prototipo sin compromiso?\n\n` +
      `Saludos cordiales,\n${currentUser?.name || 'Equipo Comercial'}\nTransformAcción 720°`
    );
  };

  // Filter Managed Leads
  const filteredManagedLeads = useMemo(() => {
    return managedLeads.filter((lead) => {
      // Member filter
      if (managedMemberFilter && lead.assigned_to !== managedMemberFilter) {
        return false;
      }
      // Status filter
      if (managedStatusFilter !== 'all' && lead.status !== managedStatusFilter) {
        return false;
      }
      // Search query
      if (managedSearchQuery.trim()) {
        const q = managedSearchQuery.toLowerCase();
        const matchName = (lead.company || lead.first_name || '').toLowerCase().includes(q);
        const matchPhone = (lead.phone || '').includes(q);
        const matchCity = (lead.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchNotes = (lead.notes || '').toLowerCase().includes(q);
        return matchName || matchPhone || matchCity || matchNotes;
      }
      return true;
    });
  }, [managedLeads, managedMemberFilter, managedStatusFilter, managedSearchQuery]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-theme-bg">
      {/* Header & Metric Banner */}
      <div className="bg-theme-sur p-5 sm:p-6 rounded-2xl border border-theme-bor shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff6d3b] font-bold bg-[#ff6d3b]/10 px-2 py-0.5 rounded flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#ff6d3b]" />
              <span>Cazador B2B Exploratorio • Google Perú</span>
            </span>

            {/* API Status Pill */}
            {apiStatus.has_google_key ? (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Google Places (New) Activo</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Modo Demostración</span>
              </span>
            )}

            {apiStatus.has_google_key && (
              <button
                onClick={onOpenApiSettings}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-sur2 text-theme-txt2 hover:text-[#00a870] border border-theme-bor hover:border-[#00a870]/40 flex items-center gap-1 transition-colors cursor-pointer"
                title="Límite diario de seguridad activo para evitar consumos inesperados. Haz clic para configurar."
              >
                <ShieldCheck className="w-3 h-3 text-[#00a870]" />
                <span>Búsquedas hoy: {searchQuota.today}/{searchQuota.limit}</span>
              </button>
            )}

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-sur2 text-theme-txt3 border border-theme-bor">
              {managedLeads.length} explorados en CRM
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-theme-txt">
            Cazador de Negocios & Servicios Web Perú
          </h1>
          <p className="text-xs sm:text-sm text-theme-txt2 mt-1 max-w-2xl">
            Descubre empresas peruanas activas en Google que <b>no tienen sitio web</b>. Conéctate directamente por WhatsApp y Email con mensaje de venta personalizado.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Assigned target selector */}
          <div className="flex items-center gap-1.5 bg-theme-sur2 border border-theme-bor rounded-xl px-2.5 py-1.5 text-xs text-theme-txt2">
            <UserCheck className="w-3.5 h-3.5 text-[#ff6d3b]" />
            <span className="text-[11px] font-mono font-semibold">Asignar a:</span>
            <select
              value={assignedTarget}
              onChange={(e) => setAssignedTarget(e.target.value)}
              className="bg-transparent text-theme-txt font-bold outline-hidden cursor-pointer text-xs"
            >
              {teamMembers.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Config APIs Button */}
          {onOpenApiSettings && (
            <button
              onClick={onOpenApiSettings}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor hover:border-[#ff6d3b] text-theme-txt flex items-center gap-1.5 transition-all cursor-pointer"
              title="Configurar Google Places y OpenRouter API Keys"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#ff6d3b]" />
              <span>Configurar APIs</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs: Explorador en Vivo vs Contactos Explorados */}
      <div className="flex items-center justify-between border-b border-theme-bor pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-[#ff6d3b] text-white shadow-xs font-extrabold'
                : 'bg-theme-sur2 text-theme-txt2 hover:text-theme-txt border border-theme-bor'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>1. Explorador de Negocios en Vivo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('managed');
              fetchManagedLeads();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'managed'
                ? 'bg-[#2979ff] text-white shadow-xs font-extrabold'
                : 'bg-theme-sur2 text-theme-txt2 hover:text-theme-txt border border-theme-bor'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>2. Contactos Explorados en CRM ({managedLeads.length})</span>
          </button>
        </div>

        {activeTab === 'managed' && (
          <button
            onClick={fetchManagedLeads}
            disabled={loadingManaged}
            className="p-2 rounded-xl bg-theme-sur2 border border-theme-bor hover:border-[#2979ff] text-theme-txt2 hover:text-theme-txt text-xs flex items-center gap-1 cursor-pointer transition-colors"
            title="Refrescar lista de contactos explorados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingManaged ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* TAB 1: EXPLORADOR DE NEGOCIOS EN VIVO */}
      {activeTab === 'explore' && (
        <div className="space-y-5">
          {/* Search Box & Filters */}
          <div className="bg-theme-sur border border-theme-bor p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-theme-txt font-mono uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4 text-[#ff6d3b]" />
                <span>Parámetros de Búsqueda de Negocios en Perú</span>
              </span>

              {isDemoMode && (
                <span className="text-[11px] font-mono text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded border border-[#f59e0b]/30">
                  ⚡ Datos de muestra activos • Configura tu clave de Google para datos 100% en vivo
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Ciudad / Región */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt3 font-bold">
                  Ciudad o Región:
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#ff6d3b] rounded-xl px-3 py-2 text-xs font-bold text-theme-txt outline-hidden cursor-pointer"
                >
                  {PERU_CITIES.map((c) => (
                    <option key={c} value={c}>
                      📍 {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Rubro / Categoría Comercial */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt3 font-bold">
                  Rubro Comercial de Alto Potencial:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCustomKeyword('');
                  }}
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#ff6d3b] rounded-xl px-3 py-2 text-xs font-bold text-theme-txt outline-hidden cursor-pointer"
                >
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Palabra Clave personalizada */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt3 font-bold">
                  O Palabra Clave Específica:
                </label>
                <input
                  type="text"
                  value={customKeyword}
                  onChange={(e) => setCustomKeyword(e.target.value)}
                  placeholder="ej. imprenta, autopartes, consultor..."
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#ff6d3b] rounded-xl px-3 py-2 text-xs text-theme-txt outline-hidden placeholder:text-theme-txt3"
                />
              </div>

              {/* 4. Action Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#ff6d3b] hover:bg-[#e05828] text-white flex items-center justify-center gap-2 shadow-md shadow-[#ff6d3b]/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {searching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Buscando en Google...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Explorar Negocios</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-theme-txt2">
                <input
                  type="checkbox"
                  checked={onlyWithoutWebsite}
                  onChange={(e) => setOnlyWithoutWebsite(e.target.checked)}
                  className="accent-[#ff6d3b] w-4 h-4 rounded cursor-pointer"
                />
                <span className="font-semibold text-theme-txt">
                  🎯 Solo empresas SIN sitio web oficial (Oportunidad Web)
                </span>
              </label>

              <span className="text-theme-txt3 font-mono text-[11px]">
                País: <b className="text-theme-txt">Perú</b>
              </span>
            </div>
          </div>

          {/* Search Error Alert */}
          {searchError && (
            <div className="p-4 bg-[#ff6d3b]/10 border border-[#ff6d3b]/30 rounded-2xl flex items-center gap-3 text-xs text-[#ff6d3b]">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                <span className="font-bold">Aviso: </span>
                <span>{searchError}</span>
              </div>
            </div>
          )}

          {/* Results Area */}
          {searching ? (
            <div className="bg-theme-sur border border-theme-bor rounded-2xl p-16 text-center text-xs text-theme-txt2 space-y-3 shadow-xs">
              <Loader2 className="w-8 h-8 text-[#ff6d3b] animate-spin mx-auto" />
              <div className="font-bold text-sm text-theme-txt">Consultando Google Maps en {selectedCity}...</div>
              <p className="text-theme-txt3 max-w-sm mx-auto">
                Filtrando empresas activas, verificando teléfonos y formateando canales de contacto directo.
              </p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="bg-theme-sur border border-theme-bor rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-theme-bor flex items-center justify-between bg-theme-sur2/40">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-theme-txt">
                    Negocios Encontrados ({searchResults.length})
                  </span>
                  <span className="text-[11px] font-mono text-theme-txt3">
                    en {selectedCity}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-theme-txt3">
                  Asignando automáticamente a: <b className="text-theme-txt">{assignedTarget}</b>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-theme-bor bg-theme-sur2/60 text-theme-txt2 font-mono text-[10.5px] uppercase tracking-wider">
                      <th className="py-3 px-4 font-bold">Empresa / Negocio</th>
                      <th className="py-3 px-4 font-bold">Ubicación</th>
                      <th className="py-3 px-3 font-bold">Teléfono / WhatsApp</th>
                      <th className="py-3 px-3 font-bold">Presencia Web</th>
                      <th className="py-3 px-3 font-bold">Correo Sugerido</th>
                      <th className="py-3 px-3 font-bold">Reputación</th>
                      <th className="py-3 px-4 font-bold text-right">Acciones Comerciales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-bor/60">
                    {searchResults.map((biz) => {
                      const isImporting = importingPlaceId === biz.place_id;
                      const hasWhatsapp = Boolean(biz.whatsapp_number);
                      const waLink = hasWhatsapp
                        ? `https://wa.me/${biz.whatsapp_number}?text=${getWhatsAppMessage(biz.name, biz.city)}`
                        : null;
                      const mailLink = biz.email
                        ? `mailto:${biz.email}?subject=${getEmailSubject(biz.name)}&body=${getEmailBody(biz.name, biz.city)}`
                        : null;

                      return (
                        <tr key={biz.place_id} className="hover:bg-theme-sur2/40 transition-colors">
                          {/* Empresa / Negocio */}
                          <td className="py-3 px-4 max-w-[220px]">
                            <div className="font-bold text-theme-txt text-sm leading-snug">
                              {biz.name}
                            </div>
                            <div className="text-[10.5px] text-theme-txt3 truncate mt-0.5">
                              {biz.category || selectedCategory}
                            </div>
                          </td>

                          {/* Ubicación */}
                          <td className="py-3 px-4 max-w-[180px]">
                            <div className="flex items-start gap-1 text-[11px] text-theme-txt2">
                              <MapPin className="w-3.5 h-3.5 text-[#ff6d3b] shrink-0 mt-0.5" />
                              <span className="truncate">{biz.address || biz.city}</span>
                            </div>
                            {biz.google_maps_url && (
                              <a
                                href={biz.google_maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-mono text-[#2979ff] hover:underline flex items-center gap-0.5 mt-0.5"
                              >
                                <span>Ver en Maps</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </td>

                          {/* Teléfono / WhatsApp */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {biz.phone ? (
                              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                <Phone className="w-3.5 h-3.5 text-[#00a870]" />
                                <span className="text-theme-txt font-semibold">{biz.phone}</span>
                              </div>
                            ) : (
                              <span className="text-theme-txt3 italic text-[11px]">Sin teléfono</span>
                            )}
                          </td>

                          {/* Presencia Web */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {biz.website_status === 'NONE' || !biz.website ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-[#ff6d3b]/15 text-[#ff6d3b] border-[#ff6d3b]/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6d3b]" />
                                <span>SIN SITIO WEB</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30">
                                <span>Tiene Web</span>
                              </span>
                            )}
                          </td>

                          {/* Correo Sugerido */}
                          <td className="py-3 px-3 max-w-[180px]">
                            {biz.email ? (
                              <div className="flex items-center gap-1 text-[11px] font-mono text-theme-txt2 truncate" title={biz.email}>
                                <Mail className="w-3 h-3 text-[#2979ff] shrink-0" />
                                <span className="truncate">{biz.email}</span>
                              </div>
                            ) : (
                              <span className="text-theme-txt3 text-[10.5px] italic">-</span>
                            )}
                          </td>

                          {/* Reputación */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />
                              <span className="font-bold text-xs text-theme-txt">{biz.rating || 0}</span>
                              <span className="text-[10px] text-theme-txt3">({biz.reviews_count || 0})</span>
                            </div>
                          </td>

                          {/* Acciones Comerciales */}
                          <td className="py-3 px-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* WhatsApp Direct Button */}
                              {waLink && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#00a870]/15 hover:bg-[#00a870]/25 text-[#00a870] border border-[#00a870]/30 flex items-center gap-1 cursor-pointer transition-all"
                                  title="Abrir chat de WhatsApp con pitch comercial pre-redactado"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </a>
                              )}

                              {/* Email Direct Button */}
                              {mailLink && (
                                <a
                                  href={mailLink}
                                  className="p-1.5 rounded-lg text-xs bg-theme-sur2 hover:bg-[#2979ff]/15 text-theme-txt2 hover:text-[#2979ff] border border-theme-bor cursor-pointer transition-all"
                                  title="Enviar propuesta por correo electrónico"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {/* Import to CRM button */}
                              {biz.is_imported ? (
                                <button
                                  onClick={() => biz.imported_id && onOpenContactDrawer && onOpenContactDrawer(biz.imported_id)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-theme-sur2 text-[#2979ff] border border-theme-bor flex items-center gap-1 cursor-pointer hover:bg-[#2979ff]/10"
                                >
                                  <Check className="w-3 h-3 text-[#00a870]" />
                                  <span>En CRM</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleImportLead(biz)}
                                  disabled={isImporting}
                                  className="px-3 py-1 rounded-lg text-xs font-bold bg-[#ff6d3b] hover:bg-[#e05828] text-white flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50 shadow-xs"
                                >
                                  {isImporting ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      <span>Guardando...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3" />
                                      <span>+ Importar B2B</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : hasSearched ? (
            <div className="bg-theme-sur border border-theme-bor rounded-2xl p-12 text-center text-xs text-theme-txt2 space-y-2 shadow-xs">
              <Building2 className="w-10 h-10 text-theme-txt3 mx-auto opacity-40" />
              <h3 className="font-bold text-sm text-theme-txt">No se encontraron negocios con esos filtros específicos</h3>
              <p className="max-w-md mx-auto text-theme-txt3">
                Intenta buscar en otra ciudad como <b>Lima Metropolitana</b>, <b>Arequipa</b> o <b>Trujillo</b>, o selecciona otro rubro comercial.
              </p>
            </div>
          ) : (
            /* First time guide card */
            <div className="bg-theme-sur border border-theme-bor rounded-2xl p-8 shadow-xs text-center space-y-4 max-w-2xl mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#ff6d3b]/15 text-[#ff6d3b] flex items-center justify-center mx-auto">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-theme-txt">
                  Listo para Explorar Negocios en Todo el Perú
                </h3>
                <p className="text-xs text-theme-txt2 mt-1 leading-relaxed">
                  Selecciona una ciudad (ej. <b>Arequipa</b> o <b>Trujillo</b>), elige un rubro de alto ticket comercial y haz clic en <b>&quot;Explorar Negocios&quot;</b> para descubrir prospectos con números de WhatsApp listos para contactar.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
                <div className="p-3 bg-theme-sur2 rounded-xl border border-theme-bor text-xs space-y-1">
                  <div className="font-bold text-theme-txt flex items-center gap-1.5">
                    <span className="text-base">1️⃣</span>
                    <span>Descubrimiento</span>
                  </div>
                  <p className="text-theme-txt3 text-[11px]">
                    Filtra negocios reales en Google que carecen de sitio web comercial.
                  </p>
                </div>

                <div className="p-3 bg-theme-sur2 rounded-xl border border-theme-bor text-xs space-y-1">
                  <div className="font-bold text-theme-txt flex items-center gap-1.5">
                    <span className="text-base">2️⃣</span>
                    <span>Ataque Seguro</span>
                  </div>
                  <p className="text-theme-txt3 text-[11px]">
                    Conexión nativa por WhatsApp con mensaje persuasivo sin riesgo de baneo.
                  </p>
                </div>

                <div className="p-3 bg-theme-sur2 rounded-xl border border-theme-bor text-xs space-y-1">
                  <div className="font-bold text-theme-txt flex items-center gap-1.5">
                    <span className="text-base">3️⃣</span>
                    <span>Pipeline Dedicado</span>
                  </div>
                  <p className="text-theme-txt3 text-[11px]">
                    Importa con 1 clic al embudo B2B Exploratorio sin mezclar con LinkedIn.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONTACTOS EXPLORADOS EN CRM */}
      {activeTab === 'managed' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-theme-sur border border-theme-bor p-4 rounded-2xl shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-theme-txt3 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={managedSearchQuery}
                  onChange={(e) => setManagedSearchQuery(e.target.value)}
                  placeholder="Buscar negocio explorado, teléfono, ciudad o notas..."
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#2979ff] rounded-xl pl-8 pr-3 py-2 text-xs text-theme-txt outline-hidden placeholder:text-theme-txt3"
                />
              </div>

              {/* Secondary filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Stage filter */}
                <div className="flex items-center gap-1.5 bg-theme-sur2 border border-theme-bor rounded-xl px-2.5 py-1 text-xs text-theme-txt2">
                  <Filter className="w-3.5 h-3.5 text-[#2979ff]" />
                  <select
                    value={managedStatusFilter}
                    onChange={(e) => setManagedStatusFilter(e.target.value)}
                    className="bg-transparent text-theme-txt outline-hidden cursor-pointer text-xs font-medium"
                  >
                    <option value="all">Etapa del Pipeline: Todas</option>
                    <option value="Prospecto identificado">1. Prospecto identificado</option>
                    <option value="Contactado">2. WhatsApp enviado / Contactado</option>
                    <option value="Conversación iniciada">3. Conversación activa</option>
                    <option value="Discovery / reunión">4. Reunión / Demo agendada</option>
                    <option value="Oportunidad calificada">5. Propuesta enviada</option>
                    <option value="Ganada">6. Ganada (Cliente Web)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Asignado a filter pills */}
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-theme-bor/60">
              <span className="text-[11px] font-mono text-theme-txt3 uppercase tracking-wider font-bold">
                Asesor Responsable:
              </span>
              <button
                onClick={() => setManagedMemberFilter('')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  managedMemberFilter === ''
                    ? 'bg-[#2979ff] text-white shadow-xs'
                    : 'bg-theme-sur2 text-theme-txt2 hover:text-theme-txt border border-theme-bor'
                }`}
              >
                Todos ({managedLeads.length})
              </button>
              {teamMembers.map((m) => {
                const count = managedLeads.filter((l) => l.assigned_to === m.name).length;
                return (
                  <button
                    key={m.id}
                    onClick={() => setManagedMemberFilter(managedMemberFilter === m.name ? '' : m.name)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      managedMemberFilter === m.name
                        ? 'bg-[#2979ff] text-white shadow-xs'
                        : 'bg-theme-sur2 text-theme-txt2 hover:text-theme-txt border border-theme-bor'
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className="text-[10px] opacity-80 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Managed Leads Table */}
          {loadingManaged ? (
            <div className="bg-theme-sur border border-theme-bor rounded-2xl p-16 text-center text-xs text-theme-txt2 space-y-2">
              <RefreshCw className="w-5 h-5 animate-spin text-[#2979ff] mx-auto" />
              <span>Cargando contactos explorados...</span>
            </div>
          ) : filteredManagedLeads.length === 0 ? (
            <div className="bg-theme-sur border border-theme-bor rounded-2xl p-12 text-center text-xs text-theme-txt2 space-y-2 shadow-xs">
              <Building2 className="w-10 h-10 text-theme-txt3 mx-auto opacity-40" />
              <h3 className="font-bold text-sm text-theme-txt">No hay prospectos explorados con los filtros actuales</h3>
              <p className="max-w-md mx-auto text-theme-txt3">
                Ve a la pestaña <b>&quot;Explorador de Negocios en Vivo&quot;</b> para buscar y agregar empresas de cualquier ciudad de Perú.
              </p>
            </div>
          ) : (
            <div className="bg-theme-sur border border-theme-bor rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 border-b border-theme-bor flex items-center justify-between bg-theme-sur2/40">
                <span className="text-xs font-extrabold text-theme-txt">
                  Cartera B2B Exploratoria ({filteredManagedLeads.length} negocios)
                </span>
                <span className="text-[11px] font-mono text-theme-txt3">
                  Páginas Web & Transformación Digital PYME
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-theme-bor bg-theme-sur2/60 text-theme-txt2 font-mono text-[10.5px] uppercase tracking-wider">
                      <th className="py-3 px-4 font-bold">Negocio / Razón Social</th>
                      <th className="py-3 px-4 font-bold">Ciudad & Maps</th>
                      <th className="py-3 px-3 font-bold">Contacto / WhatsApp</th>
                      <th className="py-3 px-3 font-bold">Correo Electrónico</th>
                      <th className="py-3 px-3 font-bold">Etapa Pipeline</th>
                      <th className="py-3 px-3 font-bold">Valor Web</th>
                      <th className="py-3 px-3 font-bold">Responsable</th>
                      <th className="py-3 px-4 font-bold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-bor/60">
                    {filteredManagedLeads.map((lead) => {
                      const waPhone = (lead.phone || '').replace(/\D/g, '');
                      const waLink = waPhone.length >= 9
                        ? `https://wa.me/${waPhone.startsWith('51') ? waPhone : `51${waPhone}`}?text=${getWhatsAppMessage(lead.company || lead.first_name, lead.country || 'Perú')}`
                        : null;
                      const mailLink = lead.email
                        ? `mailto:${lead.email}?subject=${getEmailSubject(lead.company || lead.first_name)}&body=${getEmailBody(lead.company || lead.first_name, lead.country || 'Perú')}`
                        : null;

                      return (
                        <tr 
                          key={lead.id}
                          onClick={() => onOpenContactDrawer && onOpenContactDrawer(lead.id)}
                          className="hover:bg-theme-sur2/50 transition-colors cursor-pointer group"
                        >
                          {/* Negocio */}
                          <td className="py-3 px-4 max-w-[200px]">
                            <div className="font-bold text-theme-txt text-sm leading-snug group-hover:text-[#2979ff] transition-colors truncate">
                              {lead.company || lead.first_name}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10.5px] text-theme-txt3 mt-0.5">
                              <span className="px-1.5 py-0.2 rounded bg-[#ff6d3b]/15 text-[#ff6d3b] font-mono font-bold">
                                B2B Exploratorio
                              </span>
                              {lead.google_rating && (
                                <span className="flex items-center gap-0.5 text-[#f59e0b] font-bold font-mono">
                                  ⭐ {lead.google_rating}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Ciudad & Maps */}
                          <td className="py-3 px-4 max-w-[160px]" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1 text-[11px] text-theme-txt2 truncate">
                              <MapPin className="w-3.5 h-3.5 text-[#ff6d3b] shrink-0" />
                              <span className="truncate">
                                {(lead.tags || []).find((t) => t !== 'B2B Exploratorio' && t !== 'Google Maps' && t !== 'Servicios Web') || 'Perú'}
                              </span>
                            </div>
                            {lead.google_maps_url && (
                              <a
                                href={lead.google_maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-mono text-[#2979ff] hover:underline flex items-center gap-0.5 mt-0.5"
                              >
                                <span>Ficha Google Maps</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </td>

                          {/* Contacto / WhatsApp */}
                          <td className="py-3 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {lead.phone ? (
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-[#00a870]" />
                                <span className="font-mono text-xs text-theme-txt font-semibold">{lead.phone}</span>
                              </div>
                            ) : (
                              <span className="text-theme-txt3 italic text-[11px]">Sin teléfono</span>
                            )}
                          </td>

                          {/* Correo Electrónico */}
                          <td className="py-3 px-3 max-w-[170px]" onClick={(e) => e.stopPropagation()}>
                            {lead.email ? (
                              <div className="flex items-center gap-1 text-[11px] font-mono text-theme-txt2 truncate" title={lead.email}>
                                <Mail className="w-3 h-3 text-[#2979ff] shrink-0" />
                                <span className="truncate">{lead.email}</span>
                              </div>
                            ) : (
                              <span className="text-theme-txt3 text-[11px] italic">-</span>
                            )}
                          </td>

                          {/* Etapa Pipeline */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-theme-sur2 text-theme-txt border border-theme-bor">
                              {lead.status}
                            </span>
                          </td>

                          {/* Valor Web */}
                          <td className="py-3 px-3 whitespace-nowrap font-mono">
                            {lead.deal_value ? (
                              <span className="text-xs font-bold text-[#00e5a0]">
                                ${lead.deal_value} USD
                              </span>
                            ) : (
                              <span className="text-theme-txt3">-</span>
                            )}
                          </td>

                          {/* Responsable */}
                          <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-theme-txt3">
                            <span className="bg-theme-sur2 px-2 py-0.5 rounded border border-theme-bor">
                              {lead.assigned_to || 'Gabino'}
                            </span>
                          </td>

                          {/* Acciones */}
                          <td className="py-3 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {waLink && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-xs bg-[#00a870]/15 hover:bg-[#00a870]/25 text-[#00a870] border border-[#00a870]/30 cursor-pointer transition-colors"
                                  title="Enviar WhatsApp con propuesta comercial"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {mailLink && (
                                <a
                                  href={mailLink}
                                  className="p-1.5 rounded-lg text-xs bg-theme-sur2 hover:bg-[#2979ff]/15 text-theme-txt2 hover:text-[#2979ff] border border-theme-bor cursor-pointer transition-colors"
                                  title="Enviar correo electrónico"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}

                              <button
                                onClick={() => onOpenContactDrawer && onOpenContactDrawer(lead.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#2979ff]/15 text-[#2979ff] hover:bg-[#2979ff]/25 border border-[#2979ff]/30 flex items-center gap-1 cursor-pointer transition-all"
                              >
                                <span>Gestionar</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
