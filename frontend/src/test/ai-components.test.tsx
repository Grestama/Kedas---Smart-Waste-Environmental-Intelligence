import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  AIDataProvenance,
  AIConfidenceIndicator,
  AICitationCard,
  AIAbstainState,
  AISuggestionReview,
  OperationRecommendationCard,
  AIAssistantPanel,
} from "../components/ai";

describe("AI Design System Components", () => {
  it("renders AIDataProvenance with correct labels and icons", () => {
    const { rerender } = render(<AIDataProvenance level="VERIFIED" />);
    expect(screen.getByText("Terverifikasi Sistem")).toBeInTheDocument();

    rerender(<AIDataProvenance level="ESTIMATED" sourceText="Vision Model" />);
    expect(screen.getByText("Estimasi Model")).toBeInTheDocument();
    expect(screen.getByText("(Vision Model)")).toBeInTheDocument();

    rerender(<AIDataProvenance level="SIMULATED" />);
    expect(screen.getByText("Data Demo / Simulasi")).toBeInTheDocument();
  });

  it("renders AIConfidenceIndicator with score and band", () => {
    const { rerender } = render(<AIConfidenceIndicator band="HIGH" score={0.94} />);
    expect(screen.getByText("Tinggi")).toBeInTheDocument();
    expect(screen.getByText("(94%)")).toBeInTheDocument();

    rerender(<AIConfidenceIndicator band="NEEDS_REVIEW" />);
    expect(screen.getByText("Perlu Verifikasi Manusia")).toBeInTheDocument();
  });

  it("renders AICitationCard and toggles excerpt expansion", () => {
    const citations = [
      {
        id: "cit-1",
        source_id: "CDOA-01",
        title: "SOP TPS3R Tebesaya",
        section: "Pasal 2",
        excerpt: "Sampah plastik PET wajib dibilas bersih sebelum diserahkan.",
      },
    ];

    render(<AICitationCard citations={citations} />);
    expect(screen.getByText("SOP TPS3R Tebesaya")).toBeInTheDocument();
    expect(screen.getByText("(Pasal 2)")).toBeInTheDocument();

    // Toggle expansion
    const toggleBtn = screen.getByRole("button", { name: /SOP TPS3R Tebesaya/i });
    fireEvent.click(toggleBtn);
    expect(
      screen.getByText(/Sampah plastik PET wajib dibilas bersih sebelum diserahkan/i)
    ).toBeInTheDocument();
  });

  it("renders AIAbstainState gracefully", () => {
    render(
      <AIAbstainState
        reason="Aturan pengolahan limbah minyak jelantah belum terdaftar dalam CDOA aktif."
        suggestedAction="Simpan dalam jeriken tertutup dan hubungi prajuru banjar."
        contactChannel="+62 812-3456-7890"
      />
    );
    expect(screen.getByText("Informasi Terverifikasi Belum Tersedia")).toBeInTheDocument();
    expect(
      screen.getByText(/Aturan pengolahan limbah minyak jelantah belum terdaftar/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/\+62 812-3456-7890/i)).toBeInTheDocument();
  });

  it("handles AISuggestionReview user acceptance and alternative trigger", () => {
    const onAccept = vi.fn();
    const onSelectAlt = vi.fn();

    render(
      <AISuggestionReview
        suggestion={{
          category_code: "PLASTIK_PET",
          category_name: "Botol Plastik Bening (PET)",
          confidence_band: "HIGH",
          confidence_score: 92,
          preparation_instructions: "Lepas label dan kempeskan botol.",
        }}
        onAccept={onAccept}
        onSelectAlternative={onSelectAlt}
      />
    );

    expect(screen.getByText("Botol Plastik Bening (PET)")).toBeInTheDocument();
    expect(screen.getByText("Lepas label dan kempeskan botol.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Gunakan Rekomendasi Ini/i }));
    expect(onAccept).toHaveBeenCalledWith("PLASTIK_PET");

    fireEvent.click(screen.getByRole("button", { name: /Pilih Kategori Lain/i }));
    expect(onSelectAlt).toHaveBeenCalledTimes(1);
  });

  it("renders OperationRecommendationCard and fires execution callback", () => {
    const onExecute = vi.fn();

    render(
      <OperationRecommendationCard
        recommendation={{
          id: "rec-01",
          title: "Prioritaskan Pengangkutan Banjar Tebesaya",
          rationale: "Fasilitas TPS3R memiliki sisa kapasitas 250 kg sebelum jadwal tutup pukul 14.00.",
          priority: "HIGH",
          constraints_checked: [
            "Fasilitas berstatus OPERATIONAL",
            "Kategori material sesuai kapasitas conveyor",
          ],
          suggested_action_label: "Tugaskan Armada 02",
          metric_snapshot: {
            capacity_available_kg: 250,
            pending_tasks: 3,
            mass_balance_ratio: 98.5,
          },
        }}
        onExecute={onExecute}
      />
    );

    expect(screen.getByText("Prioritaskan Pengangkutan Banjar Tebesaya")).toBeInTheDocument();
    expect(screen.getByText("Prioritas Tinggi")).toBeInTheDocument();
    expect(screen.getByText("250 kg")).toBeInTheDocument();
    expect(screen.getByText("98.5%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Tugaskan Armada 02/i }));
    expect(onExecute).toHaveBeenCalledWith("rec-01");
  });

  it("renders AIAssistantPanel and sends message", () => {
    const onClose = vi.fn();

    render(
      <AIAssistantPanel
        isOpen={true}
        onClose={onClose}
        destinationName="Banjar Ubud"
      />
    );

    expect(screen.getAllByText("Kedas EcoGuide")[0]).toBeInTheDocument();
    expect(screen.getByText("Banjar Ubud")).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /Tutup Panel/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
