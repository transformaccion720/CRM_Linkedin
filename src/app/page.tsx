'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Contact, ContactStatus, TeamMember } from '@/lib/types';
import { MessageTemplate, DEFAULT_TEMPLATES } from '@/lib/templates';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ContactTable from '@/components/ContactTable';
import PipelineView from '@/components/PipelineView';
import FunnelView from '@/components/FunnelView';
import AnalyticsView from '@/components/AnalyticsView';
import ExecutiveDashboard from '@/components/ExecutiveDashboard';
import ContactDrawer from '@/components/ContactDrawer';
import CsvUploader from '@/components/CsvUploader';
import NewContactModal from '@/components/NewContactModal';
import TeamManagerModal from '@/components/TeamManagerModal';
import MessageTemplatesModal from '@/components/MessageTemplatesModal';
import TemplateManagerModal from '@/components/TemplateManagerModal';
import { Search, ShieldAlert, LayoutGrid, LayoutList, UserCheck } from 'lucide-react';

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filterOptions, setFilterOptions] = useState<{ years: string[]; companies: string[]; positions: string[]; tags: string[] }>({
    years: [],
    companies: [],
    positions: [],
    tags: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Responsive mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Commercial Message Templates in Neon DB
  const [templates, setTemplates] = useState<MessageTemplate[]>(DEFAULT_TEMPLATES);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(DEFAULT_TEMPLATES[0].id);

  // Tabs & Views
  const [activeTab, setActiveTab] = useState<'contactos' | 'segmentos' | 'funnel' | 'analytics' | 'ejecutivo'>('contactos');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filters
  const [search, setSearch] = useState('');
  const [viewFilter, setViewFilter] = useState<'all' | 'email' | 'noemail' | 'recent' | 'follow_up' | 'star3' | 'shared'>('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState('');

  // Modals
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [templateContact, setTemplateContact] = useState<Contact | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [isTeamManagerOpen, setIsTeamManagerOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);

  // Auto detect mobile device to switch default viewMode to 'grid'
  useEffect(() => {
    if (window.innerWidth < 768) {
      setViewMode('grid');
    }
  }, []);

  // Fetch team members from Neon DB
  const fetchTeamMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.members || []);
      }
    } catch (e) {
      console.error('Error fetching team members:', e);
    }
  }, []);

  // Fetch templates from Neon DB
  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.templates) && data.templates.length > 0) {
          setTemplates(data.templates);
          const active = data.templates.find((t: any) => t.isActive);
          if (active) {
            setActiveTemplateId(active.id);
          } else {
            setActiveTemplateId(data.templates[0].id);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching templates from Neon DB:', e);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
    fetchTeamMembers();
  }, [fetchTemplates, fetchTeamMembers]);

  const handleSaveTemplates = async (newTemplates: MessageTemplate[]) => {
    setTemplates(newTemplates);
    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templates: newTemplates, activeTemplateId }),
      });
    } catch (e) {
      console.error('Error saving templates to Neon DB:', e);
    }
  };

  const handleSelectActiveTemplate = async (id: string) => {
    setActiveTemplateId(id);
    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templates, activeTemplateId: id }),
      });
    } catch (e) {
      console.error('Error syncing active template to Neon DB:', e);
    }
  };

  const handleResetTemplates = async () => {
    setTemplates(DEFAULT_TEMPLATES);
    setActiveTemplateId(DEFAULT_TEMPLATES[0].id);
    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templates: DEFAULT_TEMPLATES, activeTemplateId: DEFAULT_TEMPLATES[0].id }),
      });
    } catch (e) {
      console.error('Error resetting templates in Neon DB:', e);
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Error fetching stats:', e);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (viewFilter) params.set('viewFilter', viewFilter);
      if (yearFilter) params.set('year', yearFilter);
      if (companyFilter) params.set('company', companyFilter);
      if (positionFilter) params.set('position', positionFilter);
      if (tagFilter) params.set('tag', tagFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      if (assignedToFilter) params.set('assignedTo', assignedToFilter);

      const res = await fetch(`/api/contacts?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al conectar con Neon DB');
      }

      setContacts(data.contacts || []);
      if (data.filterOptions) {
        setFilterOptions({
          years: data.filterOptions.years || [],
          companies: data.filterOptions.companies || [],
          positions: data.filterOptions.positions || [],
          tags: data.filterOptions.tags || [],
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar contactos';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, viewFilter, yearFilter, companyFilter, positionFilter, tagFilter, priorityFilter, assignedToFilter]);

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [fetchContacts, fetchStats]);

  const handleQuickStatusChange = async (id: string, newStatus: ContactStatus) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );

    try {
      const contactObj = contacts.find((c) => c.id === id);
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          performed_by: contactObj?.assigned_to || 'Comercial'
        }),
      });
      if (res.ok) {
        fetchStats();
      }
    } catch (e) {
      console.error('Error actualizando estado:', e);
      fetchContacts();
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setViewFilter('all');
    setStatusFilter('');
    setYearFilter('');
    setCompanyFilter('');
    setPositionFilter('');
    setTagFilter('');
    setPriorityFilter('');
    setAssignedToFilter('');
  };

  const handleExportCSV = () => {
    if (!contacts.length) return;
    const header = ['Nombre', 'Apellido', 'URL', 'Email', 'Teléfono', 'Empresa', 'Cargo', 'Fecha Conexión', 'Estado', 'Prioridad', 'Próximo Seguimiento', 'Responsable', 'Etiquetas', 'Notas'];
    const rows = contacts.map((c) => [
      c.first_name,
      c.last_name || '',
      c.linkedin_url || '',
      c.email || '',
      c.phone || '',
      c.company || '',
      c.position || '',
      c.connected_on || '',
      c.status || '',
      c.priority || 1,
      c.follow_up_date || '',
      c.assigned_to || '',
      (c.tags || []).join('; '),
      (c.notes || '').replace(/,/g, ';'),
    ]);

    const csvContent = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm_linkedin_contactos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-theme-bg text-theme-txt overflow-hidden">
      {/* Responsive Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenNewContact={() => setIsNewContactOpen(true)}
        onOpenTeamManager={() => setIsTeamManagerOpen(true)}
        onOpenTemplateManager={() => setIsTemplateManagerOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onRefresh={() => {
          fetchContacts();
          fetchStats();
          fetchTemplates();
          fetchTeamMembers();
        }}
        onExport={handleExportCSV}
        totalContacts={stats?.total || 0}
      />

      {/* Main workspace layout */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Responsive Sidebar */}
        <Sidebar
          viewFilter={viewFilter}
          setViewFilter={setViewFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          assignedToFilter={assignedToFilter}
          setAssignedToFilter={setAssignedToFilter}
          teamMembers={teamMembers}
          onOpenTeamManager={() => setIsTeamManagerOpen(true)}
          onClearFilters={handleClearFilters}
          onSwitchTab={setActiveTab}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          counts={{
            total: stats?.total || 0,
            withEmail: stats?.withEmail || 0,
            noEmail: stats?.noEmail || 0,
            recent: stats?.recentCount || 0,
            pendingFollowUps: stats?.pendingFollowUps || 0,
          }}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-theme-bg">
          {error && (
            <div className="m-3 p-3 rounded-xl bg-[#ff6d3b]/10 border border-[#ff6d3b]/30 flex items-center gap-2.5 text-xs text-theme-txt">
              <ShieldAlert className="w-4 h-4 text-[#ff6d3b] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'contactos' && (
            <>
              {/* Toolbar - Full height workspace with StatsCards removed from here */}
              <div className="px-3 sm:px-5 py-2.5 border-b border-theme-bor bg-theme-sur flex items-center gap-2 flex-wrap shrink-0">
                <div className="relative flex-1 min-w-[140px] max-w-xs">
                  <Search className="w-3.5 h-3.5 text-theme-txt2 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar contacto, cargo, tel..."
                    className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-lg pl-8 pr-3 py-1.5 text-xs text-theme-txt placeholder-theme-txt3 outline-hidden transition-all"
                  />
                </div>

                {/* Team member active filter pill */}
                {assignedToFilter && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00a870]/15 text-[#00a870] border border-[#00a870]/30 text-xs font-semibold">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Base: {assignedToFilter}</span>
                    <button
                      onClick={() => setAssignedToFilter('')}
                      className="ml-1 hover:text-white cursor-pointer font-bold"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Filter by Year */}
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="bg-theme-sur2 border border-theme-bor rounded-lg px-2.5 py-1.5 text-xs text-theme-txt outline-hidden cursor-pointer"
                >
                  <option value="">Años</option>
                  {filterOptions.years.map((y) => (
                    <option key={y} value={y} className="bg-theme-sur text-theme-txt">
                      {y}
                    </option>
                  ))}
                </select>

                {/* Filter by Company */}
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="bg-theme-sur2 border border-theme-bor rounded-lg px-2.5 py-1.5 text-xs text-theme-txt outline-hidden max-w-[130px] cursor-pointer"
                >
                  <option value="">Empresas</option>
                  {filterOptions.companies.map((c) => (
                    <option key={c} value={c} className="bg-theme-sur text-theme-txt">
                      {c.length > 16 ? `${c.slice(0, 16)}…` : c}
                    </option>
                  ))}
                </select>

                {/* Filter by Position (Cargo) */}
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="bg-theme-sur2 border border-theme-bor rounded-lg px-2.5 py-1.5 text-xs text-theme-txt outline-hidden max-w-[130px] cursor-pointer"
                >
                  <option value="">Cargos</option>
                  {filterOptions.positions.map((p) => (
                    <option key={p} value={p} className="bg-theme-sur text-theme-txt">
                      {p.length > 16 ? `${p.slice(0, 16)}…` : p}
                    </option>
                  ))}
                </select>

                {/* Filter by Tag */}
                {filterOptions.tags.length > 0 && (
                  <select
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    className="bg-theme-sur2 border border-theme-bor rounded-lg px-2.5 py-1.5 text-xs text-theme-txt outline-hidden max-w-[110px] cursor-pointer"
                  >
                    <option value="">Tags</option>
                    {filterOptions.tags.map((t) => (
                      <option key={t} value={t} className="bg-theme-sur text-theme-txt">
                        🏷️ {t}
                      </option>
                    ))}
                  </select>
                )}

                {/* Filter by Priority */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-theme-sur2 border border-theme-bor rounded-lg px-2.5 py-1.5 text-xs text-theme-txt outline-hidden cursor-pointer"
                >
                  <option value="">Prioridad</option>
                  <option value="3">⭐⭐⭐ Alta</option>
                  <option value="2">⭐⭐ Media</option>
                  <option value="1">⭐ Normal</option>
                </select>

                <div className="ml-auto flex items-center gap-1 bg-theme-sur2 p-1 rounded-lg border border-theme-bor">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1 rounded cursor-pointer ${viewMode === 'table' ? 'bg-theme-sur text-[#00a870] shadow-xs' : 'text-theme-txt2'}`}
                    title="Vista Tabla"
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1 rounded cursor-pointer ${viewMode === 'grid' ? 'bg-theme-sur text-[#00a870] shadow-xs' : 'text-theme-txt2'}`}
                    title="Vista Cuadrícula"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Table Body - Max space */}
              <div className="flex-1 flex flex-col min-h-0">
                {loading ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-theme-txt2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00a870] animate-ping" />
                      <span>Cargando contactos desde Neon DB...</span>
                    </div>
                  </div>
                ) : (
                  <ContactTable
                    contacts={contacts}
                    viewMode={viewMode}
                    onSelectContact={setSelectedContact}
                    onOpenTemplates={setTemplateContact}
                    onQuickStatusChange={handleQuickStatusChange}
                  />
                )}
              </div>
            </>
          )}

          {activeTab === 'segmentos' && (
            <PipelineView
              contacts={contacts}
              onSelectContact={setSelectedContact}
              onOpenTemplates={setTemplateContact}
              onQuickStatusChange={handleQuickStatusChange}
            />
          )}

          {activeTab === 'funnel' && (
            <FunnelView
              stats={stats}
              contacts={contacts}
              onSelectContact={setSelectedContact}
              onOpenTemplates={setTemplateContact}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsView stats={stats} />}

          {activeTab === 'ejecutivo' && <ExecutiveDashboard stats={stats} />}
        </main>
      </div>

      {/* Detail Drawer with team members passed */}
      <ContactDrawer
        contact={selectedContact}
        teamMembers={teamMembers}
        isOpen={Boolean(selectedContact)}
        onClose={() => setSelectedContact(null)}
        onOpenTemplates={(c) => {
          setSelectedContact(null);
          setTemplateContact(c);
        }}
        onUpdate={(updated) => {
          setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          fetchStats();
          fetchTeamMembers();
        }}
        onDelete={(deletedId) => {
          setContacts((prev) => prev.filter((c) => c.id !== deletedId));
          fetchStats();
          fetchTeamMembers();
        }}
      />

      {/* Message Templates Modal */}
      <MessageTemplatesModal
        contact={templateContact}
        isOpen={Boolean(templateContact)}
        templates={templates}
        activeTemplateId={activeTemplateId}
        onClose={() => setTemplateContact(null)}
        onOpenTemplateManager={() => {
          setTemplateContact(null);
          setIsTemplateManagerOpen(true);
        }}
        onMarkContacted={(id) => handleQuickStatusChange(id, 'En contacto')}
      />

      {/* Template Manager Configuration Modal */}
      <TemplateManagerModal
        isOpen={isTemplateManagerOpen}
        templates={templates}
        activeTemplateId={activeTemplateId}
        onSelectActiveTemplate={handleSelectActiveTemplate}
        onSaveTemplates={handleSaveTemplates}
        onResetTemplates={handleResetTemplates}
        onClose={() => setIsTemplateManagerOpen(false)}
      />

      {/* Team Management Modal */}
      <TeamManagerModal
        isOpen={isTeamManagerOpen}
        teamMembers={teamMembers}
        onClose={() => setIsTeamManagerOpen(false)}
        onRefreshTeam={fetchTeamMembers}
      />

      {/* New Contact Manual Modal */}
      <NewContactModal
        isOpen={isNewContactOpen}
        teamMembers={teamMembers}
        onClose={() => setIsNewContactOpen(false)}
        onSuccess={(newContact) => {
          setContacts((prev) => [newContact, ...prev]);
          fetchStats();
          fetchTeamMembers();
        }}
      />

      {/* CSV Uploader */}
      <CsvUploader
        isOpen={isImportOpen}
        teamMembers={teamMembers}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => {
          fetchContacts();
          fetchStats();
          fetchTeamMembers();
        }}
      />
    </div>
  );
}
