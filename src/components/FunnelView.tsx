'use client';

import React, { useState } from 'react';
import { Contact, ContactStats } from '@/lib/types';
import { Filter, UserCheck, Star, MessageSquare, ExternalLink } from 'lucide-react';

interface FunnelViewProps {
  stats: ContactStats | null;
  contacts: Contact[];
  onSelectContact: (c: Contact) => void;
  onOpenTemplates?: (c: Contact) => void;
}

export default function FunnelView({
  stats,
  contacts,
  onSelectContact,
  onOpenTemplates,
}: FunnelViewProps) {
  const [activeStage, setActiveStage] = useState<string>('all');

  const total = contacts.length;
  const byStage: Record<string, Contact[]> = {
    'Sin contactar': contacts.filter((c) => !c.status || c.status === 'Sin contactar'),
    'En contacto': contacts.filter((c) => c.status === 'En contacto'),
    'Oportunidad': contacts.filter((c) => c.status === 'Oportunidad'),
    'Cliente': contacts.filter((c) => c.status === 'Cliente'),
    'En pausa': contacts.filter((c) => c.status === 'En pausa'),
    'Descartado': contacts.filter((c) => c.status === 'Descartado'),
  };

  const stageCounts = {
    'Sin contactar': byStage['Sin contactar'].length,
    'En contacto': byStage['En contacto'].length,
    'Oportunidad': byStage['Oportunidad'].length,
    'Cliente': byStage['Cliente'].length,
  };

  const filteredContacts = activeStage === 'all' 
    ? contacts 
    : byStage[activeStage] || [];

  // Funnel steps calculation
  const funnelSteps = [
    {
      id: 'Sin contactar',
      title: '1. Base Sin Contactar',
      count: stageCounts['Sin contactar'],
      color: '#7d8fa8',
      description: 'Prospectos importados listos para primer mensaje',
    },
    {
      id: 'En contacto',
      title: '2. En Conversación',
      count: stageCounts['En contacto'],
      color: '#2979ff',
      description: 'Mensaje enviado / apertura de diálogo',
    },
    {
      id: 'Oportunidad',
      title: '3. Oportunidad / Interesado',
      count: stageCounts['Oportunidad'],
      color: '#ff6d3b',
      description: 'Reunión agendada o propuesta enviada',
    },
    {
      id: 'Cliente',
      title: '4. Cierre / Cliente Ganado',
      count: stageCounts['Cliente'],
      color: '#00a870',
      description: 'Venta de programa o servicio cerrada',
    },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-theme-bg">
      {/* Left side: Interactive Visual Funnel */}
      <div className="w-full md:w-96 p-4 sm:p-6 border-b md:border-b-0 md:border-r border-theme-bor overflow-y-auto space-y-4 shrink-0 bg-theme-sur/30">
        <div>
          <h3 className="font-bold text-base text-theme-txt flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#00a870]" />
            <span>Embudo de Conversión (Funnel)</span>
          </h3>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Haz clic en una etapa para filtrar y gestionar sus prospectos
          </p>
        </div>

        {/* Funnel Pipeline Cards */}
        <div className="space-y-2.5 pt-2">
          {funnelSteps.map((step) => {
            const pctOfTotal = total > 0 ? Math.round((step.count / total) * 100) : 0;
            const isSelected = activeStage === step.id;

            return (
              <div
                key={step.id}
                onClick={() => setActiveStage(isSelected ? 'all' : step.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group shadow-xs ${
                  isSelected
                    ? 'ring-2 ring-[#00a870] bg-theme-sur border-[#00a870] shadow-md'
                    : 'bg-theme-sur border-theme-bor hover:border-theme-bor2 hover:bg-theme-sur2'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-theme-txt flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: step.color }} />
                    <span>{step.title}</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-theme-txt">
                    {step.count.toLocaleString()}
                  </span>
                </div>

                <p className="text-[11px] text-theme-txt2 mb-2 line-clamp-1">{step.description}</p>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-theme-sur2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(pctOfTotal, 2)}%`,
                      backgroundColor: step.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-theme-txt3 mt-1.5">
                  <span>{pctOfTotal}% de la red</span>
                  <span className="text-[#00a870] group-hover:underline">
                    {isSelected ? '✓ Filtrando' : 'Ver prospectos →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Secondary Statuses */}
        <div className="pt-3 border-t border-theme-bor flex items-center justify-between text-xs text-theme-txt2">
          <button
            onClick={() => setActiveStage('En pausa')}
            className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
              activeStage === 'En pausa'
                ? 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]'
                : 'border-theme-bor hover:bg-theme-sur2'
            }`}
          >
            ⏸️ En Pausa ({byStage['En pausa'].length})
          </button>

          <button
            onClick={() => setActiveStage('Descartado')}
            className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
              activeStage === 'Descartado'
                ? 'bg-theme-sur2 text-theme-txt border-theme-bor2'
                : 'border-theme-bor hover:bg-theme-sur2'
            }`}
          >
            🚫 Descartados ({byStage['Descartado'].length})
          </button>
        </div>
      </div>

      {/* Right side: Filtered Stage Contacts List */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="p-4 border-b border-theme-bor bg-theme-sur flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-theme-txt">
              {activeStage === 'all' ? 'Todos los Contactos del Embudo' : `Prospectos en: ${activeStage}`}
            </span>
            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-theme-sur2 text-[#00a870] font-bold border border-theme-bor">
              {filteredContacts.length.toLocaleString()}
            </span>
          </div>

          {activeStage !== 'all' && (
            <button
              onClick={() => setActiveStage('all')}
              className="text-xs text-[#00a870] hover:underline cursor-pointer"
            >
              Mostrar todos
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-theme-txt2">
              <UserCheck className="w-10 h-10 text-theme-txt3 mb-2" />
              <p className="text-xs font-semibold text-theme-txt">No hay prospectos en esta etapa</p>
            </div>
          ) : (
            filteredContacts.slice(0, 100).map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectContact(c)}
                className="p-3.5 bg-theme-sur border border-theme-bor hover:border-theme-bor2 rounded-xl transition-all flex items-center justify-between gap-3 group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-theme-sur2 border border-theme-bor2 flex items-center justify-center font-bold text-[#00a870] text-xs shrink-0">
                    {(c.first_name[0] || '') + (c.last_name?.[0] || '')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-xs text-theme-txt group-hover:text-[#00a870] transition-colors truncate">
                        {c.first_name} {c.last_name || ''}
                      </h4>
                      {c.priority && c.priority > 1 && (
                        <span className="flex items-center text-[#f59e0b]">
                          {[...Array(c.priority)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-[#f59e0b]" />
                          ))}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-theme-txt2 truncate">{c.position || 'Sin cargo'}</p>
                    <p className="text-[10px] text-theme-txt3 truncate">{c.company || 'Sin empresa'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {onOpenTemplates && (
                    <button
                      onClick={() => onOpenTemplates(c)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#00a870] bg-[#00a870]/15 hover:bg-[#00a870]/25 rounded-lg border border-[#00a870]/30 flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Mensaje</span>
                    </button>
                  )}

                  {c.linkedin_url && (
                    <a
                      href={c.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-theme-txt2 hover:text-[#0a66c2] bg-theme-sur2 rounded-lg"
                      title="LinkedIn"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
