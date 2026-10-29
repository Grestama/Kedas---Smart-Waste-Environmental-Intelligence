"use client";

import React, { useEffect, useState } from "react";
import { Tags, PlusCircle, RefreshCw, Edit2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { fetchCategories } from "@/services/collection";
import { createWasteCategory, updateWasteCategory } from "@/services/admin";
import { WasteCategory } from "@/types/collection";
import { WasteCategoryCreateRequest, WasteCategoryUpdateRequest } from "@/types/admin";

export default function AdminCategoriesPage() {
  const { showToast } = useToast();

  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<WasteCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [categoryType, setCategoryType] = useState<
    "ORGANIC" | "RECYCLABLE" | "RESIDUAL" | "SPECIAL"
  >("RECYCLABLE");
  const [description, setDescription] = useState("");
  const [preparationGuide, setPreparationGuide] = useState("");
  const [safetyNotes, setSafetyNotes] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat kategori sampah."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setCode("");
    setName("");
    setCategoryType("RECYCLABLE");
    setDescription("");
    setPreparationGuide("");
    setSafetyNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: WasteCategory) => {
    setEditingCategory(cat);
    setCode(cat.code);
    setName(cat.name);
    setCategoryType(cat.category_type);
    setDescription(cat.description || "");
    setPreparationGuide(cat.preparation_guide || "");
    setSafetyNotes(cat.safety_notes || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("error", "Nama kategori sampah wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        const updatePayload: WasteCategoryUpdateRequest = {
          name,
          category_type: categoryType,
          description: description || null,
          preparation_guide: preparationGuide || null,
          safety_notes: safetyNotes || null,
        };
        await updateWasteCategory(editingCategory.id, updatePayload);
        showToast("success", `Kategori ${name} berhasil diperbarui.`);
      } else {
        if (!code.trim()) {
          showToast("error", "Kode material unik wajib diisi.");
          setIsSubmitting(false);
          return;
        }
        const createPayload: WasteCategoryCreateRequest = {
          code: code.trim().toUpperCase(),
          name,
          category_type: categoryType,
          description: description || null,
          preparation_guide: preparationGuide || null,
          safety_notes: safetyNotes || null,
          is_active: true,
        };
        await createWasteCategory(createPayload);
        showToast("success", `Kategori baru ${name} berhasil didaftarkan.`);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menyimpan kategori sampah.";
      showToast("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (cat: WasteCategory) => {
    try {
      await updateWasteCategory(cat.id, { is_active: !cat.is_active });
      showToast(
        "success",
        `Status kategori ${cat.name} diubah menjadi ${!cat.is_active ? "Aktif" : "Nonaktif"}.`
      );
      await loadData();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memperbarui status aktif kategori.";
      showToast("error", msg);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Taksonomi Kategori Sampah"
        description="Konfigurasi jenis sampah terpilah, instruksi pemilahan warga, dan catatan keselamatan kerja TPS3R."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Kategori Sampah", active: true },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
            >
              Segarkan
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={openCreateModal}
              leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              Tambah Kategori Baru
            </Button>
          </div>
        }
      />

      {/* Categories List */}
      {isLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-24 rounded-xl" />
          <LoadingSkeleton className="h-24 rounded-xl" />
        </div>
      ) : error ? (
        <ErrorState
          title="Gagal Memuat Kategori"
          description={error}
          onRetry={loadData}
        />
      ) : categories.length === 0 ? (
        <EmptyState
          title="Belum Ada Kategori Sampah"
          description="Daftarkan kategori sampah pertama untuk memulai operasional penjemputan terpilah."
          action={
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              Tambah Kategori Baru
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <Panel
              key={cat.id}
              className={`p-5 bg-surface border transition-colors shadow-xs ${
                cat.is_active ? "border-border" : "border-border bg-canvas/60 opacity-80"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-900 border border-brand-200">
                      {cat.code}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-900 uppercase">
                      {cat.category_type}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        cat.is_active
                          ? "bg-[#E7F4EA] text-[#276749]"
                          : "bg-[#FBEAE7] text-[#A43F35]"
                      }`}
                    >
                      {cat.is_active ? "AKTIF" : "NONAKTIF"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary">
                    {cat.name}
                  </h3>

                  {cat.description && (
                    <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
                      {cat.description}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs">
                    {cat.preparation_guide && (
                      <div className="p-2 bg-canvas rounded border border-border">
                        <span className="font-semibold text-text-muted block text-[11px]">
                          Panduan Warga:
                        </span>
                        <span className="text-text-secondary">
                          {cat.preparation_guide}
                        </span>
                      </div>
                    )}
                    {cat.safety_notes && (
                      <div className="p-2 bg-[#FFF4D9] rounded border border-[#F7E1A0]">
                        <span className="font-semibold text-[#98631C] block text-[11px]">
                          Catatan Keselamatan Petugas:
                        </span>
                        <span className="text-[#7A4E12]">
                          {cat.safety_notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(cat)}
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant={cat.is_active ? "danger" : "secondary"}
                    size="sm"
                    onClick={() => handleToggleActive(cat)}
                  >
                    {cat.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isSubmitting) setIsModalOpen(false);
        }}
        title={editingCategory ? "Edit Kategori Sampah" : "Tambah Kategori Sampah Baru"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {!editingCategory && (
            <Input
              label="Kode Unik Material *"
              placeholder="Contoh: RECYCLABLE_ALUMINIUM"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
          )}

          <Input
            label="Nama Kategori *"
            placeholder="Contoh: Kaleng Aluminium & Logam Bersih"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Select
            label="Tipe Klasifikasi *"
            value={categoryType}
            onChange={(e) =>
              setCategoryType(
                e.target.value as "ORGANIC" | "RECYCLABLE" | "RESIDUAL" | "SPECIAL"
              )
            }
            options={[
              { value: "RECYCLABLE", label: "RECYCLABLE — Anorganik Daur Ulang Bernilai" },
              { value: "ORGANIC", label: "ORGANIC — Organik Mudah Terurai (Kompos)" },
              { value: "RESIDUAL", label: "RESIDUAL — Residu Tanpa Nilai Daur Ulang" },
              { value: "SPECIAL", label: "SPECIAL — Limbah Khusus / Berbahaya (B3)" },
            ]}
            required
          />

          <Textarea
            label="Deskripsi Material"
            placeholder="Karakteristik sampah yang diterima dalam kategori ini..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />

          <Textarea
            label="Panduan Penyiapan untuk Warga"
            placeholder="Instruksi bagi warga sebelum menyerahkan ke petugas (cuci, keringkan, pipihkan)..."
            value={preparationGuide}
            onChange={(e) => setPreparationGuide(e.target.value)}
            rows={2}
          />

          <Textarea
            label="Catatan Keselamatan Kerja Petugas (K3)"
            placeholder="Peringatan keselamatan atau APD khusus saat memindahkan material..."
            value={safetyNotes}
            onChange={(e) => setSafetyNotes(e.target.value)}
            rows={2}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Kategori"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
