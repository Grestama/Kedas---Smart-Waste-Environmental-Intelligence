import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AdminKnowledgePage from "../app/admin/pengetahuan/page";
import { ToastProvider } from "../components/ui/Toast";

describe("AdminKnowledgePage (GAP-007 Knowledge Administration UI)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <ToastProvider>
        <AdminKnowledgePage />
      </ToastProvider>
    );
  };

  it("renders knowledge management header, actions, and initial documents", async () => {
    renderComponent();

    expect(screen.getByText(/Basis Pengetahuan & Regulasi Kawasan Kedas/i)).toBeDefined();
    expect(screen.getByText(/RAG Knowledge Base & Document Provenance/i)).toBeDefined();

    await waitFor(() => {
      expect(
        screen.getByText(/Peraturan Gubernur Bali No. 47 Tahun 2019/i)
      ).toBeDefined();
    });
  });

  it("filters documents by search query", async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/Peraturan Gubernur Bali No. 47 Tahun 2019/i)
      ).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/Cari judul dokumen/i);
    fireEvent.change(searchInput, { target: { value: "Tebesaya" } });

    await waitFor(() => {
      expect(
        screen.getByText(/SOP Operasional Pemilahan & Pengolahan TPS3R Tebesaya/i)
      ).toBeDefined();
      expect(
        screen.queryByText(/Peraturan Gubernur Bali No. 47 Tahun 2019/i)
      ).toBeNull();
    });
  });

  it("opens ingestion modal when 'Unggah / Tambah Dokumen' is clicked", async () => {
    renderComponent();

    const addBtn = screen.getByRole("button", { name: /Unggah \/ Tambah Dokumen/i });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Ingestion Dokumen Pengetahuan Baru \(RAG\)/i)
      ).toBeDefined();
      expect(screen.getByText(/Judul Dokumen \/ Regulasi \*/i)).toBeDefined();
    });
  });

  it("opens provenance inspector modal when inspect button is clicked", async () => {
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(/Peraturan Gubernur Bali No. 47 Tahun 2019/i)
      ).toBeDefined();
    });

    const inspectButtons = screen.getAllByTitle(/Inspeksi Chunk & Kutipan RAG/i);
    expect(inspectButtons.length).toBeGreaterThan(0);

    fireEvent.click(inspectButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/PROVENANCE INSPECTOR/i)).toBeDefined();
      expect(screen.getByText(/Tutup Inspektor/i)).toBeDefined();
    });
  });
});
