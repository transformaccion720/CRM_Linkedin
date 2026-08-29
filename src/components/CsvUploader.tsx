'use client';

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface CsvUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function cleanLinkedInCSVText(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => {
      let l = line.trim();
      if (!l) return '';
      // Remove trailing semicolons (e.g. from Excel or custom exports)
      if (l.endsWith(';')) l = l.slice(0, -1).trim();
      // If line was wrapped in quotes with doubled inner quotes: ^" ... "$
      if (l.startsWith('"') && l.endsWith('"')) {
        const unescaped = l.slice(1, -1).replace(/""/g, '"');
        return unescaped;
      }
      return l;
    })
    .join('\n');
}

export default function CsvUploader({ isOpen, onClose, onSuccess }: CsvUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatusMsg(null);
    }
  };

  const handleProcessImport = async () => {
    if (!file) return;
    setLoading(true);
    setStatusMsg(null);
    setProgressMsg('Leyendo y limpiando archivo CSV...');

    try {
      const text = await file.text();
      const cleaned = cleanLinkedInCSVText(text);

      Papa.parse(cleaned, {
        header: true,
        skipEmptyLines: 'greedy',
        complete: async (results) => {
          try {
            const rawRows = results.data as Record<string, string>[];
            if (!rawRows || rawRows.length === 0) {
              throw new Error('El archivo CSV está vacío.');
            }

            setProgressMsg(`Subiendo ${rawRows.length.toLocaleString()} contactos a Neon DB...`);

            // Send in chunks of 300 rows to prevent timeouts and optimize SQL batch queries
            const batchSize = 300;
            let totalInserted = 0;
            let totalSkipped = 0;

            for (let i = 0; i < rawRows.length; i += batchSize) {
              const batch = rawRows.slice(i, i + batchSize);
              const res = await fetch('/api/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows: batch }),
              });

              const data = await res.json();
              if (!res.ok) {
                throw new Error(data.error || 'Error durante la importación');
              }

              totalInserted += data.inserted || 0;
              totalSkipped += data.skipped || 0;
              setProgressMsg(
                `Guardando... ${Math.min(i + batchSize, rawRows.length).toLocaleString()} de ${rawRows.length.toLocaleString()} contactos`
              );
            }

            setStatusMsg({
              text: `¡Importación completada con éxito! ${totalInserted.toLocaleString()} contactos guardados en Neon DB (${totalSkipped} omitidos).`,
              type: 'success',
            });

            setTimeout(() => {
              onSuccess();
              onClose();
            }, 1800);
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error desconocido al procesar';
            setStatusMsg({ text: message, type: 'error' });
          } finally {
            setLoading(false);
            setProgressMsg('');
          }
        },
        error: (err: Error) => {
          setLoading(false);
          setProgressMsg('');
          setStatusMsg({ text: `Error al leer CSV: ${err.message}`, type: 'error' });
        },
      });
    } catch (e: unknown) {
      setLoading(false);
      setProgressMsg('');
      const msg = e instanceof Error ? e.message : 'Error al leer el archivo';
      setStatusMsg({ text: msg, type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-theme-txt">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-theme-txt2 hover:text-theme-txt transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#00e5a0]/15 flex items-center justify-center text-[#00e5a0]">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-theme-txt">Importar Conexiones de LinkedIn</h3>
            <p className="text-xs text-theme-txt2">Sube tu archivo Connections.csv descargado de LinkedIn</p>
          </div>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-theme-bor hover:border-[#00e5a0] rounded-xl p-8 text-center cursor-pointer transition-colors bg-theme-sur2/40"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="w-8 h-8 mx-auto mb-2 text-theme-txt2" />
          {file ? (
            <div className="text-sm font-medium text-[#00e5a0]">{file.name}</div>
          ) : (
            <>
              <p className="text-sm font-medium text-theme-txt">Haz clic para seleccionar o arrastra tu archivo CSV</p>
              <p className="text-xs text-theme-txt2 mt-1">Exportación oficial de conexiones de LinkedIn</p>
            </>
          )}
        </div>

        {progressMsg && loading && (
          <div className="mt-3 text-xs text-[#00e5a0] flex items-center gap-2 font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span>{progressMsg}</span>
          </div>
        )}

        {statusMsg && (
          <div
            className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-xs ${
              statusMsg.type === 'success'
                ? 'bg-[#00e5a0]/10 text-[#00e5a0] border border-[#00e5a0]/20'
                : 'bg-[#ff6d3b]/10 text-[#ff6d3b] border border-[#ff6d3b]/20'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-theme-txt2 hover:text-theme-txt bg-theme-sur2 hover:bg-theme-sur3 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleProcessImport}
            disabled={!file || loading}
            className="px-5 py-2 rounded-lg text-xs font-semibold text-[#00110b] bg-[#00e5a0] hover:bg-[#00e5a0]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-[#00e5a0]/20 transition-all cursor-pointer"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
            {loading ? 'Importando a Neon DB...' : 'Iniciar Importación'}
          </button>
        </div>
      </div>
    </div>
  );
}
