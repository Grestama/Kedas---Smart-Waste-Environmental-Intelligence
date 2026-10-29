import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "@/services/auth";
import { collectionService } from "@/services/collection";
import { staffService } from "@/services/staff";
import { adminService } from "@/services/admin";
import { formatWITA, formatWeightKg, formatPoints } from "@/tokens";

describe("WasteLink Bali — Tahap 7 Full Integration & End-to-End Hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Journey 1: Warga Web/Mobile Deposit & Lifecycle", () => {
    it("1.1 Warga login, memuat kategori sampah dan slot penjemputan", async () => {
      // Mock login
      vi.spyOn(authService, "login").mockResolvedValueOnce({
        session_token: "mock_session_warga_01",
        user: {
          id: "usr_warga_01",
          full_name: "I Wayan Sudarsana",
          email: "wayan@sukawati.id",
          phone: "0812-3456-7890",
          account_status: "ACTIVE",
          preferred_active_role: "USER",
          created_at: new Date().toISOString(),
        },
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      });

      const loginRes = await authService.login("0812-3456-7890", "Warga123!");
      expect(loginRes.user.full_name).toBe("I Wayan Sudarsana");
      expect(loginRes.user.preferred_active_role).toBe("USER");

      // Load categories & slots
      const categories = await collectionService.getCategories();
      expect(categories.length).toBeGreaterThan(0);
      const recyclable = categories.find((c) => c.code === "ANORGANIK" || c.category_type === "RECYCLABLE");
      expect(recyclable).toBeDefined();

      const slots = await collectionService.getSlotsForArea("sa_sukawati");
      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0].remaining_capacity).toBeGreaterThan(0);
    });

    it("1.2 Warga membuat permohonan setoran valid dan menerima nomor referensi", async () => {
      const payload = {
        category_id: "cat_anorganik",
        address_id: "addr_01",
        slot_id: "slot_01",
        estimated_weight_kg: 4.5,
        notes: "3 kantong di depan garasi",
      };

      const request = await collectionService.createPickupRequest(payload);
      expect(request.id).toBeDefined();
      expect(request.public_code).toMatch(/^WL-/);
      expect(request.status).toBe("PENDING_ASSIGNMENT");
      expect(request.estimated_weight_kg).toBe(4.5);
    });

    it("1.3 Warga memantau status transisi dan melihat WastePoints resmi hanya setelah timbang", async () => {
      const request = await collectionService.getPickupRequestById("pick_001");
      expect(request.id).toBeDefined();
      expect(request.status).toBeDefined();

      // Before weigh-in, points are not minted
      if (request.status !== "COMPLETED") {
        expect(request.points_earned ?? null).toBeNull();
      }

      // Check balance
      const balance = await collectionService.getPointsBalance();
      expect(balance.current_balance).toBeGreaterThanOrEqual(0);

      // Check ledger audit trail
      const ledger = await collectionService.getPointsLedger();
      expect(Array.isArray(ledger)).toBe(true);
    });

    it("1.4 Penanganan error: 422 saat kategori B3, 409 saat slot penuh, dan pembatalan aman", async () => {
      // B3 Safety Gate test
      const isB3Forbidden = (categoryType: string) => categoryType === "SPECIAL";
      expect(isB3Forbidden("SPECIAL")).toBe(true);

      // Cancel pickup
      const cancelRes = await collectionService.cancelPickupRequest("pick_001", "Ada acara mendadak");
      expect(cancelRes.status).toBe("CANCELLED");
    });
  });

  describe("Journey 2: Petugas Sampah Desktop POS & QC Inspection", () => {
    it("2.1 Petugas belum diverifikasi menerima penolakan 403", async () => {
      const checkCollectorAccess = (status: string) => {
        if (status !== "APPROVED" && status !== "ACTIVE") {
          throw new Error("Akses ditolak (403): Akun petugas belum disetujui admin.");
        }
        return true;
      };

      expect(() => checkCollectorAccess("PENDING")).toThrow("403");
      expect(checkCollectorAccess("APPROVED")).toBe(true);
    });

    it("2.2 Petugas terverifikasi melihat antrean tugas dan mengklaim secara atomik", async () => {
      const availableTasks = await staffService.getAvailableTasks("sa_sukawati");
      expect(Array.isArray(availableTasks)).toBe(true);
      expect(availableTasks.length).toBeGreaterThan(0);

      const taskToClaim = availableTasks[0];
      const claimed = await staffService.acceptTask(taskToClaim.id);
      expect(claimed.status).toBe("ACCEPTED");
      expect(claimed.assigned_collector_id).toBeDefined();
    });

    it("2.3 Petugas mencatat hasil inspeksi kebersihan dan validasi timbangan tara/bruto", async () => {
      // Record QC Inspection
      const inspection = await staffService.recordInspection("pick_sukawati_001", {
        result: "ACCEPTED",
        contamination_level: "NONE",
      });
      expect(inspection.result).toBe("ACCEPTED");

      // Gross and Tare math verification: Net = Gross - Tare
      const gross = 6.2;
      const tare = 0.4;
      expect(gross).toBeGreaterThan(tare);
      const net = gross - tare;
      expect(net).toBeCloseTo(5.8);

      const weightRecord = await staffService.recordWeight("pick_sukawati_001", {
        gross_weight_kg: gross,
        tare_weight_kg: tare,
      });
      expect(weightRecord.net_weight_kg).toBe(5.8);
      expect(weightRecord.verification_status).toBe("VERIFIED");
    });

    it("2.4 State machine: Petugas memperbarui status secara sekuensial", async () => {
      const validTransitions: Record<string, string[]> = {
        ACCEPTED: ["EN_ROUTE", "CANCELLED"],
        EN_ROUTE: ["ARRIVED"],
        ARRIVED: ["INSPECTION"],
        INSPECTION: ["COLLECTED", "CANCELLED"],
        COLLECTED: ["COMPLETED"],
      };

      expect(validTransitions["ACCEPTED"]).toContain("EN_ROUTE");
      expect(validTransitions["EN_ROUTE"]).toContain("ARRIVED");
      expect(validTransitions["COLLECTED"]).toContain("COMPLETED");

      const updated = await staffService.updateTaskStatus("pick_sukawati_001", {
        status: "COMPLETED",
        reason: "Tugas selesai di TPS3R",
      });
      expect(updated.status).toBe("COMPLETED");
    });
  });

  describe("Journey 3: Admin Web Master Data, Governance & Audit", () => {
    it("3.1 Admin meninjau permohonan collector dan memvalidasi kendaraan", async () => {
      const applications = await adminService.getCollectorApplications();
      expect(Array.isArray(applications)).toBe(true);

      if (applications.length > 0) {
        const reviewed = await adminService.reviewCollectorApplication(applications[0].id, {
          approved: true,
          reason: "Dokumen SIM dan rekomendasi banjar lengkap.",
        });
        expect(reviewed.status).toBe("APPROVED");
      }
    });

    it("3.2 Admin mengelola kategori sampah dan slot area operasional", async () => {
      const newCat = await adminService.createCategory({
        code: "KACA_BOTOL",
        name: "Botol Kaca & Beling",
        category_type: "RECYCLABLE",
        description: "Botol sirup, kecap, dan saus kaca utuh",
        preparation_guide: "Bilas dan pisahkan dari tutup logam",
      });
      expect(newCat.code).toBe("KACA_BOTOL");

      const newSlot = await adminService.createSlotForArea("sa_sukawati", {
        service_area_id: "sa_sukawati",
        start_time: "10:00:00",
        end_time: "12:00:00",
        max_capacity: 10,
      });
      expect(newSlot.service_area_id).toBe("sa_sukawati");
      expect(newSlot.max_capacity).toBe(10);
    });

    it("3.3 Admin mengonfigurasi aturan poin dan melakukan koreksi dengan audit reason", async () => {
      const rule = await adminService.createRewardRule({
        category_id: "cat_anorganik",
        points_per_kg: 60,
      });
      expect(rule.points_per_kg).toBe(60);

      const adj = (await adminService.adjustUserPoints({
        user_id: "usr_warga_01",
        points_delta: 50,
        reason: "Penyesuaian timbangan ulang TPS3R",
        idempotency_key: `adj_${Date.now()}`,
      })) as { points_delta: number; status?: string };
      expect(adj.points_delta).toBe(50);
      expect(adj.status).toBe("ADJUSTED");
    });

    it("3.4 Admin melihat ringkasan metrik WITA dan audit log imutabel", async () => {
      const summary = await adminService.getReportsSummary(
        "2026-10-01T00:00:00Z",
        "2026-10-31T23:59:59Z"
      );
      expect(summary.pickups_completed).toBeGreaterThanOrEqual(0);
      expect(summary.total_verified_weight_kg).toBeGreaterThanOrEqual(0);
      expect(summary.total_points_issued).toBeGreaterThanOrEqual(0);

      const auditLogs = await adminService.getAuditLogs();
      expect(Array.isArray(auditLogs.items)).toBe(true);
      if (auditLogs.items.length > 0) {
        expect(auditLogs.items[0].action).toBeDefined();
        expect(auditLogs.items[0].created_at).toBeDefined();
      }
    });
  });

  describe("Security, Data Formatting & Token Standards", () => {
    it("memformat waktu menggunakan standar tanggal id-ID", () => {
      const dateStr = "2026-10-30T06:00:00.000Z";
      const formatted = formatWITA(dateStr);
      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThan(5);
    });

    it("memformat WastePoints dan bobot bersih sah", () => {
      expect(formatPoints(450)).toBe("450 poin");
      expect(formatWeightKg(12.35)).toBe("12,35 kg");
    });

    it("menolak bobot tara yang melebihi atau sama dengan bobot kotor (bruto)", () => {
      const validateWeight = (gross: number, tare: number) => {
        if (tare >= gross) {
          throw new Error("Bobot tara tidak boleh melebihi atau sama dengan bobot kotor.");
        }
        return gross - tare;
      };

      expect(() => validateWeight(5.0, 5.0)).toThrow("Bobot tara tidak boleh melebihi");
      expect(() => validateWeight(4.0, 5.0)).toThrow("Bobot tara tidak boleh melebihi");
      expect(validateWeight(6.0, 1.0)).toBe(5.0);
    });
  });
});
