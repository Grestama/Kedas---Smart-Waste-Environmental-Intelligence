import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { collectionService } from "../services/collection";
import { getStatusBadgeConfig, StatusBadge } from "../components/ui/StatusBadge";
import { ApiError } from "../lib/api-client";
import { AuthProvider } from "../context/auth-context";
import { ToastProvider } from "../components/ui/Toast";
import NewDepositPage from "../app/app/setoran/baru/page";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/app/setoran/baru",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ id: "REQ-2026-0012" }),
}));

describe("Collection Service & Safety Gating Tests", () => {
  it("fetches categories including SPECIAL hazardous category", async () => {
    const cats = await collectionService.getCategories();
    expect(cats.length).toBeGreaterThan(0);

    const specialCat = cats.find((c) => c.category_type === "SPECIAL");
    expect(specialCat).toBeDefined();
    expect(specialCat?.code).toContain("SPECIAL");
  });

  it("blocks creation of pickup request for SPECIAL category (Safety Gating)", async () => {
    const cats = await collectionService.getCategories();
    const specialCat = cats.find((c) => c.category_type === "SPECIAL");

    expect(specialCat).toBeDefined();

    await expect(
      collectionService.createPickupRequest({
        category_id: specialCat!.id,
        address_id: "addr_1",
        slot_id: "slot_1",
        estimated_weight_kg: 2.0,
      })
    ).rejects.toThrow(/safety gating/i);
  });

  it("successfully creates a valid non-SPECIAL pickup request", async () => {
    const cats = await collectionService.getCategories();
    const validCat = cats.find((c) => c.category_type !== "SPECIAL")!;

    const result = await collectionService.createPickupRequest({
      category_id: validCat.id,
      address_id: "addr_default_01",
      slot_id: "slot_01",
      estimated_weight_kg: 4.5,
      notes: "Tolong jemput pagi",
    });

    expect(result).toBeDefined();
    expect(result.status).toBe("PENDING_ASSIGNMENT");
    expect(result.public_code).toContain("WL-");
    expect(result.estimated_weight_kg).toBe(4.5);
  });

  it("fetches my pickup requests and retrieves detail with events", async () => {
    const requests = await collectionService.getMyPickupRequests();
    expect(requests.length).toBeGreaterThan(0);

    const first = requests[0];
    const detail = await collectionService.getPickupRequestDetail(first.id);
    expect(detail).toBeDefined();
    expect(detail.id).toBe(first.id);
    expect(detail.events).toBeDefined();
    expect(detail.events!.length).toBeGreaterThan(0);
  });

  it("cancels a pickup request and transitions status to CANCELLED", async () => {
    const requests = await collectionService.getMyPickupRequests();
    const first = requests[0];

    const cancelled = await collectionService.cancelPickupRequest(
      first.id,
      "Jadwal bentrok dengan upacara banjar"
    );

    expect(cancelled.status).toBe("CANCELLED");
    expect(
      cancelled.events?.some((e) => e.to_status === "CANCELLED")
    ).toBe(true);
  });
});

describe("StatusBadge Backend State Machine Mapping", () => {
  it("correctly maps all backend pickup states", () => {
    expect(getStatusBadgeConfig("PENDING_ASSIGNMENT").variant).toBe("info");
    expect(getStatusBadgeConfig("ACCEPTED").variant).toBe("info");
    expect(getStatusBadgeConfig("EN_ROUTE").variant).toBe("warning");
    expect(getStatusBadgeConfig("ARRIVED").variant).toBe("warning");
    expect(getStatusBadgeConfig("INSPECTION").variant).toBe("warning");
    expect(getStatusBadgeConfig("COLLECTED").variant).toBe("warning");
    expect(getStatusBadgeConfig("COMPLETED").variant).toBe("success");
    expect(getStatusBadgeConfig("CANCELLED").variant).toBe("danger");
  });
});

describe("NewDepositPage Component Rendering", () => {
  it("renders service modes, category choices and slot selections", async () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <NewDepositPage />
        </AuthProvider>
      </ToastProvider>
    );

    expect(
      await screen.findByText(/1\. Jalur Penyerahan Sampah/i)
    ).toBeDefined();
    expect(
      screen.getByText(/2\. Pilih Kategori Sampah Terpilah/i)
    ).toBeDefined();
    expect(
      screen.getByText(/3\. Alamat Penjemputan \/ Asal & Jadwal Slot Banjar/i)
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: /kirim permintaan setoran/i })
    ).toBeDefined();
  });

  it("supports creating drop-off requests and idempotency keys", async () => {
    const cats = await collectionService.getCategories();
    const validCat = cats.find((c) => c.category_type !== "SPECIAL")!;
    const idempotencyKey = "idem_test_web_001";

    const result = await collectionService.createPickupRequest({
      category_id: validCat.id,
      address_id: "addr_default_01",
      slot_id: "slot_01",
      service_mode: "DROP_OFF",
      idempotency_key: idempotencyKey,
      estimated_weight_kg: 5.0,
      notes: "Setoran mandiri ke pos",
    });

    expect(result).toBeDefined();
    expect(result.status).toBe("PENDING_ASSIGNMENT");
    expect(result.service_mode).toBe("DROP_OFF");
  });

  it("WL-AUD-001: re-throws server ApiError on createPickupRequest when backend rejects with HTTP error", async () => {
    const { apiClient } = await import("../lib/api-client");
    const spy = vi.spyOn(apiClient, "post").mockRejectedValueOnce(
      new ApiError(400, "Slot jadwal sudah penuh.", "SLOT_CAPACITY_EXCEEDED")
    );

    const cats = await collectionService.getCategories();
    const validCat = cats.find((c) => c.category_type !== "SPECIAL")!;

    await expect(
      collectionService.createPickupRequest({
        category_id: validCat.id,
        address_id: "addr_default_01",
        slot_id: "slot_01",
        estimated_weight_kg: 5.0,
      })
    ).rejects.toThrow("Slot jadwal sudah penuh.");

    spy.mockRestore();
  });

  it("WL-AUD-001: re-throws server ApiError on cancelPickupRequest when backend rejects cancellation", async () => {
    const { apiClient } = await import("../lib/api-client");
    const spy = vi.spyOn(apiClient, "post").mockRejectedValueOnce(
      new ApiError(409, "Setoran dalam status [EN_ROUTE] tidak dapat dibatalkan.", "INVALID_STATE_TRANSITION")
    );

    await expect(
      collectionService.cancelPickupRequest("req_123", "Batal jemput")
    ).rejects.toThrow("tidak dapat dibatalkan");

    spy.mockRestore();
  });

  it("WL-AUD-005: correctly maps extended domain statuses to badge variants", () => {
    expect(getStatusBadgeConfig("INSPECTION")).toEqual({ variant: "warning", label: "Inspeksi Kualitas" });
    expect(getStatusBadgeConfig("WEIGHED")).toEqual({ variant: "info", label: "Diajukan" });
    expect(getStatusBadgeConfig("SAFELY_DISPOSED")).toEqual({ variant: "success", label: "Selesai" });
    expect(getStatusBadgeConfig("HARVESTED")).toEqual({ variant: "success", label: "Selesai" });
    expect(getStatusBadgeConfig("PROCESSED_CONFIRMED")).toEqual({ variant: "success", label: "Selesai" });
    expect(getStatusBadgeConfig("RESOLVED")).toEqual({ variant: "success", label: "Selesai" });
  });
});
