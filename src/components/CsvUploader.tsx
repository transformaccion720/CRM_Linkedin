'use client';

import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2, Sparkles } from 'lucide-react';

interface CsvUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CsvUploader({ isOpen, onClose, onSuccess }: CsvUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<{ newAdded: number; updatedExisting: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  function cleanLinkedInCSVText(rawText: string): string {
    const lines = rawText.split(/\r?\n/);
    const cleanedLines: string[] = [];
    for (const line of lines) {
      let l = line.trim();
      if (!l) continue;
      l = l.replace(/;+$/, '');
      cleanedLines.push(l);
    }
    return cleanedLines.join('\n');
  }

  function parseCSVRobust(text: string): string[][] {
    const clean = cleanLinkedInCSVText(text);
    const lines = clean.split('\n');
    const result: string[][] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const row: string[] = [];
      let inQuotes = false;
      let cur = '';

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          cur = '';
        } else {
          cur += char;
        }
      }
      row.push(cur.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

      if (row.length >= 3) {
        result.push(row);
      }
    }
    return result;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setStats(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setProgress(5);

    try {
      const text = await file.text();
      const rows = parseCSVRobust(text);

      if (rows.length <= 1) {
        throw new Error('El archivo CSV está vacío o no contiene filas con contactos válidos.');
      }

      // Check header
      let dataRows = rows;
      const firstRowStr = rows[0].join(' ').toLowerCase();
      if (firstRowStr.includes('first') || firstRowStr.includes('nombre') || firstRowStr.includes('url')) {
        dataRows = rows.slice(1);
      }

      const totalRows = dataRows.length;
      const CHUNK_SIZE = 150;
      let totalNewAdded = 0;
      let totalUpdatedExisting = 0;
      let totalSkipped = 0;

      for (let i = 0; i < totalRows; i += CHUNK_SIZE) {
        const chunk = dataRows.slice(i, i + CHUNK_SIZE);
        const res = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: chunk }),
        });

        const resData = await res.json();
        if (!res.ok) {
          throw new Error(resData.error || 'Error al procesar lote');
        }

        totalNewAdded += resData.newlyInserted ?? resData.inserted ?? 0;
        totalUpdatedExisting += resData.existingUpdated ?? 0;
        totalSkipped += resData.skipped || 0;

        const currentPct = Math.min(95, Math.round(((i + chunk.length) / totalRows) * 100));
        setProgress(currentPct);
      }

      setProgress(100);
      setStats({
        newAdded: totalNewAdded,
        updatedExisting: totalUpdatedExisting,
        skipped: totalSkipped,
      });

      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido al subir CSV';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-theme-txt animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 px-6 border-b border-theme-bor flex items-center justify-between bg-theme-sur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00e5a0]/15 flex items-center justify-center text-[#00e5a0]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-theme-txt">Importar Base de Contactos LinkedIn</h3>
              <p className="text-xs text-theme-txt2">Detección inteligente de duplicados automática</p>
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
        <div className="p-6 space-y-5">
          <div className="border-2 border-dashed border-theme-bor hover:border-[#00e5a0]/50 rounded-xl p-6 text-center transition-all bg-theme-sur2/40">
            <FileSpreadsheet className="w-10 h-10 text-[#00e5a0] mx-auto mb-3 opacity-80" />
            <p className="text-xs font-semibold text-theme-txt mb-1">
              {file ? file.name : 'Selecciona tu archivo Connections.csv de LinkedIn'}
            </p>
            <p className="text-[11px] text-theme-txt2 mb-4">
              Exportación estándar de LinkedIn o archivo con columnas: Nombre, Apellido, URL, Email, Empresa, Cargo, Teléfono
            </p>

            <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#00e5a0] text-[#00110b] font-bold text-xs rounded-xl shadow-md hover:bg-[#00e5a0]/90 transition-all cursor-pointer">
              <span>{file ? 'Cambiar archivo' : 'Elegir archivo CSV'}</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>

          {/* Duplicates notice */}
          <div className="p-3 rounded-xl bg-theme-sur2 border border-theme-bor text-[11px] text-theme-txt2 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#00e5a0] shrink-0 mt-0.5" />
            <p>
              <b className="text-theme-txt">Filtro inteligente activo:</b> Si subes una base actualizada, los contactos ya registrados <b className="text-[#00e5a0]">no perderán sus notas ni su estado en el pipeline</b>; solo se añadirán los nuevos prospectos.
            </p>
          </div>

          {/* Progress bar */}
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-theme-txt2">
                <span className="flex items-center gap-1.5 font-medium text-theme-txt">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00e5a0]" />
                  Procesando e insertando en Neon DB...
                </span>
                <span className="font-mono">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-theme-sur2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00e5a0] transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success summary */}
          {stats && (
            <div className="p-4 rounded-xl bg-[#00e5a0]/10 border border-[#00e5a0]/30 text-xs text-theme-txt space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-[#00e5a0]">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Importación finalizada con éxito!</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-theme-sur p-2 rounded-lg border border-theme-bor">
                  <span className="text-theme-txt2 block">Nuevos agregados:</span>
                  <span className="text-sm font-bold text-[#00e5a0]">+{stats.newAdded}</span>
                </div>
                <div className="bg-theme-sur p-2 rounded-lg border border-theme-bor">
                  <span className="text-theme-txt2 block">Ya existentes (sin alterar):</span>
                  <span className="text-sm font-bold text-[#2979ff]">{stats.updatedExisting}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3.5 rounded-xl bg-[#ff6d3b]/10 border border-[#ff6d3b]/30 text-xs text-theme-txt flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#ff6d3b] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-theme-bor flex items-center justify-between bg-theme-sur shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-theme-txt2 hover:text-theme-txt bg-theme-sur2 hover:bg-theme-sur3 transition-all cursor-pointer"
          >
            {stats ? 'Cerrar' : 'Cancelar'}
          </button>

          {!stats && (
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#00110b] bg-[#00e5a0] hover:bg-[#00e5a0]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-[#00e5a0]/20 transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>{loading ? 'Importando...' : 'Iniciar Importación'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
