'use client';

import React, { useState } from 'react';
import { Contact } from '@/lib/types';
import { MessageTemplate } from '@/lib/templates';
import { X, Copy, ExternalLink, Check, MessageSquare, Settings, Briefcase, Building2 } from 'lucide-react';

import { getCategoryBadge } from './TemplateManagerModal';

interface MessageTemplatesModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  templates: MessageTemplate[];
  activeTemplateId: string;
  onOpenTemplateManager?: () => void;
  onMarkContacted?: (id: string) => void;
}

export default function MessageTemplatesModal({
  contact,
  isOpen,
  onClose,
  templates,
  activeTemplateId,
  onOpenTemplateManager,
  onMarkContacted,
}: MessageTemplatesModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(activeTemplateId || templates[0]?.id);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [customText, setCustomText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [autoMark, setAutoMark] = useState<boolean>(true);

  if (!isOpen || !contact) return null;

  const visibleTemplates = templates.filter((t) => {
    if (categoryFilter === 'ALL') return true;
    if (t.category === categoryFilter) return true;
    if (categoryFilter === 'Entrenamiento / Certificación' && (t.category === 'Entrenamiento' || (t.name && t.name.toLowerCase().includes('certi')))) return true;
    return false;
  });

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Personalize template
  const getPersonalizedText = (templateText: string) => {
    return (templateText || '')
      .replace(/{nombre}/g, contact.first_name || '')
      .replace(/{apellido}/g, contact.last_name || '')
      .replace(/{empresa}/g, contact.company || 'tu empresa')
      .replace(/{cargo}/g, contact.position || 'tu rol actual');
  };

  const activeMessage = customText || (currentTemplate ? getPersonalizedText(currentTemplate.text) : '');

  const handleSelectTemplate = (t: MessageTemplate) => {
    setSelectedTemplateId(t.id);
    setCustomText(getPersonalizedText(t.text));
    setCopied(false);
  };

  const handleCopyOnly = async () => {
    try {
      await navigator.clipboard.writeText(activeMessage);
      setCopied(true);
      if (autoMark && onMarkContacted) {
        onMarkContacted(contact.id);
      }
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Error copying:', e);
    }
  };

  const handleOpenLinkedIn = () => {
    if (contact.linkedin_url) {
      window.open(contact.linkedin_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col text-theme-txt animate-in fade-in zoom-in-95 duration-150">
        {/* Header with clear Name, Position and Company */}
        <div className="p-4 px-6 border-b border-theme-bor flex items-center justify-between bg-theme-sur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00a870]/15 flex items-center justify-center text-[#00a870]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-theme-txt">Generador de Mensaje LinkedIn</h3>
              <div className="flex items-center gap-2 text-xs text-theme-txt2 mt-0.5 flex-wrap">
                <span className="font-semibold text-theme-txt">{contact.first_name} {contact.last_name || ''}</span>
                {contact.position && (
                  <span className="flex items-center gap-1 text-[11px] text-theme-txt3">
                    <Briefcase className="w-3 h-3" />
                    <span>{contact.position}</span>
                  </span>
                )}
                {contact.company && (
                  <span className="flex items-center gap-1 text-[11px] text-theme-txt3">
                    <Building2 className="w-3 h-3" />
                    <span>({contact.company})</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenTemplateManager && (
              <button
                onClick={onOpenTemplateManager}
                className="p-1.5 text-xs text-theme-txt2 hover:text-[#00a870] bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title="Configurar y editar plantillas"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Gestionar Plantillas</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-theme-txt2 hover:text-theme-txt rounded-lg hover:bg-theme-sur2 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[70vh]">
          {/* Template pills with category segmentation tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 font-bold">
                Selecciona el Mensaje de tu Campaña ({visibleTemplates.length}/{templates.length})
              </label>
              <span className="text-[10px] text-theme-txt3 font-mono">
                Segmento: <b className="text-theme-txt">{categoryFilter === 'ALL' ? 'Todas' : categoryFilter}</b>
              </span>
            </div>

            {/* Segment Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 mb-2.5 no-scrollbar">
              <button
                type="button"
                onClick={() => setCategoryFilter('ALL')}
                className={`text-[10px] font-mono px-2 py-1 rounded-md whitespace-nowrap transition-all cursor-pointer font-bold ${
                  categoryFilter === 'ALL'
                    ? 'bg-theme-txt text-theme-sur shadow-xs'
                    : 'bg-theme-sur2 text-theme-txt2 hover:text-theme-txt border border-theme-bor'
                }`}
              >
                Todas ({templates.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('Consultoría')}
                className={`text-[10px] font-mono px-2 py-1 rounded-md whitespace-nowrap transition-all cursor-pointer font-bold flex items-center gap-1 ${
                  categoryFilter === 'Consultoría'
                    ? 'bg-[#f59e0b] text-[#1a1000] shadow-xs'
                    : 'bg-theme-sur2 text-theme-txt2 hover:text-[#f59e0b] border border-theme-bor'
                }`}
              >
                <span>💼 Consultoría</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('Soluciones Digitales')}
                className={`text-[10px] font-mono px-2 py-1 rounded-md whitespace-nowrap transition-all cursor-pointer font-bold flex items-center gap-1 ${
                  categoryFilter === 'Soluciones Digitales'
                    ? 'bg-[#00d2ff] text-[#001a24] shadow-xs'
                    : 'bg-theme-sur2 text-theme-txt2 hover:text-[#00d2ff] border border-theme-bor'
                }`}
              >
                <span>⚡ Sol. Digitales</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('Entrenamiento / Certificación')}
                className={`text-[10px] font-mono px-2 py-1 rounded-md whitespace-nowrap transition-all cursor-pointer font-bold flex items-center gap-1 ${
                  categoryFilter === 'Entrenamiento / Certificación'
                    ? 'bg-[#00e5a0] text-[#001a12] shadow-xs'
                    : 'bg-theme-sur2 text-theme-txt2 hover:text-[#00e5a0] border border-theme-bor'
                }`}
              >
                <span>🎓 Entrenamiento/Cert.</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('Lanzamiento Ágil')}
                className={`text-[10px] font-mono px-2 py-1 rounded-md whitespace-nowrap transition-all cursor-pointer font-bold flex items-center gap-1 ${
                  categoryFilter === 'Lanzamiento Ágil'
                    ? 'bg-[#ff6d3b] text-white shadow-xs'
                    : 'bg-theme-sur2 text-theme-txt2 hover:text-[#ff6d3b] border border-theme-bor'
                }`}
              >
                <span>🚀 Ágil</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-0.5">
              {visibleTemplates.map((t) => {
                const badge = getCategoryBadge(t.category);
                const isSelected = selectedTemplateId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTemplate(t)}
                    className={`p-3 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                      isSelected
                        ? 'bg-[#00a870]/10 border-[#00a870] text-theme-txt font-medium shadow-xs ring-1 ring-[#00a870]/40'
                        : 'bg-theme-sur2 border-theme-bor text-theme-txt2 hover:border-theme-bor2 hover:text-theme-txt'
                    }`}
                  >
                    <div className="font-semibold text-theme-txt mb-1 truncate">{t.name}</div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-[9.5px] text-theme-txt2 truncate">{t.targetAudience}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editable text area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2">
                Mensaje Personalizado (Listo para enviar)
              </label>
              <span className="text-[10px] font-mono text-theme-txt3">Autocompletado con datos del contacto</span>
            </div>

            <textarea
              rows={5}
              value={activeMessage}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl p-3.5 text-xs text-theme-txt leading-relaxed outline-hidden resize-none font-sans"
            />
          </div>

          {/* Options */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="auto-mark"
              checked={autoMark}
              onChange={(e) => setAutoMark(e.target.checked)}
              className="accent-[#00a870] w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="auto-mark" className="text-xs text-theme-txt2 cursor-pointer select-none">
              Marcar automáticamente a este prospecto como <b className="text-theme-txt">"En contacto"</b> al copiar
            </label>
          </div>
        </div>

        {/* Footer Actions with Separate Copy and Open buttons */}
        <div className="p-4 px-6 border-t border-theme-bor flex items-center justify-between bg-theme-sur shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-theme-txt2 hover:text-theme-txt bg-theme-sur2 hover:bg-theme-sur3 transition-all cursor-pointer"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2.5">
            {/* Separate Button: Only Copy */}
            <button
              onClick={handleCopyOnly}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-theme-txt bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor hover:border-[#00a870] flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copiar texto al portapapeles"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#00a870]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Solo Copiar'}</span>
            </button>

            {/* Separate Button: Open LinkedIn Profile */}
            <button
              onClick={handleOpenLinkedIn}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0a66c2] hover:bg-[#084e96] flex items-center gap-1.5 shadow-md shadow-[#0a66c2]/25 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir LinkedIn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
