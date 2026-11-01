/**
 * Kedas Offline-First Weighing Outbox Queue (GAP-005)
 * Safely persists weighing intake records in field/remote TPS3R operations
 * when network connection drops, and replays them idempotently upon reconnect.
 */

import { recordWeight } from "@/services/staff";
import { WeightRecordCreateRequest, WeightRecordResponse } from "@/types/staff";

export interface QueuedWeighingItem {
  id: string;
  taskId: string;
  taskCode: string;
  payload: WeightRecordCreateRequest;
  timestamp: string;
  status: "QUEUED" | "SYNCING" | "FAILED";
  retryCount: number;
  lastError?: string;
}

const STORAGE_KEY = "kedas_weighing_outbox_v1";

function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

export function getQueuedWeighings(): QueuedWeighingItem[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQueuedWeighings(items: QueuedWeighingItem[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded or blocked
  }
}

export function enqueueWeighing(
  taskId: string,
  taskCode: string,
  payload: WeightRecordCreateRequest
): QueuedWeighingItem {
  const newItem: QueuedWeighingItem = {
    id: `offline-wt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    taskId,
    taskCode,
    payload,
    timestamp: new Date().toISOString(),
    status: "QUEUED",
    retryCount: 0,
  };

  const existing = getQueuedWeighings();
  const updated = [newItem, ...existing];
  saveQueuedWeighings(updated);
  return newItem;
}

export function removeQueuedWeighing(id: string): void {
  const existing = getQueuedWeighings();
  const updated = existing.filter((item) => item.id !== id);
  saveQueuedWeighings(updated);
}

export async function syncOfflineWeighings(): Promise<{
  synced: number;
  failed: number;
  results: Array<{ id: string; success: boolean; error?: string }>;
}> {
  const items = getQueuedWeighings();
  if (items.length === 0) {
    return { synced: 0, failed: 0, results: [] };
  }

  let synced = 0;
  let failed = 0;
  const results: Array<{ id: string; success: boolean; error?: string }> = [];
  const remaining: QueuedWeighingItem[] = [];

  for (const item of items) {
    try {
      await recordWeight(item.taskId, item.payload);
      synced++;
      results.push({ id: item.id, success: true });
    } catch (err: unknown) {
      failed++;
      const errorMsg = err instanceof Error ? err.message : "Sync error";
      results.push({ id: item.id, success: false, error: errorMsg });
      remaining.push({
        ...item,
        status: "FAILED",
        retryCount: item.retryCount + 1,
        lastError: errorMsg,
      });
    }
  }

  saveQueuedWeighings(remaining);
  return { synced, failed, results };
}
