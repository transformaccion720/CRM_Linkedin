'use client';

import React, { useState, memo } from 'react';
import { X, User, Lock, KeyRound, Check, AlertCircle, Loader2, LogOut, Shield } from 'lucide-react';
import { TeamMember } from '@/lib/types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: TeamMember;
  onUpdateUser: (updatedUser: TeamMember) => void;
  onLogout: () => void;
}

function ProfileModalInner({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
}: ProfileModalProps) {
  const [name, setName] = useState(currentUser.name || '');
  const [role, setRole] = useState(currentUser.role || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword !== confirmPassword) {
      setError('La nueva contraseña y la confirmación no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name: name.trim(),
          role: role.trim(),
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar perfil');
      }

      onUpdateUser(data.user);
      localStorage.setItem('crm_auth_user', JSON.stringify(data.user));
      setSuccess('¡Perfil y seguridad actualizados con éxito!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-theme-txt animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 px-6 border-b border-theme-bor flex items-center justify-between bg-theme-sur shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs"
              style={{ backgroundColor: currentUser.color || '#00a870' }}
            >
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-sm text-theme-txt">Mi Perfil & Seguridad</h3>
              <p className="text-xs text-theme-txt2">{currentUser.email || 'Usuario comercial'}</p>
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
        <form onSubmit={handleSaveProfile} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="p-3 rounded-xl bg-[#ff6d3b]/10 border border-[#ff6d3b]/30 text-xs text-[#ff6d3b] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-[#00a870]/10 border border-[#00a870]/30 text-xs text-[#00a870] flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-3">
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-theme-txt3 block font-bold">
              Información de Usuario
            </span>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
                Nombre de Visualización
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs text-theme-txt outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
                Rol / Especialidad
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs text-theme-txt outline-hidden font-medium"
              />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-theme-bor">
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-theme-txt3 flex items-center gap-1.5 font-bold">
              <KeyRound className="w-3.5 h-3.5 text-[#2979ff]" />
              <span>Cambiar Contraseña (Opcional)</span>
            </span>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
                Contraseña Actual
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingresa tu contraseña actual..."
                className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs text-theme-txt outline-hidden font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña..."
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3 py-2 text-xs text-theme-txt outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-theme-txt2 block mb-1">
                  Confirmar Nueva
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetir nueva..."
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3 py-2 text-xs text-theme-txt outline-hidden font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#ff6d3b] hover:bg-[#ff6d3b]/10 border border-[#ff6d3b]/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#00110b] bg-[#00a870] hover:bg-[#00a870]/90 disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-[#00a870]/20 transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const ProfileModal = memo(ProfileModalInner);
export default ProfileModal;

