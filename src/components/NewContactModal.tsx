'use client';

import React, { useState } from 'react';
import { Contact, ContactStatus, TeamMember } from '@/lib/types';
import { X, UserPlus, Save, Loader2, Star, UserCheck } from 'lucide-react';

interface NewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newContact: Contact) => void;
  teamMembers?: TeamMember[];
}

export default function NewContactModal({ isOpen, onClose, onSuccess, teamMembers = [] }: NewContactModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState<ContactStatus>('Sin contactar');
  const [priority, setPriority] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('Gabino');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim() || null,
          linkedin_url: linkedinUrl.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          company: company.trim() || null,
          position: position.trim() || null,
          connected_on: new Date().toISOString().split('T')[0],
          status,
          priority,
          notes: notes.trim() || null,
          assigned_to: assignedTo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear prospecto');
      }

      onSuccess(data.contact);
      onClose();
      setFirstName('');
      setLastName('');
      setLinkedinUrl('');
      setEmail('');
      setPhone('');
      setCompany('');
      setPosition('');
      setNotes('');
      setPriority(1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-theme-txt animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 px-6 border-b border-theme-bor flex items-center justify-between bg-theme-sur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00a870]/15 flex items-center justify-center text-[#00a870]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-theme-txt">Registrar Nuevo Prospecto</h3>
              <p className="text-xs text-theme-txt2">Añade un contacto manual asignándolo a un miembro del equipo</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-theme-txt2 hover:text-theme-txt rounded-lg hover:bg-theme-sur2 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="p-3 rounded-lg bg-[#ff6d3b]/10 border border-[#ff6d3b]/30 text-xs text-[#ff6d3b]">
              {error}
            </div>
          )}

          {/* Member assignment */}
          <div className="p-3 bg-theme-sur2 rounded-xl border border-theme-bor">
            <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 flex items-center gap-1.5 mb-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#00a870]" />
              <span>Miembro Comercial Responsable</span>
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full bg-theme-sur border border-theme-bor rounded-lg px-3 py-1.5 text-xs text-theme-txt font-semibold outline-hidden cursor-pointer"
            >
              {teamMembers.length > 0 ? (
                teamMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.role})
                  </option>
                ))
              ) : (
                <option value="Gabino">Gabino (Director Comercial)</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ej. Carlos"
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-lg px-3 py-1.5 text-xs text-theme-txt outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
                Apellido
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ej. Mendoza"
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-lg px-3 py-1.5 text-xs text-theme-txt outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
                Empresa
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ej. Minera Chinalco"
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-lg px-3 py-1.5 text-xs text-theme-txt outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
                Cargo
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Ej. Gerente de Operaciones"
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-lg px-3 py-1.5 text-xs text-theme-txt outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ej. cmendoza@empresa.com"
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-lg px-3 py-1.5 text-xs text-theme-txt outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
                Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. +51 987 654 321"
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-lg px-3 py-1.5 text-xs text-theme-txt outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
              URL Perfil LinkedIn
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="Ej. https://www.linkedin.com/in/carlos-mendoza"
              className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-lg px-3 py-1.5 text-xs text-theme-txt outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
                Estado Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContactStatus)}
                className="w-full bg-theme-sur2 border border-theme-bor rounded-lg px-2.5 py-1.5 text-xs text-theme-txt outline-hidden cursor-pointer"
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
              <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
                Prioridad
              </label>
              <div className="flex items-center gap-1 h-[34px] px-2 bg-theme-sur2 border border-theme-bor rounded-lg">
                {[1, 2, 3].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setPriority(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= priority ? 'text-[#f59e0b] fill-[#f59e0b]' : 'text-theme-txt3'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
              Notas iniciales
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Acuerdos, contexto o motivos de contacto..."
              className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl p-3 text-xs text-theme-txt outline-hidden resize-none font-sans"
            />
          </div>

          <div className="pt-3 border-t border-theme-bor flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-theme-txt2 hover:text-theme-txt bg-theme-sur2 hover:bg-theme-sur3 transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-[#00110b] bg-[#00a870] hover:bg-[#00a870]/90 disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-[#00a870]/20 transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{loading ? 'Guardando...' : 'Guardar Prospecto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
