'use client';

import React, { useState, useEffect, memo, useMemo } from 'react';
import { MessageTemplate, TemplateCategory, TEMPLATE_CATEGORIES } from '@/lib/templates';
import { X, Plus, Trash2, Save, RotateCcw, Check, Sparkles, FolderKanban, Search, Briefcase, Zap, GraduationCap, Rocket, Layers } from 'lucide-react';

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: MessageTemplate[];
  activeTemplateId: string;
  onSelectActiveTemplate: (id: string) => void;
  onSaveTemplates: (templates: MessageTemplate[], activeId?: string) => void;
  onResetTemplates: () => void;
}

interface TemplateEditorPanelProps {
  template: MessageTemplate;
  isCreatingNew: boolean;
  onSave: (updated: MessageTemplate) => void;
  onCancel: () => void;
  savedSuccess: boolean;
}

// Category Badge Helper with distinctive branding
export function getCategoryBadge(cat?: string) {
  switch (cat) {
    case 'Consultoría':
      return {
        label: 'Consultoría',
        color: 'text-[#f59e0b] bg-[#f59e0b]/15 border-[#f59e0b]/30',
        icon: Briefcase,
      };
    case 'Soluciones Digitales':
      return {
        label: 'Soluciones Digitales',
        color: 'text-[#00d2ff] bg-[#00d2ff]/15 border-[#00d2ff]/30',
        icon: Zap,
      };
    case 'Entrenamiento / Certificación':
    case 'Entrenamiento':
      return {
        label: 'Entrenamiento / Cert.',
        color: 'text-[#00e5a0] bg-[#00e5a0]/15 border-[#00e5a0]/30',
        icon: GraduationCap,
      };
    case 'Lanzamiento Ágil':
      return {
        label: 'Lanzamiento Ágil',
        color: 'text-[#ff6d3b] bg-[#ff6d3b]/15 border-[#ff6d3b]/30',
        icon: Rocket,
      };
    default:
      return {
        label: cat || 'General',
        color: 'text-theme-txt2 bg-theme-sur2 border-theme-bor',
        icon: Layers,
      };
  }
}

