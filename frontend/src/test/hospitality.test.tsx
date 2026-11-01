import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HospitalityDashboardPage from "../app/hospitality/page";
import HospitalitySetoranPage from "../app/hospitality/setoran/page";
import HospitalityEsgPage from "../app/hospitality/esg/page";
import HospitalityGuestCompanionPage from "../app/hospitality/guest-companion/page";
import HospitalityLaporPage from "../app/hospitality/lapor/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => "/hospitality",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Toast
vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    showToast: vi.fn(),
  }),
}));

describe("Green Hospitality Workspace (GAP-004)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders HospitalityDashboardPage with KPIs and recent pickups", async () => {
    render(<HospitalityDashboardPage />);

    expect(screen.getByText(/Dashboard Operasional Sirkular Perhotelan/i)).toBeDefined();
    expect(screen.getByText(/Laju Diversi TPA/i)).toBeDefined();
    expect(screen.getByText(/Emisi Terhindar/i)).toBeDefined();
    expect(screen.getByText(/Kuota CDOA Hari Ini/i)).toBeDefined();
    expect(screen.getByText(/Riwayat Penjemputan B2B Terverifikasi/i)).toBeDefined();
  });

  it("renders HospitalitySetoranPage and adds new waste entry", async () => {
    render(<HospitalitySetoranPage />);

    expect(screen.getByText(/Pencatatan Timbulan Sampah Harian/i)).toBeDefined();
    expect(screen.getByText(/Informasi Shift & Penanggung Jawab/i)).toBeDefined();

    // Verify existing items
    expect(screen.getAllByText(/Organik Dapur \(Food Waste\)/i)[0]).toBeDefined();

    // Add a new entry
    const weightInput = screen.getByPlaceholderText("0.0");
    const addButton = screen.getByRole("button", { name: /Tambah/i });

    fireEvent.change(weightInput, { target: { value: "45.5" } });
    fireEvent.click(addButton);

    expect(screen.getByText(/^45\.5$/)).toBeDefined();
  });

  it("renders HospitalityEsgPage with audit trail and mandatory disclaimer", async () => {
    render(<HospitalityEsgPage />);

    expect(screen.getByText(/Tingkat Diversi Sampah/i)).toBeDefined();
    expect(screen.getByText(/Komposisi Fraksi Material/i)).toBeDefined();
    expect(screen.getByText(/Rantai Lacak Bukti Fisik \(Audit Trail\)/i)).toBeDefined();
    // Audit disclaimer check
    expect(screen.getByText(/Catatan Independensi & Integritas Bukti/i)).toBeDefined();
    expect(screen.getByText(/Laporan Operasional Green Hospitality Kedas/i)).toBeDefined();
  });

  it("renders HospitalityGuestCompanionPage and allows language switching", async () => {
    render(<HospitalityGuestCompanionPage />);

    expect(screen.getByText(/Guest Waste Sorting Companion/i)).toBeDefined();
    expect(screen.getByText(/Green Bin \(Organic\)/i)).toBeDefined();

    // Switch to Japanese
    const jaButton = screen.getByRole("button", { name: /日本語/i });
    fireEvent.click(jaButton);

    expect(screen.getByText(/ゲスト専用 ごみ分別ガイド/i)).toBeDefined();
    expect(screen.getByText(/緑のゴミ箱/i)).toBeDefined();
  });

  it("renders HospitalityLaporPage and submits community incident", async () => {
    render(<HospitalityLaporPage />);

    expect(screen.getByText(/Lapor Insiden Kawasan Wisata \(EcoLoop\)/i)).toBeDefined();

    const titleInput = screen.getByPlaceholderText(/Contoh: Tumpukan kelapa muda/i);
    const locInput = screen.getByPlaceholderText(/Contoh: Jl. Raya Sayang/i);
    const descInput = screen.getByPlaceholderText(/Jelaskan kondisi timbulan/i);
    const submitBtn = screen.getByRole("button", { name: /Kirimkan Laporan/i });

    fireEvent.change(titleInput, { target: { value: "Tumpukan sampah batok kelapa" } });
    fireEvent.change(locInput, { target: { value: "Depan Pura Dalem Ubud" } });
    fireEvent.change(descInput, { target: { value: "Meluap ke trotoar jalan utama turis" } });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Laporan Anda Telah Terdaftar/i)).toBeDefined();
    });
  });
});
