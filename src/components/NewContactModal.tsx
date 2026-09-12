'use client';

import React, { useState, memo } from 'react';
import { 
  X, UserPlus, Building2, Briefcase, Mail, Phone, Link2, Star, Calendar, 
  Tag, Check, Loader2, UserCheck, Globe, ExternalLink, HelpCircle
} from 'lucide-react';
import { Contact, ContactStatus, ContactSource, TeamMember, BusinessSegment } from '@/lib/types';
import { detectBusinessSegment } from '@/lib/segmentation';

interface NewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newContact: Contact) => void;
  teamMembers?: TeamMember[];
}

function NewContactModalInner({
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
  const [businessSegment, setBusinessSegment] = useState<BusinessSegment>('B2B');
  const [status, setStatus] = useState<ContactStatus>('Prospecto identificado');
  const [priority, setPriority] = useState<number>(3); // 1, 2, or 3 stars
  const [postUrl, setPostUrl] = useState('');
  const [serviceNeeded, setServiceNeeded] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('Gabino');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const B2B_STAGES: { value: ContactStatus; label: string }[] = [
    { value: 'Prospecto identificado', label: '1. Prospecto Identificado' },
    { value: 'Contactado', label: '2. Contactado' },
    { value: 'Conversación iniciada', label: '3. Conversación Iniciada' },
    { value: 'Discovery / reunión', label: '4. Discovery / Reunión' },
    { value: 'Oportunidad calificada', label: '5. Oportunidad Calificada' },
    { value: 'Propuesta enviada', label: '6. Propuesta Enviada' },
    { value: 'Negociación', label: '7. Negociación' },
    { value: 'Ganada', label: '8. Ganada / Cerrada' },
    { value: 'Perdida', label: '9. Perdida' },
    { value: 'Pausada', label: '10. Pausada' },
  ];

  const B2C_STAGES: { value: ContactStatus; label: string }[] = [
    { value: 'Sin contactar', label: 'Sin contactar' },
    { value: 'En contacto', label: 'En contacto' },
    { value: 'Seguimiento', label: 'Seguimiento' },
    { value: 'Oportunidad', label: 'Oportunidad' },
    { value: 'Cliente', label: 'Cliente' },
    { value: 'En pausa', label: 'En pausa' },
    { value: 'Descartado', label: 'Descartado' },
  ];

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

  const setQuickFollowUp = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setFollowUpDate(`${yyyy}-${mm}-${dd}`);
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
          source: 'BUSQUEDA_ACTIVA', // Automatically marked as Nuevo Prospecto agregado recientemente
          post_url: postUrl.trim() || null,
          service_needed: serviceNeeded.trim() || null,
          notes: notes.trim() || null,
          follow_up_date: followUpDate || null,
          tags: finalTags,
          assigned_to: assignedTo.trim() || 'Gabino',
          business_segment: businessSegment,
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
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
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
                Agrega un nuevo prospecto para prospección o seguimiento comercial
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

          {/* Clasificación Comercial Inicial (Grid 2x2 Perfecto y Encajado) */}
          <div className="p-4 rounded-2xl bg-theme-sur2/70 border border-theme-bor">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* 1. Segmento Comercial */}
              <div>
                <label className="text-xs font-bold text-theme-txt block mb-1.5">
                  Línea / Segmento Comercial:
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-theme-sur p-1 rounded-xl border border-theme-bor">
                  <button
                    type="button"
                    onClick={() => {
                      setBusinessSegment('B2B');
                      setStatus('Prospecto identificado');
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      businessSegment === 'B2B'
                        ? 'bg-[#2979ff] text-white shadow-xs'
                        : 'text-theme-txt2 hover:text-theme-txt'
                    }`}
                  >
                    <span>🏢</span>
                    <span>B2B Corporativo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBusinessSegment('B2C');
                      setStatus('Sin contactar');
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      businessSegment === 'B2C'
                        ? 'bg-[#00a870] text-white shadow-xs'
                        : 'text-theme-txt2 hover:text-theme-txt'
                    }`}
                  >
                    <span>👤</span>
                    <span>B2C Alumnos</span>
                  </button>
                </div>
              </div>

              {/* 2. Responsable Asignado */}
              <div>
                <label className="text-xs font-bold text-theme-txt block mb-1.5">
                  Responsable Comercial:
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-theme-sur border border-theme-bor focus:border-[#00a870] rounded-xl px-3 py-2 text-xs text-theme-txt outline-hidden font-medium"
                >
                  {teamMembers.length > 0 ? (
                    teamMembers.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.role || 'Comercial'})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Gabino">Gabino (Director General)</option>
                      <option value="Kiara Zavala Peralta">Kiara Zavala Peralta</option>
                    </>
                  )}
                </select>
              </div>

              {/* 3. Estado Inicial según Segmento */}
              <div>
                <label className="text-xs font-bold text-theme-txt block mb-1.5">
                  Estado Inicial ({businessSegment}):
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContactStatus)}
                  className="w-full bg-theme-sur border border-theme-bor focus:border-[#00a870] rounded-xl px-3 py-2 text-xs text-theme-txt outline-hidden font-medium cursor-pointer"
                >
                  {(businessSegment === 'B2B' ? B2B_STAGES : B2C_STAGES).map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Prioridad Comercial */}
              <div>
                <label className="text-xs font-bold text-theme-txt block mb-1.5">
                  Nivel de Prioridad:
                </label>
                <div className="grid grid-cols-3 gap-1 bg-theme-sur p-1 rounded-xl border border-theme-bor">
                  {[
                    { val: 1, label: 'Normal (1⭐)', short: 'Normal' },
                    { val: 2, label: 'Media (2⭐)', short: 'Media' },
                    { val: 3, label: 'Alta (3⭐)', short: 'Alta' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setPriority(item.val)}
                      className={`py-1.5 px-1 rounded-lg text-center text-xs transition-all cursor-pointer font-semibold flex items-center justify-center gap-1 ${
                        priority === item.val
                          ? 'bg-theme-sur2 text-[#f59e0b] border border-[#f59e0b]/40 font-bold shadow-xs'
                          : 'text-theme-txt2 hover:text-theme-txt'
                      }`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          priority >= item.val ? 'text-[#f59e0b] fill-[#f59e0b]' : 'opacity-30'
                        }`}
                      />
                      <span className="text-[11px] truncate">{item.short}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
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
              <label className="text-xs font-semibold text-theme-txt mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-theme-txt3" />
                  <span>Cargo / Posición</span>
                </span>
                {/recurso|humano|rrhh|talento|desarrollo organizacional/i.test(position) && (
                  <span className="text-[9px] font-mono text-[#2979ff] bg-[#2979ff]/10 px-1.5 py-0.2 rounded font-semibold">
                    RRHH $\rightarrow$ B2B
                  </span>
                )}
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => {
                  const newPos = e.target.value;
                  setPosition(newPos);
                  setBusinessSegment(detectBusinessSegment(newPos));
                }}
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

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-theme-txt flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#ff6d3b]" />
                  <span>Fecha de Seguimiento (Opcional)</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQuickFollowUp(1)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ff6d3b]/15 text-[#ff6d3b] hover:bg-[#ff6d3b]/25 cursor-pointer transition-colors"
                  >
                    +1d
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickFollowUp(3)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-theme-sur text-theme-txt hover:bg-theme-sur3 border border-theme-bor cursor-pointer transition-colors"
                  >
                    +3d
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickFollowUp(7)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-theme-sur text-theme-txt hover:bg-theme-sur3 border border-theme-bor cursor-pointer transition-colors"
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

          {/* Optional Post URL / Need context */}
          <div className="p-3 rounded-xl bg-theme-sur2/50 border border-theme-bor space-y-2">
            <div>
              <label className="text-[11px] font-medium text-theme-txt2 mb-1 flex items-center gap-1">
                <ExternalLink className="w-3 h-3 text-[#0a66c2]" />
                <span>Link de Publicación / Post de LinkedIn (Opcional):</span>
              </label>
              <input
                type="url"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://www.linkedin.com/posts/..."
                className="w-full bg-theme-sur border border-theme-bor focus:border-[#00a870] rounded-xl px-3 py-1.5 text-xs text-theme-txt outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-theme-txt2 mb-1 block">
                Notas / Servicio que busca o contexto:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalles sobre la necesidad, conversación o acuerdos..."
                className="w-full bg-theme-sur border border-theme-bor focus:border-[#00a870] rounded-xl p-2.5 text-xs text-theme-txt outline-hidden resize-none"
              />
            </div>
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

const NewContactModal = memo(NewContactModalInner);
export default NewContactModal;