// Isolated editor panel: typing inside the form only re-renders this subcomponent
const TemplateEditorPanel = memo(function TemplateEditorPanel({
  template,
  isCreatingNew,
  onSave,
  onCancel,
  savedSuccess,
}: TemplateEditorPanelProps) {
  const [draft, setDraft] = useState<MessageTemplate>(template);

  // Sync when selecting a different template
  useEffect(() => {
    setDraft(template);
  }, [template.id]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!draft.name.trim()) {
      alert('Por favor ingresa un nombre para la plantilla.');
      return;
    }
    if (!draft.text.trim()) {
      alert('El texto del mensaje no puede estar vacío.');
      return;
    }
    onSave(draft);
  };

  return (
    <div className="space-y-4 flex-1 flex flex-col">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-bold text-sm text-theme-txt flex items-center gap-2">
          <span>{isCreatingNew ? 'Crear Nueva Plantilla Comercial' : 'Editar Plantilla'}</span>
          {isCreatingNew && (
            <span className="text-[10px] font-mono text-[#00e5a0] bg-[#00e5a0]/15 border border-[#00e5a0]/30 px-2 py-0.5 rounded-full font-bold">
              NUEVA
            </span>
          )}
        </h4>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-theme-txt3">
          <span>Variables:</span>
          <code className="text-[#00e5a0] bg-theme-sur2 px-1.5 py-0.5 rounded border border-theme-bor">{'{nombre}'}</code>
          <code className="text-[#2979ff] bg-theme-sur2 px-1.5 py-0.5 rounded border border-theme-bor">{'{empresa}'}</code>
          <code className="text-[#ff6d3b] bg-theme-sur2 px-1.5 py-0.5 rounded border border-theme-bor">{'{cargo}'}</code>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1 font-semibold">
            Nombre de la Plantilla
          </label>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Ej: Consultoría en Procesos C-Level"
            className="w-full bg-theme-sur2 border border-theme-bor rounded-lg px-3 py-2 text-xs text-theme-txt outline-hidden focus:border-[#00e5a0] transition-colors"
          />
        </div>

        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1 font-semibold">
            Segmento / Servicio
          </label>
          <select
            value={draft.category}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                category: e.target.value as TemplateCategory,
              }))
            }
            className="w-full bg-theme-sur2 border border-theme-bor rounded-lg px-3 py-2 text-xs text-theme-txt outline-hidden cursor-pointer focus:border-[#00e5a0]"
          >
            <option value="Consultoría">💼 Consultoría</option>
            <option value="Soluciones Digitales">⚡ Soluciones Digitales</option>
            <option value="Entrenamiento / Certificación">🎓 Entrenamiento / Certificación</option>
            <option value="Lanzamiento Ágil">🚀 Lanzamiento Ágil</option>
            <option value="General">📌 General</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1 font-semibold">
            Audiencia Objetivo
          </label>
          <select
            value={draft.targetAudience}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                targetAudience: e.target.value as MessageTemplate['targetAudience'],
              }))
            }
            className="w-full bg-theme-sur2 border border-theme-bor rounded-lg px-3 py-2 text-xs text-theme-txt outline-hidden cursor-pointer focus:border-[#00e5a0]"
          >
            <option value="Venta Directa / Profesional">👤 Venta Directa / Profesional</option>
            <option value="Líderes / Gerentes (Equipos)">👥 Líderes / Gerentes (Equipos)</option>
            <option value="C-Level / Decisor">🏢 C-Level / Decisor</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 font-semibold">
            Cuerpo del Mensaje (Argumento Comercial)
          </label>
          <span className="text-[10.5px] text-theme-txt3 font-mono">
            {draft.text.length} caracteres
          </span>
        </div>
        <textarea
          rows={7}
          value={draft.text}
          onChange={(e) => setDraft((prev) => ({ ...prev, text: e.target.value }))}
          placeholder="Escribe el mensaje aquí. Usa {nombre}, {empresa}, {cargo} para personalización automática al contactar..."
          className="w-full flex-1 bg-theme-sur2 border border-theme-bor focus:border-[#00e5a0] rounded-xl p-3.5 text-xs text-theme-txt leading-relaxed outline-hidden transition-all resize-none font-sans"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div>
          {savedSuccess && (
            <span className="text-xs text-[#00e5a0] font-bold flex items-center gap-1.5 bg-[#00e5a0]/15 px-3 py-1.5 rounded-xl border border-[#00e5a0]/30 shadow-xs animate-in fade-in duration-150">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>¡Guardado correctamente en la nube!</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-medium text-theme-txt2 bg-theme-sur2 hover:bg-theme-sur3 cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="px-5 py-2 rounded-lg text-xs font-bold text-[#00110b] bg-[#00e5a0] hover:bg-[#00e5a0]/90 flex items-center gap-1.5 shadow-md shadow-[#00e5a0]/20 cursor-pointer transition-all active:scale-98"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Plantilla</span>
          </button>
        </div>
      </div>
    </div>
  );
});

