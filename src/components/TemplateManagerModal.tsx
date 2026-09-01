'use client';

import React, { useState } from 'react';
import { MessageTemplate } from '@/lib/templates';
import { X, Plus, Trash2, Edit3, Save, RotateCcw, Check, Sparkles, FolderKanban } from 'lucide-react';

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: MessageTemplate[];
  activeTemplateId: string;
  onSelectActiveTemplate: (id: string) => void;
  onSaveTemplates: (templates: MessageTemplate[]) => void;
  onResetTemplates: () => void;
}

export default function TemplateManagerModal({
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

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setEditingTemplate({
      id: 'template-' + Date.now(),
      name: 'Nueva Plantilla Comercial',
      category: 'Lanzamiento Ágil',
      targetAudience: 'Venta Directa / Profesional',
      text: 'Hola {nombre}, un gusto saludarte. Como {cargo} en {empresa}...',
    });
    setIsCreatingNew(true);
  };

  const handleSaveCurrent = () => {
    if (!editingTemplate) return;
    let updated: MessageTemplate[];
    if (isCreatingNew) {
      updated = [...templates, editingTemplate];
      onSelectActiveTemplate(editingTemplate.id);
    } else {
      updated = templates.map((t) => (t.id === editingTemplate.id ? editingTemplate : t));
    }
    onSaveTemplates(updated);
    setEditingTemplate(null);
    setIsCreatingNew(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDelete = (id: string) => {
    if (templates.length <= 1) {
      alert('Debes mantener al menos una plantilla.');
      return;
    }
    if (confirm('¿Eliminar esta plantilla?')) {
      const updated = templates.filter((t) => t.id !== id);
      onSaveTemplates(updated);
      if (activeTemplateId === id) {
        onSelectActiveTemplate(updated[0]?.id || '');
      }
      if (editingTemplate?.id === id) {
        setEditingTemplate(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col text-theme-txt max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 px-6 border-b border-theme-bor flex items-center justify-between bg-theme-sur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00e5a0]/15 flex items-center justify-center text-[#00e5a0]">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-theme-txt">Configurador de Plantillas de Mensajes</h3>
              <p className="text-xs text-theme-txt2">
                Personaliza tus argumentos para Ágil, Consultoría, Soluciones Digitales y Entrenamiento
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
          <div className="bg-[#00e5a0] text-[#00110b] font-bold px-6 py-2.5 flex items-center justify-between text-xs animate-in slide-in-from-top duration-200 shadow-md">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>¡Plantilla guardada y sincronizada correctamente en la base de datos!</span>
            </div>
            <span className="text-[10.5px] opacity-80 font-mono">Actualizado</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left List of Templates */}
          <div className="w-80 border-r border-theme-bor flex flex-col p-4 bg-theme-sur2/40 overflow-y-auto shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2">
                Tus Plantillas ({templates.length})
              </span>
              <button
                onClick={handleStartCreate}
                className="p-1.5 text-xs bg-[#00e5a0]/15 text-[#00e5a0] hover:bg-[#00e5a0]/25 rounded-lg flex items-center gap-1 font-semibold cursor-pointer border border-[#00e5a0]/30"
                title="Crear nueva plantilla"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva</span>
              </button>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
              {templates.map((t) => {
                const isActive = activeTemplateId === t.id;
                const isSelectedForEdit = editingTemplate?.id === t.id;

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
                        : 'bg-theme-sur border-theme-bor hover:border-theme-bor2'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className="font-semibold text-theme-txt truncate flex-1">{t.name}</h4>
                      {isActive && (
                        <span className="text-[9.5px] font-mono text-[#00e5a0] bg-[#00e5a0]/15 px-1.5 py-0.5 rounded font-bold shrink-0">
                          ACTIVA
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-mono text-[#2979ff] bg-[#2979ff]/10 px-1.5 py-0.5 rounded">
                        {t.category}
                      </span>
                      <span className="text-[9.5px] text-theme-txt3">{t.targetAudience}</span>
                    </div>

                    <p className="text-[11px] text-theme-txt2 line-clamp-2 italic">{t.text}</p>

                    <div className="mt-2 pt-2 border-t border-theme-bor flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectActiveTemplate(t.id);
                        }}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded cursor-pointer ${
                          isActive
                            ? 'text-[#00e5a0] bg-[#00e5a0]/15 font-bold'
                            : 'text-theme-txt2 hover:text-[#00e5a0] bg-theme-sur2'
                        }`}
                      >
                        {isActive ? '✓ Predeterminada' : 'Fijar como activa'}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(t.id);
                        }}
                        className="text-theme-txt3 hover:text-[#ff6d3b] p-1 cursor-pointer"
                        title="Eliminar plantilla"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Editor Area */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between space-y-4">
            {editingTemplate ? (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-theme-txt">
                    {isCreatingNew ? 'Crear Nueva Plantilla Comercial' : 'Editar Plantilla'}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-theme-txt3">
                    <span>Variables:</span>
                    <code className="text-[#00e5a0] bg-theme-sur2 px-1 rounded">{'{nombre}'}</code>
                    <code className="text-[#2979ff] bg-theme-sur2 px-1 rounded">{'{empresa}'}</code>
                    <code className="text-[#ff6d3b] bg-theme-sur2 px-1 rounded">{'{cargo}'}</code>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
                      Nombre de la Plantilla
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.name}
                      onChange={(e) =>
                        setEditingTemplate({ ...editingTemplate, name: e.target.value })
                      }
                      className="w-full bg-theme-sur2 border border-theme-bor rounded-lg px-3 py-1.5 text-xs text-theme-txt outline-hidden focus:border-[#00e5a0]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
                      Servicio / Categoría
                    </label>
                    <select
                      value={editingTemplate.category}
                      onChange={(e) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          category: e.target.value as MessageTemplate['category'],
                        })
                      }
                      className="w-full bg-theme-sur2 border border-theme-bor rounded-lg px-3 py-1.5 text-xs text-theme-txt outline-hidden cursor-pointer"
                    >
                      <option value="Lanzamiento Ágil">Lanzamiento Ágil</option>
                      <option value="Consultoría">Consultoría</option>
                      <option value="Soluciones Digitales">Soluciones Digitales</option>
                      <option value="Entrenamiento">Entrenamiento</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
                      Audiencia Objetivo
                    </label>
                    <select
                      value={editingTemplate.targetAudience}
                      onChange={(e) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          targetAudience: e.target.value as MessageTemplate['targetAudience'],
                        })
                      }
                      className="w-full bg-theme-sur2 border border-theme-bor rounded-lg px-3 py-1.5 text-xs text-theme-txt outline-hidden cursor-pointer"
                    >
                      <option value="Venta Directa / Profesional">Venta Directa / Profesional</option>
                      <option value="Líderes / Gerentes (Equipos)">Líderes / Gerentes (Equipos)</option>
                      <option value="C-Level / Decisor">C-Level / Decisor</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
                    Cuerpo del Mensaje (Argumento Comercial)
                  </label>
                  <textarea
                    rows={6}
                    value={editingTemplate.text}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, text: e.target.value })
                    }
                    placeholder="Escribe el mensaje aquí. Usa {nombre}, {empresa}, {cargo} para personalización automática..."
                    className="w-full flex-1 bg-theme-sur2 border border-theme-bor focus:border-[#00e5a0] rounded-xl p-3.5 text-xs text-theme-txt leading-relaxed outline-hidden transition-all resize-none font-sans"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    {savedSuccess && (
                      <span className="text-xs text-[#00e5a0] font-bold flex items-center gap-1.5 bg-[#00e5a0]/15 px-3 py-1.5 rounded-xl border border-[#00e5a0]/30 shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>¡Guardado correctamente!</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingTemplate(null);
                        setIsCreatingNew(false);
                      }}
                      className="px-4 py-2 rounded-lg text-xs font-medium text-theme-txt2 bg-theme-sur2 hover:bg-theme-sur3 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveCurrent}
                      className="px-5 py-2 rounded-lg text-xs font-bold text-[#00110b] bg-[#00e5a0] hover:bg-[#00e5a0]/90 flex items-center gap-1.5 shadow-md shadow-[#00e5a0]/20 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar Plantilla</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-theme-txt2">
                <Sparkles className="w-10 h-10 mb-3 text-[#00e5a0]" />
                <h4 className="font-bold text-sm text-theme-txt">Selecciona una plantilla o crea una nueva</h4>
                <p className="text-xs text-theme-txt2 mt-1 max-w-md">
                  Personaliza los mensajes de prospección para tus lanzamientos en Gestión Ágil, Consultoría y Soluciones Digitales.
                </p>
                <button
                  onClick={handleStartCreate}
                  className="mt-4 px-4 py-2 bg-[#00e5a0] text-[#00110b] font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#00e5a0]/20"
                >
                  <Plus className="w-4 h-4" />
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
                className="text-[11px] text-theme-txt3 hover:text-theme-txt flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer plantillas predeterminadas</span>
              </button>

              {savedSuccess && (
                <span className="text-xs text-[#00e5a0] flex items-center gap-1 font-medium">
                  <Check className="w-3.5 h-3.5" />
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
