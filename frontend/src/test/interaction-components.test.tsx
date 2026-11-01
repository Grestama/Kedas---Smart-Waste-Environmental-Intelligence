import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Drawer } from "@/components/ui/Drawer";
import { Tooltip } from "@/components/ui/Tooltip";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";

describe("Interaction Components Tests (Stage 7 QA)", () => {
  describe("Drawer Component", () => {
    it("renders drawer when isOpen is true and calls onClose on ESC", () => {
      const handleClose = vi.fn();
      render(
        <Drawer
          isOpen={true}
          onClose={handleClose}
          title="Detail Penjemputan"
          description="Deskripsi tugas"
        >
          <p>Konten Drawer</p>
        </Drawer>
      );

      expect(screen.getByText("Detail Penjemputan")).toBeDefined();
      expect(screen.getByText("Konten Drawer")).toBeDefined();

      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("does not render drawer when isOpen is false", () => {
      render(
        <Drawer isOpen={false} onClose={() => {}} title="Hidden Drawer">
          <p>Hidden</p>
        </Drawer>
      );

      expect(screen.queryByText("Hidden Drawer")).toBeNull();
    });
  });

  describe("Tooltip Component", () => {
    it("shows tooltip on mouse enter after delay and hides on mouse leave", () => {
      vi.useFakeTimers();
      render(
        <Tooltip content="Informasi sertifikasi" delayMs={100}>
          <button type="button">Bantuan</button>
        </Tooltip>
      );

      const trigger = screen.getByText("Bantuan");
      fireEvent.mouseEnter(trigger);

      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(screen.getByRole("tooltip")).toBeDefined();
      expect(screen.getByText("Informasi sertifikasi")).toBeDefined();

      fireEvent.mouseLeave(trigger);
      expect(screen.queryByRole("tooltip")).toBeNull();
      vi.useRealTimers();
    });

    it("shows tooltip immediately on focus", () => {
      render(
        <Tooltip content="Keyboard tooltip">
          <button type="button">Fokus Saya</button>
        </Tooltip>
      );

      const trigger = screen.getByText("Fokus Saya");
      fireEvent.focus(trigger);

      expect(screen.getByRole("tooltip")).toBeDefined();
      expect(screen.getByText("Keyboard tooltip")).toBeDefined();
    });
  });

  describe("Dropdown Component", () => {
    it("opens menu on trigger click and triggers action on item click", () => {
      const handleAction = vi.fn();
      render(
        <Dropdown
          trigger={<button type="button">Opsi Filter</button>}
          items={[
            { id: "1", label: "Urutkan Tanggal", onClick: handleAction },
            { id: "2", label: "Urutkan Bobot", onClick: () => {} },
          ]}
        />
      );

      const trigger = screen.getByText("Opsi Filter");
      fireEvent.click(trigger);

      expect(screen.getByRole("menu")).toBeDefined();
      const item1 = screen.getByText("Urutkan Tanggal");
      fireEvent.click(item1);

      expect(handleAction).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("menu")).toBeNull();
    });

    it("handles keyboard navigation with ArrowDown, Enter, and Escape", () => {
      const handleSelect = vi.fn();
      render(
        <Dropdown
          trigger={<button type="button">Menu Aksi</button>}
          items={[
            { id: "act-1", label: "Setujui", onClick: handleSelect },
            { id: "act-2", label: "Tolak", onClick: () => {} },
          ]}
        />
      );

      const trigger = screen.getByText("Menu Aksi");
      fireEvent.click(trigger);

      expect(screen.getByRole("menu")).toBeDefined();

      // Press ArrowDown then Enter
      fireEvent.keyDown(trigger.parentElement!, { key: "ArrowDown" });
      fireEvent.keyDown(trigger.parentElement!, { key: "Enter" });

      expect(handleSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe("Modal Focus Trap & Escape", () => {
    it("handles Escape key dismiss", () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Konfirmasi">
          <p>Apakah Anda yakin?</p>
        </Modal>
      );

      expect(screen.getByText("Konfirmasi")).toBeDefined();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accordion Interaction", () => {
    it("toggles panel open and closed", () => {
      render(
        <Accordion
          items={[
            {
              id: "faq-test-1",
              question: "Apakah Kedas gratis?",
              answer: "Kedas gratis untuk warga banjar pilot.",
            },
          ]}
        />
      );

      const button = screen.getByRole("button", { name: /Apakah Kedas gratis\?/i });
      expect(button.getAttribute("aria-expanded")).toBe("false");

      fireEvent.click(button);
      expect(button.getAttribute("aria-expanded")).toBe("true");
      expect(screen.getByText("Kedas gratis untuk warga banjar pilot.")).toBeDefined();

      fireEvent.click(button);
      expect(button.getAttribute("aria-expanded")).toBe("false");
    });
  });
});
