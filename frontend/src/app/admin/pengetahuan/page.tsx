"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  Archive,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  UploadCloud,
  AlertCircle,
  Filter,
  Layers,
  FileText,
  ShieldCheck,
  RefreshCw,
  X,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  aiService,
  KnowledgeDocument,
  KnowledgeDocumentDetail,
  KnowledgeSourceType,
  KnowledgeDocumentStatus,
  KnowledgeDocumentCreate,
} from "@/services/ai";

const SOURCE_TYPE_LABELS: Record<KnowledgeSourceType, { label: string; color: string }> = {
  REGULATION: { label: "Pergub / Regulasi", color: "bg-[#EAF2F9] text-[#315F86] border-[#BDD8EF]" },
  SOP: { label: "SOP Fasilitas TPS3R", color: "bg-[#E7F4EA] text-[#276749] border-[#BCE1C7]" },
  CDOA: { label: "Kesepakatan CDOA", color: "bg-[#E8F0E9] text-[#1D3F35] border-[#D7E4D9]" },
  EDUCATIONAL: { label: "Panduan Edukasi", color: "bg-[#FFF4D9] text-[#98631C] border-[#F7E1A0]" },
};

const DEFAULT_SAMPLE_DOCS: KnowledgeDocument[] = [
  {
    id: "doc-pergub-47-2019",
    title: "Peraturan Gubernur Bali No. 47 Tahun 2019 tentang Pengelolaan Sampah Berbasis Sumber",
    source_type: "REGULATION",
    destination_id: null,
    organization_id: null,
    cdoa_id: null,
    is_public: true,
    version: "1.0",
    status: "PUBLISHED",
    checksum: "8a4f9b23e1d5c7614f8a0e8c7b6a5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c",
    total_chunks: 4,
    created_by: "system_admin",
    created_at: "2026-10-29T10:00:00Z",
    updated_at: "2026-10-29T10:00:00Z",
  },
  {
    id: "doc-sop-tps3r-tebesaya",
    title: "SOP Operasional Pemilahan & Pengolahan TPS3R Tebesaya Ubud",
    source_type: "SOP",
    destination_id: "dest-ubud-tebesaya",
    organization_id: null,
    cdoa_id: null,
    is_public: true,
    version: "1.2",
    status: "PUBLISHED",
    checksum: "5c8d3e2a1b0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d",
    total_chunks: 3,
    created_by: "system_admin",
    created_at: "2026-10-29T11:30:00Z",
    updated_at: "2026-10-29T11:30:00Z",
  },
  {
    id: "doc-cdoa-sukawati-kaja",
    title: "Aturan Operasional Kebersihan Banjar Kaja Desa Adat Sukawati (CDOA-V1.2)",
    source_type: "CDOA",
    destination_id: "sa-sukawati-kaja",
    organization_id: null,
    cdoa_id: "cdoa-sukawati-kaja-v1",
    is_public: true,
    version: "1.2",
    status: "PUBLISHED",
    checksum: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    total_chunks: 3,
    created_by: "system_admin",
    created_at: "2026-10-30T08:00:00Z",
    updated_at: "2026-10-30T08:00:00Z",
  },
];

