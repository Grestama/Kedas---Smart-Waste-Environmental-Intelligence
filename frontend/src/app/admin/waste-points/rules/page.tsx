"use client";

import React, { useEffect, useState } from "react";
import {
  Coins,
  ShieldCheck,
  PlusCircle,
  RefreshCw,
  AlertTriangle,
  History,
  Lock,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { useToast } from "@/components/ui/Toast";
import { fetchCategories } from "@/services/collection";
import {
  fetchRewardRules,
  createRewardRule,
  adjustUserPoints,
} from "@/services/admin";
import { RewardRuleResponse } from "@/types/admin";
import { WasteCategory } from "@/types/collection";

export default function AdminWastePointsRulesPage() {
  const { showToast } = useToast();

  const [rules, setRules] = useState<RewardRuleResponse[]>([]);
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Rule Modal
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [pointsPerKgInput, setPointsPerKgInput] = useState("30");
  const [minWeightInput, setMinWeightInput] = useState("0.5");
  const [maxPointsInput, setMaxPointsInput] = useState("500");
  const [isSubmittingRule, setIsSubmittingRule] = useState(false);

  // Manual Adjust Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState("");
  const [pointsDeltaInput, setPointsDeltaInput] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rData, cData] = await Promise.all([
        fetchRewardRules(),
        fetchCategories(),
      ]);
      setRules(rData);
      setCategories(cData);
      if (cData.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(cData[0].id);
      }
    } catch {
      showToast("error", "Gagal memuat aturan reward poin.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) return;

    const rateNum = parseInt(pointsPerKgInput, 10);
    if (isNaN(rateNum) || rateNum <= 0) {
      showToast("error", "Poin per kg harus angka positif lebih dari 0.");
      return;
    }

    setIsSubmittingRule(true);
    try {
      await createRewardRule({
        category_id: selectedCategoryId,
        points_per_kg: rateNum,
        minimum_weight_kg: parseFloat(minWeightInput) || 0.5,
        max_points_per_pickup: maxPointsInput ? parseInt(maxPointsInput, 10) : null,
      });

      showToast("success", "Versi aturan reward poin baru berhasil diterbitkan!");
      setIsRuleModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menerbitkan aturan baru.";
      showToast("error", msg);
    } finally {
      setIsSubmittingRule(false);
    }
  };

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId.trim() || !pointsDeltaInput.trim()) {
      showToast("error", "ID Pengguna dan jumlah poin delta wajib diisi.");
      return;
    }
    if (!adjustmentReason.trim()) {
      showToast("error", "Alasan penyesuaian poin wajib dicatat untuk audit trail.");
      return;
    }

    const deltaNum = parseInt(pointsDeltaInput, 10);
    if (isNaN(deltaNum) || deltaNum === 0) {
      showToast("error", "Nilai perubahan poin delta tidak boleh 0.");
      return;
    }

    setIsSubmittingAdjust(true);
    try {
      const idempotencyKey = `adj_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      await adjustUserPoints({
        user_id: targetUserId.trim(),
        points_delta: deltaNum,
        reason: adjustmentReason.trim(),
        idempotency_key: idempotencyKey,
      });

      showToast(
        "success",
        `Penyesuaian saldo (${deltaNum > 0 ? "+" : ""}${deltaNum} Pts) berhasil dibukukan!`
      );
      setIsAdjustModalOpen(false);
      setTargetUserId("");
      setPointsDeltaInput("");
      setAdjustmentReason("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal melakukan penyesuaian poin.";
      showToast("error", msg);
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aturan Konversi & Integritas WastePoints"
        description="Konfigurasi versi rasio reward poin per kategori sampah. Aturan bersifat append-only dan tidak merusak data transaksi historis."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Aturan WastePoints", active: true },
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
              variant="secondary"
              size="sm"
              onClick={() => setIsAdjustModalOpen(true)}
            >
              Koreksi Poin Manual
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsRuleModalOpen(true)}
              leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              Terbitkan Versi Aturan Baru
            </Button>
          </div>
        }
      />

      {/* Safety & Versioning Policy Notice */}
      <div className="p-4 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 shrink-0 text-brand-800 mt-0.5" />
        <div className="space-y-1 text-xs leading-relaxed">
          <p className="font-bold">Kebijakan Versioning & Kekebalan Historis Buku Besar</p>
          <p className="text-brand-800">
            Perubahan tarif poin berlaku untuk penimbangan setoran di masa depan. Transaksi masa lalu yang sudah selesai mengikat pada versi aturan saat penimbangan dicatat dan tidak akan diubah nilainya.
          </p>
        </div>
      </div>

      {/* Active Rules List */}
      <Panel className="p-5 bg-surface border border-border">
        <h3 className="text-sm font-bold text-brand-900 border-b border-border pb-3 mb-4">
          Daftar Versi Aturan Reward Poin Per Kategori
        </h3>

        {isLoading ? (
          <LoadingSkeleton className="h-32 rounded-xl" />
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-xl border border-border bg-canvas/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-900">
                      Versi {rule.version}
                    </span>
                    <span className="text-xs font-bold text-[#2E6B4F] bg-[#E7F4EA] px-2 py-0.5 rounded-full uppercase">
                      {rule.status}
                    </span>
                    <span className="text-xs font-bold text-text-primary">
                      {rule.category_name || "Kategori"}
                    </span>
                  </div>

                  <p className="text-xs text-text-muted">
                    Tarif: <strong>{rule.points_per_kg} Poin / kg</strong> &bull; Min:{" "}
                    <strong>{rule.minimum_weight_kg} kg</strong>
                    {rule.max_points_per_pickup && (
                      <> &bull; Batas Maks: <strong>{rule.max_points_per_pickup} Pts</strong></>
                    )}
                  </p>
                </div>

                <div className="shrink-0 text-right text-[11px] text-text-muted font-mono">
                  Berlaku sejak:{" "}
                  {new Date(rule.effective_from).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    timeZone: "Asia/Makassar",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Publish New Rule Modal */}
      <Modal
        isOpen={isRuleModalOpen}
        onClose={() => {
          if (!isSubmittingRule) setIsRuleModalOpen(false);
        }}
        title="Terbitkan Versi Aturan Poin Baru"
      >
        <form onSubmit={handleCreateRule} className="space-y-4">
          <Select
            label="Kategori Sampah *"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            options={categories.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.code})`,
            }))}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Tarif Poin / kg *"
              type="number"
              min="1"
              value={pointsPerKgInput}
              onChange={(e) => setPointsPerKgInput(e.target.value)}
              required
            />
            <Input
              label="Berat Minimal (kg) *"
              type="number"
              step="0.1"
              min="0.1"
              value={minWeightInput}
              onChange={(e) => setMinWeightInput(e.target.value)}
              required
            />
            <Input
              label="Batas Maks Poin"
              type="number"
              placeholder="Tanpa batas"
              value={maxPointsInput}
              onChange={(e) => setMaxPointsInput(e.target.value)}
            />
          </div>

          <p className="text-[11px] text-text-muted leading-relaxed">
            * Menetapkan versi baru akan mengarsipkan aturan sebelumnya secara otomatis.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmittingRule}
              onClick={() => setIsRuleModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmittingRule}
            >
              {isSubmittingRule ? "Menerbitkan..." : "Terbitkan Aturan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manual Point Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => {
          if (!isSubmittingAdjust) setIsAdjustModalOpen(false);
        }}
        title="Koreksi Saldo WastePoints Manual (Audit Gated)"
      >
        <form onSubmit={handleAdjustPoints} className="space-y-4">
          <div className="p-3 bg-[#FFF4D9] rounded-lg border border-[#F7E1A0] text-[#98631C] text-xs">
            <p className="font-bold">Peringatan Audit Finansial:</p>
            <p className="text-[#7A4E12]">
              Setiap penyesuaian saldo poin manual akan dicatat ke dalam audit trail dengan identitas admin dan kunci idempotensi anti-duplikasi.
            </p>
          </div>

          <Input
            label="ID Pengguna Warga *"
            placeholder="Contoh: usr_warga_01"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            required
          />

          <Input
            label="Perubahan Poin Delta (Gunakan tanda minus untuk pengurangan) *"
            type="number"
            placeholder="Contoh: +50 atau -20"
            value={pointsDeltaInput}
            onChange={(e) => setPointsDeltaInput(e.target.value)}
            required
          />

          <Textarea
            label="Alasan Koreksi Manual *"
            placeholder="Contoh: Koreksi selisih tara timbangan manual di banjar kaja sesuai laporan pengurus TPS3R."
            value={adjustmentReason}
            onChange={(e) => setAdjustmentReason(e.target.value)}
            rows={3}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmittingAdjust}
              onClick={() => setIsAdjustModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              disabled={isSubmittingAdjust}
            >
              {isSubmittingAdjust ? "Membukukan..." : "Bukukan Koreksi Poin"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
