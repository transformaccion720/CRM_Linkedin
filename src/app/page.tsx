'use client';

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Contact, ContactStatus, TeamMember } from '@/lib/types';
import { MessageTemplate, DEFAULT_TEMPLATES } from '@/lib/templates';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ContactTable from '@/components/ContactTable';
import PipelineView from '@/components/PipelineView';
import FunnelView from '@/components/FunnelView';
import WeeklyGoalsView from '@/components/WeeklyGoalsView';
import AnalyticsView from '@/components/AnalyticsView';
import ExecutiveDashboard from '@/components/ExecutiveDashboard';
import FollowUpsCalendarView from '@/components/FollowUpsCalendarView';
import MessagingInboxView from '@/components/MessagingInboxView';
import ResourcesDirectoryView from '@/components/ResourcesDirectoryView';
import SettingsCenterView from '@/components/SettingsCenterView';
import ContactDrawer from '@/components/ContactDrawer';
import CsvUploader from '@/components/CsvUploader';
import NewContactModal from '@/components/NewContactModal';
import TeamManagerModal from '@/components/TeamManagerModal';
import ZernioLinkedInModal from '@/components/ZernioLinkedInModal';
import TemplateManagerModal from '@/components/TemplateManagerModal';
import ProfileModal from '@/components/ProfileModal';
import LoginScreen from '@/components/LoginScreen';
import { Search, ShieldAlert, LayoutGrid, LayoutList, UserCheck, X } from 'lucide-react';

