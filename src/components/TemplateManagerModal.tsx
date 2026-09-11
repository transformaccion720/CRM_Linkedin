'use client';

import React, { useState, useEffect, memo, useMemo, useRef } from 'react';
import { 
  MessageTemplate, 
  TemplateCategory, 
  DEFAULT_TEMPLATES 
} from '@/lib/templates';
import { 
  X, Plus, Trash2, Save, Check, Search, 
  Briefcase, Zap, GraduationCap, Rocket, Layers, Eye, User, Building2, 
  RotateCcw
} from 'lucide-react';

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: MessageTemplate[];
  activeTemplateId: string;
  onSelectActiveTemplate: (id: string) => void;
  onSaveTemplates: (templates: MessageTemplate[], activeId?: string) => void;
  onResetTemplates: () => void;
}

// Category Helper
export function getCategoryBadge(cat?: string) {
  switch (cat) {
    case 'Consultoría':
      return {
        label: 'Consultoría B2B',
        color: 'text-[#f59e0b] bg-[#f59e0b]/15 border-[#f59e0b]/30',
        icon: Briefcase,
      };
    case 'Soluciones Digitales':
      return {
        label: 'Sol. Digitales B2B',
        color: 'text-[#00d2ff] bg-[#00d2ff]/15 border-[#00d2ff]/30',
        icon: Zap,
      };
    case 'Entrenamiento Corporativo':
    case 'Entrenamiento / Certificación':
    case 'Entrenamiento':
      return {
        label: 'Entrenamiento In-Company (RRHH)',
        color: 'text-[#2979ff] bg-[#2979ff]/15 border-[#2979ff]/30',
        icon: Building2,
      };
    case 'Programa de Agilidad':
    case 'Lanzamiento Ágil':
      return {
        label: 'Programa Agilidad B2C',
        color: 'text-[#ff6d3b] bg-[#ff6d3b]/15 border-[#ff6d3b]/30',
        icon: Rocket,
      };
    case 'Certificaciones Abiertas':
      return {
        label: 'Certificaciones B2C',
        color: 'text-[#00e5a0] bg-[#00e5a0]/15 border-[#00e5a0]/30',
        icon: GraduationCap,
      };
    case 'Upskilling Profesional':
      return {
        label: 'Upskilling Profesional B2C',
        color: 'text-[#a855f7] bg-[#a855f7]/15 border-[#a855f7]/30',
        icon: User,
      };
    default:
      return {
        label: cat || 'General',
        color: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
        icon: Layers,
      };
  }
}

