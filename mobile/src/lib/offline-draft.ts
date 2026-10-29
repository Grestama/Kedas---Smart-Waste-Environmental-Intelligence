/**
 * WasteLink Bali Mobile — Offline Draft Manager
 * Mengelola draf permohonan setoran yang disimpan lokal saat perangkat luring.
 * Memastikan draf lokal tidak diklaim sebagai permintaan tersimpan di server.
 */

import { OfflinePickupDraft, PickupRequest } from "@/types";
import { mobileApiClient } from "./api-client";

let memoryDraftStore: OfflinePickupDraft[] = [];

export class OfflineDraftManager {
  /**
   * Menyimpan draf setoran secara lokal di perangkat.
   */
  public static async saveDraft(
    draft: Omit<OfflinePickupDraft, "local_id" | "created_at" | "is_draft" | "status_label">
  ): Promise<OfflinePickupDraft> {
    const newDraft: OfflinePickupDraft = {
      ...draft,
      local_id: `draft_local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      is_draft: true,
      status_label: "DRAFT_LOKAL_OFFLINE",
    };

    memoryDraftStore.unshift(newDraft);
    return newDraft;
  }

  /**
   * Mengambil semua draf lokal yang belum dikirim ke server.
   */
  public static async getDrafts(): Promise<OfflinePickupDraft[]> {
    return [...memoryDraftStore];
  }

  /**
   * Menghapus draf lokal setelah berhasil disubmit atau dibatalkan user.
   */
  public static async removeDraft(localId: string): Promise<void> {
    memoryDraftStore = memoryDraftStore.filter((d) => d.local_id !== localId);
  }

  /**
   * Mengirim draf lokal ke server ketika koneksi pulih secara eksplisit.
   */
  public static async submitDraftToServer(
    draft: OfflinePickupDraft
  ): Promise<PickupRequest> {
    const payload = {
      category_id: draft.category_id,
      address_id: draft.address_id,
      slot_id: draft.slot_id,
      estimated_weight_kg: draft.estimated_weight_kg || 2.0,
      notes: draft.notes ? `[Draf Pulih] ${draft.notes}` : "Draf disinkronkan saat online",
    };

    const res = await mobileApiClient.post<PickupRequest>("/pickup-requests", payload);

    // Hapus dari draf lokal setelah sukses server
    await this.removeDraft(draft.local_id);
    return res;
  }
}
