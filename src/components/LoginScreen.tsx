'use client';

import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { TeamMember } from '@/lib/types';

interface LoginScreenProps {
  onLoginSuccess: (user: TeamMember) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Save user in localStorage
      localStorage.setItem('crm_auth_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0f18] text-[#f0f4f8] relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00a870]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#2979ff]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#111723] border border-[#1e293b] rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00a870]/20 to-[#2979ff]/20 border border-[#00a870]/30 shadow-lg mb-2">
            <ShieldCheck className="w-7 h-7 text-[#00a870]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            CRM <span className="text-[#00a870]">LINKEDIN</span>
          </h1>
          <p className="text-xs text-[#7d8fa8]">
            Ingresa con tu cuenta comercial para acceder a tu base de prospectos
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-[#ff6d3b]/10 border border-[#ff6d3b]/30 text-xs text-[#ff6d3b] flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#7d8fa8] block">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#7d8fa8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-correo@empresa.com"
                className="w-full bg-[#182232] border border-[#233044] focus:border-[#00a870] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#475569] outline-hidden transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#7d8fa8] block">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#7d8fa8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#182232] border border-[#233044] focus:border-[#00a870] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#475569] outline-hidden transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-[#00110b] bg-gradient-to-r from-[#00a870] to-[#00c985] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#00a870]/20 transition-all cursor-pointer mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Iniciar Sesión Comercial</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-4 border-t border-[#1e293b] text-center">
          <p className="text-[10.5px] text-[#475569] font-mono flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#00a870]" />
            <span>Base Segura en Neon Postgres & Vercel SSL</span>
          </p>
        </div>
      </div>
    </div>
  );
}
