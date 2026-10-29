import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import {
  fetchAvailableTasks,
  fetchMyTasks,
  getTaskDetail,
  acceptTask,
  updateTaskStatus,
  recordInspection,
  recordWeight,
  uploadEvidence,
} from "@/services/staff";
import { ApiError } from "@/lib/api-client";
import AvailableTasksPage from "@/app/staff/tugas/tersedia/page";
import MyActiveTasksPage from "@/app/staff/tugas/saya/page";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/context/auth-context";

// Mock Next.js navigation
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/staff/tugas/tersedia",
  useParams: () => ({ id: "pick_sukawati_001" }),
}));

describe("Collector Field POS Operations & Business Rules (Tahap 4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Task Queue & Concurrency Management", () => {
    it("should fetch available tasks for collector pool", async () => {
      const available = await fetchAvailableTasks();
      expect(Array.isArray(available)).toBe(true);
      expect(available.length).toBeGreaterThan(0);
      expect(available[0].status).toBe("PENDING_ASSIGNMENT");
    });

    it("should successfully claim an available task", async () => {
      const claimed = await acceptTask("pick_sukawati_001");
      expect(claimed.status).toBe("ACCEPTED");
      expect(claimed.assigned_collector_id).toBe("usr_staff_01");
    });

    it("should reject claiming an already claimed task with 409 Conflict", async () => {
      // First claim succeeds or is already claimed
      try {
        await acceptTask("pick_sukawati_003"); // Status is already ACCEPTED in mock
        expect.unreachable("Should have thrown 409 Conflict");
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(ApiError);
        expect((err as ApiError).status).toBe(409);
        expect((err as ApiError).code).toBe("CONFLICT");
        expect((err as ApiError).message).toContain("sudah diambil oleh petugas lain");
      }
    });

    it("should advance status through the allowed state machine", async () => {
      const updated = await updateTaskStatus("pick_sukawati_003", {
        status: "EN_ROUTE",
        reason: "Petugas meluncur dengan trike",
      });
      expect(updated.status).toBe("EN_ROUTE");
    });
  });

  describe("QC Inspection Domain Rules", () => {
    it("should reject REJECTED inspection if reason code and notes are missing", async () => {
      await expect(
        recordInspection("pick_sukawati_004", {
          result: "REJECTED",
          contamination_level: "HIGH",
          rejection_reason_code: null,
          rejection_notes: "",
        })
      ).rejects.toThrow(/Penolakan setoran \(REJECTED\) wajib menyertakan kode alasan/);
    });

    it("should reject PARTIALLY_ACCEPTED inspection if weights are missing", async () => {
      await expect(
        recordInspection("pick_sukawati_004", {
          result: "PARTIALLY_ACCEPTED",
          accepted_weight_kg: null,
          rejected_weight_kg: null,
        })
      ).rejects.toThrow(/Penerimaan sebagian \(PARTIALLY_ACCEPTED\) wajib memisahkan/);
    });

    it("should record ACCEPTED inspection and advance status to ready for weigh-in", async () => {
      const inspection = await recordInspection("pick_sukawati_004", {
        result: "ACCEPTED",
        contamination_level: "NONE",
      });
      expect(inspection.result).toBe("ACCEPTED");
      expect(inspection.contamination_level).toBe("NONE");

      const task = await getTaskDetail("pick_sukawati_004");
      expect(task.status).toBe("ARRIVED");
    });

    it("should record REJECTED inspection and update task status to CANCELLED", async () => {
      const inspection = await recordInspection("pick_sukawati_002", {
        result: "REJECTED",
        contamination_level: "HIGH",
        rejection_reason_code: "B3_HAZARDOUS",
        rejection_notes: "Ditemukan limbah medis dan botol racun serangga.",
      });
      expect(inspection.result).toBe("REJECTED");

      const task = await getTaskDetail("pick_sukawati_002");
      expect(task.status).toBe("CANCELLED");
    });
  });

  describe("Digital Scale Tare & Gross Calculation", () => {
    it("should reject weigh-in when tare weight exceeds gross weight", async () => {
      await expect(
        recordWeight("pick_sukawati_004", {
          method: "MANUAL_SCALE",
          gross_weight_kg: 5.0,
          tare_weight_kg: 6.5, // Tare > Gross invalid!
        })
      ).rejects.toThrow(/Berat tara wadah\/keranjang tidak boleh melebihi berat bruto/);
    });

    it("should calculate exact net weight and award WastePoints automatically", async () => {
      const weightRecord = await recordWeight("pick_sukawati_004", {
        method: "MANUAL_SCALE",
        gross_weight_kg: 6.2,
        tare_weight_kg: 0.4,
      });

      expect(weightRecord.net_weight_kg).toBe(5.8);
      expect(weightRecord.verification_status).toBe("VERIFIED");
      expect(weightRecord.version).toBeGreaterThanOrEqual(1);

      const task = await getTaskDetail("pick_sukawati_004");
      expect(task.status).toBe("COMPLETED");
      expect(task.actual_weight_kg).toBe(5.8);
      expect(task.points_earned).toBe(Math.round(5.8 * 30));
    });
  });

  describe("Evidence Upload Integrity", () => {
    it("should reject evidence upload when file exceeds 10MB limit", async () => {
      // Create a mock large file > 10MB
      const largeFile = new File(["x".repeat(100)], "oversized.jpg", {
        type: "image/jpeg",
      });
      Object.defineProperty(largeFile, "size", { value: 11 * 1024 * 1024 });

      await expect(
        uploadEvidence(largeFile, "PICKUP_REQUEST", "pick_sukawati_004")
      ).rejects.toThrow(/Ukuran berkas melebihi batas maksimum 10MB/);
    });

    it("should reject evidence upload with invalid MIME type", async () => {
      const invalidFile = new File(["malicious script"], "payload.sh", {
        type: "text/x-sh",
      });

      await expect(
        uploadEvidence(invalidFile, "PICKUP_REQUEST", "pick_sukawati_004")
      ).rejects.toThrow(/Format berkas tidak didukung/);
    });

    it("should successfully store photo evidence with valid JPEG image", async () => {
      const validPhoto = new File(["fake image content"], "timbangan_display.jpg", {
        type: "image/jpeg",
      });

      const uploaded = await uploadEvidence(
        validPhoto,
        "PICKUP_REQUEST",
        "pick_sukawati_004"
      );

      expect(uploaded.original_filename).toBe("timbangan_display.jpg");
      expect(uploaded.mime_type).toBe("image/jpeg");
      expect(uploaded.status).toBe("STORED");
      expect(uploaded.sha256_hash).toBeDefined();
    });
  });

  describe("UI Page Rendering", () => {
    it("renders available tasks page and filters correctly", async () => {
      render(
        <ToastProvider>
          <AuthProvider>
            <AvailableTasksPage />
          </AuthProvider>
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Antrean Tugas Penjemputan Banjar/i)).toBeInTheDocument();
      });
    });

    it("renders active collector tasks page with status tabs", async () => {
      render(
        <ToastProvider>
          <AuthProvider>
            <MyActiveTasksPage />
          </AuthProvider>
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Daftar Tugas Penjemputan Saya/i)).toBeInTheDocument();
        expect(screen.getByText("Semua Tugas")).toBeInTheDocument();
      });
    });
  });
});