function TemplateManagerModalInner({
  isOpen,
  onClose,
  templates,
  activeTemplateId,
  onSelectActiveTemplate,
  onSaveTemplates,
  onResetTemplates,
}: TemplateManagerModalProps) {
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  // Compute count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: templates.length };
    templates.forEach((t) => {
      const cat = t.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [templates]);

  // Filter templates by category and search
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesCategory =
        selectedCategory === 'ALL' ||
        t.category === selectedCategory ||
        (selectedCategory === 'Entrenamiento / Certificación' &&
          (t.category === 'Entrenamiento' || (t.name && t.name.toLowerCase().includes('certi'))));

      const matchesSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.targetAudience && t.targetAudience.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [templates, selectedCategory, searchQuery]);

  const handleStartCreate = () => {
    // Default to currently selected category filter if specific
    const defaultCat: TemplateCategory =
      selectedCategory !== 'ALL' && ['Consultoría', 'Soluciones Digitales', 'Entrenamiento / Certificación', 'Lanzamiento Ágil'].includes(selectedCategory)
        ? (selectedCategory as TemplateCategory)
        : 'Consultoría';

    const newId = `template-${Date.now()}`;
    const newTpl: MessageTemplate = {
      id: newId,
      name: `Plantilla ${templates.length + 1}: ${defaultCat}`,
      category: defaultCat,
      targetAudience: 'Venta Directa / Profesional',
      text: 'Hola {nombre}, un gusto saludarte. Vi tu rol como {cargo} en {empresa} y quería consultarte...',
      isActive: false,
    };
    setEditingTemplate(newTpl);
    setIsCreatingNew(true);
    setSavedSuccess(false);
  };

  const handleSaveCurrent = (updatedTemplate: MessageTemplate) => {
    let updated: MessageTemplate[];
    let newActiveId: string | undefined = undefined;

    if (isCreatingNew) {
      const newTemplate: MessageTemplate = {
        ...updatedTemplate,
        id: updatedTemplate.id || `template-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        isActive: templates.length === 0, // active if first template
      };
      updated = [...templates, newTemplate];
      if (templates.length === 0) newActiveId = newTemplate.id;
    } else {
      updated = templates.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t));
    }

    // Atomic save without race condition
    onSaveTemplates(updated, newActiveId);
    setEditingTemplate(null);
    setIsCreatingNew(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDelete = (id: string) => {
    if (templates.length <= 1) {
      alert('Debes mantener al menos una plantilla registrada.');
      return;
    }
    if (confirm('¿Estás seguro de eliminar esta plantilla comercial?')) {
      const updated = templates.filter((t) => t.id !== id);
      const newActive = activeTemplateId === id ? updated[0]?.id : undefined;
      onSaveTemplates(updated, newActive);
      if (editingTemplate?.id === id) {
        setEditingTemplate(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col text-theme-txt max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 px-6 border-b border-theme-bor flex items-center justify-between bg-theme-sur shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00e5a0]/15 flex items-center justify-center text-[#00e5a0] border border-[#00e5a0]/30 shadow-xs">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
                <span>Gestor & Segmentación de Plantillas Comerciales</span>
                <span className="text-[10.5px] font-mono text-[#00e5a0] bg-[#00e5a0]/10 px-2 py-0.5 rounded border border-[#00e5a0]/25 font-bold">
                  {templates.length} guardadas
                </span>
              </h3>
              <p className="text-xs text-theme-txt2">
                Segmentadas por <b>Consultoría</b>, <b>Soluciones Digitales</b> y <b>Entrenamiento / Certificación</b>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-theme-txt2 hover:text-theme-txt rounded-lg hover:bg-theme-sur2 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Save Confirmation Banner */}
        {savedSuccess && (
          <div className="bg-[#00e5a0] text-[#00110b] font-bold px-6 py-2.5 flex items-center justify-between text-xs animate-in slide-in-from-top duration-200 shadow-md shrink-0">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>¡Plantilla guardada atómicamente y sincronizada en Neon DB sin límites!</span>
            </div>
            <span className="text-[10.5px] opacity-85 font-mono">100% Persistente</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left Column: Segment tabs + Search + List of Templates */}
          <div className="w-88 border-r border-theme-bor flex flex-col bg-theme-sur2/40 overflow-hidden shrink-0">
            {/* Header with New Button */}
            <div className="p-3.5 border-b border-theme-bor space-y-2.5 bg-theme-sur/50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 font-bold">
                  Catálogo ({filteredTemplates.length}/{templates.length})
                </span>
                <button
                  onClick={handleStartCreate}
                  className="px-2.5 py-1 text-xs bg-[#00e5a0] text-[#00110b] hover:bg-[#00e5a0]/90 rounded-lg flex items-center gap-1 font-bold cursor-pointer shadow-xs active:scale-95 transition-all"
                  title="Crear nueva plantilla"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Nueva Plantilla</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-theme-txt3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por título, texto o cargo..."
                  className="w-full bg-theme-sur2 border border-theme-bor rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-theme-txt outline-hidden focus:border-[#00e5a0] transition-colors"
                />
              </div>

              {/* Segment Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className={`text-[10px] font-mono px-2 py-1 rounded-md whitespace-nowrap transition-all cursor-pointer font-bold ${
                    selectedCategory === 'ALL'
                      ? 'bg-theme-txt text-theme-sur font-bold shadow-xs'
                      : 'bg-theme-sur text-theme-txt2 hover:text-theme-txt border border-theme-bor'
                  }`}
                >
                  Todas ({templates.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Consultoría')}
                  className={`text-[10px] font-mono px-2 py-1 rounded-md whitespace-nowrap transition-all cursor-pointer font-bold flex items-center gap-1 ${
                    selectedCategory === 'Consultoría'
                      ? 'bg-[#f59e0b] text-[#1a1000] shadow-xs'
                      : 'bg-theme-sur text-theme-txt2 hover:text-[#f59e0b] border border-theme-bor'
                  }`}
                >
                  <span>💼 Consultoría</span>
                  <span>({categoryCounts['Consultoría'] || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Soluciones Digitales')}
                  className={`text-[10px] font-mono px-2 py-1 rounded-md whitespace-nowrap transition-all cursor-pointer font-bold flex items-center gap-1 ${
                    selectedCategory === 'Soluciones Digitales'
                      ? 'bg-[#00d2ff] text-[#001a24] shadow-xs'
                      : 'bg-theme-sur text-theme-txt2 hover:text-[#00d2ff] border border-theme-bor'
                  }`}
                >
                  <span>⚡ Sol. Digitales</span>
                  <span>({categoryCounts['Soluciones Digitales'] || 0})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Entrenamiento / Certificación')}
                  className={`text-[10px] font-mono px-2 py-1 rounded-md whitespace-nowrap transition-all cursor-pointer font-bold flex items-center gap-1 ${
                    selectedCategory === 'Entrenamiento / Certificación'
                      ? 'bg-[#00e5a0] text-[#001a12] shadow-xs'
                      : 'bg-theme-sur text-theme-txt2 hover:text-[#00e5a0] border border-theme-bor'
                  }`}
                >
                  <span>🎓 Entrenamiento/Cert.</span>
                  <span>({(categoryCounts['Entrenamiento / Certificación'] || 0) + (categoryCounts['Entrenamiento'] || 0)})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Lanzamiento Ágil')}
                  className={`text-[10px] font-mono px-2 py-1 rounded-md whitespace-nowrap transition-all cursor-pointer font-bold flex items-center gap-1 ${
                    selectedCategory === 'Lanzamiento Ágil'
                      ? 'bg-[#ff6d3b] text-white shadow-xs'
                      : 'bg-theme-sur text-theme-txt2 hover:text-[#ff6d3b] border border-theme-bor'
                  }`}
                >
                  <span>🚀 Ágil</span>
                  <span>({categoryCounts['Lanzamiento Ágil'] || 0})</span>
                </button>
              </div>
            </div>

            {/* Template List */}
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
              {filteredTemplates.length === 0 ? (
                <div className="p-6 text-center text-theme-txt3 text-xs">
                  No hay plantillas en este segmento.
                  <button
                    onClick={handleStartCreate}
                    className="mt-2 text-[#00e5a0] hover:underline block mx-auto font-medium"
                  >
                    + Crear plantilla para este segmento
                  </button>
                </div>
              ) : (
                filteredTemplates.map((t) => {
                  const isActive = activeTemplateId === t.id;
                  const isSelectedForEdit = editingTemplate?.id === t.id;
                  const badge = getCategoryBadge(t.category);
                  const Icon = badge.icon;

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setEditingTemplate({ ...t });
                        setIsCreatingNew(false);
                        setSavedSuccess(false);
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelectedForEdit
                          ? 'bg-[#00e5a0]/10 border-[#00e5a0] ring-1 ring-[#00e5a0]/30 shadow-xs'
                          : 'bg-theme-sur border-theme-bor hover:border-theme-bor2 hover:bg-theme-sur/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h4 className="font-semibold text-theme-txt truncate flex-1">{t.name}</h4>
                        {isActive && (
                          <span className="text-[9px] font-mono text-[#00e5a0] bg-[#00e5a0]/15 border border-[#00e5a0]/30 px-1.5 py-0.2 rounded font-bold shrink-0">
                            ACTIVA
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <span className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 font-semibold ${badge.color}`}>
                          <Icon className="w-2.5 h-2.5" />
                          <span>{badge.label}</span>
                        </span>
                        <span className="text-[9.5px] text-theme-txt3 truncate">{t.targetAudience}</span>
                      </div>

                      <p className="text-[11px] text-theme-txt2 line-clamp-2 italic leading-relaxed">{t.text}</p>

                      <div className="mt-2 pt-2 border-t border-theme-bor flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectActiveTemplate(t.id);
                          }}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded cursor-pointer transition-colors ${
                            isActive
                              ? 'text-[#00e5a0] bg-[#00e5a0]/15 font-bold border border-[#00e5a0]/30'
                              : 'text-theme-txt2 hover:text-[#00e5a0] bg-theme-sur2'
                          }`}
                        >
                          {isActive ? '✓ Predeterminada' : 'Fijar como activa'}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(t.id);
                          }}
                          className="text-theme-txt3 hover:text-[#ff6d3b] p-1 cursor-pointer transition-colors"
                          title="Eliminar plantilla"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Editor Area */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between space-y-4 bg-theme-sur">
            {editingTemplate ? (
              <TemplateEditorPanel
                key={editingTemplate.id}
                template={editingTemplate}
                isCreatingNew={isCreatingNew}
                onSave={handleSaveCurrent}
                onCancel={() => {
                  setEditingTemplate(null);
                  setIsCreatingNew(false);
                }}
                savedSuccess={savedSuccess}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-theme-txt2">
                <div className="w-16 h-16 rounded-2xl bg-[#00e5a0]/10 flex items-center justify-center text-[#00e5a0] mb-4 border border-[#00e5a0]/20">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-base text-theme-txt">Selecciona una plantilla o crea una nueva</h4>
                <p className="text-xs text-theme-txt2 mt-1.5 max-w-md leading-relaxed">
                  Personaliza y segmenta tus argumentos comerciales para <b>Consultoría</b>, <b>Soluciones Digitales</b> y <b>Entrenamiento / Certificación</b>. Puedes guardar todas las plantillas que necesites sin límite.
                </p>
                <button
                  onClick={handleStartCreate}
                  className="mt-5 px-5 py-2.5 bg-[#00e5a0] text-[#00110b] font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-[#00e5a0]/20 hover:bg-[#00e5a0]/90 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Crear Nueva Plantilla</span>
                </button>
              </div>
            )}

            <div className="pt-3 border-t border-theme-bor flex items-center justify-between text-xs text-theme-txt2">
              <button
                onClick={() => {
                  if (confirm('¿Restablecer las plantillas predeterminadas de fábrica?')) {
                    onResetTemplates();
                  }
                }}
                className="text-[11px] text-theme-txt3 hover:text-theme-txt flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer plantillas originales</span>
              </button>

              {savedSuccess && (
                <span className="text-xs text-[#00e5a0] flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>¡Sincronizado!</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TemplateManagerModal = memo(TemplateManagerModalInner);
export default TemplateManagerModal;
