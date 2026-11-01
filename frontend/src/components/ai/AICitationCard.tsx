"use client";

import React, { useState } from "react";
import { BookOpen, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

export interface CitationItem {
  id: string;
  source_id: string;
  title: string;
  section?: string;
  excerpt: string;
  cdoa_version?: string;
  url?: string;
}

interface AICitationCardProps {
  citations: CitationItem[];
  className?: string;
}

export function AICitationCard({ citations, className = "" }: AICitationCardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className={`mt-3 pt-3 border-t border-border ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary mb-2">
        <BookOpen className="w-3.5 h-3.5 text-brand-700" aria-hidden="true" />
        <span>Rujukan Sumber Terverifikasi ({citations.length}):</span>
      </div>
      <div className="space-y-1.5">
        {citations.map((c, index) => {
          const isExpanded = expandedId === c.id;
          return (
            <div
              key={c.id || index}
              className="bg-[#FAFBF9] border border-border rounded-xl p-2.5 text-xs transition-all duration-fast ease-soft hover:border-brand-800/60 hover:bg-white"
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  className="flex items-center gap-1.5 text-left font-medium text-text-primary hover:text-brand-900 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#83b6a0] rounded"
                  aria-expanded={isExpanded}
                >
                  <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-900 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-brand-900">{c.title}</span>
                  {c.section && <span className="text-text-secondary font-normal">({c.section})</span>}
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                  )}
                </button>
                {c.cdoa_version && (
                  <span className="text-[10px] bg-brand-100 text-brand-900 px-1.5 py-0.5 rounded font-mono border border-[#D7E4D9]/60 shrink-0">
                    v{c.cdoa_version}
                  </span>
                )}
              </div>
              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-border text-text-secondary text-xs leading-relaxed space-y-1 animate-fade-in">
                  <p className="italic bg-white p-2 rounded-lg border border-border">
                    &ldquo;{c.excerpt}&rdquo;
                  </p>
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-brand-800 font-semibold hover:underline mt-1.5"
                    >
                      <span>Buka dokumen asli</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
