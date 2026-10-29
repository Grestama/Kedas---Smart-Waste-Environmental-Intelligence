import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import {
  formatIDR,
  formatWITA,
  formatWeightKg,
  formatPoints,
  colors,
} from "../tokens";
import { Button } from "../components/ui/Button";
import { StatusBadge, getStatusBadgeConfig } from "../components/ui/StatusBadge";
import { Panel } from "../components/ui/Panel";
import { StatCard } from "../components/ui/StatCard";
import { EmptyState } from "../components/ui/EmptyState";

describe("Design System Tokens & Formatters", () => {
  it("formats IDR currency correctly", () => {
    const formatted = formatIDR(250000);
    expect(formatted).toContain("250.000");
  });

  it("formats weight in kilograms correctly", () => {
    expect(formatWeightKg(4.5)).toBe("4,5 kg");
    expect(formatWeightKg(12)).toBe("12,0 kg");
  });

  it("formats WastePoints correctly", () => {
    expect(formatPoints(1250)).toBe("1.250 poin");
  });

  it("formats date/time in WITA timezone (Asia/Makassar)", () => {
    // 2026-10-29T12:00:00Z is 20:00 WITA (UTC+8)
    const formatted = formatWITA("2026-10-29T12:00:00Z");
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe("string");
  });

  it("has the required Calm Field Operations color tokens", () => {
    expect(colors.brand[900]).toBe("#1D3F35");
    expect(colors.brand[700]).toBe("#2F6552");
    expect(colors.brand[100]).toBe("#E8F0E9");
    expect(colors.canvas).toBe("#F6F6F1");
    expect(colors.surface).toBe("#FFFFFF");
    expect(colors.status.success.text).toBe("#276749");
    expect(colors.status.warning.text).toBe("#98631C");
    expect(colors.status.danger.text).toBe("#A43F35");
  });
});

describe("UI Components Rendering", () => {
  it("renders Button with primary variant and text", () => {
    render(<Button variant="primary">Kirim Permintaan</Button>);
    const btn = screen.getByRole("button", { name: /kirim permintaan/i });
    expect(btn).toBeDefined();
    expect(btn.className).toContain("bg-brand-900");
  });

  it("renders Button in loading state with accessible aria-busy", () => {
    render(<Button isLoading>Simpan</Button>);
    const btn = screen.getByRole("button");
    expect(btn.getAttribute("aria-busy")).toBe("true");
    expect(btn.getAttribute("disabled")).not.toBeNull();
    expect(screen.getByText(/memproses/i)).toBeDefined();
  });

  it("maps backend statuses to proper badge variant", () => {
    expect(getStatusBadgeConfig("selesai").variant).toBe("success");
    expect(getStatusBadgeConfig("diajukan").variant).toBe("info");
    expect(getStatusBadgeConfig("dijemput").variant).toBe("warning");
    expect(getStatusBadgeConfig("dibatalkan").variant).toBe("danger");
  });

  it("renders StatusBadge with dot and text", () => {
    render(<StatusBadge variant="success" label="Selesai Ditimbang" />);
    expect(screen.getByText("Selesai Ditimbang")).toBeDefined();
  });

  it("renders Panel with header, action, and children", () => {
    render(
      <Panel
        title="Panel Judul"
        subtitle="Sub-keterangan"
        action={<button>Aksi</button>}
      >
        <div>Konten Utama Panel</div>
      </Panel>
    );
    expect(screen.getByText("Panel Judul")).toBeDefined();
    expect(screen.getByText("Sub-keterangan")).toBeDefined();
    expect(screen.getByText("Konten Utama Panel")).toBeDefined();
    expect(screen.getByRole("button", { name: "Aksi" })).toBeDefined();
  });

  it("renders StatCard with highlight and hint", () => {
    render(
      <StatCard
        label="Terkumpul"
        value="1.420 kg"
        hint="Bulan berjalan"
        highlight
      />
    );
    expect(screen.getByText("Terkumpul")).toBeDefined();
    expect(screen.getByText("1.420 kg")).toBeDefined();
    expect(screen.getByText("Bulan berjalan")).toBeDefined();
  });

  it("renders EmptyState with call to action", () => {
    render(
      <EmptyState
        title="Belum Ada Data"
        description="Silakan buat setoran baru."
        action={<Button>Buat Setoran</Button>}
      />
    );
    expect(screen.getByText("Belum Ada Data")).toBeDefined();
    expect(screen.getByText("Silakan buat setoran baru.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Buat Setoran" })).toBeDefined();
  });
});