function TemplateManagerModalInner({
  isOpen,
  onClose,
  templates,
  activeTemplateId,
  onSelectActiveTemplate,
  onSaveTemplates,
  onResetTemplates,
}: TemplateManagerModalProps) {
  const [modalSegment, setModalSegment] = useState<'ALL' | 'B2B' | 'B2C'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [draft, setDraft] = useState<MessageTemplate | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter templates by segment and search query
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (modalSegment !== 'ALL' && t.businessSegment && t.businessSegment !== 'ALL' && t.businessSegment !== modalSegment) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.text.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [templates, modalSegment, searchQuery]);

  // Ensure a template is always selected when opening or switching filters (Never blank right pane)
  useEffect(() => {
    if (!isOpen) return;

    if (isCreatingNew) return;

    // Check if currently selected template is valid in current list
    const currentValid = filteredTemplates.find((t) => t.id === selectedTemplateId);
    if (currentValid) {
      setDraft(currentValid);
      return;
    }

    // Default to active template if in current list
    const activeInList = filteredTemplates.find((t) => t.id === activeTemplateId);
    if (activeInList) {
      setSelectedTemplateId(activeInList.id);
      setDraft(activeInList);
      return;
    }

    // Otherwise select the first matching template
    if (filteredTemplates.length > 0) {
      setSelectedTemplateId(filteredTemplates[0].id);
      setDraft(filteredTemplates[0]);
    } else {
      setDraft(null);
    }
  }, [isOpen, filteredTemplates, selectedTemplateId, activeTemplateId, isCreatingNew]);

  if (!isOpen) return null;

  const handleSelectTemplate = (t: MessageTemplate) => {
    setIsCreatingNew(false);
    setSelectedTemplateId(t.id);
    setDraft({ ...t });
    setSavedSuccess(false);
  };

  const handleStartCreate = () => {
    const isB2B = modalSegment === 'B2B' || modalSegment === 'ALL';
    const newDraft: MessageTemplate = {
      id: `template-${Date.now()}`,
      name: '',
      category: isB2B ? 'Consultoría' : 'Programa de Agilidad',
      businessSegment: isB2B ? 'B2B' : 'B2C',
      targetAudience: isB2B ? 'C-Level / Decisor' : 'Venta Directa / Profesional',
      text: isB2B 
        ? 'Hola {nombre}, un gusto saludarte. Vi tu rol como {cargo} en {empresa} y quería compartir contigo cómo en TransformAcción 720 aceleramos la eficiencia operativa...'
        : 'Hola {nombre}, un gusto saludarte. Vi tu perfil enfocado en {cargo} en {empresa} y quería invitarte a conocer nuestras certificaciones oficiales...',
      isActive: false,
    };
    setIsCreatingNew(true);
    setSelectedTemplateId(newDraft.id);
    setDraft(newDraft);
    setSavedSuccess(false);
  };

  const handleInsertVariable = (variableTag: string) => {
    if (!draft) return;
    const textarea = textareaRef.current;
    if (!textarea) {
      setDraft((prev) => prev ? { ...prev, text: (prev.text || '') + variableTag } : prev);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = draft.text || '';
    const newText = currentText.slice(0, start) + variableTag + currentText.slice(end);

    setDraft((prev) => prev ? { ...prev, text: newText } : prev);

    setTimeout(() => {
      textarea.focus();
      const nextPos = start + variableTag.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 10);
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    if (!draft.name.trim()) {
      alert('Por favor ingresa un nombre para la plantilla.');
      return;
    }
    if (!draft.text.trim()) {
      alert('El texto del mensaje no puede estar vacío.');
      return;
    }

    let updatedList: MessageTemplate[];
    if (isCreatingNew) {
      updatedList = [draft, ...templates];
      setIsCreatingNew(false);
    } else {
      updatedList = templates.map((t) => (t.id === draft.id ? draft : t));
    }

    onSaveTemplates(updatedList, draft.isActive ? draft.id : undefined);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDelete = (templateId: string) => {
    if (templates.length <= 1) {
      alert('Debes mantener al menos una plantilla en el catálogo.');
      return;
    }
    if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return;

    const remaining = templates.filter((t) => t.id !== templateId);
    let nextActiveId = activeTemplateId;
    if (activeTemplateId === templateId) {
      nextActiveId = remaining[0]?.id || '';
      onSelectActiveTemplate(nextActiveId);
    }
    onSaveTemplates(remaining, nextActiveId);
    if (selectedTemplateId === templateId) {
      setSelectedTemplateId(remaining[0]?.id || '');
      setDraft(remaining[0] || null);
    }
  };

  // Preview simulation
  const sampleName = 'Yesenia';
  const sampleCompany = 'SANNA Salud';
  const samplePosition = draft?.businessSegment === 'B2B' ? 'Gerente de Gestión Humana' : 'Product Owner';
  const simulatedMessage = (draft?.text || '')
    .replace(/{nombre}/g, sampleName)
    .replace(/{apellido}/g, '')
    .replace(/{empresa}/g, sampleCompany)
    .replace(/{cargo}/g, samplePosition);

  // Available categories for segment
  const categoriesList: { key: TemplateCategory; label: string }[] = draft?.businessSegment === 'B2B'
    ? [
        { key: 'Consultoría', label: '💼 Consultoría de Procesos' },
        { key: 'Soluciones Digitales', label: '⚡ Soluciones Digitales & IA' },
        { key: 'Entrenamiento Corporativo', label: '🏢 Entrenamiento In-Company (RRHH)' },
      ]
    : [
        { key: 'Programa de Agilidad', label: '🚀 Programa de Agilidad' },
        { key: 'Certificaciones Abiertas', label: '🎓 Certificaciones Scrum/IA' },
        { key: 'Upskilling Profesional', label: '🎯 Upskilling Profesional' },
      ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 px-6 border-b border-theme-bor flex items-center justify-between bg-theme-sur shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00a870]/15 text-[#00a870]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-theme-txt">
                  Gestor de Plantillas de Prospección
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00a870]/15 text-[#00a870] font-bold border border-[#00a870]/30">
                  {templates.length} registradas
                </span>
              </div>
              <p className="text-xs text-theme-txt2 mt-0.5">
                Plantillas estandarizadas para contacto comercial y seguimiento alineado al funnel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('¿Restablecer las plantillas recomendadas de fábrica de TA720?')) {
                  onResetTemplates();
                }
              }}
              className="p-2 rounded-xl text-theme-txt3 hover:text-theme-txt hover:bg-theme-sur2 border border-transparent hover:border-theme-bor transition-all cursor-pointer"
              title="Restablecer plantillas oficiales de fábrica"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-theme-txt2 hover:text-theme-txt hover:bg-theme-sur2 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Segment Filter Bar */}
        <div className="p-3 px-6 bg-theme-sur2/40 border-b border-theme-bor flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-theme-sur p-1 rounded-xl border border-theme-bor">
            <button
              type="button"
              onClick={() => setModalSegment('ALL')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                modalSegment === 'ALL'
                  ? 'bg-theme-sur2 text-theme-txt shadow-xs'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
            >
              🌐 Todas ({templates.length})
            </button>
            <button
              type="button"
              onClick={() => setModalSegment('B2B')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                modalSegment === 'B2B'
                  ? 'bg-[#2979ff] text-white shadow-xs'
                  : 'text-theme-txt2 hover:text-[#2979ff]'
              }`}
            >
              🏢 B2B Gabino ({templates.filter(t => t.businessSegment === 'B2B').length})
            </button>
            <button
              type="button"
              onClick={() => setModalSegment('B2C')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                modalSegment === 'B2C'
                  ? 'bg-[#00a870] text-white shadow-xs'
                  : 'text-theme-txt2 hover:text-[#00a870]'
              }`}
            >
              👤 B2C Kiara ({templates.filter(t => t.businessSegment === 'B2C').length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-theme-txt3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar plantilla..."
                className="w-full bg-theme-sur border border-theme-bor rounded-xl pl-8 pr-3 py-1.5 text-xs text-theme-txt outline-hidden focus:border-[#00a870]"
              />
            </div>
            <button
              onClick={handleStartCreate}
              className="px-3 py-1.5 text-xs bg-[#00a870] text-[#00110b] hover:bg-[#00a870]/90 rounded-xl flex items-center gap-1.5 font-bold cursor-pointer shadow-xs transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Nueva Plantilla</span>
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns (Catalog on left, Standard Direct Editor on right) */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {/* Left Column: Template Cards List */}
          <div className="w-72 sm:w-84 border-r border-theme-bor flex flex-col bg-theme-sur2/30 overflow-y-auto p-3 space-y-2 shrink-0">
            {filteredTemplates.length === 0 ? (
              <div className="p-8 text-center text-theme-txt3 text-xs">
                No hay plantillas que coincidan con la búsqueda.
                <button
                  onClick={handleStartCreate}
                  className="mt-3 text-[#00a870] hover:underline block mx-auto font-semibold"
                >
                  + Crear nueva plantilla
                </button>
              </div>
            ) : (
              filteredTemplates.map((t) => {
                const isActive = activeTemplateId === t.id;
                const isSelected = selectedTemplateId === t.id && !isCreatingNew;
                const badgeInfo = getCategoryBadge(t.category);

                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTemplate(t)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 group ${
                      isSelected
                        ? 'border-[#00a870] bg-theme-sur ring-1 ring-[#00a870]/30 shadow-sm'
                        : 'border-theme-bor bg-theme-sur/60 hover:bg-theme-sur hover:border-theme-bor2'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                            t.businessSegment === 'B2B'
                              ? 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30'
                              : 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30'
                          }`}
                        >
                          {t.businessSegment === 'B2B' ? '🏢 B2B' : '👤 B2C'}
                        </span>
                        <span className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded border truncate max-w-[140px] ${badgeInfo.color}`}>
                          {t.category}
                        </span>
                      </div>

                      {isActive && (
                        <span className="text-[8.5px] font-mono text-[#00a870] bg-[#00a870]/15 border border-[#00a870]/30 px-1.5 py-0.2 rounded font-bold shrink-0">
                          En uso
                        </span>
                      )}
                    </div>

                    <h5 className="font-bold text-xs text-theme-txt line-clamp-1 group-hover:text-[#00a870] transition-colors">
                      {t.name}
                    </h5>

                    <p className="text-[11px] text-theme-txt2 line-clamp-2 leading-relaxed">
                      {t.text}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10.5px] border-t border-theme-bor/40 text-theme-txt3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectActiveTemplate(t.id);
                        }}
                        className={`hover:text-[#00a870] font-medium cursor-pointer ${
                          isActive ? 'text-[#00a870] font-bold' : ''
                        }`}
                      >
                        {isActive ? '✓ Predeterminada' : 'Fijar por defecto'}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(t.id);
                        }}
                        className="hover:text-red-400 p-0.5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
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

          {/* Right Column: Standard Clean Form */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto flex flex-col bg-theme-sur">
            {draft ? (
              <form onSubmit={handleSaveDraft} className="space-y-4 flex-1 flex flex-col">
                
                {/* Editor Header */}
                <div className="flex items-center justify-between pb-3 border-b border-theme-bor">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-theme-txt">
                      {isCreatingNew ? 'Crear Nueva Plantilla' : 'Configuración de Plantilla'}
                    </h4>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        draft.businessSegment === 'B2B'
                          ? 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30'
                          : 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30'
                      }`}
                    >
                      {draft.businessSegment === 'B2B' ? '🏢 B2B Corporativo' : '👤 B2C Alumnos'}
                    </span>
                  </div>

                  {savedSuccess && (
                    <span className="text-xs text-[#00a870] font-bold flex items-center gap-1 animate-in fade-in">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>¡Guardada correctamente!</span>
                    </span>
                  )}
                </div>

                {/* Field 1: Name and Segment */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-theme-txt block mb-1">
                      Nombre de la Plantilla:
                    </label>
                    <input
                      type="text"
                      required
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      placeholder="Ej: B2B Consultoría: Eficiencia Operativa y Gobierno"
                      className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3 py-2 text-xs text-theme-txt font-medium outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-theme-txt block mb-1">
                      Segmento:
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-theme-sur2 p-1 rounded-xl border border-theme-bor">
                      <button
                        type="button"
                        onClick={() => setDraft({ ...draft, businessSegment: 'B2B', category: 'Consultoría' })}
                        className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          draft.businessSegment === 'B2B'
                            ? 'bg-[#2979ff] text-white shadow-xs'
                            : 'text-theme-txt2 hover:text-theme-txt'
                        }`}
                      >
                        🏢 B2B
                      </button>
                      <button
                        type="button"
                        onClick={() => setDraft({ ...draft, businessSegment: 'B2C', category: 'Programa de Agilidad' })}
                        className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          draft.businessSegment === 'B2C'
                            ? 'bg-[#00a870] text-white shadow-xs'
                            : 'text-theme-txt2 hover:text-theme-txt'
                        }`}
                      >
                        👤 B2C
                      </button>
                    </div>
                  </div>
                </div>

                {/* Field 2: Category */}
                <div>
                  <label className="text-xs font-semibold text-theme-txt block mb-1">
                    Categoría Comercial:
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {categoriesList.map((c) => {
                      const isSelected = draft.category === c.key;
                      return (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => setDraft({ ...draft, category: c.key })}
                          className={`text-xs px-3 py-1 rounded-xl transition-all cursor-pointer font-semibold border ${
                            isSelected
                              ? 'bg-theme-sur2 text-theme-txt border-theme-bor2 font-bold shadow-xs'
                              : 'bg-theme-sur text-theme-txt2 hover:text-theme-txt border-theme-bor'
                          }`}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Field 3: Dynamic Variables Chips */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-theme-txt">
                      Texto del Mensaje de Prospección:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-theme-txt3 font-mono">Insertar variable:</span>
                      {['{nombre}', '{empresa}', '{cargo}'].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => handleInsertVariable(v)}
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00a870]/15 text-[#00a870] hover:bg-[#00a870]/25 border border-[#00a870]/30 transition-colors cursor-pointer"
                        >
                          + {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    ref={textareaRef}
                    rows={6}
                    value={draft.text}
                    onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                    placeholder="Escribe el mensaje de prospección comercial..."
                    className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl p-3 text-xs text-theme-txt outline-hidden resize-y leading-relaxed font-sans"
                  />
                </div>

                {/* Field 4: Standard Live Preview */}
                <div className="p-3.5 bg-theme-sur2/70 border border-theme-bor rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-theme-txt2">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#00a870]" />
                      <span>Vista Previa del Mensaje (LinkedIn)</span>
                    </span>
                    <span className="text-[10px] font-mono text-theme-txt3">
                      Destinatario de prueba: <b>{sampleName}</b> ({sampleCompany})
                    </span>
                  </div>

                  <div className="bg-theme-sur border border-theme-bor rounded-xl p-3 text-xs text-theme-txt leading-relaxed shadow-xs">
                    <p className="whitespace-pre-wrap">{simulatedMessage}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-theme-bor flex items-center justify-between shrink-0">
                  <div>
                    {!isCreatingNew && (
                      <button
                        type="button"
                        onClick={() => handleDelete(draft.id)}
                        className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectActiveTemplate(draft.id)}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        activeTemplateId === draft.id
                          ? 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/40 font-bold'
                          : 'bg-theme-sur2 hover:bg-theme-sur3 text-theme-txt border-theme-bor'
                      }`}
                    >
                      {activeTemplateId === draft.id ? '✓ Plantilla Activa' : 'Fijar por Defecto'}
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold bg-[#00a870] text-[#00110b] hover:bg-[#008f5f] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Guardar Plantilla</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-theme-txt3">
                <p className="text-xs">No hay plantilla seleccionada.</p>
                <button
                  onClick={handleStartCreate}
                  className="mt-3 px-4 py-2 text-xs font-bold bg-[#00a870] text-[#00110b] rounded-xl cursor-pointer"
                >
                  Crear Nueva Plantilla
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const TemplateManagerModal = memo(TemplateManagerModalInner);
export default TemplateManagerModal;
