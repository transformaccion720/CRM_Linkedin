'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CommercialResource, TeamMember } from '@/lib/types';
import { FileText, Video, Image as ImageIcon, Link2, Download, Copy, ExternalLink, Plus, Trash2, Check, Search, UploadCloud, Eye, Sparkles, X, FileCheck, Loader2 } from 'lucide-react';

interface ResourcesDirectoryViewProps {
  currentUser: TeamMember | null;
}

export default function ResourcesDirectoryView({ currentUser }: ResourcesDirectoryViewProps) {
  const [resources, setResources] = useState<CommercialResource[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // New resource modal & Drag and Drop state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [uploadMode, setUploadMode] = useState<'FILE' | 'LINK'>('FILE');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'BROCHURE' | 'VIDEO' | 'FLYER' | 'PROPOSAL' | 'LINK'>('BROCHURE');
  const [newExternalLink, setNewExternalLink] = useState<string>('');
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const MAX_FILE_SIZE_MB = 20;

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/resources?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
      }
    } catch (e) {
      console.error('Error fetching resources:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [categoryFilter, search]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileProcess = (file: File) => {
    setFileError(null);
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`El archivo pesa ${(file.size / (1024 * 1024)).toFixed(1)}MB. El límite máximo es de ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSelectedFile({
        name: file.name,
        size: formatFileSize(file.size),
        dataUrl,
      });

      if (!newTitle) {
        // Auto name from file without extension
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setNewTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }

      // Auto-detect category
      if (file.type.includes('pdf')) {
        setNewCategory('BROCHURE');
      } else if (file.type.includes('image')) {
        setNewCategory('FLYER');
      }
    };
    reader.onerror = () => {
      setFileError('Error al leer el archivo. Intenta con otro formato.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleCopyLink = async (r: CommercialResource) => {
    const targetUrl = r.external_link || r.file_url || window.location.origin + `/api/resources?id=${r.id}`;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopiedId(r.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (e) {
      console.error('Error copying link:', e);
    }
  };

  const handleDownloadDirect = async (r: CommercialResource) => {
    setDownloadingId(r.id);
    try {
      if (r.external_link && !r.file_name) {
        window.open(r.external_link, '_blank', 'noopener,noreferrer');
        return;
      }

      const res = await fetch(`/api/resources?id=${r.id}`);
      if (res.ok) {
        const data = await res.json();
        const full = data.resource;
        if (full?.file_url) {
          const a = document.createElement('a');
          a.href = full.file_url;
          a.download = full.file_name || `${r.title}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else if (full?.external_link) {
          window.open(full.external_link, '_blank', 'noopener,noreferrer');
        }
      }
    } catch (e) {
      console.error('Error downloading:', e);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSaving(true);
    try {
      const payload: any = {
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        category: newCategory,
        created_by: currentUser?.name || 'Gabino',
      };

      if (uploadMode === 'FILE' && selectedFile) {
        payload.file_url = selectedFile.dataUrl;
        payload.file_name = selectedFile.name;
        payload.file_size = selectedFile.size;
      } else if (uploadMode === 'LINK' && newExternalLink) {
        payload.external_link = newExternalLink.trim();
      }

      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewTitle('');
        setNewDescription('');
        setNewExternalLink('');
        setSelectedFile(null);
        setFileError(null);
        fetchResources();
      }
    } catch (e) {
      console.error('Error creating resource:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResource = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${title}"?`)) return;

    try {
      const res = await fetch(`/api/resources?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error('Error deleting resource:', e);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'BROCHURE':
        return { label: 'Brochure PDF', icon: FileText, color: 'text-[#00a870] bg-[#00a870]/15 border-[#00a870]/30' };
      case 'VIDEO':
        return { label: 'Video Demo', icon: Video, color: 'text-[#ff6d3b] bg-[#ff6d3b]/15 border-[#ff6d3b]/30' };
      case 'FLYER':
        return { label: 'Flyer / Imagen', icon: ImageIcon, color: 'text-[#2979ff] bg-[#2979ff]/15 border-[#2979ff]/30' };
      case 'PROPOSAL':
        return { label: 'Propuesta / Deck', icon: Sparkles, color: 'text-[#a855f7] bg-[#a855f7]/15 border-[#a855f7]/30' };
      default:
        return { label: 'Enlace Web / Reunión', icon: Link2, color: 'text-[#f59e0b] bg-[#f59e0b]/15 border-[#f59e0b]/30' };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-theme-bg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-sur p-5 rounded-2xl border border-theme-bor">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00a870] font-bold bg-[#00a870]/10 px-2 py-0.5 rounded">
              Directorio de Material Comercial (Adjuntos hasta 20MB)
            </span>
            <span className="text-[10px] font-mono text-theme-txt3">{resources.length} recursos disponibles</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-theme-txt">
            Recursos, Archivos & Enlaces para Prospectos
          </h2>
          <p className="text-xs text-theme-txt2 mt-0.5">
            Sube brochures PDF, flyers e imágenes de hasta 20MB o comparte enlaces de videos y reuniones con 1 solo clic
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsModalOpen(true);
              setSelectedFile(null);
              setFileError(null);
            }}
            className="px-4 py-2.5 bg-[#00a870] hover:bg-[#00a870]/90 text-[#00110b] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#00a870]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Subir Archivo / Agregar Link</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-theme-sur border border-theme-bor p-3.5 rounded-xl flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'BROCHURE', 'VIDEO', 'FLYER', 'PROPOSAL', 'LINK'].map((cat) => {
            const isSelected = categoryFilter === cat;
            const labels: Record<string, string> = {
              all: 'Todos los recursos',
              BROCHURE: '📄 Brochures PDF',
              VIDEO: '🎥 Videos / Demos',
              FLYER: '🖼️ Flyers / Imágenes',
              PROPOSAL: '✨ Propuestas',
              LINK: '🔗 Enlaces / Reuniones',
            };

            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#00a870] text-[#00110b] shadow-xs'
                    : 'bg-theme-sur2 text-theme-txt2 hover:text-theme-txt border border-theme-bor'
                }`}
              >
                {labels[cat]}
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-theme-txt3 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, formato..."
            className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-lg pl-8 pr-3 py-1.5 text-xs text-theme-txt outline-hidden"
          />
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center p-12 text-xs text-theme-txt2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00a870] animate-ping" />
            <span>Cargando recursos comerciales...</span>
          </div>
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-theme-sur border border-theme-bor rounded-2xl p-12 text-center text-xs text-theme-txt2">
          <UploadCloud className="w-8 h-8 text-theme-txt3 mx-auto mb-2 opacity-50" />
          <p className="font-bold text-sm text-theme-txt">No hay recursos en esta categoría</p>
          <p className="mt-1">Arrastra un PDF o agrega enlaces de video para que tu equipo los descargue o comparta.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r) => {
            const badge = getCategoryBadge(r.category);
            const Icon = badge.icon;
            const isCopied = copiedId === r.id;
            const isDownloading = downloadingId === r.id;
            const isHostedFile = Boolean(r.file_name || (r as any).has_file);

            return (
              <div
                key={r.id}
                className="bg-theme-sur border border-theme-bor hover:border-theme-bor2 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${badge.color}`}>
                      <Icon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>

                    <button
                      onClick={() => handleDeleteResource(r.id, r.title)}
                      className="p-1 text-theme-txt3 hover:text-[#ff6d3b] rounded cursor-pointer"
                      title="Eliminar recurso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-theme-txt line-clamp-2 leading-snug">
                    {r.title}
                  </h3>

                  {r.description && (
                    <p className="text-xs text-theme-txt2 line-clamp-2">
                      {r.description}
                    </p>
                  )}

                  {isHostedFile && (
                    <div className="flex items-center gap-2 text-[10px] font-mono text-theme-txt3 bg-theme-sur2 px-2.5 py-1.5 rounded-lg border border-theme-bor">
                      <FileCheck className="w-3.5 h-3.5 text-[#00a870]" />
                      <span className="truncate flex-1">{r.file_name || 'Archivo adjunto'}</span>
                      {r.file_size && <span className="text-[#00a870] font-bold">{r.file_size}</span>}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-theme-bor space-y-2">
                  <div className="flex items-center justify-between text-[10.5px] font-mono text-theme-txt3">
                    <span>Por: {r.created_by}</span>
                    <span>{r.created_at}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {isHostedFile ? (
                      <button
                        type="button"
                        onClick={() => handleDownloadDirect(r)}
                        disabled={isDownloading}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-[#00a870] hover:bg-[#00a870]/90 text-[#00110b] flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        <span>{isDownloading ? 'Descargando...' : 'Descargar Archivo'}</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(r)}
                          className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-theme-sur2 hover:bg-theme-sur3 border border-theme-bor hover:border-[#00a870] flex items-center justify-center gap-1.5 text-theme-txt transition-all cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-[#00a870]" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? '¡Link Copiado!' : 'Copiar Link'}</span>
                        </button>

                        <a
                          href={r.external_link || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 rounded-xl text-xs font-bold bg-[#00a870]/15 text-[#00a870] hover:bg-[#00a870]/25 border border-[#00a870]/30 flex items-center justify-center gap-1 transition-all"
                        >
                          <span>Abrir</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Resource Modal with Drag & Drop */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-theme-sur border border-theme-bor rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-theme-txt animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            <div className="p-4 px-6 border-b border-theme-bor flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#00a870]" />
                <h3 className="font-bold text-sm text-theme-txt">Agregar Recurso Comercial</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-theme-txt2 hover:text-theme-txt rounded-lg hover:bg-theme-sur2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="p-6 space-y-4 text-xs overflow-y-auto">
              {/* Toggle Mode: File Upload vs Link */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-theme-sur2 rounded-xl border border-theme-bor">
                <button
                  type="button"
                  onClick={() => setUploadMode('FILE')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    uploadMode === 'FILE'
                      ? 'bg-[#00a870] text-[#00110b] shadow-xs'
                      : 'text-theme-txt2 hover:text-theme-txt'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Adjuntar Archivo (PDF / Flyer)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadMode('LINK')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    uploadMode === 'LINK'
                      ? 'bg-[#00a870] text-[#00110b] shadow-xs'
                      : 'text-theme-txt2 hover:text-theme-txt'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Enlace / Video / Reunión</span>
                </button>
              </div>

              {/* Upload Mode 1: Drag & Drop File */}
              {uploadMode === 'FILE' && (
                <div>
                  <label className="text-[11px] font-mono uppercase text-theme-txt2 block mb-1.5">
                    Archivo Adjunto (Hasta {MAX_FILE_SIZE_MB}MB)
                  </label>
                  
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                      isDragging
                        ? 'border-[#00a870] bg-[#00a870]/10'
                        : selectedFile
                        ? 'border-[#00a870]/50 bg-theme-sur2'
                        : 'border-theme-bor hover:border-theme-bor2 bg-theme-sur2/60'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.ppt,.pptx"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileProcess(e.target.files[0]);
                        }
                      }}
                    />

                    {selectedFile ? (
                      <div className="space-y-1">
                        <div className="w-10 h-10 rounded-xl bg-[#00a870]/15 text-[#00a870] mx-auto flex items-center justify-center font-bold">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-xs text-theme-txt truncate max-w-xs mx-auto">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] font-mono text-[#00a870] font-bold">
                          {selectedFile.size} • Listo para guardar
                        </p>
                        <span className="text-[10px] text-theme-txt3 block pt-1 hover:underline">
                          Haz clic para cambiar archivo
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <UploadCloud className="w-8 h-8 text-[#00a870] mx-auto" />
                        <p className="font-bold text-xs text-theme-txt">
                          Arrastra tu archivo aquí o haz clic para explorar
                        </p>
                        <p className="text-[10.5px] text-theme-txt3">
                          Soporta PDF, PNG, JPG, WebP, Word, PPT (Máx. {MAX_FILE_SIZE_MB}MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {fileError && (
                    <p className="text-xs text-[#ff6d3b] mt-1.5 font-medium">{fileError}</p>
                  )}
                </div>
              )}

              {/* Upload Mode 2: External Link */}
              {uploadMode === 'LINK' && (
                <div>
                  <label className="text-[11px] font-mono uppercase text-theme-txt2 block mb-1">
                    Enlace Externo (Video / Loom / YouTube / Calendly / Canva) *
                  </label>
                  <input
                    type="url"
                    required={uploadMode === 'LINK'}
                    value={newExternalLink}
                    onChange={(e) => setNewExternalLink(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... o https://loom.com/share/..."
                    className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs text-theme-txt outline-hidden font-mono"
                  />
                </div>
              )}

              {/* Common Fields: Title & Category */}
              <div>
                <label className="text-[11px] font-mono uppercase text-theme-txt2 block mb-1">
                  Título del Recurso *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Brochure Oficial Gestión Ágil 2026..."
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl px-3.5 py-2 text-xs text-theme-txt outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-theme-txt2 block mb-1">
                  Categoría del Material
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-theme-sur2 border border-theme-bor rounded-xl px-3 py-2 text-xs text-theme-txt outline-hidden cursor-pointer"
                >
                  <option value="BROCHURE">📄 Brochure (PDF)</option>
                  <option value="VIDEO">🎥 Video Demo / Loom / YouTube</option>
                  <option value="FLYER">🖼️ Flyer / Imagen</option>
                  <option value="PROPOSAL">✨ Propuesta / Deck Comercial</option>
                  <option value="LINK">🔗 Enlace Web / Reunión</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-theme-txt2 block mb-1">
                  Descripción / Instrucciones para el Comercial (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Explica en qué momento de la conversación enviar este material..."
                  className="w-full bg-theme-sur2 border border-theme-bor focus:border-[#00a870] rounded-xl p-3 text-xs text-theme-txt outline-hidden resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-theme-bor">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-theme-txt2 hover:bg-theme-sur2 border border-theme-bor cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving || (uploadMode === 'FILE' && !selectedFile && !newExternalLink)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-[#00110b] bg-[#00a870] hover:bg-[#00a870]/90 disabled:opacity-50 cursor-pointer shadow-md shadow-[#00a870]/20 flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando archivo...</span>
                    </>
                  ) : (
                    <span>Guardar en Directorio</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
