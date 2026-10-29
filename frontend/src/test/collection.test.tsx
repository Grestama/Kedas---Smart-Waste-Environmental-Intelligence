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
  it("renders category choices and slot selections", async () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <NewDepositPage />
        </AuthProvider>
      </ToastProvider>
    );

    expect(
      await screen.findByText(/1\. Pilih Kategori Sampah Terpilah/i)
    ).toBeDefined();
    expect(
      screen.getByText(/2\. Alamat Penjemputan & Jadwal Slot Banjar/i)
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: /kirim permintaan setoran/i })
    ).toBeDefined();
  });
});
