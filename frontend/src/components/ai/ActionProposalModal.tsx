"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FileCheck,
  Sliders,
  UserCheck,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  ActionProposalPayload,
  ActionProposalExecuteResponse,
  aiService,
} from "@/services/ai";

interface ActionProposalModalProps {
  proposal: ActionProposalPayload;
  recommendationTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onExecuted?: (result: ActionProposalExecuteResponse) => void;
}

const ACTION_TYPE_CONFIG: Record<
  string,
  { label: string; badge: string; icon: React.ReactNode }
> = {
  ADJUST_SERVICE_SLOT: {
    label: "Penyesuaian Kuota Slot",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <Sliders className="w-4 h-4 text-blue-700" />,
  },
  CREATE_STAFF_TASK: {
    label: "Penugasan Petugas Lapangan",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: <UserCheck className="w-4 h-4 text-emerald-700" />,
  },
  PROPOSE_ALTERNATE_FACILITY: {
    label: "Pengalihan Aliran Fasilitas",
    badge: "bg-purple-100 text-purple-800 border-purple-200",
    icon: <Building2 className="w-4 h-4 text-purple-700" />,
  },
};

export function ActionProposalModal({
  proposal,
  recommendationTitle,
  isOpen,
  onClose,
  onExecuted,
}: ActionProposalModalProps) {
  const toast = useToast();
  const [userNotes, setUserNotes] = useState<string>("");
  const [params, setParams] = useState<Record<string, any>>(proposal.parameters || {});
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<ActionProposalExecuteResponse | null>(null);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isOpen && e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeMeta = ACTION_TYPE_CONFIG[proposal.action_type] || {
    label: proposal.action_type,
    badge: "bg-stone-100 text-stone-800 border-stone-200",
    icon: <Sparkles className="w-4 h-4 text-brand-700" />,
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const result = await aiService.executeProposal({
        proposal: {
          ...proposal,
          parameters: params,
        },
        user_notes: userNotes.trim() || undefined,
      });

      setExecutionResult(result);
      toast.success(
        "Proposal Berhasil Dieksekusi",
        result.message || "Tindakan operasional tercatat dalam Audit Log sistem."
      );
      if (onExecuted) onExecuted(result);
    } catch (err: any) {
      toast.error(
        "Gagal Mengeksekusi Proposal",
        err.message || "Terjadi kesalahan saat memproses tindakan domain."
      );
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Tinjauan Proposal Tindakan Copilot"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#122620]/60 backdrop-blur-[2px] transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 bg-surface rounded-2xl max-w-lg w-full overflow-hidden shadow-popover border border-border animate-scale-in">
        {/* Header */}
        <div className="p-4 bg-brand-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              {typeMeta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Kedas Operations Copilot
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">
                  GAP-002
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                Konfirmasi Proposal Tindakan Terketik
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            aria-label="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Action Type & Recommendation Title */}
          <div className="p-3.5 rounded-xl bg-sand-50/70 border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeMeta.badge}`}>
                {typeMeta.label}
              </span>
              <span className="text-[11px] text-text-muted font-mono">
                Target: {proposal.target_id || "Kawasan Destinasi"}
              </span>
            </div>
            <h4 className="font-bold text-brand-900 text-sm">{proposal.title}</h4>
            <p className="text-text-secondary leading-relaxed text-[11px]">{proposal.description}</p>
          </div>

          {/* Success State */}
          {executionResult ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Tindakan Berhasil Diverifikasi & Dieksekusi</span>
              </div>
              <p className="text-xs text-emerald-700">{executionResult.message}</p>

              <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-200/60 font-mono text-[10px] space-y-1">
                <div>Audit ID: <strong>{executionResult.audit_id}</strong></div>
                <div>Waktu Eksekusi: {new Date(executionResult.executed_at).toLocaleString("id-ID")} WITA</div>
                <div>Status Akhir: {JSON.stringify(executionResult.after_state)}</div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button size="sm" variant="primary" onClick={onClose}>
                  Tutup & Kembali
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Parameter Adjustment Form */}
              <div className="space-y-3 pt-1">
                <div className="font-semibold text-brand-900 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-brand-700" />
                  Parameter Tindakan (Dapat Disesuaikan):
                </div>

                {proposal.action_type === "ADJUST_SERVICE_SLOT" && (
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">
                      Kapasitas Baru (kg/hari):
                    </label>
                    <input
                      type="number"
                      value={params.new_limit_kg || 850}
                      onChange={(e) =>
                        setParams({ ...params, new_limit_kg: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background font-mono text-xs focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                )}

                {proposal.action_type === "CREATE_STAFF_TASK" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-text-secondary mb-1">
                        Peran Petugas Ditugaskan:
                      </label>
                      <select
                        value={params.assigned_role || "COLLECTOR"}
                        onChange={(e) => setParams({ ...params, assigned_role: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
                      >
                        <option value="COLLECTOR">Kolektor Armada</option>
                        <option value="FACILITY_OPERATOR">Operator TPS3R</option>
                        <option value="DISPATCHER">Dispatcher Wilayah</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-text-secondary mb-1">
                        Prioritas Pengangkutan:
                      </label>
                      <select
                        value={params.priority || "HIGH"}
                        onChange={(e) => setParams({ ...params, priority: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs"
                      >
                        <option value="HIGH">Tinggi (SLA &lt; 24 Jam)</option>
                        <option value="MEDIUM">Sedang</option>
                        <option value="LOW">Rendah</option>
                      </select>
                    </div>
                  </div>
                )}

                {proposal.action_type === "PROPOSE_ALTERNATE_FACILITY" && (
                  <div>
                    <label className="block text-[11px] font-medium text-text-secondary mb-1">
                      Kuota Pengalihan (kg):
                    </label>
                    <input
                      type="number"
                      value={params.divert_quota_kg || 300}
                      onChange={(e) =>
                        setParams({ ...params, divert_quota_kg: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background font-mono text-xs focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Catatan Auditor / Alasan Penyesuaian (Opsional):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Disetujui pasca-koordinasi paruman banjar dan verifikasi kapasitas TPS3R."
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-lg border border-border bg-background focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Security & Audit Guarantee Notice */}
              <div className="p-3 rounded-xl bg-sand-100/60 border border-border text-[11px] text-text-secondary flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Jaminan Integritas Audit:</strong> Setiap mutasi operasional dieksekusi melalui transaksi domain terverifikasi dan secara otomatis dicatat dalam tabel <code>audit_logs</code> sebelum/sesudah tindakan.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <Button size="sm" variant="outline" onClick={onClose} disabled={isExecuting}>
                  Batal
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className="flex items-center gap-1.5"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Mengeksekusi...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-3.5 h-3.5" />
                      Konfirmasi & Eksekusi Tindakan
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
