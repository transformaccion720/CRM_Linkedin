'use client';

import React, { useState, useEffect, memo, useMemo, useCallback, useRef } from 'react';
import { 
  MessageTemplate, 
  TemplateCategory, 
  TemplateTargetAudience, 
  TemplateValueAngle,
  TEMPLATE_CATEGORIES, 
  TA720_DIFFERENTIATORS, 
  TA720_VALUE_ANGLES,
  DEFAULT_TEMPLATES 
} from '@/lib/templates';
import { 
  X, Plus, Trash2, Save, RotateCcw, Check, Sparkles, FolderKanban, Search, 
  Briefcase, Zap, GraduationCap, Rocket, Layers, Eye, Wand2, User, Building2, 
  Copy, ArrowRight, HelpCircle, CheckCircle2, Award, Compass, Target
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
        label: 'Consultoría B2B',
        color: 'text-[#f59e0b] bg-[#f59e0b]/15 border-[#f59e0b]/30',
        activeBtn: 'bg-[#f59e0b] text-[#1a1000] border-[#f59e0b]',
        icon: Briefcase,
      };
    case 'Soluciones Digitales':
      return {
        label: 'Sol. Digitales B2B',
        color: 'text-[#00d2ff] bg-[#00d2ff]/15 border-[#00d2ff]/30',
        activeBtn: 'bg-[#00d2ff] text-[#001a24] border-[#00d2ff]',
        icon: Zap,
      };
    case 'Entrenamiento Corporativo':
    case 'Entrenamiento / Certificación':
    case 'Entrenamiento':
      return {
        label: 'Entrenamiento In-Company (RRHH)',
        color: 'text-[#2979ff] bg-[#2979ff]/15 border-[#2979ff]/30',
        activeBtn: 'bg-[#2979ff] text-white border-[#2979ff]',
        icon: Building2,
      };
    case 'Programa de Agilidad':
    case 'Lanzamiento Ágil':
      return {
        label: 'Programa Agilidad B2C',
        color: 'text-[#ff6d3b] bg-[#ff6d3b]/15 border-[#ff6d3b]/30',
        activeBtn: 'bg-[#ff6d3b] text-white border-[#ff6d3b]',
        icon: Rocket,
      };
    case 'Certificaciones Abiertas':
      return {
        label: 'Certificaciones B2C',
        color: 'text-[#00e5a0] bg-[#00e5a0]/15 border-[#00e5a0]/30',
        activeBtn: 'bg-[#00e5a0] text-[#001a12] border-[#00e5a0]',
        icon: GraduationCap,
      };
    case 'Upskilling Profesional':
      return {
        label: 'Upskilling Profesional B2C',
        color: 'text-[#a855f7] bg-[#a855f7]/15 border-[#a855f7]/30',
        activeBtn: 'bg-[#a855f7] text-white border-[#a855f7]',
        icon: User,
      };
    default:
      return {
        label: cat || 'General',
        color: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
        activeBtn: 'bg-purple-600 text-white border-purple-600',
        icon: Layers,
      };
  }
}

