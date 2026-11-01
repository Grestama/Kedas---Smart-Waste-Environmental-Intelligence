import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ServiceAreaPage from "../app/(public)/area-layanan/page";
import { collectionService } from "../services/collection";
import * as communityModule from "../services/community";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => "/area-layanan",
  useSearchParams: () => new URLSearchParams(),
}));

describe("ServiceAreaPage (Dynamic CDOA & Destination Directory)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header, description, and area cards", async () => {
    render(<ServiceAreaPage />);

    expect(screen.getByText(/Cakupan Area Layanan & Aturan Operasional Destinasi/i)).toBeDefined();
    expect(screen.getByText(/Community Destination Operating Agreement \(CDOA\)/i)).toBeDefined();

    await waitFor(() => {
      const headings = screen.getAllByRole("heading", { level: 2 });
      expect(headings.length).toBeGreaterThan(0);
      expect(headings[0].textContent).toContain("Banjar");
    });
  });

  it("allows searching for specific banjar or agreement number", async () => {
    render(<ServiceAreaPage />);

    await waitFor(() => {
      const headings = screen.getAllByRole("heading", { level: 2 });
      expect(headings.length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByPlaceholderText(/Cari Banjar, Desa, Kecamatan/i);
    fireEvent.change(searchInput, { target: { value: "Tengah" } });

    await waitFor(() => {
      const headings = screen.getAllByRole("heading", { level: 2 });
      expect(headings.some((h) => h.textContent?.includes("Tengah"))).toBe(true);
    });
  });

  it("allows filtering by CDOA status", async () => {
    render(<ServiceAreaPage />);

    await waitFor(() => {
      const headings = screen.getAllByRole("heading", { level: 2 });
      expect(headings.length).toBeGreaterThan(0);
    });

    // Click 'CDOA Aktif' filter
    const activeFilterBtn = screen.getByRole("button", { name: /CDOA Aktif/i });
    fireEvent.click(activeFilterBtn);

    await waitFor(() => {
      const headings = screen.getAllByRole("heading", { level: 2 });
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  it("expands CDOA rules and accepted categories on click", async () => {
    render(<ServiceAreaPage />);

    await waitFor(() => {
      const headings = screen.getAllByRole("heading", { level: 2 });
      expect(headings.length).toBeGreaterThan(0);
    });

    const expandButtons = screen.getAllByText(/Lihat Aturan CDOA & Pemilahan/i);
    expect(expandButtons.length).toBeGreaterThan(0);

    fireEvent.click(expandButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Kategori Sampah yang Diterima:/i)).toBeDefined();
      expect(screen.getByText(/Saluran Eskalasi & Aduan:/i)).toBeDefined();
    });
  });
});
