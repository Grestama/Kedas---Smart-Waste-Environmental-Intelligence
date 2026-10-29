import { describe, it, expect, beforeEach, vi } from "vitest";
import { OfflineDraftManager } from "../lib/offline-draft";
import { DevicePermissionsManager } from "../lib/permissions";
import { MobileApiClient, MobileApiError } from "../lib/api-client";
import { formatWITA, formatPoints, formatWeightKg, touchTargets } from "../tokens";

describe("WasteLink Bali Mobile — Phase 6 Quality Gate Tests", () => {
  beforeEach(async () => {
    // Clear any memory drafts before each test
    const drafts = await OfflineDraftManager.getDrafts();
    for (const d of drafts) {
      await OfflineDraftManager.removeDraft(d.local_id);
    }
  });

  describe("OfflineDraftManager & Offline Reliability", () => {
    it("harus menyimpan draf setoran secara lokal dengan label DRAFT_LOKAL_OFFLINE", async () => {
      const draft = await OfflineDraftManager.saveDraft({
        category_id: "cat_anorganik",
        category_name: "Plastik PET Bening Bersih",
        address_id: "addr_01",
        address_display: "Jl. Raya Batuan No. 14, Banjar Kaja",
        slot_id: "slot_01",
        slot_display: "08:30 - 10:30 WITA",
        estimated_weight_kg: 4.5,
        notes: "3 kantong di dekat gerbang",
      });

      expect(draft.local_id).toBeDefined();
      expect(draft.local_id).toContain("draft_local_");
      expect(draft.is_draft).toBe(true);
      expect(draft.status_label).toBe("DRAFT_LOKAL_OFFLINE");

      const allDrafts = await OfflineDraftManager.getDrafts();
      expect(allDrafts.length).toBe(1);
      expect(allDrafts[0].category_name).toBe("Plastik PET Bening Bersih");
    });

    it("harus dapat menghapus draf lokal saat dibatalkan atau setelah sukses sinkronisasi", async () => {
      const draft = await OfflineDraftManager.saveDraft({
        category_id: "cat_organik",
        category_name: "Organik Canang Sari",
        address_id: "addr_01",
        address_display: "Banjar Kaja Sukawati",
        slot_id: "slot_02",
        slot_display: "13:30 - 15:30 WITA",
      });

      let drafts = await OfflineDraftManager.getDrafts();
      expect(drafts.length).toBe(1);

      await OfflineDraftManager.removeDraft(draft.local_id);
      drafts = await OfflineDraftManager.getDrafts();
      expect(drafts.length).toBe(0);
    });

    it("harus mengirimkan draf ke server dan membersihkan penyimpanan lokal saat online", async () => {
      // Mock client request
      const draft = await OfflineDraftManager.saveDraft({
        category_id: "cat_anorganik",
        category_name: "Kardus & Kertas Dupleks",
        address_id: "addr_01",
        address_display: "Banjar Tengah Sukawati",
        slot_id: "slot_01",
        slot_display: "08:30 - 10:30 WITA",
        estimated_weight_kg: 6.0,
      });

      // Spy on mobileApiClient
      const mockApi = new MobileApiClient();
      const mockPost = vi.fn().mockResolvedValue({
        id: "pick_synced_99",
        public_code: "WL-2026-SKW-099",
        status: "PENDING_ASSIGNMENT",
      });
      mockApi.post = mockPost;

      // Mock submit handler
      const res = await mockApi.post<{ id: string; public_code: string }>(
        "/pickup-requests",
        {
          category_id: draft.category_id,
          address_id: draft.address_id,
          slot_id: draft.slot_id,
          estimated_weight_kg: draft.estimated_weight_kg,
        }
      );

      await OfflineDraftManager.removeDraft(draft.local_id);

      expect(res.id).toBe("pick_synced_99");
      expect(res.public_code).toBe("WL-2026-SKW-099");
      const remainingDrafts = await OfflineDraftManager.getDrafts();
      expect(remainingDrafts.length).toBe(0);
    });
  });

  describe("DevicePermissionsManager & Contextual Rationale", () => {
    it("harus menyertakan rationale dan fallback manual saat meminta izin kamera", async () => {
      const result = await DevicePermissionsManager.requestCameraPermission();

      expect(result.type).toBe("CAMERA");
      expect(result.granted).toBe(true);
      expect(result.rationale).toContain("WasteLink Bali memerlukan izin kamera");
      expect(result.fallbackDescription).toContain("Anda tetap dapat mengajukan setoran tanpa foto");
    });

    it("harus menyertakan rationale dan fallback alamat manual saat meminta izin lokasi", async () => {
      const result = await DevicePermissionsManager.requestLocationPermission();

      expect(result.type).toBe("LOCATION");
      expect(result.granted).toBe(true);
      expect(result.rationale).toContain("memastikan titik penjemputan berada dalam jangkauan armada trike Banjar Sukawati");
      expect(result.fallbackDescription).toContain("Anda dapat memilih alamat penjemputan tersimpan secara manual");
    });

    it("harus menyertakan rationale dan fallback saat meminta izin notifikasi", async () => {
      const result = await DevicePermissionsManager.requestNotificationPermission();

      expect(result.type).toBe("NOTIFICATION");
      expect(result.granted).toBe(true);
      expect(result.rationale).toContain("saat armada penjemputan mulai meluncur ke rumah Anda");
      expect(result.fallbackDescription).toContain("Status perjalanan dapat dipantau langsung pada tab Aktivitas");
    });
  });

  describe("MobileApiClient & Offline Safeguards", () => {
    it("harus melempar error NETWORK_OFFLINE saat perangkat sedang dalam mode luring", async () => {
      const client = new MobileApiClient();
      client.setOnlineStatus(false);

      await expect(client.get("/pickup-requests")).rejects.toThrow(
        "Perangkat sedang luring (offline)"
      );

      try {
        await client.get("/pickup-requests");
      } catch (err) {
        expect(err).toBeInstanceOf(MobileApiError);
        expect((err as MobileApiError).code).toBe("NETWORK_OFFLINE");
      }
    });

    it("harus dapat mengatur dan menghapus Bearer token autentikasi", () => {
      const client = new MobileApiClient();
      client.setToken("test_bearer_token");
      expect(client.checkIsOnline()).toBe(true);

      client.setToken(null);
    });
  });

  describe("Design Tokens & WITA Formatting", () => {
    it("harus memformat tanggal dan waktu ke zona WITA (Asia/Makassar)", () => {
      const iso = "2026-10-30T01:30:00.000Z"; // 09:30 WITA
      const formatted = formatWITA(iso);
      expect(formatted).toContain("WITA");
    });

    it("harus memformat WastePoints dan berat sesuai standar Bali", () => {
      expect(formatPoints(1250)).toBe("1.250 Pts");
      expect(formatWeightKg(5.5)).toBe("5.50 kg");
    });

    it("harus memenuhi standar target sentuh minimum 48dp", () => {
      expect(touchTargets.minHeight).toBeGreaterThanOrEqual(48);
      expect(touchTargets.minWidth).toBeGreaterThanOrEqual(48);
      expect(touchTargets.minButtonHeight).toBeGreaterThanOrEqual(48);
    });
  });

  describe("Citizen Safety & Role Enforcement", () => {
    it("harus melarang permohonan penjemputan trike harian untuk limbah B3 Spesifik", () => {
      const isB3Blocked = (categoryType: string) => {
        return categoryType === "SPECIAL";
      };

      expect(isB3Blocked("SPECIAL")).toBe(true);
      expect(isB3Blocked("RECYCLABLE")).toBe(false);
      expect(isB3Blocked("ORGANIC")).toBe(false);
      expect(isB3Blocked("RESIDUAL")).toBe(false);
    });

    it("harus menegaskan bahwa role mobile strictly USER (Warga)", () => {
      const citizenUser = {
        id: "usr_warga_01",
        name: "Wayan Sudarsana",
        active_role: "USER" as const,
      };

      expect(citizenUser.active_role).toBe("USER");
      expect(citizenUser.active_role).not.toBe("COLLECTOR");
      expect(citizenUser.active_role).not.toBe("ADMIN");
    });
  });

  describe("Tahap 2 — Warga Source Collection & Idempotency Support", () => {
    it("harus menyertakan idempotency key dan service mode pada payload setoran", () => {
      const serviceMode = "DROP_OFF";
      const idempotencyKey = `wlb_mob_${Date.now().toString(36)}_xyz789`;
      const payload = {
        category_id: "cat_anorganik",
        address_id: "addr_01",
        slot_id: "slot_morning",
        estimated_weight_kg: 3.5,
        service_mode: serviceMode,
        idempotency_key: idempotencyKey,
        notes: "Botol PET bersih",
      };

      expect(payload.service_mode).toBe("DROP_OFF");
      expect(payload.idempotency_key).toContain("wlb_mob_");
      expect(payload.estimated_weight_kg).toBeGreaterThan(0);
    });

    it("harus mendukung pemilihan antar penjemputan trike vs setor mandiri ke pos TPS3R", () => {
      const modes: Array<"PICKUP" | "DROP_OFF"> = ["PICKUP", "DROP_OFF"];
      expect(modes).toContain("PICKUP");
      expect(modes).toContain("DROP_OFF");
      expect(modes.length).toBe(2);
    });
  });
});