export default function Home() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

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
  const [activeTab, setActiveTab] = useState<'contactos' | 'segmentos' | 'funnel' | 'objetivos' | 'seguimientos' | 'mensajeria' | 'recursos' | 'analytics' | 'ejecutivo' | 'configuracion'>('contactos');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewFilter, setViewFilter] = useState<'all' | 'email' | 'noemail' | 'recent' | 'follow_up' | 'star3' | 'shared' | 'active_search'>('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState('');

  // 250ms Debounce for instant and lag-free searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Modals
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [templateContact, setTemplateContact] = useState<Contact | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [isTeamManagerOpen, setIsTeamManagerOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Check saved session in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('crm_auth_user');
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error reading auth session:', e);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  // Auto detect mobile device to switch default viewMode to 'grid'
  useEffect(() => {
    if (window.innerWidth < 768) {
      setViewMode('grid');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('crm_auth_user');
    setCurrentUser(null);
    setIsProfileOpen(false);
  };

  // Fetch Message Templates from Neon DB
  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const data = await res.json();
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates);
          const active = data.templates.find((t: MessageTemplate) => t.isActive);
          if (active) setActiveTemplateId(active.id);
        }
      }
    } catch (e) {
      console.error('Error fetching templates:', e);
    }
  }, []);

  // Save updated templates
  const handleSaveTemplates = useCallback(async (updated: MessageTemplate[], activeId?: string) => {
    const targetActiveId = activeId ?? activeTemplateId;
    if (activeId) {
      setActiveTemplateId(activeId);
    }
    const withActive = updated.map((t) => ({
      ...t,
      isActive: targetActiveId ? t.id === targetActiveId : Boolean(t.isActive),
    }));
    setTemplates(withActive);

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templates: withActive, activeTemplateId: targetActiveId }),
      });
      if (!res.ok) {
        console.error('Error in POST /api/templates response:', await res.text());
      }
    } catch (e) {
      console.error('Error saving templates:', e);
    }
  }, [activeTemplateId]);

  // Reset templates to defaults
  const handleResetTemplates = useCallback(async () => {
    setTemplates(DEFAULT_TEMPLATES);
    setActiveTemplateId(DEFAULT_TEMPLATES[0].id);
    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templates: DEFAULT_TEMPLATES, activeTemplateId: DEFAULT_TEMPLATES[0].id }),
      });
    } catch (e) {
      console.error('Error resetting templates:', e);
    }
  }, []);

  // Set active template
  const handleSelectActiveTemplate = useCallback((id: string) => {
    setActiveTemplateId(id);
    setTemplates((prev) => {
      const updated = prev.map((t) => ({
        ...t,
        isActive: t.id === id,
      }));
      fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templates: updated, activeTemplateId: id }),
      }).catch((e) => console.error('Error updating active template:', e));
      return updated;
    });
  }, []);

  // Fetch team members
  const fetchTeamMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.members || []);
      }
    } catch (e) {
      console.error('Error fetching team:', e);
    }
  }, []);

  // Fetch stats from Neon DB
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Error fetching stats:', e);
    }
  }, []);

  // Fetch Contacts with all filters
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter) params.set('status', statusFilter);
      if (viewFilter) params.set('viewFilter', viewFilter);
      if (yearFilter) params.set('year', yearFilter);
      if (companyFilter) params.set('company', companyFilter);
      if (positionFilter) params.set('position', positionFilter);
      if (tagFilter) params.set('tag', tagFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      if (assignedToFilter) params.set('assignedTo', assignedToFilter);

      const res = await fetch(`/api/contacts?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Error al cargar contactos de la base de datos');
      }
      const data = await res.json();
      setContacts(data.contacts || []);
      if (data.filterOptions) {
        setFilterOptions(data.filterOptions);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, viewFilter, yearFilter, companyFilter, positionFilter, tagFilter, priorityFilter, assignedToFilter]);

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchTeamMembers();
    fetchTemplates();
  }, [fetchStats, fetchTeamMembers, fetchTemplates]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Handle Quick Status Change
  const handleQuickStatusChange = useCallback(async (contactId: string, newStatus: ContactStatus) => {
    try {
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, status: newStatus } : c))
      );

      const res = await fetch(`/api/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          performed_by: currentUser?.name || 'Comercial'
        }),
      });

      if (!res.ok) {
        fetchContacts();
      } else {
        fetchStats();
      }
    } catch (e) {
      console.error('Error changing status:', e);
      fetchContacts();
    }
  }, [currentUser?.name, fetchContacts, fetchStats]);

  const handleExportCSV = useCallback(() => {
    window.open('/api/contacts?export=csv', '_blank');
  }, []);

  const activeTemplate = useMemo(() => {
    return templates.find((t) => t.id === activeTemplateId) || templates[0];
  }, [templates, activeTemplateId]);

  // Stabilized callbacks for modals to prevent parent re-renders from propagating
  const handleOpenContactById = useCallback(async (contactId: string) => {
    if (!contactId) return;
    const found = contacts.find((c) => c.id === contactId);
    if (found) {
      setSelectedContact(found);
      return;
    }

    try {
      const res = await fetch(`/api/contacts/${contactId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.contact) {
          setSelectedContact(data.contact);
        }
      }
    } catch (err) {
      console.error('Error opening contact drawer by id:', err);
    }
  }, [contacts]);

  const handleCloseDrawer = useCallback(() => setSelectedContact(null), []);
  const handleDrawerOpenTemplates = useCallback((c: Contact) => {
    setSelectedContact(null);
    setTemplateContact(c);
  }, []);
  const handleDrawerUpdate = useCallback((updated: Contact) => {
    setSelectedContact(updated);
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    fetchStats();
  }, [fetchStats]);
  const handleCloseProfile = useCallback(() => setIsProfileOpen(false), []);
  const handleCloseZernio = useCallback(() => setTemplateContact(null), []);
  const handleZernioMarkContacted = useCallback((id: string) => handleQuickStatusChange(id, 'En contacto'), [handleQuickStatusChange]);
  const handleCloseTemplateManager = useCallback(() => setIsTemplateManagerOpen(false), []);
  const handleCloseTeamManager = useCallback(() => setIsTeamManagerOpen(false), []);
  const handleCloseNewContact = useCallback(() => setIsNewContactOpen(false), []);
  const handleNewContactSuccess = useCallback((newContact: Contact) => {
    setContacts((prev) => [newContact, ...prev]);
    fetchStats();
  }, [fetchStats]);
  const handleCloseImport = useCallback(() => setIsImportOpen(false), []);
  const handleImportSuccess = useCallback(() => {
    fetchContacts();
    fetchStats();
    fetchTeamMembers();
  }, [fetchContacts, fetchStats, fetchTeamMembers]);

  // Clean Theme Toggle State (supports data-theme and class)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    const saved = localStorage.getItem('crm_theme') as 'dark' | 'light' | null;
    const initialTheme = saved || (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(initialTheme);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('crm_theme', next);
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(next);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#00a870] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-theme-bg text-theme-txt overflow-hidden font-sans">
      {/* Dynamic Navigation Bar */}
      <Navbar
        totalContacts={stats?.total || contacts.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewContact={() => setIsNewContactOpen(true)}
        onRefresh={() => {
          fetchContacts();
          fetchStats();
          fetchTeamMembers();
        }}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        theme={theme}
        toggleTheme={toggleTheme}
        currentUser={currentUser}
        onOpenContactDrawer={handleOpenContactById}
      />

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          viewFilter={viewFilter}
          setViewFilter={setViewFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          assignedToFilter={assignedToFilter}
          setAssignedToFilter={setAssignedToFilter}
          teamMembers={teamMembers}
          currentUser={currentUser}
          activeTab={activeTab}
          onOpenProfile={() => setIsProfileOpen(true)}
          onSwitchTab={setActiveTab}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          counts={{
            total: stats?.total || 0,
            withEmail: stats?.withEmail || 0,
            noEmail: stats?.noEmail || 0,
            recent: stats?.recentCount || 0,
            pendingFollowUps: stats?.pendingFollowUps || 0,
            activeSearchCount: stats?.activeSearchCount || 0,
          }}
        />

        {/* Content Tabs Switcher */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'contactos' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Filter controls */}
              <div className="p-3 bg-theme-sur border-b border-theme-bor flex items-center justify-between gap-3 shrink-0 flex-wrap">
                <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-lg">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-theme-txt3 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar por nombre, cargo, empresa, email, teléfono o notas..."
                      className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl pl-9 pr-8 py-1.5 text-xs text-theme-txt outline-hidden placeholder:text-theme-txt3"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-theme-txt3 hover:text-theme-txt cursor-pointer"
                        title="Limpiar búsqueda"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-theme-sur2 border border-theme-bor rounded-xl p-0.5">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        viewMode === 'table' ? 'bg-theme-sur text-[#00a870] shadow-xs' : 'text-theme-txt3 hover:text-theme-txt'
                      }`}
                      title="Vista de Tabla"
                    >
                      <LayoutList className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        viewMode === 'grid' ? 'bg-theme-sur text-[#00a870] shadow-xs' : 'text-theme-txt3 hover:text-theme-txt'
                      }`}
                      title="Vista de Tarjetas / Cuadrícula"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Table / Grid */}
              <ContactTable
                contacts={contacts}
                onSelectContact={setSelectedContact}
                onOpenTemplates={setTemplateContact}
                onQuickStatusChange={handleQuickStatusChange}
                viewMode={viewMode}
                positionFilter={positionFilter}
                setPositionFilter={setPositionFilter}
                companyFilter={companyFilter}
                setCompanyFilter={setCompanyFilter}
                tagFilter={tagFilter}
                setTagFilter={setTagFilter}
                filterOptions={filterOptions}
              />
            </div>
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

          {activeTab === 'objetivos' && <WeeklyGoalsView />}

          {activeTab === 'seguimientos' && (
            <FollowUpsCalendarView
              currentUser={currentUser}
              teamMembers={teamMembers}
              onOpenContactDrawer={handleOpenContactById}
              onOpenTemplates={setTemplateContact}
            />
          )}

          {activeTab === 'mensajeria' && (
            <MessagingInboxView
              currentUser={currentUser}
              teamMembers={teamMembers}
              onOpenContactDrawer={handleOpenContactById}
            />
          )}

          {activeTab === 'recursos' && (
            <ResourcesDirectoryView currentUser={currentUser} />
          )}

          {activeTab === 'analytics' && <AnalyticsView stats={stats} />}

          {activeTab === 'ejecutivo' && <ExecutiveDashboard stats={stats} />}

          {/* Unified Settings Center */}
          {activeTab === 'configuracion' && (
            <SettingsCenterView
              currentUser={currentUser}
              teamMembers={teamMembers}
              onOpenTeamManager={() => setIsTeamManagerOpen(true)}
              onOpenTemplateManager={() => setIsTemplateManagerOpen(true)}
              onOpenImport={() => setIsImportOpen(true)}
              onExport={handleExportCSV}
              onOpenProfile={() => setIsProfileOpen(true)}
              onOpenResources={() => setActiveTab('recursos')}
            />
          )}
        </main>
      </div>

      {/* Detail Drawer */}
      {Boolean(selectedContact) && (
        <ContactDrawer
          contact={selectedContact}
          teamMembers={teamMembers}
          availableTags={filterOptions.tags}
          isOpen={Boolean(selectedContact)}
          onClose={handleCloseDrawer}
          onOpenTemplates={handleDrawerOpenTemplates}
          onUpdate={handleDrawerUpdate}
        />
      )}

      {/* Profile & Security Modal */}
      {isProfileOpen && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={handleCloseProfile}
          currentUser={currentUser}
          onUpdateUser={setCurrentUser}
          onLogout={handleLogout}
        />
      )}

      {/* Zernio & LinkedIn Messaging Assistant Modal */}
      {Boolean(templateContact) && (
        <ZernioLinkedInModal
          contact={templateContact}
          isOpen={Boolean(templateContact)}
          currentUser={currentUser}
          templates={templates}
          onClose={handleCloseZernio}
          onMarkContacted={handleZernioMarkContacted}
        />
      )}

      {/* Template Manager Configuration Modal */}
      {isTemplateManagerOpen && (
        <TemplateManagerModal
          isOpen={isTemplateManagerOpen}
          templates={templates}
          activeTemplateId={activeTemplateId}
          onSelectActiveTemplate={handleSelectActiveTemplate}
          onSaveTemplates={handleSaveTemplates}
          onResetTemplates={handleResetTemplates}
          onClose={handleCloseTemplateManager}
        />
      )}

      {/* Team Management Modal */}
      {isTeamManagerOpen && (
        <TeamManagerModal
          isOpen={isTeamManagerOpen}
          teamMembers={teamMembers}
          onClose={handleCloseTeamManager}
          onRefreshTeam={fetchTeamMembers}
        />
      )}

      {/* New Contact Manual Modal */}
      {isNewContactOpen && (
        <NewContactModal
          isOpen={isNewContactOpen}
          teamMembers={teamMembers}
          onClose={handleCloseNewContact}
          onSuccess={handleNewContactSuccess}
        />
      )}

      {/* CSV Uploader */}
      {isImportOpen && (
        <CsvUploader
          isOpen={isImportOpen}
          teamMembers={teamMembers}
          onClose={handleCloseImport}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
}
