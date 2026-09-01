'use client';

import React, { useState } from 'react';
import { 
  X, UserPlus, Building2, Briefcase, Mail, Phone, Link2, Star, Calendar, 
  Tag, Check, Loader2, UserCheck, Globe, Flame, ExternalLink, HelpCircle
} from 'lucide-react';
import { Contact, ContactStatus, ContactSource, TeamMember } from '@/lib/types';

interface NewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newContact: Contact) => void;
  teamMembers?: TeamMember[];
}

export default function NewContactModal({
  isOpen,
  onClose,
  onSuccess,
  teamMembers = [],
}: NewContactModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [country, setCountry] = useState('Perú');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [status, setStatus] = useState<ContactStatus>('Sin contactar');
  const [priority, setPriority] = useState<number>(3); // 3 stars by default for active search
  const [source, setSource] = useState<ContactSource>('BUSQUEDA_ACTIVA');
  const [postUrl, setPostUrl] = useState('');
  const [serviceNeeded, setServiceNeeded] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('Gabino');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let finalTags = [...tags];
      const pending = tagInput.trim();
      if (pending && !finalTags.includes(pending)) {
        finalTags.push(pending);
      }

      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim() || null,
          company: company.trim() || null,
          position: position.trim() || null,
          country: country.trim() || 'Perú',
          email: email.trim() || null,
          phone: phone.trim() || null,
          linkedin_url: linkedinUrl.trim() || null,
          status,
          priority,
          source,
          post_url: postUrl.trim() || null,
          service_needed: serviceNeeded.trim() || null,
          notes: notes.trim() || null,
          follow_up_date: followUpDate || null,
          tags: finalTags,
          assigned_to: assignedTo.trim() || 'Gabino',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar');
      }

      onSuccess(data.contact);
      onClose();

      // Reset form
      setFirstName('');
      setLastName('');
      setCompany('');
      setPosition('');
      setCountry('Perú');
      setEmail('');
      setPhone('');
      setLinkedinUrl('');
      setStatus('Sin contactar');
      setPriority(3);
      setSource('BUSQUEDA_ACTIVA');
      setPostUrl('');
      setServiceNeeded('');
      setNotes('');
      setFollowUpDate('');
      setTags([]);
      setTagInput('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear contacto';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 border-b border-theme-bor flex items-center justify-between bg-theme-sur shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00a870]/10 text-[#00a870]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-theme-txt">
                Registrar Nuevo Prospecto
              </h2>
              <p className="text-xs text-theme-txt2">
                Agrega un contacto manual o con señal de búsqueda activa en LinkedIn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-txt2 hover:text-theme-txt hover:bg-theme-sur2 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-[#ff6d3b]/10 border border-[#ff6d3b]/30 text-[#ff6d3b] text-xs font-medium">
              {error}
            </div>
          )}

          {/* Lead Source Selector (Señal de Búsqueda vs Directo) */}
          <div className="p-3.5 rounded-2xl bg-theme-sur2/70 border border-theme-bor space-y-2.5">
            <label className="text-xs font-bold text-theme-txt flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#ff6d3b]" />
                <span>Origen / Señal de Compra</span>
              </span>
              <span className="text-[10px] font-mono text-theme-txt3 font-normal">
                {source === 'BUSQUEDA_ACTIVA' ? '🔥 Lead Caliente' : '👤 Prospección'}
              </span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSource('BUSQUEDA_ACTIVA');
                  setPriority(3);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  source === 'BUSQUEDA_ACTIVA'
                    ? 'bg-[#ff6d3b]/15 border-[#ff6d3b] text-[#ff6d3b] shadow-xs font-bold'
                    : 'bg-theme-sur border-theme-bor text-theme-txt2 hover:text-theme-txt'
                }`}
              >
                <Flame className="w-4 h-4 shrink-0 text-[#ff6d3b]" />
                <div>
                  <div className="text-xs">Búsqueda Activa</div>
                  <div className="text-[10px] text-theme-txt3 font-normal">Publicó necesidad</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSource('PROSPECCION_DIRECTA');
                  setPriority(2);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  source === 'PROSPECCION_DIRECTA'
                    ? 'bg-[#00a870]/15 border-[#00a870] text-[#00a870] shadow-xs font-bold'
                    : 'bg-theme-sur border-theme-bor text-theme-txt2 hover:text-theme-txt'
                }`}
              >
                <UserCheck className="w-4 h-4 shrink-0 text-[#00a870]" />
                <div>
                  <div className="text-xs">Prospección Directa</div>
                  <div className="text-[10px] text-theme-txt3 font-normal">Añadido manual</div>
                </div>
              </button>
            </div>

            {/* If BUSQUEDA_ACTIVA: show Post URL and Service Needed */}
            {source === 'BUSQUEDA_ACTIVA' && (
              <div className="pt-2.5 border-t border-theme-bor space-y-2 animate-in fade-in duration-150">
                <div>
                  <label className="text-[11px] font-medium text-theme-txt2 mb-1 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 text-[#ff6d3b]" />
                    <span>Link de la Publicación / Post de LinkedIn (Opcional):</span>
                  </label>
                  <input
                    type="url"
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/posts/..."
                    className="w-full bg-theme-sur border border-theme-bor focus:border-[#ff6d3b] rounded-xl px-3 py-1.5 text-xs text-theme-txt outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-theme-txt2 mb-1 block">
                    Servicio / Necesidad que busca en su post:
                  </label>
                  <input
                    type="text"
                    value={serviceNeeded}
                    onChange={(e) => setServiceNeeded(e.target.value)}
                    placeholder="Ej. Busca taller de liderazgo / consultoría ágil..."
                    className="w-full bg-theme-sur border border-theme-bor focus:border-[#ff6d3b] rounded-xl px-3 py-1.5 text-xs text-theme-txt outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-theme-txt mb-1 block">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ej. Juan"
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs text-theme-txt outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-theme-txt mb-1 block">
                Apellidos
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ej. Pérez"
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs text-theme-txt outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-theme-txt mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-theme-txt3" />
                <span>Cargo / Posición</span>
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Ej. Gerente de RRHH / Líder TI"
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs text-theme-txt outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-theme-txt mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-theme-txt3" />
                <span>Empresa</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ej. Alicorp"
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs text-theme-txt outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-theme-txt mb-1 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-[#0a66c2]" />
                <span>URL de Perfil LinkedIn</span>
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/usuario"
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs text-theme-txt outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-theme-txt mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-theme-txt3" />
                <span>Teléfono / WhatsApp</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+51 987 654 321"
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs text-theme-txt outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-theme-txt mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-theme-txt3" />
                <span>Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@empresa.com"
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs text-theme-txt outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-theme-txt mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-theme-txt3" />
                <span>Responsable Comercial</span>
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3 py-2 text-xs text-theme-txt outline-hidden"
              >
                {teamMembers.length > 0 ? (
                  teamMembers.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.role})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Gabino">Gabino</option>
                    <option value="Kiara Zavala Peralta">Kiara Zavala Peralta</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-theme-txt mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-theme-txt3" />
                <span>Fecha de Seguimiento</span>
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3 py-1.5 text-xs text-theme-txt outline-hidden"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-theme-txt mb-1 block">
              Notas iniciales / Contexto de la oportunidad
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles sobre lo que busca o cómo abordarlo..."
              className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl p-3 text-xs text-theme-txt outline-hidden resize-none"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-theme-bor flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-theme-txt2 hover:text-theme-txt bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#00a870] hover:bg-[#008f5f] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Guardar Prospecto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