// Editor panel with live preview & TA720 value props insertion
const TemplateEditorPanel = memo(function TemplateEditorPanel({
  template,
  isCreatingNew,
  onSave,
  onCancel,
  savedSuccess,
}: TemplateEditorPanelProps) {
  const [draft, setDraft] = useState<MessageTemplate>(template);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(template);
  }, [template.id]);

  // Insert variable tag at cursor position
  const handleInsertVariable = (variableTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = draft.text || '';
    const newText = currentText.slice(0, start) + variableTag + currentText.slice(end);

    setDraft((prev) => ({ ...prev, text: newText }));

    setTimeout(() => {
      textarea.focus();
      const nextCursor = start + variableTag.length;
      textarea.setSelectionRange(nextCursor, nextCursor);
    }, 10);
  };

  // Append a TA720 differentiator snippet
  const handleInsertDifferentiator = (snippet: string, name: string) => {
    const currentText = draft.text ? draft.text.trim() + ' ' : '';
    setDraft((prev) => ({
      ...prev,
      differentiator: name,
      text: currentText + snippet,
    }));
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

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

  const sampleName = 'Yesenia';
  const sampleCompany = 'SANNA Salud';
  const samplePosition = draft.businessSegment === 'B2B' ? 'Gerente de Gestión Humana' : 'Product Owner';

  const simulatedMessage = (draft.text || '')
    .replace(/{nombre}/g, sampleName)
    .replace(/{apellido}/g, '')
    .replace(/{empresa}/g, sampleCompany)
    .replace(/{cargo}/g, samplePosition);

  const badge = getCategoryBadge(draft.category);

  // Available categories depending on segment
  const categoriesList = draft.businessSegment === 'B2B'
    ? [
        { key: 'Consultoría' as TemplateCategory, label: '💼 Consultoría de Procesos' },
        { key: 'Soluciones Digitales' as TemplateCategory, label: '⚡ Soluciones Digitales & IA' },
        { key: 'Entrenamiento Corporativo' as TemplateCategory, label: '🏢 Entrenamiento In-Company (RRHH)' },
      ]
    : [
        { key: 'Programa de Agilidad' as TemplateCategory, label: '🚀 Programa de Agilidad' },
        { key: 'Certificaciones Abiertas' as TemplateCategory, label: '🎓 Certificaciones Scrum/IA' },
        { key: 'Upskilling Profesional' as TemplateCategory, label: '🎯 Upskilling Profesional' },
      ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
      {/* Header with Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-theme-bor">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-sm text-theme-txt flex items-center gap-2">
              <span>{isCreatingNew ? 'Crear Nueva Plantilla Comercial' : 'Editar Plantilla'}</span>
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
          <p className="text-[11px] text-theme-txt2 mt-0.5">
            Configuración segmentada con propuesta de valor y los 5 diferenciadores de TA720.
          </p>
        </div>

        {/* Quick Presets Loader */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-theme-txt3 flex items-center gap-1 font-bold">
            <Wand2 className="w-3 h-3 text-[#00e5a0]" />
            <span>Ejemplos TA720:</span>
          </span>
          {DEFAULT_TEMPLATES.slice(0, 3).map((dt) => (
            <button
              key={dt.id}
              type="button"
              onClick={() => {
                setDraft({
                  ...dt,
                  id: isCreatingNew ? draft.id : dt.id,
                });
              }}
              className="text-[10px] font-mono px-2 py-1 rounded-lg bg-theme-sur2 hover:bg-[#00e5a0]/15 text-theme-txt2 hover:text-[#00e5a0] border border-theme-bor hover:border-[#00e5a0]/30 transition-all cursor-pointer font-medium truncate max-w-[130px]"
              title={dt.name}
            >
              {dt.businessSegment === 'B2B' ? '🏢' : '👤'} {dt.name.split(':')[1]?.trim() || dt.name}
            </button>
          ))}
        </div>
      </div>

      {/* BLOQUE 1: IDENTIFICACIÓN & NOMBRE */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1.5 font-bold">
            1. Nombre Comercial de la Plantilla:
          </label>
          <input
            type="text"
            required
            value={draft.name}
            onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Ej: B2B Consultoría: Sistema CORE720 y Eficiencia"
            className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00e5a0] rounded-xl px-3.5 py-2 text-xs text-theme-txt font-semibold outline-hidden transition-all shadow-xs"
          />
        </div>

        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1.5 font-bold">
            Segmento Principal:
          </label>
          <div className="grid grid-cols-2 gap-1 bg-theme-sur2 p-1 rounded-xl border border-theme-bor">
            <button
              type="button"
              onClick={() => setDraft((prev) => ({ ...prev, businessSegment: 'B2B', category: 'Consultoría' }))}
              className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                draft.businessSegment === 'B2B'
                  ? 'bg-[#2979ff] text-white shadow-xs'
                  : 'text-theme-txt2 hover:text-theme-txt'
              }`}
            >
              🏢 B2B
            </button>
            <button
              type="button"
              onClick={() => setDraft((prev) => ({ ...prev, businessSegment: 'B2C', category: 'Programa de Agilidad' }))}
              className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

      {/* BLOQUE 2: CATEGORÍAS SEGÚN LÍNEA DE NEGOCIO */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 font-bold block">
          2. Línea de Negocio ({draft.businessSegment === 'B2B' ? '3 Líneas Core B2B' : 'Líneas Abiertas B2C'}):
        </label>
        <div className="flex items-center gap-1.5 flex-wrap">
          {categoriesList.map((c) => {
            const isSelected = draft.category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, category: c.key }))}
                className={`text-[11px] font-mono px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold border ${
                  isSelected
                    ? 'bg-theme-txt text-theme-sur border-theme-txt shadow-xs scale-102'
                    : 'bg-theme-sur2 text-theme-txt2 hover:text-theme-txt border-theme-bor hover:border-theme-bor2'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* BLOQUE 3: 5 DIFERENCIADORES CLAVE TA720 */}
      <div className="p-3 bg-theme-sur2 border border-theme-bor rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold text-[#00e5a0] flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>5 Diferenciadores TransformAcción 720 (Click para añadir al mensaje)</span>
          </span>
          <span className="text-[10px] font-mono text-theme-txt3">Ventaja Competitiva</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {TA720_DIFFERENTIATORS.map((diff) => (
            <button
              key={diff.id}
              type="button"
              onClick={() => handleInsertDifferentiator(diff.snippet, diff.name)}
              className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-theme-sur hover:bg-[#00e5a0]/15 text-theme-txt hover:text-[#00e5a0] border border-theme-bor hover:border-[#00e5a0]/30 transition-all cursor-pointer text-left"
              title={diff.snippet}
            >
              <span>✨ {diff.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* BLOQUE 4: ÁNGULOS DE VALOR SEGÚN CLIENTE */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 font-bold block">
          3. Ángulo de Valor del Mensaje:
        </label>
        <div className="flex items-center gap-1.5 flex-wrap">
          {TA720_VALUE_ANGLES.map((va) => {
            const isSelected = draft.valueAngle === va.id;
            return (
              <button
                key={va.id}
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, valueAngle: va.id }))}
                className={`text-[10px] font-mono px-2.5 py-1 rounded-lg transition-all cursor-pointer font-semibold flex items-center gap-1 border ${
                  isSelected
                    ? 'bg-[#2979ff] text-white border-[#2979ff] shadow-xs'
                    : 'bg-theme-sur2 text-theme-txt2 hover:text-theme-txt border-theme-bor'
                }`}
                title={va.focus}
              >
                <span>{va.icon}</span>
                <span>{va.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BLOQUE 5: REDACCIÓN DEL MENSAJE CON VARIABLES */}
      <div className="space-y-1.5 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 font-bold">
            4. Texto del Mensaje:
          </label>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-theme-txt3 mr-1 font-bold">Variables:</span>
            {['{nombre}', '{apellido}', '{cargo}', '{empresa}'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => handleInsertVariable(v)}
                className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-theme-sur2 hover:bg-[#00a870]/20 text-theme-txt hover:text-[#00a870] border border-theme-bor cursor-pointer transition-colors"
                title={`Insertar variable ${v}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <textarea
          ref={textareaRef}
          required
          rows={5}
          value={draft.text}
          onChange={(e) => setDraft((prev) => ({ ...prev, text: e.target.value }))}
          placeholder="Escribe el mensaje de prospección comercial..."
          className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00e5a0] rounded-xl p-3 text-xs text-theme-txt outline-hidden transition-all shadow-xs leading-relaxed resize-y font-sans"
        />
      </div>

      {/* BLOQUE 6: VISTA PREVIA SIMULADA LINKEDIN */}
      <div className="p-3.5 bg-theme-sur2 border border-theme-bor rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-mono uppercase tracking-wider text-theme-txt3 font-bold flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#00e5a0]" />
            <span>Vista Previa del Envío (LinkedIn Outreach)</span>
          </span>
          <span className="text-[10px] font-mono text-theme-txt3">
            Destinatario simulado: <b>{sampleName}</b> ({sampleCompany})
          </span>
        </div>

        <div className="bg-[#0a66c2]/10 border border-[#0a66c2]/20 rounded-xl p-3 text-xs text-theme-txt leading-relaxed shadow-xs">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[#0a66c2]/15 text-[11px] text-[#0a66c2] font-semibold">
            <User className="w-3.5 h-3.5" />
            <span>Para: {sampleName} | {samplePosition} en {sampleCompany}</span>
          </div>
          <p className="whitespace-pre-wrap">{simulatedMessage}</p>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-theme-bor">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-theme-txt2 hover:text-theme-txt hover:bg-theme-sur2 rounded-xl transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-5 py-2 text-xs font-bold bg-[#00e5a0] text-[#00110b] hover:bg-[#00e5a0]/90 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Save className="w-4 h-4 stroke-[2.5]" />
          <span>{isCreatingNew ? 'Guardar Plantilla' : 'Guardar Cambios'}</span>
        </button>
      </div>
    </form>
  );
});

export default function TemplateManagerModal({
  isOpen,
  onClose,
  templates,
  activeTemplateId,
  onSelectActiveTemplate,
  onSaveTemplates,
  onResetTemplates,
}: TemplateManagerModalProps) {
  // Top segment tab switcher: 'ALL' | 'B2B' | 'B2C'
  const [modalSegment, setModalSegment] = useState<'ALL' | 'B2B' | 'B2C'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Filter templates by segment, category, and search query
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      // Segment filter
      if (modalSegment !== 'ALL' && t.businessSegment && t.businessSegment !== 'ALL' && t.businessSegment !== modalSegment) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchText = t.text.toLowerCase().includes(q);
        const matchCat = t.category.toLowerCase().includes(q);
        return matchName || matchText || matchCat;
      }

      return true;
    });
  }, [templates, modalSegment, selectedCategory, searchQuery]);

  const handleStartCreate = () => {
    const isB2B = modalSegment === 'B2B' || modalSegment === 'ALL';
    const newDraft: MessageTemplate = {
      id: `template-${Date.now()}`,
      name: '',
      category: isB2B ? 'Consultoría' : 'Programa de Agilidad',
      businessSegment: isB2B ? 'B2B' : 'B2C',
      targetAudience: isB2B ? 'C-Level / Decisor' : 'Venta Directa / Profesional',
      valueAngle: isB2B ? 'Negocio' : 'Agilidad',
      text: '',
    };
    setEditingTemplate(newDraft);
    setIsCreatingNew(true);
  };

  const handleSaveEditor = useCallback((updatedTemplate: MessageTemplate) => {
    let updated: MessageTemplate[];
    let newActiveId = activeTemplateId;

    if (isCreatingNew) {
      const newTemplate: MessageTemplate = {
        ...updatedTemplate,
        id: updatedTemplate.id || `template-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        isActive: templates.length === 0,
      };
      updated = [...templates, newTemplate];
      if (templates.length === 0) newActiveId = newTemplate.id;
    } else {
      updated = templates.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t));
    }

    onSaveTemplates(updated, newActiveId);
    setEditingTemplate(null);
    setIsCreatingNew(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  }, [isCreatingNew, templates, activeTemplateId, onSaveTemplates]);

  const handleDelete = useCallback((id: string) => {
    if (templates.length <= 1) {
      alert('Debes mantener al menos una plantilla registrada.');
      return;
    }
    if (confirm('¿Estás seguro de eliminar esta plantilla comercial?')) {
      const updated = templates.filter((t) => t.id !== id);
      const newActive = activeTemplateId === id ? updated[0]?.id : undefined;
      onSaveTemplates(updated, newActive);
      setEditingTemplate((prev) => (prev?.id === id ? null : prev));
    }
  }, [templates, activeTemplateId, onSaveTemplates]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col text-theme-txt max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 px-6 border-b border-theme-bor flex items-center justify-between bg-theme-sur shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00e5a0]/15 flex items-center justify-center text-[#00e5a0] border border-[#00e5a0]/30 shadow-xs">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-theme-txt flex items-center gap-2">
                <span>Gestor & Creador de Plantillas TA720</span>
                <span className="text-[10.5px] font-mono text-[#00e5a0] bg-[#00e5a0]/10 px-2 py-0.5 rounded border border-[#00e5a0]/25 font-bold">
                  {templates.length} registradas
                </span>
              </h3>
              <p className="text-xs text-theme-txt2">
                Segmentadas por B2B Corporativo (Gabino) y B2C Alumnos (Kiara)
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
              <span>¡Plantilla guardada y sincronizada en tiempo real con Neon DB!</span>
            </div>
            <span className="text-[10.5px] opacity-85 font-mono">100% Persistente</span>
          </div>
        )}

        {/* Modal Body: Split view (List on left, Visual Editor on right) */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left Column: Segment tabs + Search + List of Templates */}
          <div className="w-80 sm:w-88 border-r border-theme-bor flex flex-col bg-theme-sur2/40 overflow-hidden shrink-0">
            {/* Header with Segment switcher & New Button */}
            <div className="p-3.5 border-b border-theme-bor space-y-2.5 bg-theme-sur/50">
              {/* Segment Switcher */}
              <div className="grid grid-cols-3 gap-1 bg-theme-sur2 p-1 rounded-xl border border-theme-bor">
                <button
                  type="button"
                  onClick={() => {
                    setModalSegment('ALL');
                    setSelectedCategory('ALL');
                  }}
                  className={`py-1 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                    modalSegment === 'ALL'
                      ? 'bg-theme-sur text-theme-txt shadow-xs'
                      : 'text-theme-txt2 hover:text-theme-txt'
                  }`}
                >
                  🌐 Todas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalSegment('B2B');
                    setSelectedCategory('ALL');
                  }}
                  className={`py-1 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                    modalSegment === 'B2B'
                      ? 'bg-[#2979ff] text-white shadow-xs'
                      : 'text-theme-txt2 hover:text-theme-txt'
                  }`}
                >
                  🏢 B2B Gabino
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalSegment('B2C');
                    setSelectedCategory('ALL');
                  }}
                  className={`py-1 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                    modalSegment === 'B2C'
                      ? 'bg-[#00a870] text-white shadow-xs'
                      : 'text-theme-txt2 hover:text-theme-txt'
                  }`}
                >
                  👤 B2C Kiara
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 font-bold">
                  Catálogo ({filteredTemplates.length}/{templates.length})
                </span>
                <button
                  onClick={handleStartCreate}
                  className="px-2.5 py-1 text-xs bg-[#00e5a0] text-[#00110b] hover:bg-[#00e5a0]/90 rounded-lg flex items-center gap-1 font-bold cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Nueva</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-theme-txt3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar plantilla o texto..."
                  className="w-full bg-theme-sur2 border border-theme-bor rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-theme-txt outline-hidden focus:border-[#00e5a0] transition-colors"
                />
              </div>
            </div>

            {/* Template List */}
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
              {filteredTemplates.length === 0 ? (
                <div className="p-6 text-center text-theme-txt3 text-xs">
                  No hay plantillas en este filtro.
                  <button
                    onClick={handleStartCreate}
                    className="mt-2 text-[#00e5a0] hover:underline block mx-auto font-medium"
                  >
                    + Crear plantilla aquí
                  </button>
                </div>
              ) : (
                filteredTemplates.map((t) => {
                  const isActive = activeTemplateId === t.id;
                  const isSelectedForEdit = editingTemplate?.id === t.id;
                  const badgeInfo = getCategoryBadge(t.category);
                  const Icon = badgeInfo.icon;

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setEditingTemplate({ ...t });
                        setIsCreatingNew(false);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 group relative ${
                        isSelectedForEdit
                          ? 'border-[#00e5a0] bg-theme-sur ring-1 ring-[#00e5a0]/30 shadow-md'
                          : 'border-theme-bor bg-theme-sur/50 hover:bg-theme-sur hover:border-theme-bor2'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                                t.businessSegment === 'B2B'
                                  ? 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30'
                                  : 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30'
                              }`}
                            >
                              {t.businessSegment === 'B2B' ? '🏢 B2B' : '👤 B2C'}
                            </span>
                            <span
                              className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${badgeInfo.color}`}
                            >
                              {t.category}
                            </span>
                          </div>

                          <h5 className="font-bold text-xs text-theme-txt mt-1 line-clamp-1 group-hover:text-[#00e5a0] transition-colors">
                            {t.name}
                          </h5>
                        </div>

                        {isActive && (
                          <span className="text-[9px] font-mono text-[#00e5a0] bg-[#00e5a0]/15 px-1.5 py-0.5 rounded font-bold shrink-0">
                            Activa
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-theme-txt2 line-clamp-2 leading-relaxed">
                        {t.text}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-theme-txt3 border-t border-theme-bor/50">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectActiveTemplate(t.id);
                          }}
                          className={`hover:text-[#00e5a0] font-semibold cursor-pointer ${
                            isActive ? 'text-[#00e5a0] font-bold' : ''
                          }`}
                        >
                          {isActive ? '✓ Seleccionada' : 'Fijar por defecto'}
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
          </div>

          {/* Right Column: Visual Editor Panel */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col">
            {editingTemplate ? (
              <TemplateEditorPanel
                template={editingTemplate}
                isCreatingNew={isCreatingNew}
                onSave={handleSaveEditor}
                onCancel={() => {
                  setEditingTemplate(null);
                  setIsCreatingNew(false);
                }}
                savedSuccess={savedSuccess}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-theme-txt3">
                <div className="w-14 h-14 rounded-2xl bg-theme-sur2 border border-theme-bor flex items-center justify-center mb-3">
                  <Compass className="w-7 h-7 text-[#00e5a0]" />
                </div>
                <h4 className="font-bold text-sm text-theme-txt mb-1">
                  Selecciona una plantilla o crea una nueva
                </h4>
                <p className="text-xs max-w-sm text-theme-txt2 mb-4">
                  Podrás editar el mensaje comercial, incorporar los diferenciadores clave de TA720 y probar el envío en vivo.
                </p>
                <button
                  onClick={handleStartCreate}
                  className="px-4 py-2 text-xs font-bold bg-[#00e5a0] text-[#00110b] hover:bg-[#00e5a0]/90 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Crear Nueva Plantilla</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
