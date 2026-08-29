'use client';

import React, { useState, useEffect } from 'react';
import { Contact, ContactStatus } from '@/lib/types';
import { X, ExternalLink, Mail, Building2, Briefcase, Calendar, Trash2, CheckCircle2, Save, Star, Tag, Clock, MessageSquare, Plus } from 'lucide-react';

interface ContactDrawerProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: Contact) => void;
  onDelete: (id: string) => void;
  onOpenTemplates?: (c: Contact) => void;
}

const ALL_STATUSES: ContactStatus[] = [
  'Sin contactar',
  'En contacto',
  'Oportunidad',
  'Cliente',
  'En pausa',
  'Descartado',
];

export default function ContactDrawer({
  contact,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onOpenTemplates,
}: ContactDrawerProps) {
  const [status, setStatus] = useState<ContactStatus>('Sin contactar');
  const [notes, setNotes] = useState<string>('');
  const [priority, setPriority] = useState<number>(1);
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (contact) {
      setStatus(contact.status);
      setNotes(contact.notes || '');
      setPriority(contact.priority || 1);
      setFollowUpDate(contact.follow_up_date || '');
      setTags(contact.tags || []);
      setSaveSuccess(false);
    }
  }, [contact]);

  if (!isOpen || !contact) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          notes,
          priority,
          follow_up_date: followUpDate || null,
          tags,
        }),
      });
      const data = await res.json();
      if (res.ok && data.contact) {
        onUpdate(data.contact);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (e) {
      console.error('Error guardando:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const setQuickFollowUp = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFollowUpDate(d.toISOString().split('T')[0]);
  };

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar a ${contact.first_name}?`)) return;
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete(contact.id);
        onClose();
      }
    } catch (e) {
      console.error('Error eliminando:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-theme-sur border-l border-theme-bor h-full shadow-2xl flex flex-col text-theme-txt transition-all animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-theme-bor flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-theme-sur2 border border-theme-bor2 flex items-center justify-center font-bold text-[#00e5a0] text-sm shrink-0">
              {(contact.first_name[0] || '') + (contact.last_name?.[0] || '')}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-theme-txt truncate">
                {contact.first_name} {contact.last_name || ''}
              </h3>
              <p className="text-[11px] text-theme-txt2 truncate">{contact.position || 'Sin cargo'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-theme-txt2 hover:text-theme-txt rounded-lg hover:bg-theme-sur2 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: LinkedIn Message Templates */}
        <div className="p-3 bg-theme-sur2/60 border-b border-theme-bor flex gap-2">
          {onOpenTemplates && (
            <button
              onClick={() => onOpenTemplates(contact)}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-bold text-[#00110b] bg-[#00e5a0] hover:bg-[#00e5a0]/90 flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Plantillas de Mensaje LinkedIn</span>
            </button>
          )}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Priority Star Scoring */}
          <div className="flex items-center justify-between p-3 bg-theme-sur2 rounded-xl border border-theme-bor">
            <span className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2">
              Prioridad del Lead
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((star) => (
                <button
                  key={star}
                  onClick={() => setPriority(star)}
                  className="p-1 text-base cursor-pointer transition-transform hover:scale-110"
                  title={`${star} Estrella(s)`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= priority
                        ? 'text-[#f59e0b] fill-[#f59e0b]'
                        : 'text-theme-txt3 hover:text-theme-txt2'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Follow-up Reminder */}
          <div className="space-y-2 p-3 bg-theme-sur2 rounded-xl border border-theme-bor">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#ff6d3b]" />
                Próximo Seguimiento
              </span>
              {followUpDate && (
                <button
                  onClick={() => setFollowUpDate('')}
                  className="text-[10px] text-theme-txt3 hover:text-[#ff6d3b]"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="bg-theme-sur border border-theme-bor rounded-lg px-2.5 py-1.5 text-xs text-theme-txt outline-hidden flex-1 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => setQuickFollowUp(0)}
                className="px-2 py-1 rounded bg-theme-sur border border-theme-bor hover:border-[#00e5a0] text-[10px] text-theme-txt2 hover:text-theme-txt"
              >
                Hoy
              </button>
              <button
                onClick={() => setQuickFollowUp(3)}
                className="px-2 py-1 rounded bg-theme-sur border border-theme-bor hover:border-[#00e5a0] text-[10px] text-theme-txt2 hover:text-theme-txt"
              >
                +3 días
              </button>
              <button
                onClick={() => setQuickFollowUp(7)}
                className="px-2 py-1 rounded bg-theme-sur border border-theme-bor hover:border-[#00e5a0] text-[10px] text-theme-txt2 hover:text-theme-txt"
              >
                +1 semana
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#2979ff]" />
              Etiquetas (Tags)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[#2979ff]/15 text-[#2979ff] border border-[#2979ff]/30 font-medium"
                >
                  <span>{t}</span>
                  <button onClick={() => handleRemoveTag(t)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Ej. Minería, Tier 1, Decisor..."
                className="flex-1 bg-theme-sur2 border border-theme-bor rounded-lg px-3 py-1.5 text-xs text-theme-txt outline-hidden focus:border-[#00e5a0]"
              />
              <button
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor rounded-lg text-xs font-semibold text-theme-txt cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir</span>
              </button>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-3 bg-theme-sur2 p-4 rounded-xl border border-theme-bor">
            <div className="flex items-center gap-2.5 text-theme-txt2">
              <Building2 className="w-4 h-4 text-theme-txt3 shrink-0" />
              <span className="text-theme-txt font-medium">{contact.company || 'Empresa no registrada'}</span>
            </div>

            <div className="flex items-center gap-2.5 text-theme-txt2">
              <Briefcase className="w-4 h-4 text-theme-txt3 shrink-0" />
              <span className="text-theme-txt">{contact.position || 'Cargo no registrado'}</span>
            </div>

            <div className="flex items-center gap-2.5 text-theme-txt2">
              <Mail className="w-4 h-4 text-[#00e5a0] shrink-0" />
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="text-[#00e5a0] hover:underline">
                  {contact.email}
                </a>
              ) : (
                <span className="text-theme-txt3">Sin email</span>
              )}
            </div>

            <div className="flex items-center gap-2.5 text-theme-txt2">
              <Calendar className="w-4 h-4 text-theme-txt3 shrink-0" />
              <span>Conectado el: {contact.connected_on || 'Fecha desconocida'}</span>
            </div>

            {contact.linkedin_url && (
              <div className="pt-2 border-t border-theme-bor">
                <a
                  href={contact.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#2979ff] hover:underline font-medium"
                >
                  <span>Ver perfil en LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* CRM Status Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2">
              Estado del Prospecto / Pipeline
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ContactStatus)}
              className="w-full bg-theme-sur2 border border-theme-bor rounded-lg p-2.5 text-xs text-theme-txt outline-hidden focus:border-[#00e5a0] cursor-pointer"
            >
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st} className="bg-theme-sur text-theme-txt">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Notes Textarea */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2">
              Notas y Seguimiento
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe notas sobre la conversación, acuerdos o próximos pasos..."
              className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00e5a0] rounded-xl p-3 text-xs text-theme-txt placeholder-theme-txt3 outline-hidden transition-all resize-none font-sans"
            />
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-theme-bor flex items-center justify-between bg-theme-sur shrink-0">
          <button
            onClick={handleDelete}
            className="p-2 text-theme-txt3 hover:text-[#ff6d3b] hover:bg-theme-sur2 rounded-lg transition-colors cursor-pointer"
            title="Eliminar contacto"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-[#00e5a0] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Guardado</span>
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#00110b] bg-[#00e5a0] hover:bg-[#00e5a0]/90 disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-[#00e5a0]/15 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
