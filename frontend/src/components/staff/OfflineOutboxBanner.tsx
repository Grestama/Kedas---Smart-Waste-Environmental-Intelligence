"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import {
  getQueuedWeighings,
  syncOfflineWeighings,
  QueuedWeighingItem,
} from "@/lib/offline-queue";
import { useToast } from "@/components/ui/Toast";

export function OfflineOutboxBanner({ onSyncComplete }: { onSyncComplete?: () => void }) {
  const { showToast } = useToast();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [queuedItems, setQueuedItems] = useState<QueuedWeighingItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const refreshQueue = useCallback(() => {
    setQueuedItems(getQueuedWeighings());
  }, []);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const { synced, failed } = await syncOfflineWeighings();
      refreshQueue();
      if (synced > 0) {
        showToast("success", `Berhasil menyinkronkan ${synced} timbangan offline ke server!`);
        if (onSyncComplete) onSyncComplete();
      }
      if (failed > 0) {
        showToast("error", `Gagal menyinkronkan ${failed} item. Periksa kembali jaringan.`);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [refreshQueue, showToast, onSyncComplete]);

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    refreshQueue();

    const handleOnline = () => {
      setIsOnline(true);
      showToast("info", "Koneksi internet pulih. Memulai sinkronisasi antrean timbangan...");
      handleSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast("warning", "Koneksi internet terputus. Mode offline timbangan aktif.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleSync, refreshQueue, showToast]);

  if (isOnline && queuedItems.length === 0) {
    return null; // Clean state, no banner needed
  }

  return (
    <div
      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs transition-all ${
        !isOnline
          ? "bg-amber-50/90 border-amber-300 text-amber-900"
          : "bg-emerald-50/90 border-emerald-300 text-emerald-900"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`p-1.5 rounded-lg ${
            !isOnline ? "bg-amber-200 text-amber-800" : "bg-emerald-200 text-emerald-800"
          }`}
        >
          {!isOnline ? (
            <WifiOff className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Wifi className="w-4 h-4" aria-hidden="true" />
          )}
        </div>
        <div>
          <span className="font-bold block text-sm">
            {!isOnline ? "Mode Timbangan Lapangan Offline" : "Koneksi Internet Pulih"}
          </span>
          <span className="text-[11px] opacity-90">
            {!isOnline
              ? `${queuedItems.length} transaksi penimbangan tersimpan aman di penyimpanan lokal gawai.`
              : `${queuedItems.length} penimbangan siap disinkronkan ke server pusat TPS3R.`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          onClick={handleSync}
          disabled={!isOnline || isSyncing || queuedItems.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-white border border-stone-300 shadow-xs hover:bg-stone-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Menyinkronkan..." : "Sinkronkan Sekarang"}</span>
        </button>
      </div>
    </div>
  );
}
