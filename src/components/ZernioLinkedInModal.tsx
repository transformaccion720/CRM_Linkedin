'use client';

import React, { useState, useEffect } from 'react';
import { X, Globe, User, ExternalLink, Check, Copy, MessageSquare, Send, ShieldCheck, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { Contact, TeamMember } from '@/lib/types';
import { MessageTemplate } from '@/lib/templates';

interface ZernioLinkedInModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: TeamMember | null;
  templates?: MessageTemplate[];
  onMarkContacted?: (id: string) => void;
}

export default function ZernioLinkedInModal({
  contact,
  isOpen,
  onClose,
  currentUser,
  templates = [],
  onMarkContacted,
}: ZernioLinkedInModalProps) {
  const [accountStatus, setAccountStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [autoMark, setAutoMark] = useState<boolean>(true);

  const activeMemberName = contact?.assigned_to || currentUser?.name || 'Gabino';

  // Check Zernio account connection for the current member
  const checkZernioConnection = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch(`/api/zernio?member=${encodeURIComponent(activeMemberName)}`);
      if (res.ok) {
        const data = await res.json();
        setAccountStatus(data);
      }
    } catch (e) {
      console.error('Error fetching Zernio connection:', e);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen && contact) {
      checkZernioConnection();
      if (templates.length > 0) {
        const first = templates[0];
        setSelectedTemplateId(first.id);
        const personalized = (first.text || '')
          .replace(/{nombre}/g, contact.first_name || '')
          .replace(/{apellido}/g, contact.last_name || '')
          .replace(/{empresa}/g, contact.company || 'tu empresa')
          .replace(/{cargo}/g, contact.position || 'tu rol actual');
        setCustomMessage(personalized);
      }
      setCopied(false);
    }
  }, [isOpen, contact, activeMemberName]);

  if (!isOpen || !contact) return null;

  const handleSelectTemplate = (t: MessageTemplate) => {
    setSelectedTemplateId(t.id);
    const personalized = (t.text || '')
      .replace(/{nombre}/g, contact.first_name || '')
      .replace(/{apellido}/g, contact.last_name || '')
      .replace(/{empresa}/g, contact.company || 'tu empresa')
      .replace(/{cargo}/g, contact.position || 'tu rol actual');
    setCustomMessage(personalized);
    setCopied(false);
  };

  const saveMessageToInbox = async (textToSend: string) => {
    if (!contact || !textToSend.trim()) return;
    try {
      const currentT = templates.find((t) => t.id === selectedTemplateId);
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: contact.id,
          contact_name: `${contact.first_name} ${contact.last_name || ''}`.trim(),
          contact_company: contact.company || null,
          contact_position: contact.position || null,
          contact_linkedin_url: contact.linkedin_url || null,
          sender_name: activeMemberName,
          direction: 'OUTBOUND',
          channel: 'LINKEDIN',
          message_text: textToSend.trim(),
          template_name: currentT?.name || 'Mensaje Personalizado',
        }),
      });
    } catch (e) {
      console.error('Error auto-saving message to inbox:', e);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      setCopied(true);
      if (autoMark && onMarkContacted) {
        onMarkContacted(contact.id);
      }
      saveMessageToInbox(customMessage);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Error copying text:', e);
    }
  };

  const handleOpenDirectChat = () => {
    handleCopy();
    if (contact.linkedin_url) {
      window.open(contact.linkedin_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col text-theme-txt animate-in fade-in zoom-in-95 duration-150 max-h-[90vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-theme-bor flex items-center justify-between bg-theme-sur shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0a66c2]/15 border border-[#0a66c2]/30 flex items-center justify-center text-[#0a66c2] font-bold">
              in
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-theme-txt">Gestión Directa LinkedIn & Zernio</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00a870]/15 text-[#00a870] font-bold border border-[#00a870]/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Zernio API Conectada</span>
                </span>
              </div>
              <p className="text-xs text-theme-txt2">
                Prospecto: <b className="text-theme-txt">{contact.first_name} {contact.last_name || ''}</b> ({contact.company || 'Empresa no especificada'})
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

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Member Linked Account Status Card */}
          <div className="p-3.5 bg-theme-sur2 rounded-xl border border-theme-bor flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#00a870]/15 text-[#00a870] flex items-center justify-center font-bold text-xs">
                {activeMemberName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-theme-txt">Cuenta Emisora: {activeMemberName}</span>
                  {accountStatus?.account ? (
                    <span className="text-[9.5px] font-mono text-[#00a870] bg-[#00a870]/15 px-1.5 py-0.2 rounded font-bold">
                      ● {accountStatus.account.name} (Online)
                    </span>
                  ) : (
                    <span className="text-[9.5px] font-mono text-[#f59e0b] bg-[#f59e0b]/15 px-1.5 py-0.2 rounded font-bold">
                      ● Verificando cuenta
                    </span>
                  )}
                </div>
                <p className="text-[10.5px] text-theme-txt3 font-mono">
                  {accountStatus?.accountId ? `ID Zernio: ${accountStatus.accountId}` : 'Sincronizado vía Zernio Hub'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={checkZernioConnection}
              disabled={loadingStatus}
              className="p-1.5 rounded-lg bg-theme-sur border border-theme-bor hover:border-[#00a870] text-theme-txt2 hover:text-theme-txt text-[10px] flex items-center gap-1 cursor-pointer"
              title="Re-verificar conexión Zernio"
            >
              <RefreshCw className={`w-3 h-3 ${loadingStatus ? 'animate-spin' : ''}`} />
              <span>Verificar</span>
            </button>
          </div>

          {/* Template Selector Pills */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-2 font-bold">
              Seleccionar Plantilla Comercial Especializada:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTemplate(t)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTemplateId === t.id
                      ? 'bg-[#00a870]/10 border-[#00a870] shadow-xs'
                      : 'bg-theme-sur2 border-theme-bor hover:border-theme-bor2'
                  }`}
                >
                  <div className="font-bold text-xs text-theme-txt mb-0.5 truncate">{t.name}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold text-[#00a870] bg-[#00a870]/15 px-1.5 py-0.2 rounded">
                      {t.category}
                    </span>
                    <span className="text-[9.5px] text-theme-txt3 truncate">{t.targetAudience}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 font-bold">
                Mensaje Listo para Enviar por LinkedIn:
              </label>
              <span className="text-[10px] font-mono text-theme-txt3">Autocompletado con nombre y empresa</span>
            </div>

            <textarea
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl p-3 text-xs text-theme-txt leading-relaxed outline-hidden resize-none font-sans"
            />
          </div>

          {/* Option Checkbox */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="checkbox"
              id="zernio-auto-mark"
              checked={autoMark}
              onChange={(e) => setAutoMark(e.target.checked)}
              className="accent-[#00a870] w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="zernio-auto-mark" className="text-xs text-theme-txt2 cursor-pointer select-none">
              Marcar automáticamente a este prospecto como <b className="text-theme-txt">"En contacto"</b> al enviar
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-theme-bor flex items-center justify-between bg-theme-sur shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-theme-txt2 hover:bg-theme-sur2 border border-theme-bor cursor-pointer"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-theme-txt bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor hover:border-[#00a870] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#00a870]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Texto Copiado!' : 'Copiar Mensaje'}</span>
            </button>

            <button
              onClick={handleOpenDirectChat}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0a66c2] hover:bg-[#084e96] flex items-center gap-2 shadow-lg shadow-[#0a66c2]/30 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Abrir Chat en LinkedIn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
