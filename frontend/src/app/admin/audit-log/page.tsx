"use client";

import React, { useEffect, useState } from "react";
import { History, ShieldCheck, RefreshCw, Key, Filter, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { fetchAuditLogs } from "@/services/admin";
import { AuditLogItem } from "@/types/admin";

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const loadLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAuditLogs(
        actionFilter === "ALL" ? undefined : actionFilter
      );
      setLogs(res.items);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat log audit sistem."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionFilter]);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      (log.entity_type && log.entity_type.toLowerCase().includes(q)) ||
      (log.reason && log.reason.toLowerCase().includes(q)) ||
      (log.actor_user_id && log.actor_user_id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log Penelusuran Sistem (Read-Only)"
        description="Rekaman audit append-only yang tidak dapat diubah untuk setiap aksi penimbangan, mutasi poin, dan persetujuan operasional banjar."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Audit Log", active: true },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Segarkan Log
          </Button>
        }
      />

      {/* Filter Ribbon */}
      <Panel className="p-3 bg-surface border border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Cari aksi, entitas, alasan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-canvas border border-border rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-700"
            />
          </div>

          <div className="text-xs text-text-muted font-medium">
            Status: <span className="text-[#2E6B4F] font-bold">Append-Only / Immutable</span>
          </div>
        </div>
      </Panel>

      {/* Logs Table / List */}
      {isLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-20 rounded-xl" />
          <LoadingSkeleton className="h-20 rounded-xl" />
        </div>
      ) : error ? (
        <ErrorState title="Gagal Memuat Audit Log" description={error} onRetry={loadLogs} />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          title="Tidak Ada Catatan Audit"
          description="Belum ada aktivitas mutasi yang tercatat dengan kriteria pencarian ini."
        />
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <Panel
              key={log.id}
              className="p-4 bg-surface border border-border hover:border-brand-500 hover:shadow-interactive card-interactive transition-all duration-fast ease-soft"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-900 border border-brand-200">
                      {log.action}
                    </span>
                    <span className="text-[11px] font-bold text-text-muted font-mono">
                      {log.entity_type} &bull; {log.entity_id || "-"}
                    </span>
                  </div>

                  {log.reason && (
                    <p className="text-xs text-text-primary font-medium">
                      Alasan: &ldquo;{log.reason}&rdquo;
                    </p>
                  )}

                  {log.details_json && (
                    <p className="text-[11px] text-text-muted font-mono bg-canvas px-2.5 py-1 rounded border border-border max-w-2xl truncate">
                      {log.details_json}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right text-xs text-text-muted">
                  <p className="font-mono text-[11px]">
                    Actor: {log.actor_user_id || "SYSTEM"}
                  </p>
                  <p className="font-mono text-[11px] text-text-secondary mt-0.5">
                    {new Date(log.created_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      timeZone: "Asia/Makassar",
                    })}{" "}
                    WITA
                  </p>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
