'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, KeyRound, Check, RefreshCw, AlertCircle, ExternalLink, ShieldCheck, Sparkles, Globe, Cpu 
} from 'lucide-react';
import { ProspectingSettings } from '@/lib/types';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function ApiSettingsModal({
  isOpen,
  onClose,
  onSaved,
}: ApiSettingsModalProps) {
  const [googleKey, setGoogleKey] = useState<string>('');
  const [openRouterKey, setOpenRouterKey] = useState<string>('');
  const [openRouterModel, setOpenRouterModel] = useState<string>('google/gemini-2.5-flash');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  
  const [testResults, setTestResults] = useState<{
    google_ok?: boolean;
    google_message?: string;
    openrouter_ok?: boolean;
    openrouter_message?: string;
  } | null>(null);

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Fetch current settings on open
  useEffect(() => {
    if (isOpen) {
      setTestResults(null);
      setSaveSuccess(false);
      setLoading(true);
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          setGoogleKey(data.google_places_api_key || '');
          setOpenRouterKey(data.openrouter_api_key || '');
          setOpenRouterModel(data.openrouter_model || 'google/gemini-2.5-flash');
        })
        .catch((e) => console.error('Error loading API settings:', e))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnections = async () => {
    setTesting(true);
    setTestResults(null);
    try {
      const res = await fetch('/api/settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google_places_api_key: googleKey,
          openrouter_api_key: openRouterKey,
        }),
      });
      const data = await res.json();
      setTestResults(data);
    } catch (e: any) {
      setTestResults({
        google_ok: false,
        google_message: `Error al probar conexión: ${e.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google_places_api_key: googleKey,
          openrouter_api_key: openRouterKey,
          openrouter_model: openRouterModel,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        if (onSaved) onSaved();
        setTimeout(() => {
          setSaveSuccess(false);
          onClose();
        }, 1200);
      }
    } catch (e) {
      console.error('Error saving API settings:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
      <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-theme-txt animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 px-6 border-b border-theme-bor flex items-center justify-between bg-theme-sur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2979ff]/15 flex items-center justify-center text-[#2979ff]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-theme-txt">Conexiones & APIs de Prospección</h3>
              <p className="text-xs text-theme-txt2">
                Credenciales seguras para Google Places y OpenRouter IA
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
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {loading ? (
            <div className="py-12 flex items-center justify-center text-xs text-theme-txt2 gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#2979ff]" />
              <span>Cargando configuración de APIs...</span>
            </div>
          ) : (
            <>
              {/* 1. Google Places API */}
              <div className="p-4 bg-theme-sur2/70 border border-theme-bor rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#2979ff]" />
                    <label className="text-xs font-bold text-theme-txt uppercase tracking-wider font-mono">
                      Google Places API Key
                    </label>
                  </div>
                  <a
                    href="https://console.cloud.google.com/google/maps-apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-[#2979ff] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Obtener clave en Google Cloud</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <input
                  type="text"
                  value={googleKey}
                  onChange={(e) => setGoogleKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-theme-sur border border-theme-bor focus:border-[#2979ff] rounded-xl px-3.5 py-2.5 text-xs text-theme-txt font-mono outline-hidden"
                />

                <div className="text-[11px] text-theme-txt3 leading-relaxed">
                  💡 <b>Crédito mensual gratis:</b> Google otorga $200 USD todos los meses para Places API. Te permite buscar hasta 4,000 negocios en Perú a costo $0.
                </div>
              </div>

              {/* 2. OpenRouter API Key & Model */}
              <div className="p-4 bg-theme-sur2/70 border border-theme-bor rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#00a870]" />
                    <label className="text-xs font-bold text-theme-txt uppercase tracking-wider font-mono">
                      OpenRouter API Key (Inteligencia & Mensajes)
                    </label>
                  </div>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-[#00a870] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Ver mis claves en OpenRouter</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <input
                  type="password"
                  value={openRouterKey}
                  onChange={(e) => setOpenRouterKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full bg-theme-sur border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2.5 text-xs text-theme-txt font-mono outline-hidden"
                />

                {/* Model Selector */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-xs text-theme-txt2 font-medium">Modelo para Análisis & Mensajes:</span>
                  <select
                    value={openRouterModel}
                    onChange={(e) => setOpenRouterModel(e.target.value)}
                    className="bg-theme-sur border border-theme-bor focus:border-[#00a870] rounded-lg px-2.5 py-1 text-xs font-bold text-theme-txt outline-hidden cursor-pointer"
                  >
                    <option value="google/gemini-2.5-flash">Google Gemini 2.5 Flash (Ultra rápido y económico)</option>
                    <option value="deepseek/deepseek-chat">DeepSeek Chat V3 (Excelente rendimiento)</option>
                    <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Máxima persuasión)</option>
                  </select>
                </div>

                <div className="text-[11px] text-theme-txt3 leading-relaxed">
                  ⚡ Con tus $5 en OpenRouter tienes suficiente para calificar y redactar mensajes para más de <b>25,000 prospectos</b>.
                </div>
              </div>

              {/* Test Results Banner */}
              {testResults && (
                <div className="p-3.5 rounded-xl border space-y-2 bg-theme-sur border-theme-bor">
                  <div className="text-xs font-bold text-theme-txt flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#00a870]" />
                    <span>Diagnóstico de Conectividad:</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-2">
                      <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${testResults.google_ok ? 'bg-[#00a870]' : 'bg-[#ff6d3b]'}`} />
                      <div>
                        <span className="font-semibold text-theme-txt">Google Places: </span>
                        <span className={testResults.google_ok ? 'text-[#00a870]' : 'text-[#ff6d3b]'}>
                          {testResults.google_message}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${testResults.openrouter_ok ? 'bg-[#00a870]' : 'bg-[#ff6d3b]'}`} />
                      <div>
                        <span className="font-semibold text-theme-txt">OpenRouter IA: </span>
                        <span className={testResults.openrouter_ok ? 'text-[#00a870]' : 'text-[#ff6d3b]'}>
                          {testResults.openrouter_message}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-theme-bor flex items-center justify-between bg-theme-sur shrink-0">
          <button
            onClick={handleTestConnections}
            disabled={testing || loading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor text-theme-txt flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Probando...' : 'Probar Conexiones'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-theme-txt2 hover:text-theme-txt bg-theme-sur2 transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#00110b] bg-[#00a870] hover:bg-[#008f5f] flex items-center gap-1.5 shadow-md shadow-[#00a870]/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Guardado!</span>
                </>
              ) : (
                <span>Guardar Credenciales</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
