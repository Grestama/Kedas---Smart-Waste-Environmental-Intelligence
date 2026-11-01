"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { AIDataProvenance } from "./AIDataProvenance";
import { ActionProposalModal } from "./ActionProposalModal";

export interface ActionProposalPayload {
  action_type: "ADJUST_SERVICE_SLOT" | "CREATE_STAFF_TASK" | "PROPOSE_ALTERNATE_FACILITY" | string;
  title: string;
  description: string;
  target_id?: string | null;
  service_area_id?: string | null;
  parameters: Record<string, any>;
}

export interface OperationRecommendation {
  id: string;
  title: string;
  rationale: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  constraints_checked: string[];
  suggested_action_label: string;
  target_url?: string;
  metric_snapshot?: {
    capacity_available_kg?: number;
    pending_tasks?: number;
    mass_balance_ratio?: number;
  };
  action_proposal?: ActionProposalPayload;
}

interface OperationRecommendationCardProps {
  recommendation: OperationRecommendation;
  onExecute?: (recId: string) => void;
  className?: string;
}

export function OperationRecommendationCard({
  recommendation,
  onExecute,
  className = "",
}: OperationRecommendationCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const priorityConfig = {
    HIGH: { label: "Prioritas Tinggi", badge: "bg-rose-100 text-rose-800 border-rose-200" },
    MEDIUM: { label: "Prioritas Sedang", badge: "bg-amber-100 text-amber-800 border-amber-200" },
    LOW: { label: "Saran Optimal", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  }[recommendation.priority];

  const handleActionClick = () => {
    if (recommendation.action_proposal) {
      setIsModalOpen(true);
    } else if (onExecute) {
      onExecute(recommendation.id);
    }
  };

  return (
    <>
      <div
        className={`bg-white border border-stone-200 rounded-xl p-4 shadow-sm hover:border-brand-300 transition-colors space-y-3 ${className}`}
        role="article"
      >
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-50 text-indigo-700">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <span className="text-xs font-semibold text-stone-900">
              Rekomendasi Operasional Copilot
            </span>
            <AIDataProvenance level="ESTIMATED" />
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityConfig.badge}`}
          >
            {priorityConfig.label}
          </span>
        </div>

        <div>
          <h4 className="text-sm font-bold text-stone-900">{recommendation.title}</h4>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed">{recommendation.rationale}</p>
        </div>

        {recommendation.constraints_checked && recommendation.constraints_checked.length > 0 && (
          <div className="bg-stone-50 rounded-lg p-2.5 text-xs space-y-1">
            <span className="text-[11px] font-semibold text-stone-700">
              Batasan Deterministik yang Terverifikasi:
            </span>
            <ul className="space-y-0.5 text-stone-600">
              {recommendation.constraints_checked.map((c, i) => (
                <li key={i} className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recommendation.metric_snapshot && (
          <div className="grid grid-cols-3 gap-2 py-1 text-center border-t border-stone-100 pt-2">
            {recommendation.metric_snapshot.capacity_available_kg !== undefined && (
              <div className="bg-stone-50 p-1.5 rounded">
                <div className="text-[10px] text-stone-500">Sisa Kapasitas</div>
                <div className="text-xs font-bold text-stone-800">
                  {recommendation.metric_snapshot.capacity_available_kg} kg
                </div>
              </div>
            )}
            {recommendation.metric_snapshot.pending_tasks !== undefined && (
              <div className="bg-stone-50 p-1.5 rounded">
                <div className="text-[10px] text-stone-500">Tugas Menunggu</div>
                <div className="text-xs font-bold text-stone-800">
                  {recommendation.metric_snapshot.pending_tasks}
                </div>
              </div>
            )}
            {recommendation.metric_snapshot.mass_balance_ratio !== undefined && (
              <div className="bg-stone-50 p-1.5 rounded">
                <div className="text-[10px] text-stone-500">Neraca Massa</div>
                <div className="text-xs font-bold text-emerald-700">
                  {recommendation.metric_snapshot.mass_balance_ratio}%
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-100 text-xs">
          <span className="text-[11px] text-stone-400 italic">
            *Memerlukan konfirmasi manusia sebelum eksekusi.
          </span>
          <button
            type="button"
            onClick={handleActionClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-white bg-brand-800 hover:bg-brand-900 rounded-lg transition-colors shadow-sm ml-auto"
          >
            <span>{recommendation.suggested_action_label}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {recommendation.action_proposal && (
        <ActionProposalModal
          proposal={recommendation.action_proposal}
          recommendationTitle={recommendation.title}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onExecuted={(res) => {
            if (onExecute) onExecute(recommendation.id);
          }}
        />
      )}
    </>
  );
}

