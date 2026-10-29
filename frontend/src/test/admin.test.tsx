import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import {
  fetchAdminDashboard,
  fetchSummaryReport,
  exportReportsCsv,
  fetchCollectorApplications,
  reviewCollectorApplication,
  reassignPickup,
  fetchPartners,
  createPartner,
  fetchBatches,
  createBatch,
  confirmDeliveryReceipt,
  fetchRewardRules,
  createRewardRule,
  adjustUserPoints,
  fetchAdminUsers,
  updateUserStatus,
  fetchAuditLogs,
} from "@/services/admin";
import { ApiError } from "@/lib/api-client";
import AdminDashboardPage from "@/app/admin/page";
import StaffVerificationPage from "@/app/admin/pengajuan-petugas/page";
import AdminReportsPage from "@/app/admin/laporan/page";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/context/auth-context";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin",
  useParams: () => ({}),
}));

describe("Admin Operations & Governance (Tahap 5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Real Operational Dashboard & Reports", () => {
    it("should fetch operational summary report matching schema", async () => {
      const report = await fetchAdminDashboard();
      expect(report.timezone).toBe("Asia/Makassar (WITA)");
      expect(report.total_pickups).toBeGreaterThan(0);
      expect(report.total_verified_weight_kg).toBeGreaterThan(0);
      expect(report.category_metrics.length).toBeGreaterThan(0);
      expect(report.funding_budget_total_idr).toBeGreaterThan(0);
    });

    it("should fetch report filtered by date range", async () => {
      const report = await fetchSummaryReport("2026-10-01", "2026-10-30");
      expect(report.date_from).toBe("2026-10-01");
      expect(report.date_to).toBe("2026-10-30");
    });

    it("should export sanitized CSV report string", async () => {
      const csv = await exportReportsCsv();
      expect(typeof csv).toBe("string");
      expect(csv).toContain("Kategori");
      expect(csv).toContain("Total Berat Bersih");
    });
  });

  describe("Collector Application Review & Reassignment", () => {
    it("should fetch collector applications queue", async () => {
      const apps = await fetchCollectorApplications();
      expect(Array.isArray(apps)).toBe(true);
      expect(apps.length).toBeGreaterThan(0);
    });

    it("should reject application review if rejection reason is missing", async () => {
      await expect(
        reviewCollectorApplication("app_col_001", {
          approved: false,
          reason: "", // Missing mandatory reason
        })
      ).rejects.toThrow(/Penolakan permohonan wajib menyertakan alasan/);
    });

    it("should approve collector application successfully", async () => {
      const reviewed = await reviewCollectorApplication("app_col_001", {
        approved: true,
      });
      expect(reviewed.status).toBe("APPROVED");
      expect(reviewed.reviewed_by).toBeDefined();
    });

    it("should validate pickup reassignment requiring collector and reason", async () => {
      await expect(
        reassignPickup("pick_sukawati_003", {
          new_collector_id: "",
          reason: "Alasan darurat",
        })
      ).rejects.toThrow(/Petugas baru dan alasan penugasan ulang wajib diisi/);
    });
  });

  describe("Circular Marketplace & Delivery Confirmation", () => {
    it("should fetch recycling partners and register new partner", async () => {
      const partners = await fetchPartners();
      expect(partners.length).toBeGreaterThan(0);

      const created = await createPartner({
        name: "PT Sirkular Karangasem",
        contact_email: "info@sirkular.id",
        contact_phone: "0812-9999-8888",
        address: "Kawasan Industri Manggis, Karangasem",
      });
      expect(created.name).toBe("PT Sirkular Karangasem");
      expect(created.verification_status).toBe("VERIFIED");
    });

    it("should create material batch from pickups", async () => {
      const batch = await createBatch({
        category_id: "cat_anorganik_pet",
        pickup_ids: ["pick_001", "pick_002"],
      });
      expect(batch.status).toBe("AGGREGATED");
      expect(batch.items.length).toBe(2);
    });

    it("should confirm delivery receipt and calculate weight discrepancy", async () => {
      const confirmed = await confirmDeliveryReceipt("dlv_001", {
        received_weight_kg: 84.8,
        notes: "Susut 0.7 kg",
      });
      expect(confirmed.status).toBe("CONFIRMED");
      expect(confirmed.received_weight_kg).toBe(84.8);
      expect(confirmed.weight_discrepancy_kg).toBe(-0.7);
    });
  });

  describe("Reward Rules & Point Adjustments Governance", () => {
    it("should create versioned reward rule without altering past history", async () => {
      const existingRules = await fetchRewardRules();
      const initialCount = existingRules.length;

      const newRule = await createRewardRule({
        category_id: "cat_anorganik_pet",
        points_per_kg: 35,
        minimum_weight_kg: 0.5,
        max_points_per_pickup: 600,
      });

      expect(newRule.version).toBeGreaterThanOrEqual(2);
      expect(newRule.points_per_kg).toBe(35);

      const updatedRules = await fetchRewardRules();
      expect(updatedRules.length).toBe(initialCount + 1);
    });

    it("should reject manual point adjustment if reason is omitted", async () => {
      await expect(
        adjustUserPoints({
          user_id: "usr_warga_01",
          points_delta: 50,
          reason: "", // Omitted reason
          idempotency_key: "idem_test_01",
        })
      ).rejects.toThrow(/Alasan penyesuaian saldo poin wajib dicatat/);
    });
  });

  describe("User Accounts & Read-Only Audit Log", () => {
    it("should fetch users and update user suspension status with mandatory reason", async () => {
      const usersRes = await fetchAdminUsers();
      expect(usersRes.items.length).toBeGreaterThan(0);

      await expect(
        updateUserStatus("usr_warga_01", "SUSPENDED", "")
      ).rejects.toThrow(/Alasan perubahan status akun wajib diisi/);

      const suspended = await updateUserStatus(
        "usr_warga_01",
        "SUSPENDED",
        "Pelanggaran limbah B3 berulang"
      );
      expect(suspended.status).toBe("SUSPENDED");
    });

    it("should fetch immutable system audit logs", async () => {
      const auditRes = await fetchAuditLogs();
      expect(Array.isArray(auditRes.items)).toBe(true);
      expect(auditRes.items.length).toBeGreaterThan(0);
      expect(auditRes.items[0].action).toBeDefined();
    });
  });

  describe("UI Page Rendering", () => {
    it("renders admin operational dashboard with real metrics", async () => {
      render(
        <ToastProvider>
          <AuthProvider>
            <AdminDashboardPage />
          </AuthProvider>
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Konsol Supervisi Banjar Pilot/i)).toBeInTheDocument();
        expect(screen.getByText(/Total Setoran Selesai/i)).toBeInTheDocument();
      });
    });

    it("renders collector verification queue page", async () => {
      render(
        <ToastProvider>
          <AuthProvider>
            <StaffVerificationPage />
          </AuthProvider>
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Verifikasi Pengajuan Petugas Lapangan/i)).toBeInTheDocument();
      });
    });

    it("renders admin operational reports and CSV export page", async () => {
      render(
        <ToastProvider>
          <AuthProvider>
            <AdminReportsPage />
          </AuthProvider>
        </ToastProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Laporan Operasional & Audit Sirkular/i)).toBeInTheDocument();
      });
    });
  });
});
