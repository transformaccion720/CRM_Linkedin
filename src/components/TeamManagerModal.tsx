'use client';

import React, { useState, memo } from 'react';
import { X, Users, UserPlus, Trash2, Shield, Mail, Check, AlertCircle } from 'lucide-react';
import { TeamMember } from '@/lib/types';

interface TeamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  onRefreshTeam: () => void;
}

const PRESET_COLORS = ['#00a870', '#2979ff', '#ff6d3b', '#a855f7', '#ec4899', '#f59e0b'];

interface AddMemberFormProps {
  onSuccess: () => void;
}

// Isolated form subcomponent: typing inside inputs only re-renders this form
const AddMemberForm = memo(function AddMemberForm({ onSuccess }: AddMemberFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Comercial B2B');
  const [color, setColor] = useState('#00a870');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || null, role: role.trim(), color }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al agregar miembro');
      }

      setName('');
      setEmail('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAddMember} className="p-4 bg-theme-sur2/70 border border-theme-bor rounded-xl space-y-3">
      <span className="text-xs font-bold text-theme-txt flex items-center gap-1.5">
        <UserPlus className="w-4 h-4 text-[#00a870]" />
        <span>Añadir Nuevo Miembro al Equipo</span>
      </span>

      {error && (
        <div className="p-2.5 rounded-lg bg-[#ff6d3b]/10 text-xs text-[#ff6d3b] border border-[#ff6d3b]/30">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
            Nombre *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Andrea, Carlos"
            className="w-full bg-theme-sur border border-theme-bor focus:border-[#00a870] rounded-lg px-2.5 py-1.5 text-xs text-theme-txt outline-hidden"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="comercial@empresa.com"
            className="w-full bg-theme-sur border border-theme-bor focus:border-[#00a870] rounded-lg px-2.5 py-1.5 text-xs text-theme-txt outline-hidden"
          />
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
            Rol / Especialidad
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Ej. Consultoría, Ágil"
            className="w-full bg-theme-sur border border-theme-bor focus:border-[#00a870] rounded-lg px-2.5 py-1.5 text-xs text-theme-txt outline-hidden"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-theme-txt2 font-mono">Color:</span>
          <div className="flex items-center gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1.5 rounded-lg text-xs font-bold text-[#00110b] bg-[#00a870] hover:bg-[#00a870]/90 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
        >
          {loading ? 'Guardando...' : 'Añadir Miembro'}
        </button>
      </div>

      {success && (
        <p className="text-xs text-[#00a870] flex items-center gap-1 font-medium">
          <Check className="w-3.5 h-3.5" />
          <span>¡Miembro agregado correctamente!</span>
        </p>
      )}
    </form>
  );
});

function TeamManagerModalInner({
  isOpen,
  onClose,
  teamMembers,
  onRefreshTeam,
}: TeamManagerModalProps) {
  if (!isOpen) return null;

  const handleDeleteMember = async (id: string, memberName: string) => {
    if (id === 'gabino') {
      alert('No se puede eliminar al usuario administrador.');
      return;
    }
    if (!confirm(`¿Eliminar al miembro "${memberName}" del equipo comercial?`)) return;

    try {
      const res = await fetch(`/api/team?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefreshTeam();
      }
    } catch (e) {
      console.error('Error deleting member:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col text-theme-txt animate-in fade-in zoom-in-95 duration-150 max-h-[85vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-theme-bor flex items-center justify-between bg-theme-sur shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00a870]/15 flex items-center justify-center text-[#00a870]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-theme-txt">Equipo Comercial y Perfiles</h3>
              <p className="text-xs text-theme-txt2">Gestiona los miembros, sus roles y sus bases de contactos</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-theme-txt2 hover:text-theme-txt rounded-lg hover:bg-theme-sur2 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Add member form isolated component */}
          <AddMemberForm onSuccess={onRefreshTeam} />

          {/* Members list */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-theme-txt3 block">
              Miembros Registrados ({teamMembers.length})
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teamMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 bg-theme-sur border border-theme-bor rounded-xl flex items-start justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs"
                      style={{ backgroundColor: m.color || '#00a870' }}
                    >
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-theme-txt truncate">{m.name}</h4>
                        {m.id === 'gabino' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#00a870]/15 text-[#00a870] font-bold">
                            Admin
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-theme-txt2 truncate">{m.role}</p>

                      {m.email && (
                        <p className="text-[10px] text-theme-txt3 truncate flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span>{m.email}</span>
                        </p>
                      )}

                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-theme-sur2 border border-theme-bor text-[10.5px] font-mono text-theme-txt">
                        <span>Base de prospectos:</span>
                        <b className="text-[#00a870] font-bold">{(m.contact_count || 0).toLocaleString()}</b>
                      </div>
                    </div>
                  </div>

                  {m.id !== 'gabino' && (
                    <button
                      onClick={() => handleDeleteMember(m.id, m.name)}
                      className="text-theme-txt3 hover:text-[#ff6d3b] p-1 rounded transition-colors cursor-pointer"
                      title="Eliminar miembro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-theme-bor flex items-center justify-end bg-theme-sur shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-theme-txt2 hover:text-theme-txt bg-theme-sur2 hover:bg-theme-sur3 transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

const TeamManagerModal = memo(TeamManagerModalInner);
export default TeamManagerModal;
