'use client';

import React, { useState, useEffect } from 'react';
import { ContactMessage, TeamMember } from '@/lib/types';
import { MessageSquare, Send, Reply, Search, UserCheck, ExternalLink, RefreshCw, CheckCircle2, Clock, Inbox, ChevronRight } from 'lucide-react';

interface MessagingInboxViewProps {
  currentUser: TeamMember | null;
  teamMembers: TeamMember[];
  onOpenContactDrawer?: (contactId: string) => void;
}

export default function MessagingInboxView({
  currentUser,
  teamMembers = [],
  onOpenContactDrawer,
}: MessagingInboxViewProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [memberFilter, setMemberFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Quick reply note modal
  const [replyModalOpen, setReplyModalOpen] = useState<boolean>(false);
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [replyType, setReplyType] = useState<'INBOUND' | 'OUTBOUND'>('INBOUND');
  const [savingReply, setSavingReply] = useState<boolean>(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (memberFilter && memberFilter !== 'all') params.set('member', memberFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/messages?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error('Error fetching messages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [memberFilter, search]);

  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMsg || !replyText.trim()) return;

    setSavingReply(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: selectedMsg.contact_id,
          contact_name: selectedMsg.contact_name,
          contact_company: selectedMsg.contact_company,
          contact_position: selectedMsg.contact_position,
          contact_linkedin_url: selectedMsg.contact_linkedin_url,
          sender_name: currentUser?.name || 'Comercial',
          direction: replyType,
          channel: selectedMsg.channel || 'LINKEDIN',
          message_text: replyText.trim(),
        }),
      });

      if (res.ok) {
        setReplyModalOpen(false);
        setReplyText('');
        fetchMessages();
      }
    } catch (e) {
      console.error('Error saving message reply:', e);
    } finally {
      setSavingReply(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-theme-bg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-sur p-5 rounded-2xl border border-theme-bor">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#2979ff] font-bold bg-[#2979ff]/10 px-2 py-0.5 rounded flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-[#2979ff]" />
              <span>Bandeja de Mensajes & Conversaciones</span>
            </span>
            <span className="text-[10px] font-mono text-theme-txt3">{messages.length} mensajes registrados</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-theme-txt">
            Historial de Conversaciones y Seguimiento Comercial
          </h2>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Registro unificado de prospecciones enviadas y respuestas de prospectos, organizado por comercial
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMessages}
            disabled={loading}
            className="p-2 rounded-xl bg-theme-sur2 border border-theme-bor hover:border-[#2979ff] text-theme-txt2 hover:text-theme-txt text-xs flex items-center gap-1 cursor-pointer"
            title="Actualizar mensajes"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-theme-sur border border-theme-bor p-3.5 rounded-xl flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setMemberFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              memberFilter === ''
                ? 'bg-[#2979ff] text-white shadow-xs'
                : 'bg-theme-sur2 text-theme-txt2 hover:text-theme-txt border border-theme-bor'
            }`}
          >
            Todas las bases
          </button>

          {teamMembers.map((m) => (
            <button
              key={m.id}
              onClick={() => setMemberFilter(m.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                memberFilter === m.name
                  ? 'bg-[#00a870] text-[#00110b] font-bold shadow-xs'
                  : 'bg-theme-sur2 text-theme-txt2 hover:text-theme-txt border border-theme-bor'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Base: {m.name}</span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-theme-txt3 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por contacto, empresa, texto..."
            className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#2979ff] rounded-lg pl-8 pr-3 py-1.5 text-xs text-theme-txt outline-hidden"
          />
        </div>
      </div>

      {/* Message List Timeline */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center p-12 text-xs text-theme-txt2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#2979ff] animate-ping" />
            <span>Cargando conversaciones...</span>
          </div>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-12 text-center text-xs text-theme-txt2">
          <Inbox className="w-8 h-8 text-theme-txt3 mx-auto mb-2 opacity-50" />
          <p className="font-bold text-sm text-theme-txt">No hay mensajes registrados aún</p>
          <p className="mt-1">
            Al enviar plantillas desde la tabla o el Drawer, los mensajes quedarán archivados aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => {
            const isOutbound = m.direction === 'OUTBOUND';

            return (
              <div
                key={m.id}
                className="bg-theme-sur border border-theme-bor hover:border-theme-bor2 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all"
              >
                {/* Left: Contact Info and Message */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-theme-txt">
                      {m.contact_name}
                    </span>
                    {m.contact_company && (
                      <span className="text-xs text-theme-txt2">
                        • {m.contact_company}
                      </span>
                    )}
                    {m.contact_position && (
                      <span className="text-[11px] text-theme-txt3 font-mono">
                        ({m.contact_position})
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        isOutbound
                          ? 'bg-[#2979ff]/15 text-[#2979ff] border border-[#2979ff]/30'
                          : 'bg-[#00a870]/15 text-[#00a870] border border-[#00a870]/30'
                      }`}
                    >
                      {isOutbound ? '📤 Enviado por ' + m.sender_name : '📥 Respuesta Recibida'}
                    </span>

                    {m.template_name && (
                      <span className="text-[10px] font-mono text-theme-txt3 bg-theme-sur2 px-2 py-0.5 rounded border border-theme-bor">
                        Plantilla: {m.template_name}
                      </span>
                    )}
                  </div>

                  {/* Message Body */}
                  <div className="p-3 rounded-xl bg-theme-sur2 border border-theme-bor text-xs text-theme-txt leading-relaxed font-sans whitespace-pre-wrap">
                    {m.message_text}
                  </div>

                  <div className="flex items-center gap-3 text-[10.5px] font-mono text-theme-txt3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{m.created_at}</span>
                    </span>
                    <span>Canal: {m.channel || 'LinkedIn'}</span>
                  </div>
                </div>

                {/* Right: Quick Action Buttons */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  {m.contact_linkedin_url && (
                    <a
                      href={m.contact_linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0a66c2] hover:bg-[#084e96] flex items-center gap-1 transition-all shadow-xs"
                      title="Abrir chat en LinkedIn"
                    >
                      <span>Chat LinkedIn</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <button
                    onClick={() => {
                      setSelectedMsg(m);
                      setReplyModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor hover:border-[#00a870] text-theme-txt flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Reply className="w-3.5 h-3.5 text-[#00a870]" />
                    <span>Anotar Respuesta</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply / Response Register Modal */}
      {replyModalOpen && selectedMsg && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-theme-txt animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 px-6 border-b border-theme-bor flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Reply className="w-5 h-5 text-[#00a870]" />
                <h3 className="font-bold text-sm text-theme-txt">Registrar Interacción con {selectedMsg.contact_name}</h3>
              </div>
              <button
                onClick={() => setReplyModalOpen(false)}
                className="p-1 text-theme-txt2 hover:text-theme-txt rounded-lg hover:bg-theme-sur2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReply} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-mono uppercase text-theme-txt2 block mb-1">
                  Tipo de Mensaje
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyType('INBOUND')}
                    className={`py-2 px-3 rounded-xl border font-semibold text-xs cursor-pointer ${
                      replyType === 'INBOUND'
                        ? 'bg-[#00a870]/15 border-[#00a870] text-[#00a870]'
                        : 'bg-theme-sur2 border-theme-bor text-theme-txt2'
                    }`}
                  >
                    📥 Respuesta del Prospecto
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyType('OUTBOUND')}
                    className={`py-2 px-3 rounded-xl border font-semibold text-xs cursor-pointer ${
                      replyType === 'OUTBOUND'
                        ? 'bg-[#2979ff]/15 border-[#2979ff] text-[#2979ff]'
                        : 'bg-theme-sur2 border-theme-bor text-theme-txt2'
                    }`}
                  >
                    📤 Mensaje de Seguimiento
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-theme-txt2 block mb-1">
                  Texto del Mensaje / Resumen de lo que dijo
                </label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Ej. Me contestó que le interesa el programa y me pidió brochure para revisarlo..."
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl p-3 text-xs text-theme-txt outline-hidden resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-theme-txt2 hover:bg-theme-sur2 border border-theme-bor cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingReply}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#00110b] bg-[#00a870] hover:bg-[#00a870]/90 disabled:opacity-50 cursor-pointer shadow-md shadow-[#00a870]/20"
                >
                  {savingReply ? 'Guardando...' : 'Guardar en Historial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
