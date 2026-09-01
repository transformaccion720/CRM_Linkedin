'use client';

import React, { useState, useMemo } from 'react';
import { 
  X, ExternalLink, Calendar, Star, Building2, Briefcase, Mail, Phone, 
  Tag, Clock, Save, Edit3, MessageSquare, Check, User, Globe, AlertTriangle,
  UserCheck, Plus
} from 'lucide-react';
import { Contact, ContactStatus, TeamMember } from '@/lib/types';

interface ContactDrawerProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedContact: Contact) => void;
  onOpenTemplates?: (contact: Contact) => void;
  teamMembers?: TeamMember[];
}

export default function ContactDrawer({
  contact,
  isOpen,
  onClose,
  onUpdate,
  onOpenTemplates,
  teamMembers = [],
}: ContactDrawerProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [country, setCountry] = useState('Perú');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<ContactStatus>('Sin contactar');
  const [priority, setPriority] = useState<number>(1);
  const [postUrl, setPostUrl] = useState('');
  const [serviceNeeded, setServiceNeeded] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('Gabino');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    if (contact) {
      setFirstName(contact.first_name || '');
      setLastName(contact.last_name || '');
      setCompany(contact.company || '');
      setPosition(contact.position || '');
      setCountry(contact.country || 'Perú');
      setEmail(contact.email || '');
      setPhone(contact.phone || '');
      setStatus(contact.status);
      setPriority(contact.priority || 1);
      setPostUrl(contact.post_url || '');
      setServiceNeeded(contact.service_needed || '');
      setNotes(contact.notes || '');
      setFollowUpDate(contact.follow_up_date || '');
      setAssignedTo(contact.assigned_to || (teamMembers[0]?.name) || 'Gabino');
      setTags(contact.tags || []);
      setNewTagInput('');
      setSaveSuccess(false);
    }
  }, [contact, teamMembers]);

  if (!isOpen || !contact) return null;

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

  const handleSave = async () => {
    setSaving(true);
    try {
      let currentTags = [...tags];
      const pendingTag = newTagInput.trim();
      if (pendingTag && !currentTags.includes(pendingTag)) {
        currentTags.push(pendingTag);
        setTags(currentTags);
        setNewTagInput('');
      }

      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim() || contact.first_name,
          last_name: lastName.trim() || null,
          company: company.trim() || null,
          position: position.trim() || null,
          country: country.trim() || 'Perú',
          email: email.trim() || null,
          phone: phone.trim() || null,
          status,
          priority,
          post_url: postUrl.trim() || null,
          service_needed: serviceNeeded.trim() || null,
          notes,
          follow_up_date: followUpDate || null,
          assigned_to: assignedTo.trim() || contact.assigned_to || 'Gabino',
          performed_by: assignedTo.trim() || 'Comercial',
          tags: currentTags,
        }),
      });
      const data = await res.json();
      if (res.ok && data.contact) {
        onUpdate(data.contact);
        setSaveSuccess(true);
        // Persist confirmation without quick flickering (10 seconds)
        setTimeout(() => setSaveSuccess(false), 10000);
      }
    } catch (e) {
      console.error('Error guardando:', e);
    } finally {
      setSaving(false);
    }
  };

  const setQuickFollowUp = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setFollowUpDate(`${yyyy}-${mm}-${dd}`);
  };

  const isShared = contact.shared_with && contact.shared_with.length > 0;
  const isManuallyAdded = contact.source === 'BUSQUEDA_ACTIVA' || contact.source === 'PROSPECCION_DIRECTA';
  const ownerLabel = isManuallyAdded
    ? `Prospecto agregado por ${contact.assigned_to || 'el equipo'}`
    : `BD de ${contact.assigned_to || 'Kiara / Gabino'}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-theme-sur border-l border-theme-bor h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 overflow-y-auto">
        {/* Header */}
        <div className="p-4 px-6 border-b border-theme-bor flex items-center justify-between bg-theme-sur sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00a870]/10 text-[#00a870] flex items-center justify-center font-bold text-xs">
              {(firstName[0] || '') + (lastName[0] || '')}
            </div>
            <div>
              <h2 className="font-bold text-sm text-theme-txt">Ficha del Prospecto</h2>
              <span className="text-[10.5px] text-theme-txt3 font-medium">
                {ownerLabel}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-txt2 hover:text-theme-txt hover:bg-theme-sur2 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 flex-1">
          {/* Shared Contact Warning Alert */}
          {isShared && (
            <div className="p-3 bg-[#ff6d3b]/10 border border-[#ff6d3b]/30 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#ff6d3b]">
                <AlertTriangle className="w-4 h-4" />
                <span>Contacto Compartido</span>
              </div>
              <p className="text-theme-txt2 text-[11px]">
                Este prospecto también se encuentra en la base de:{' '}
                <span className="font-semibold text-theme-txt">{contact.shared_with?.join(', ')}</span>.
              </p>
            </div>
          )}

          {/* Action Buttons: Abrir Asistente de Mensajes + Ver LinkedIn */}
          <div className="flex items-center gap-2.5">
            {onOpenTemplates && (
              <button
                onClick={() => onOpenTemplates(contact)}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#0a66c2]/15 text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white border border-[#0a66c2]/30 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Abrir Asistente de Mensajes</span>
              </button>
            )}

            {contact.linkedin_url && (
              <a
                href={contact.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-theme-txt hover:text-[#0a66c2] bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor flex items-center gap-1.5 transition-all"
                title="Abrir perfil de LinkedIn en una nueva pestaña"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#0a66c2]" />
                <span>Ver LinkedIn</span>
              </a>
            )}
          </div>

          {/* Editable Personal, Company & Location Info */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-medium text-theme-txt2 mb-1 block">Nombre</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3 py-1.5 text-xs text-theme-txt outline-hidden"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-theme-txt2 mb-1 block">Apellidos</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3 py-1.5 text-xs text-theme-txt outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-theme-txt2 mb-1 flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-theme-txt3" />
                <span>Cargo / Posición</span>
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3 py-1.5 text-xs text-theme-txt outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-medium text-theme-txt2 mb-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-theme-txt3" />
                  <span>Empresa</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3 py-1.5 text-xs text-theme-txt outline-hidden"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-theme-txt2 mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-theme-txt3" />
                  <span>País / Ubicación</span>
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Perú"
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3 py-1.5 text-xs text-theme-txt outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-medium text-theme-txt2 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-theme-txt3" />
                  <span>Teléfono / WhatsApp</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+51 999 999 999"
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3 py-1.5 text-xs text-theme-txt outline-hidden"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-theme-txt2 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-theme-txt3" />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@empresa.com"
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3 py-1.5 text-xs text-theme-txt outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Tags (Etiquetas del Prospecto) */}
          <div>
            <label className="text-[11px] font-medium text-theme-txt2 mb-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3 text-theme-txt3" />
              <span>Etiquetas de Segmentación</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-[#2979ff]/15 text-[#2979ff] border border-[#2979ff]/30 font-semibold"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-red-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
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
                placeholder="Añadir etiqueta (ej. Agile, Decisor, Interesado) y presiona Enter..."
                className="flex-1 bg-theme-sur2 border border-theme-bor focus:border-[#2979ff] rounded-xl px-3 py-1.5 text-xs text-theme-txt outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor text-xs font-semibold text-theme-txt cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir</span>
              </button>
            </div>
          </div>

          {/* Status & Priority Stars */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-theme-txt2 mb-1 block">Estado del Lead</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContactStatus)}
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3 py-1.5 text-xs text-theme-txt outline-hidden"
              >
                <option value="Sin contactar">Sin contactar</option>
                <option value="En contacto">En contacto</option>
                <option value="Oportunidad">Oportunidad</option>
                <option value="Cliente">Cliente</option>
                <option value="En pausa">En pausa</option>
                <option value="Descartado">Descartado</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-theme-txt2 mb-1 block">Prioridad</label>
              <div className="flex items-center gap-1 py-1">
                {[1, 2, 3].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setPriority(star)}
                    className="p-1 text-theme-txt3 hover:text-[#f59e0b] cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        priority >= star ? 'text-[#f59e0b] fill-[#f59e0b]' : 'opacity-30'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Assigned To & Follow-up Agenda */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-theme-txt2 mb-1 flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-theme-txt3" />
                <span>Responsable Comercial</span>
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3 py-1.5 text-xs text-theme-txt outline-hidden"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-theme-txt2 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#ff6d3b]" />
                  <span>Fecha de Seguimiento</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQuickFollowUp(1)}
                    className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-[#ff6d3b]/15 text-[#ff6d3b] hover:bg-[#ff6d3b]/25 cursor-pointer"
                  >
                    +1d
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickFollowUp(3)}
                    className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-theme-sur2 text-theme-txt hover:bg-theme-sur3 cursor-pointer"
                  >
                    +3d
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickFollowUp(7)}
                    className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-theme-sur2 text-theme-txt hover:bg-theme-sur3 cursor-pointer"
                  >
                    +1sem
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#ff6d3b] rounded-xl px-3 py-1.5 text-xs text-theme-txt outline-hidden"
              />
            </div>
          </div>

          {/* Context Notes */}
          <div>
            <label className="text-[11px] font-medium text-theme-txt2 mb-1 block">Notas de Gestión Comercial</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe detalles de la conversación, objeciones o acuerdos..."
              className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl p-3 text-xs text-theme-txt outline-hidden resize-none"
            />
          </div>
        </div>

        {/* Sticky Save Footer */}
        <div className="p-4 px-6 border-t border-theme-bor bg-theme-sur sticky bottom-0 z-10 flex items-center justify-between shrink-0">
          <div>
            {saveSuccess ? (
              <span className="text-xs text-[#00a870] font-bold flex items-center gap-1 animate-in fade-in bg-[#00a870]/10 px-2.5 py-1 rounded-lg border border-[#00a870]/20">
                <Check className="w-4 h-4" />
                <span>¡Se guardó correctamente!</span>
              </span>
            ) : (
              <span className="text-[11px] text-theme-txt3">Cambios pendientes por guardar</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-theme-txt2 hover:text-theme-txt bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor transition-all cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#00a870] hover:bg-[#008f5f] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
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
