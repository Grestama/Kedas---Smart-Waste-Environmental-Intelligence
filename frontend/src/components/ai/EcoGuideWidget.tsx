"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, MessageSquare } from "lucide-react";
import { AIAssistantPanel, ChatMessage } from "./AIAssistantPanel";
import { aiService } from "../../services/ai";

interface EcoGuideWidgetProps {
  destinationId?: string;
  destinationName?: string;
  initialPrompts?: string[];
  className?: string;
}

export function EcoGuideWidget({
  destinationId,
  destinationName = "Kawasan Desa Adat Bali",
  initialPrompts = [
    "Bagaimana aturan pemilahan sampah canang sari dan upakara?",
    "Apakah minyak jelantah dan botol kaca diterima di TPS3R?",
    "Kapan jadwal armada pengangkutan sampah daur ulang di banjar?",
    "Bagaimana cara memilah sampah dapur agar tidak berbau?",
  ],
  className = "",
}: EcoGuideWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-ecoguide", handleOpen);
    return () => window.removeEventListener("open-ecoguide", handleOpen);
  }, []);

  const handleSendMessage = async (text: string): Promise<ChatMessage | null> => {
    try {
      const resp = await aiService.askEcoGuide({
        question: text,
        destination_id: destinationId,
      });

      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: resp.answer,
        citations: resp.citations,
        provenance: resp.status === "SUCCESS" ? "VERIFIED" : "ESTIMATED",
        abstained: resp.status === "INSUFFICIENT_CONTEXT",
        abstainReason: resp.abstain_reason,
        logId: resp.log_id,
      };
    } catch {
      return {
        id: `ai-err-${Date.now()}`,
        sender: "ai",
        text: "Terjadi gangguan saat menghubungkan ke asisten. Silakan coba sesaat lagi.",
        abstained: true,
        abstainReason: "Layanan asisten sementara offline. Gunakan panduan SOP manual.",
      };
    }
  };

  return (
    <>
      <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-[#122620] hover:bg-[#1A382F] text-white rounded-full shadow-lg border-2 border-emerald-400/40 hover:border-emerald-400 hover:-translate-y-1 hover:shadow-interactive-hover active:scale-95 transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
          aria-label="Buka Kedas EcoGuide AI"
        >
          <div className="relative w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-[#122620]"></span>
            </span>
          </div>
          <div className="text-left">
            <span className="text-xs font-bold tracking-wide block leading-tight text-white group-hover:text-emerald-300 transition-colors">
              Tanya EcoGuide
            </span>
            <span className="text-[10px] text-emerald-300/80 font-medium block">
              AI SOP Sampah Bali
            </span>
          </div>
        </button>
      </div>

      <AIAssistantPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        destinationName={destinationName}
        onSendMessage={handleSendMessage}
        initialSuggestedPrompts={initialPrompts}
      />
    </>
  );
}
