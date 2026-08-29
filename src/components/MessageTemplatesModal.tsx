'use client';

import React, { useState } from 'react';
import { Contact } from '@/lib/types';
import { MessageTemplate } from '@/lib/templates';
import { X, Copy, ExternalLink, Check, Sparkles, Send, MessageSquare, Settings } from 'lucide-react';

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
  const [customText, setCustomText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [autoMark, setAutoMark] = useState<boolean>(true);

  if (!isOpen || !contact) return null;

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

  const handleCopyAndOpenLinkedIn = async () => {
    await handleCopyOnly();
    handleOpenLinkedIn();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col text-theme-txt animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 px-6 border-b border-theme-bor flex items-center justify-between bg-theme-sur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00e5a0]/15 flex items-center justify-center text-[#00e5a0]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-theme-txt">Generador de Mensaje LinkedIn</h3>
              <p className="text-xs text-theme-txt2">
                Para <b className="text-theme-txt">{contact.first_name} {contact.last_name || ''}</b> ({contact.company || 'Sin empresa'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenTemplateManager && (
              <button
                onClick={onOpenTemplateManager}
                className="p-1.5 text-xs text-theme-txt2 hover:text-[#00e5a0] bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
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
          {/* Template pills */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-2">
              Selecciona el Mensaje de tu Campaña
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`p-3 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                    selectedTemplateId === t.id
                      ? 'bg-[#00e5a0]/10 border-[#00e5a0] text-theme-txt font-medium shadow-xs ring-1 ring-[#00e5a0]/30'
                      : 'bg-theme-sur2 border-theme-bor text-theme-txt2 hover:border-theme-bor2 hover:text-theme-txt'
                  }`}
                >
                  <div className="font-semibold text-theme-txt mb-0.5 truncate">{t.name}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9.5px] font-mono text-[#00e5a0] bg-[#00e5a0]/10 px-1.5 py-0.2 rounded">
                      {t.category}
                    </span>
                    <span className="text-[9px] text-theme-txt3 truncate">{t.targetAudience}</span>
                  </div>
                </button>
              ))}
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
              className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00e5a0] rounded-xl p-3.5 text-xs text-theme-txt leading-relaxed outline-hidden transition-all resize-none font-sans"
            />
          </div>

          {/* Options */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="auto-mark"
              checked={autoMark}
              onChange={(e) => setAutoMark(e.target.checked)}
              className="accent-[#00e5a0] w-4 h-4 rounded cursor-pointer"
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

          <div className="flex items-center gap-2">
            {/* Separate Button: Only Copy */}
            <button
              onClick={handleCopyOnly}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-theme-txt bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor hover:border-[#00e5a0] flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copiar texto al portapapeles"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#00e5a0]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Solo Copiar'}</span>
            </button>

            {/* Separate Button: Copy & Open LinkedIn */}
            <button
              onClick={handleCopyAndOpenLinkedIn}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#00110b] bg-[#00e5a0] hover:bg-[#00e5a0]/90 flex items-center gap-1.5 shadow-lg shadow-[#00e5a0]/25 transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar y Abrir LinkedIn</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
