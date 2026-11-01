"use client";

import React from "react";
import { Check, Edit3, AlertCircle } from "lucide-react";
import { AIConfidenceIndicator, ConfidenceBand } from "./AIConfidenceIndicator";
import { AIDataProvenance } from "./AIDataProvenance";

export interface MaterialSuggestion {
  category_code: string;
  category_name: string;
  confidence_band: ConfidenceBand;
  confidence_score: number;
  preparation_instructions?: string;
  is_accepted_in_area?: boolean;
}

interface AISuggestionReviewProps {
  suggestion: MaterialSuggestion;
  onAccept: (categoryCode: string) => void;
  onSelectAlternative: () => void;
  className?: string;
}

export function AISuggestionReview({
  suggestion,
  onAccept,
  onSelectAlternative,
  className = "",
}: AISuggestionReviewProps) {
  return (
    <div
      className={`bg-white border border-brand-200/80 rounded-xl p-4 shadow-sm space-y-3 ${className}`}
      role="region"
      aria-label="Tinjauan Saran Material AI"
    >
      <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-brand-900 uppercase tracking-wider">
            Saran Analisis Material AI
          </span>
          <AIDataProvenance level="ESTIMATED" />
        </div>
        <AIConfidenceIndicator
          band={suggestion.confidence_band}
          score={suggestion.confidence_score}
        />
      </div>

      <div className="space-y-1">
        <div className="text-xs text-stone-500">Kandidat Kategori:</div>
        <div className="text-base font-bold text-stone-900 flex items-center gap-2">
          <span>{suggestion.category_name}</span>
          <span className="text-xs font-mono bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
            {suggestion.category_code}
          </span>
        </div>
      </div>

      {suggestion.preparation_instructions && (
        <div className="bg-brand-50/60 border border-brand-100 rounded-lg p-2.5 text-xs text-brand-950">
          <div className="font-semibold text-brand-900 mb-0.5">Petunjuk Penyiapan:</div>
          <p>{suggestion.preparation_instructions}</p>
        </div>
      )}

      {suggestion.is_accepted_in_area === false && (
        <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            Perhatian: Kategori ini sedang tidak diterima di fasilitas TPS3R kawasan Anda saat ini.
          </span>
        </div>
      )}

      <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
        <button
          type="button"
          onClick={onSelectAlternative}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Pilih Kategori Lain</span>
        </button>
        <button
          type="button"
          onClick={() => onAccept(suggestion.category_code)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-brand-800 hover:bg-brand-900 rounded-lg transition-colors shadow-sm"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Gunakan Rekomendasi Ini</span>
        </button>
      </div>
    </div>
  );
}
