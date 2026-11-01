"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
} from "lucide-react";
import { AICitationCard, CitationItem } from "./AICitationCard";
import { AIDataProvenance, ProvenanceLevel } from "./AIDataProvenance";
import { AIAbstainState } from "./AIAbstainState";
import { aiService } from "../../services/ai";

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  citations?: CitationItem[];
  provenance?: ProvenanceLevel;
  abstained?: boolean;
  abstainReason?: string;
  suggestedPrompts?: string[];
  logId?: string;
}

interface AIAssistantPanelProps {
  title?: string;
  destinationName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (message: string) => Promise<ChatMessage | null>;
  initialSuggestedPrompts?: string[];
}

export function AIAssistantPanel({
  title = "Kedas EcoGuide",
  destinationName = "Desa Adat Ubud & Banjar Sanur",
  isOpen,
  onClose,
  onSendMessage,
  initialSuggestedPrompts = [
    "Bagaimana aturan pemilahan sampah organik dan anorganik di kawasan ini?",
    "Apakah minyak jelantah diterima di TPS3R setempat?",
    "Berapa batas kapasitas harian penjemputan di banjar saya?",
  ],
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: `Om Swastiastu! Saya adalah Kedas EcoGuide, asisten pengetahuan berbasis data operasional dan aturan adat kawasan ${destinationName}. Ada yang ingin Anda tanyakan seputar pemilahan material atau jadwal layanan?`,
      provenance: "VERIFIED",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, "up" | "down">>({});

  // Support ESC dismiss
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isOpen && e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      if (onSendMessage) {
        const response = await onSendMessage(query);
        if (response) {
          setMessages((prev) => [...prev, response]);
        }
      } else {
        // Safe local fallback simulation
        setTimeout(() => {
          const fallbackResponse: ChatMessage = {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: `Berdasarkan Peraturan Gubernur Bali No. 47/2019 dan kesepakatan CDOA kawasan ${destinationName}, sampah anorganik (seperti botol plastik PET dan kardus) wajib dikumpulkan dalam keadaan bersih dan kering. Penjemputan dilakukan setiap hari Selasa dan Jumat.`,
            provenance: "VERIFIED",
            citations: [
              {
                id: "c-1",
                source_id: "CDOA-UBD-2026-001",
                title: "Kesepakatan Operasional CDOA Tebesaya",
                section: "Pasal 4 Ayat 2",
                excerpt:
                  "Pengangkutan sampah anorganik terpilah dijadwalkan pada hari Selasa dan Jumat pukul 07.00 - 10.00 WITA.",
                cdoa_version: "1.0",
              },
            ],
          };
          setMessages((prev) => [...prev, fallbackResponse]);
          setIsLoading(false);
        }, 600);
        return;
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          text: "Mohon maaf, layanan asisten cerdas sedang mengalami gangguan komunikasi server.",
          abstained: true,
          abstainReason: "Koneksi ke adapter AI terputus. Silakan hubungi koordinator banjar.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (msgId: string, type: "up" | "down") => {
    setFeedbackGiven((prev) => ({ ...prev, [msgId]: type }));
    const msg = messages.find((m) => m.id === msgId);
    if (msg?.logId) {
      aiService.submitFeedback(msg.logId, type === "up" ? "THUMBS_UP" : "THUMBS_DOWN").catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#122620]/50 backdrop-blur-[2px] transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative z-10 w-full sm:w-[440px] bg-white shadow-2xl flex flex-col border-l border-stone-200 animate-slide-in-right h-full"
        role="dialog"
        aria-modal="true"
        aria-label="Panel Asisten Cerdas Kedas"
      >
        {/* Header */}
        <div className="p-4 bg-brand-900 text-white flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-700/80 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-emerald-300" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">{title}</h3>
              <p className="text-[11px] text-emerald-200/80">{destinationName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-brand-800 active:scale-95 transition-all focus:outline-none"
            aria-label="Tutup Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Trust & Boundary Notice */}
      <div className="px-3.5 py-1.5 bg-stone-100 border-b border-stone-200/70 text-[11px] text-stone-600 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-stone-500" />
          <span>Jawaban berakar pada CDOA & SOP Kawasan</span>
        </span>
        <AIDataProvenance level="VERIFIED" />
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-brand-800 text-white rounded-br-none shadow-sm"
                  : "bg-stone-50 text-stone-800 border border-stone-200/80 rounded-bl-none"
              }`}
            >
              {msg.sender === "ai" && (
                <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-stone-200/60">
                  <span className="font-semibold text-brand-900 text-[11px]">Kedas EcoGuide</span>
                  {msg.provenance && <AIDataProvenance level={msg.provenance} />}
                </div>
              )}

              <p className="whitespace-pre-wrap">{msg.text}</p>

              {msg.abstained && msg.abstainReason && (
                <AIAbstainState reason={msg.abstainReason} />
              )}

              {msg.citations && msg.citations.length > 0 && (
                <AICitationCard citations={msg.citations} />
              )}

              {msg.sender === "ai" && (
                <div className="mt-2.5 pt-1.5 flex items-center justify-between border-t border-stone-200/40 text-[10px] text-stone-400">
                  <span>Apakah jawaban ini membantu?</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleFeedback(msg.id, "up")}
                      className={`p-1 rounded hover:bg-stone-200 ${
                        feedbackGiven[msg.id] === "up" ? "text-emerald-700 bg-emerald-100" : ""
                      }`}
                      aria-label="Membantu"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFeedback(msg.id, "down")}
                      className={`p-1 rounded hover:bg-stone-200 ${
                        feedbackGiven[msg.id] === "down" ? "text-rose-700 bg-rose-100" : ""
                      }`}
                      aria-label="Tidak Membantu"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-200 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-700" />
            <span>Mencari rujukan dokumen kawasan & merumuskan jawaban...</span>
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length <= 2 && (
        <div className="p-3 bg-stone-50/80 border-t border-stone-200/60">
          <div className="text-[11px] font-semibold text-stone-600 mb-1.5">Pertanyaan Populer:</div>
          <div className="flex flex-wrap gap-1.5">
            {initialSuggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(prompt)}
                className="text-[11px] text-left bg-white border border-stone-200 hover:border-brand-600 hover:text-brand-900 active:scale-[0.97] px-2.5 py-1 rounded-full text-stone-700 transition-all duration-fast shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanyakan aturan pemilahan, SOP, atau jadwal..."
          className="flex-1 px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 bg-brand-800 text-white rounded-lg hover:bg-brand-900 active:scale-95 disabled:opacity-40 disabled:hover:bg-brand-800 transition-all duration-fast"
          aria-label="Kirim Pertanyaan"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  </div>
  );
}
