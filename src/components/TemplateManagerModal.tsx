'use client';

import React, { useState, useEffect, memo, useMemo, useCallback, useRef } from 'react';
import { MessageTemplate, TemplateCategory, TemplateTargetAudience, TEMPLATE_CATEGORIES } from '@/lib/templates';
import { 
  X, Plus, Trash2, Save, RotateCcw, Check, Sparkles, FolderKanban, Search, 
  Briefcase, Zap, GraduationCap, Rocket, Layers, Eye, Wand2, User, Building2, 
  Copy, ArrowRight, HelpCircle, CheckCircle2
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
        label: 'Consultoría',
        color: 'text-[#f59e0b] bg-[#f59e0b]/15 border-[#f59e0b]/30',
        activeBtn: 'bg-[#f59e0b] text-[#1a1000] border-[#f59e0b]',
        icon: Briefcase,
      };
    case 'Soluciones Digitales':
      return {
        label: 'Sol. Digitales',
        color: 'text-[#00d2ff] bg-[#00d2ff]/15 border-[#00d2ff]/30',
        activeBtn: 'bg-[#00d2ff] text-[#001a24] border-[#00d2ff]',
        icon: Zap,
      };
    case 'Entrenamiento / Certificación':
    case 'Entrenamiento':
      return {
        label: 'Entrenamiento/Cert.',
        color: 'text-[#00e5a0] bg-[#00e5a0]/15 border-[#00e5a0]/30',
        activeBtn: 'bg-[#00e5a0] text-[#001a12] border-[#00e5a0]',
        icon: GraduationCap,
      };
    case 'Lanzamiento Ágil':
      return {
        label: 'Ágil',
        color: 'text-[#ff6d3b] bg-[#ff6d3b]/15 border-[#ff6d3b]/30',
        activeBtn: 'bg-[#ff6d3b] text-white border-[#ff6d3b]',
        icon: Rocket,
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

// Quick Inspiration Presets
const INSPIRATION_PRESETS = [
  {
    title: '🏢 B2B: RRHH & Formación Corporativa',
    name: 'Entrenamiento y Up-skilling Corporativo',
    category: 'Entrenamiento / Certificación' as TemplateCategory,
    targetAudience: 'Líderes / Gerentes (Equipos)' as TemplateTargetAudience,
    text: 'Hola {nombre}, un gusto saludarte. Diseñamos programas prácticos de entrenamiento corporativo para equipos en agilidad, innovación y liderazgo operativo. Si en {empresa} están buscando potenciar las capacidades de sus líderes, me encantaría compartirte nuestros casos de éxito.',
  },
  {
    title: '👤 B2C: Certificación Scrum & IA',
    name: 'Certificación Internacional Scrum & IA',
    category: 'Entrenamiento / Certificación' as TemplateCategory,
    targetAudience: 'Venta Directa / Profesional' as TemplateTargetAudience,
    text: 'Hola {nombre}, un gusto saludarte. Vi tu trayectoria como {cargo} y quería compartirte que acabamos de abrir vacantes con beca especial para la Certificación Internacional en Scrum & Inteligencia Artificial aplicada. ¿Te gustaría que te envíe el temario y las fechas?',
  },
  {
    title: '💼 B2B: Consultoría Transformación',
    name: 'Consultoría: Transformación y Eficiencia',
    category: 'Consultoría' as TemplateCategory,
    targetAudience: 'C-Level / Decisor' as TemplateTargetAudience,
    text: 'Hola {nombre}, un placer conectar. Vengo siguiendo el crecimiento de {empresa}. Ayudamos a organizaciones a optimizar procesos críticos y estructurar modelos operativos escalables mediante consultoría de transformación empresarial. Quedo a tu disposición si te gustaría explorar sinergias.',
  },
  {
    title: '⚡ Soluciones Digitales y Automatización',
    name: 'Soluciones Digitales y Automatización de Procesos',
    category: 'Soluciones Digitales' as TemplateCategory,
    targetAudience: 'Líderes / Gerentes (Equipos)' as TemplateTargetAudience,
    text: 'Hola {nombre}, ¿cómo estás? En {empresa}, ¿han explorado este año iniciativas en soluciones digitales o automatización de flujos operativos? Desarrollamos tecnología a medida para reducir tiempos manuales. Con gusto podemos agendar un café virtual breve de 10 min.',
  },
];

// Isolated high-converting editor panel with Live Message & Card Preview matching the message sender UX
const TemplateEditorPanel = memo(function TemplateEditorPanel({
  template,
  isCreatingNew,
  onSave,
  onCancel,
  savedSuccess,
}: TemplateEditorPanelProps) {
  const [draft, setDraft] = useState<MessageTemplate>(template);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync when selecting a different template
  useEffect(() => {
    setDraft(template);
  }, [template.id]);

  // Insert variable tag at cursor position
  const handleInsertVariable = (variableTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setDraft((prev) => ({ ...prev, text: prev.text + ' ' + variableTag }));
      return;
    }

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const currentText = draft.text || '';
    const newText = currentText.slice(0, start) + variableTag + currentText.slice(end);

    setDraft((prev) => ({ ...prev, text: newText }));

    setTimeout(() => {
      textarea.focus();
      const nextCursor = start + variableTag.length;
      textarea.setSelectionRange(nextCursor, nextCursor);
    }, 10);
  };

  const handleApplyPreset = (preset: typeof INSPIRATION_PRESETS[0]) => {
    setDraft((prev) => ({
      ...prev,
      name: preset.name,
      category: preset.category,
      targetAudience: preset.targetAudience,
      text: preset.text,
    }));
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

  // Live Simulated Preview Text (Matches the exact prompt screenshot with Yesenia & SANNA Salud)
  const sampleName = 'Yesenia';
  const sampleCompany = 'SANNA Salud';
  const samplePosition = 'Gerente de Gestión Humana';

  const simulatedMessage = (draft.text || '')
    .replace(/{nombre}/g, sampleName)
    .replace(/{apellido}/g, '')
    .replace(/{empresa}/g, sampleCompany)
    .replace(/{cargo}/g, samplePosition);

  const badge = getCategoryBadge(draft.category);
  const BadgeIcon = badge.icon;

  const categories: { key: TemplateCategory; label: string; icon: any }[] = [
    { key: 'Consultoría', label: 'Consultoría', icon: Briefcase },
    { key: 'Soluciones Digitales', label: 'Sol. Digitales', icon: Zap },
    { key: 'Entrenamiento / Certificación', label: 'Entrenamiento/Cert.', icon: GraduationCap },
    { key: 'Lanzamiento Ágil', label: 'Ágil', icon: Rocket },
    { key: 'General', label: 'General', icon: Layers },
  ];

  const audiences: { key: TemplateTargetAudience; label: string; badge: string; isB2B: boolean }[] = [
    { key: 'Venta Directa / Profesional', label: 'Venta Directa / Profesional', badge: 'B2C Alumnos', isB2B: false },
    { key: 'Líderes / Gerentes (Equipos)', label: 'Líderes / Gerentes (Equipos)', badge: 'B2B Equipos', isB2B: true },
    { key: 'C-Level / Decisor', label: 'C-Level / Decisor', badge: 'B2B Corporativo', isB2B: true },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
      {/* Header with Title & Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-theme-bor">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-sm text-theme-txt flex items-center gap-2">
              <span>{isCreatingNew ? 'Crear Nueva Plantilla Comercial' : 'Editar Plantilla'}</span>
            </h4>
            {isCreatingNew ? (
              <span className="text-[10px] font-mono text-[#00e5a0] bg-[#00e5a0]/15 border border-[#00e5a0]/30 px-2 py-0.5 rounded-full font-bold">
                NUEVA
              </span>
            ) : (
              <span className="text-[10px] font-mono text-theme-txt3 bg-theme-sur2 border border-theme-bor px-2 py-0.5 rounded-full">
                ID: {draft.id}
              </span>
            )}
          </div>
          <p className="text-[11px] text-theme-txt2 mt-0.5">
            Organiza el segmento, audiencia y mensaje con autocompletado en tiempo real.
          </p>
        </div>

        {/* Quick Inspiration Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-theme-txt3 flex items-center gap-1 font-bold">
            <Wand2 className="w-3 h-3 text-[#00e5a0]" />
            <span>Ejemplos:</span>
          </span>
          <button
            type="button"
            onClick={() => handleApplyPreset(INSPIRATION_PRESETS[0])}
            className="text-[10px] font-mono px-2 py-1 rounded-lg bg-theme-sur2 hover:bg-[#00e5a0]/15 text-theme-txt2 hover:text-[#00e5a0] border border-theme-bor hover:border-[#00e5a0]/30 transition-all cursor-pointer font-medium"
            title="Cargar ejemplo B2B Formación"
          >
            🏢 B2B Formación
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset(INSPIRATION_PRESETS[1])}
            className="text-[10px] font-mono px-2 py-1 rounded-lg bg-theme-sur2 hover:bg-[#00e5a0]/15 text-theme-txt2 hover:text-[#00e5a0] border border-theme-bor hover:border-[#00e5a0]/30 transition-all cursor-pointer font-medium"
            title="Cargar ejemplo B2C Scrum"
          >
            👤 B2C Scrum
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset(INSPIRATION_PRESETS[2])}
            className="text-[10px] font-mono px-2 py-1 rounded-lg bg-theme-sur2 hover:bg-[#f59e0b]/15 text-theme-txt2 hover:text-[#f59e0b] border border-theme-bor hover:border-[#f59e0b]/30 transition-all cursor-pointer font-medium"
            title="Cargar ejemplo Consultoría"
          >
            💼 Consultoría
          </button>
        </div>
      </div>

      {/* BLOQUE 1: IDENTIFICACIÓN & NOMBRE */}
      <div>
        <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1.5 font-bold">
          1. Nombre Comercial de la Plantilla:
        </label>
        <input
          type="text"
          required
          value={draft.name}
          onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Ej: Entrenamiento y Up-skilling Corporativo"
          className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00e5a0] rounded-xl px-3.5 py-2.5 text-xs text-theme-txt font-semibold outline-hidden transition-all shadow-xs"
        />
      </div>

      {/* BLOQUE 2: SEGMENTO COMERCIAL (BOTONES VISUALES IGUAL QUE EN EL SELECTOR DE LA CAPTURA) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 font-bold">
            2. Segmento / Servicio:
          </label>
          <span className="text-[10px] font-mono text-theme-txt3">
            Seleccionado: <b className="text-theme-txt">{draft.category}</b>
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((c) => {
            const isSelected = draft.category === c.key || (draft.category === 'Entrenamiento' && c.key === 'Entrenamiento / Certificación');
            const Icon = c.icon;
            const bStyle = getCategoryBadge(c.key);

            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, category: c.key }))}
                className={`text-[11px] font-mono px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold flex items-center gap-1.5 border shadow-2xs ${
                  isSelected
                    ? `${bStyle.activeBtn} shadow-xs scale-102`
                    : 'bg-theme-sur2 text-theme-txt2 hover:text-theme-txt border-theme-bor hover:border-theme-bor2'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BLOQUE 3: AUDIENCIA OBJETIVO (B2B vs B2C) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 font-bold">
            3. Audiencia Objetivo & Enfoque:
          </label>
          <span className="text-[10px] font-mono text-theme-txt3">
            Foco: <b className="text-theme-txt">{draft.targetAudience}</b>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {audiences.map((aud) => {
            const isSelected = draft.targetAudience === aud.key;

            return (
              <button
                key={aud.key}
                type="button"
                onClick={() => setDraft((prev) => ({ ...prev, targetAudience: aud.key }))}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#00a870]/10 border-[#00a870] ring-1 ring-[#00a870]/40 shadow-xs'
                    : 'bg-theme-sur2 border-theme-bor hover:border-theme-bor2'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-xs text-theme-txt truncate">
                    {aud.key === 'Venta Directa / Profesional' ? '👤 Profesional' : aud.key === 'Líderes / Gerentes (Equipos)' ? '👥 Líderes / Equipos' : '🏢 C-Level / Decisor'}
                  </span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                    aud.isB2B 
                      ? 'bg-[#2979ff]/15 text-[#2979ff] border-[#2979ff]/30' 
                      : 'bg-[#00a870]/15 text-[#00a870] border-[#00a870]/30'
                  }`}>
                    {aud.badge}
                  </span>
                </div>
                <span className="text-[10px] text-theme-txt3 line-clamp-1">{aud.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BLOQUE 4: REDACCIÓN DEL MENSAJE COMERCIAL CON VARIABLES INSERTABLES */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 font-bold">
            4. Argumento Comercial (Usa variables con un clic):
          </label>
          <div className="flex items-center gap-1 text-[10.5px] font-mono">
            <span className="text-theme-txt3 font-medium">Insertar:</span>
            <button
              type="button"
              onClick={() => handleInsertVariable('{nombre}')}
              className="px-2 py-0.5 rounded-md bg-[#00a870]/15 text-[#00a870] hover:bg-[#00a870]/25 border border-[#00a870]/30 font-bold transition-all cursor-pointer"
              title="Insertar {nombre}"
            >
              + {'{nombre}'}
            </button>
            <button
              type="button"
              onClick={() => handleInsertVariable('{empresa}')}
              className="px-2 py-0.5 rounded-md bg-[#2979ff]/15 text-[#2979ff] hover:bg-[#2979ff]/25 border border-[#2979ff]/30 font-bold transition-all cursor-pointer"
              title="Insertar {empresa}"
            >
              + {'{empresa}'}
            </button>
            <button
              type="button"
              onClick={() => handleInsertVariable('{cargo}')}
              className="px-2 py-0.5 rounded-md bg-[#ff6d3b]/15 text-[#ff6d3b] hover:bg-[#ff6d3b]/25 border border-[#ff6d3b]/30 font-bold transition-all cursor-pointer"
              title="Insertar {cargo}"
            >
              + {'{cargo}'}
            </button>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          rows={5}
          required
          value={draft.text}
          onChange={(e) => setDraft((prev) => ({ ...prev, text: e.target.value }))}
          placeholder="Hola {nombre}, un gusto saludarte. Diseñamos programas prácticos de entrenamiento corporativo para equipos en agilidad... Si en {empresa} están buscando..."
          className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl p-3.5 text-xs text-theme-txt leading-relaxed outline-hidden resize-none font-sans shadow-inner transition-colors"
        />

        <div className="flex items-center justify-between text-[10.5px] font-mono text-theme-txt3">
          <span>{draft.text.length} caracteres redactados</span>
          <span className="text-[#00a870] font-medium">
            {draft.text.length > 350 ? '⚠️ Mensaje extenso (ideal <300 car.)' : '✓ Longitud óptima para LinkedIn'}
          </span>
        </div>
      </div>

      {/* BLOQUE 5: VISTA PREVIA EN VIVO (IDÉNTICA A LA DEL DETALLE DE ENVÍO DE LINKEDIN) */}
      <div className="p-4 rounded-2xl bg-theme-sur2/70 border border-theme-bor space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#00a870]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-theme-txt font-bold">
              Vista Previa en Vivo (Como se verá al enviar):
            </span>
          </div>
          <span className="text-[10px] font-mono text-theme-txt3">
            Autocompletado con: <b className="text-theme-txt">{sampleName}</b> ({sampleCompany})
          </span>
        </div>

        {/* 1. Tarjeta en el Selector de Plantillas */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase text-theme-txt3 block font-semibold">
            Apariencia en la lista de selección:
          </span>
          <div className="p-2.5 rounded-xl border border-[#00a870] bg-[#00a870]/10 max-w-sm shadow-xs">
            <div className="font-bold text-xs text-theme-txt mb-0.5 truncate">
              {draft.name || 'Sin título aún'}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${badge.color}`}>
                {badge.label}
              </span>
              <span className="text-[9.5px] text-theme-txt3 truncate">{draft.targetAudience}</span>
            </div>
          </div>
        </div>

        {/* 2. Caja del Mensaje Terminado (Idéntica al screenshot del usuario) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 font-bold">
              MENSAJE LISTO PARA ENVIAR POR LINKEDIN:
            </span>
            <span className="text-[10px] font-mono text-theme-txt3">
              Autocompletado con nombre y empresa
            </span>
          </div>

          <div className="p-3.5 bg-theme-sur border border-theme-bor rounded-xl text-xs text-theme-txt leading-relaxed shadow-2xs">
            {simulatedMessage || (
              <span className="italic text-theme-txt3">
                Escribe tu argumento comercial arriba para ver la simulación en tiempo real...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* BARRA DE ACCIÓN: CANCELAR & GUARDAR */}
      <div className="flex items-center justify-between pt-2 border-t border-theme-bor">
        <div>
          {savedSuccess && (
            <span className="text-xs text-[#00a870] font-bold flex items-center gap-1.5 bg-[#00a870]/15 px-3 py-1.5 rounded-xl border border-[#00a870]/30 shadow-xs animate-in fade-in duration-150">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>¡Plantilla guardada y disponible de inmediato!</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-medium text-theme-txt2 bg-theme-sur2 hover:bg-theme-sur border border-theme-bor cursor-pointer transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#00110b] bg-[#00e5a0] hover:bg-[#00e5a0]/90 flex items-center gap-2 shadow-md shadow-[#00e5a0]/25 cursor-pointer transition-all active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>{isCreatingNew ? 'Guardar Nueva Plantilla' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>
    </form>
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

  const handleStartCreate = useCallback(() => {
    const defaultCat: TemplateCategory =
      selectedCategory !== 'ALL' && ['Consultoría', 'Soluciones Digitales', 'Entrenamiento / Certificación', 'Lanzamiento Ágil'].includes(selectedCategory)
        ? (selectedCategory as TemplateCategory)
        : 'Entrenamiento / Certificación';

    const newId = `template-${Date.now()}`;
    const newTpl: MessageTemplate = {
      id: newId,
      name: `Nueva Plantilla: ${defaultCat}`,
      category: defaultCat,
      targetAudience: 'Líderes / Gerentes (Equipos)',
      text: 'Hola {nombre}, un gusto saludarte. Vi tu rol como {cargo} en {empresa} y quería consultarte...',
      isActive: false,
    };
    setEditingTemplate(newTpl);
    setIsCreatingNew(true);
    setSavedSuccess(false);
  }, [selectedCategory]);

  const handleSaveCurrent = useCallback((updatedTemplate: MessageTemplate) => {
    let updated: MessageTemplate[];
    let newActiveId: string | undefined = undefined;

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
  }, [isCreatingNew, templates, onSaveTemplates]);

  const handleCancelEdit = useCallback(() => {
    setEditingTemplate(null);
    setIsCreatingNew(false);
  }, []);

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
                <span>Gestor & Creador de Plantillas de Prospección</span>
                <span className="text-[10.5px] font-mono text-[#00e5a0] bg-[#00e5a0]/10 px-2 py-0.5 rounded border border-[#00e5a0]/25 font-bold">
                  {templates.length} registradas
                </span>
              </h3>
              <p className="text-xs text-theme-txt2">
                Configuración rápida y visual con vista previa idéntica al envío de LinkedIn
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

              {/* Segment Filter Tabs (Pills exactly like the screenshot) */}
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
                        <h4 className="font-bold text-theme-txt truncate flex-1">{t.name}</h4>
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

          {/* Right Editor Area (High-Converting Form with Live Message Preview) */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between space-y-4 bg-theme-sur">
            {editingTemplate ? (
              <TemplateEditorPanel
                key={editingTemplate.id}
                template={editingTemplate}
                isCreatingNew={isCreatingNew}
                onSave={handleSaveCurrent}
                onCancel={handleCancelEdit}
                savedSuccess={savedSuccess}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-theme-txt2">
                <div className="w-16 h-16 rounded-2xl bg-[#00e5a0]/10 flex items-center justify-center text-[#00e5a0] mb-4 border border-[#00e5a0]/20">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-base text-theme-txt">Selecciona una plantilla o crea una nueva</h4>
                <p className="text-xs text-theme-txt2 mt-1.5 max-w-md leading-relaxed">
                  Personaliza y segmenta tus argumentos comerciales para <b>Consultoría</b>, <b>Soluciones Digitales</b> y <b>Entrenamiento / Certificación</b> con previsualización en tiempo real.
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
                  <span>¡Sincronizado con Neon DB!</span>
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