export default function AdminKnowledgePage() {
  const toast = useToast();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Ingestion Modal State
  const [showIngestModal, setShowIngestModal] = useState<boolean>(false);
  const [ingestForm, setIngestForm] = useState<KnowledgeDocumentCreate>({
    title: "",
    source_type: "SOP",
    destination_id: "",
    version: "1.0",
    is_public: true,
    content_raw: "",
  });
  const [isIngesting, setIsIngesting] = useState<boolean>(false);

  // Inspector Modal State
  const [inspectDoc, setInspectDoc] = useState<KnowledgeDocumentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await aiService.listKnowledge();
      if (data && data.length > 0) {
        setDocuments(data);
        setIsUsingFallback(false);
      } else {
        setDocuments(DEFAULT_SAMPLE_DOCS);
        setIsUsingFallback(true);
      }
    } catch {
      setDocuments(DEFAULT_SAMPLE_DOCS);
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleIngestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestForm.title.trim() || !ingestForm.content_raw.trim()) {
      toast.error("Validasi Gagal", "Judul dan isi dokumen wajib diisi.");
      return;
    }

    setIsIngesting(true);
    try {
      const created = await aiService.createKnowledgeDocument({
        ...ingestForm,
        destination_id: ingestForm.destination_id?.trim() || undefined,
      });

      toast.success(
        "Dokumen Berhasil Diindeks",
        `"${created.title}" berhasil dipecah menjadi ${created.total_chunks} chunk untuk RAG EcoGuide.`
      );

      setShowIngestModal(false);
      setIngestForm({
        title: "",
        source_type: "SOP",
        destination_id: "",
        version: "1.0",
        is_public: true,
        content_raw: "",
      });
      fetchDocuments();
    } catch (err: any) {
      toast.error(
        "Gagal Mengindeks Dokumen",
        err.message || "Terjadi kesalahan saat memproses chunking dokumen."
      );
    } finally {
      setIsIngesting(false);
    }
  };

  const handleInspect = async (doc: KnowledgeDocument) => {
    setLoadingDetail(true);
    try {
      const detail = await aiService.getKnowledgeDetail(doc.id);
      setInspectDoc(detail);
    } catch {
      // Mock chunks for preview if detail call fails or fallback mode
      setInspectDoc({
        ...doc,
        chunks: [
          {
            id: `chk-1-${doc.id.slice(0, 6)}`,
            document_id: doc.id,
            chunk_index: 0,
            section_title: "# Bab I: Ketentuan & Standar Penerimaan",
            content: `Ketentuan operasional pengelolaan sampah di kawasan ini merujuk pada standar baku mutu lingkungan. Setiap entitas wajib memilah sesuai kesepakatan dan jadwal yang ditetapkan.`,
            token_count: 32,
          },
          {
            id: `chk-2-${doc.id.slice(0, 6)}`,
            document_id: doc.id,
            chunk_index: 1,
            section_title: "# Bab II: Alur & Jadwal Penjemputan",
            content: `Penjemputan anorganik dilakukan secara rutin dengan SLA maksimal 24 jam. Setiap pelanggaran penolakan material dicatat dalam logbook digital Kedas.`,
            token_count: 28,
          },
        ],
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggleStatus = async (doc: KnowledgeDocument) => {
    const nextStatus: KnowledgeDocumentStatus = doc.status === "PUBLISHED" ? "RETIRED" : "PUBLISHED";
    try {
      await aiService.updateKnowledgeStatus(doc.id, nextStatus);
      toast.info(
        "Status Diperbarui",
        `Dokumen "${doc.title}" diubah statusnya menjadi ${nextStatus}.`
      );
      fetchDocuments();
    } catch (err: any) {
      toast.error(
        "Gagal Mengubah Status",
        err.message || "Koneksi API gagal."
      );
    }
  };

  const handleDelete = async (doc: KnowledgeDocument) => {
    if (!confirm(`Hapus dokumen "${doc.title}" beserta seluruh chunk RAG-nya?`)) return;
    try {
      await aiService.deleteKnowledgeDocument(doc.id);
      toast.success(
        "Dokumen Dihapus",
        `Dokumen "${doc.title}" berhasil dihapus dari basis pengetahuan RAG.`
      );
      fetchDocuments();
    } catch (err: any) {
      toast.error(
        "Gagal Menghapus Dokumen",
        err.message || "Koneksi API gagal."
      );
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.checksum.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.destination_id && doc.destination_id.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = filterType === "ALL" || doc.source_type === filterType;
      const matchesStatus = filterStatus === "ALL" || doc.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [documents, searchQuery, filterType, filterStatus]);

  // Real-time chunk estimator for ingestion modal
  const estimatedChunks = useMemo(() => {
    if (!ingestForm.content_raw.trim()) return 0;
    const parts = ingestForm.content_raw.split(/\n(?=#{1,4}\s+|Pasal\s+\d+|Bab\s+[IVXLCDM]+)/);
    return parts.filter((p) => p.trim().length >= 15).length || 1;
  }, [ingestForm.content_raw]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            RAG Knowledge Base & Document Provenance (GAP-007)
          </div>
          <h1 className="text-2xl font-bold text-brand-900 tracking-tight">
            Basis Pengetahuan & Regulasi Kawasan Kedas
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Kelola dokumen SOP TPS3R, Perarem Banjar, dan Pergub 47/2019 yang digunakan oleh EcoGuide untuk menjawab pertanyaan warga secara terverifikasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchDocuments}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Segarkan
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowIngestModal(true)}
            className="flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-4 h-4" />
            Unggah / Tambah Dokumen
          </Button>
        </div>
      </div>

      {/* Fallback Banner */}
      {isUsingFallback && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Menampilkan basis dokumen pengetahuan default (Mode Mock / Cache Aktif).
            </span>
          </div>
          <button
            onClick={fetchDocuments}
            className="font-semibold text-amber-800 hover:text-amber-950 underline shrink-0 ml-2"
          >
            Hubungkan API
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul dokumen, hash SHA-256, atau ID kawasan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Source Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-brand-900 font-medium"
          >
            <option value="ALL">Semua Jenis Sumber</option>
            <option value="REGULATION">Pergub / Regulasi</option>
            <option value="SOP">SOP TPS3R</option>
            <option value="CDOA">Kesepakatan CDOA</option>
            <option value="EDUCATIONAL">Edukasi Warga</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-brand-900 font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="PUBLISHED">PUBLISHED (Aktif)</option>
            <option value="RETIRED">RETIRED (Arsip)</option>
            <option value="DRAFT">DRAFT</option>
          </select>
        </div>
      </div>

      {/* Documents Table View */}
      <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-700 mx-auto" />
            <p className="text-xs text-text-secondary">Memuat indeks dokumen pengetahuan...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-text-muted mx-auto" />
            <h3 className="font-semibold text-brand-900 text-sm">Tidak ada dokumen ditemukan</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Tidak ada dokumen pengetahuan yang cocok dengan filter atau kata kunci pencarian.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-100/60 border-b border-border text-brand-900 font-semibold">
                <tr>
                  <th className="py-3 px-4">Judul Dokumen & Scope</th>
                  <th className="py-3 px-3">Jenis Sumber</th>
                  <th className="py-3 px-3">Versi</th>
                  <th className="py-3 px-3">Chunk RAG</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Hash Checksum</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredDocuments.map((doc) => {
                  const typeMeta = SOURCE_TYPE_LABELS[doc.source_type] || {
                    label: doc.source_type,
                    color: "bg-sand-100 text-brand-900 border-border",
                  };
                  return (
                    <tr key={doc.id} className="hover:bg-sand-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-brand-900 max-w-xs">
                        <div className="font-semibold text-xs leading-snug line-clamp-2">{doc.title}</div>
                        <div className="text-[11px] text-text-muted flex items-center gap-1.5 mt-0.5">
                          <Layers className="w-3 h-3 text-brand-700" />
                          <span>Scope: {doc.destination_id || "Seluruh Bali (Global)"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${typeMeta.color}`}
                        >
                          {typeMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-text-secondary text-[11px]">
                        v{doc.version}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sand-200/60 text-brand-900 font-bold font-mono text-[11px]">
                          <FileCode className="w-3 h-3 text-brand-700" />
                          {doc.total_chunks} chunks
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            doc.status === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-800"
                              : doc.status === "RETIRED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[10px] text-text-muted max-w-[120px] truncate" title={doc.checksum}>
                        {doc.checksum.slice(0, 12)}...
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => handleInspect(doc)}
                            title="Inspeksi Chunk & Kutipan RAG"
                            className="p-1.5 rounded-md text-brand-700 hover:bg-brand-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(doc)}
                            title={doc.status === "PUBLISHED" ? "Arsipkan (RETIRED)" : "Aktifkan (PUBLISHED)"}
                            className="p-1.5 rounded-md text-amber-700 hover:bg-amber-100 transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(doc)}
                            title="Hapus Dokumen"
                            className="p-1.5 rounded-md text-rose-600 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ingest New Document Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-brand-700" />
                <h3 className="text-base font-bold text-brand-900">
                  Ingestion Dokumen Pengetahuan Baru (RAG)
                </h3>
              </div>
              <button
                onClick={() => setShowIngestModal(false)}
                className="p-1 text-text-muted hover:text-brand-900 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIngestSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-brand-900 mb-1">
                  Judul Dokumen / Regulasi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SOP Pemilahan TPS3R Ubud v1.0"
                  value={ingestForm.title}
                  onChange={(e) => setIngestForm({ ...ingestForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-brand-900 mb-1">
                    Jenis Sumber *
                  </label>
                  <select
                    value={ingestForm.source_type}
                    onChange={(e) =>
                      setIngestForm({ ...ingestForm, source_type: e.target.value as KnowledgeSourceType })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="SOP">SOP Fasilitas TPS3R</option>
                    <option value="REGULATION">Pergub / Perda</option>
                    <option value="CDOA">Kesepakatan CDOA</option>
                    <option value="EDUCATIONAL">Panduan Edukasi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-brand-900 mb-1">
                    Scope ID Kawasan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Kosongkan untuk Global"
                    value={ingestForm.destination_id || ""}
                    onChange={(e) => setIngestForm({ ...ingestForm, destination_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-brand-900 mb-1">
                    Versi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1.0"
                    value={ingestForm.version}
                    onChange={(e) => setIngestForm({ ...ingestForm, version: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-brand-900">
                    Isi Konten Dokumen (Markdown / Teks SOP) *
                  </label>
                  <span className="text-[11px] text-text-muted">
                    Estimasi Chunk: <strong>{estimatedChunks} bagian</strong>
                  </span>
                </div>
                <textarea
                  rows={8}
                  required
                  placeholder={`Gunakan heading markdown (# Bab I, ## Pasal 2) untuk chunking otomatis.\n\nContoh:\n# Bab I: Prinsip Pemilahan\nSetiap rumah tangga wajib memilah sampah menjadi organik, anorganik, dan residu.\n\n# Bab II: Jadwal TPS3R\nPenjemputan organik dilakukan setiap Senin dan Rabu.`}
                  value={ingestForm.content_raw}
                  onChange={(e) => setIngestForm({ ...ingestForm, content_raw: e.target.value })}
                  className="w-full p-3 font-mono text-xs rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                />
                <p className="text-[10px] text-text-muted mt-1">
                  Kedas secara otomatis melakukan hashing SHA-256 dan memecah teks berdasarkan section/pasal agar kutipan RAG memiliki pembuktian akurat.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowIngestModal(false)}
                  disabled={isIngesting}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isIngesting}
                  className="flex items-center gap-1.5"
                >
                  {isIngesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Memproses & Chunking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Simpan & Publikasikan ke RAG
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Chunk Modal */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl max-w-3xl w-full p-6 space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-100 text-brand-900 font-bold">
                  PROVENANCE INSPECTOR
                </span>
                <h3 className="text-base font-bold text-brand-900 mt-1 line-clamp-1">
                  {inspectDoc.title}
                </h3>
                <div className="text-[11px] text-text-muted flex items-center gap-2 mt-0.5">
                  <span>Versi: {inspectDoc.version}</span>
                  <span>•</span>
                  <span>Total Chunks: {inspectDoc.chunks?.length || inspectDoc.total_chunks}</span>
                  <span>•</span>
                  <span className="font-mono text-[10px]">SHA-256: {inspectDoc.checksum.slice(0, 16)}...</span>
                </div>
              </div>
              <button
                onClick={() => setInspectDoc(null)}
                className="p-1 text-text-muted hover:text-brand-900 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chunks List */}
            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {inspectDoc.chunks && inspectDoc.chunks.length > 0 ? (
                inspectDoc.chunks.map((chk, idx) => (
                  <div
                    key={chk.id || idx}
                    className="p-3.5 rounded-xl border border-border bg-sand-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-brand-900 flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-brand-700" />
                        Chunk #{chk.chunk_index + 1}: {chk.section_title || "Bagian Konten"}
                      </span>
                      <span className="text-text-muted font-mono text-[10px]">
                        ~{chk.token_count} tokens
                      </span>
                    </div>
                    <p className="text-text-secondary leading-relaxed bg-surface p-2.5 rounded-lg border border-border/70 font-mono text-[11px] whitespace-pre-wrap">
                      {chk.content}
                    </p>
                    <div className="text-[10px] text-text-muted flex items-center justify-between">
                      <span className="font-mono">Citation Tag: [cit-{chk.id.slice(0, 8)}]</span>
                      <span className="text-emerald-700 font-medium">Siap untuk Retrieval EcoGuide</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-text-muted">
                  Tidak ada chunk detail yang tersedia.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border flex justify-end shrink-0">
              <Button size="sm" variant="secondary" onClick={() => setInspectDoc(null)}>
                Tutup Inspektor
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
